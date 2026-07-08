const { AppDataSource } = require('../config/configDb.mjs');

const materialRepo = () => AppDataSource.getRepository('Material');
const historialRepo = () => AppDataSource.getRepository('HistorialStock');

const ESTADOS_VALIDOS = ['Disponible', 'Agotado', 'En_camino'];

// GET /api/stock
async function listarMateriales(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.proyectoId) where.proyectoId = Number(req.query.proyectoId);

    const materiales = await materialRepo().find({
      where,
      order: { id: 'ASC' },
      relations: ['proyecto'],
    });

    res.json(materiales);
  } catch (err) {
    next(err);
  }
}

// GET /api/stock/:id
async function obtenerMaterial(req, res, next) {
  try {
    const material = await materialRepo().findOne({
      where: { id: Number(req.params.id) },
      relations: ['proyecto'],
    });

    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    const historial = await historialRepo().find({
      where: { materialId: material.id },
      order: { registradoEn: 'DESC' },
    });

    res.json({ ...material, historialStock: historial });
  } catch (err) {
    next(err);
  }
}

// POST /api/stock (solo admin/coordinador_logistica)
async function crearMaterial(req, res, next) {
  try {
    const { nombre, descripcion, proyectoId } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del material es requerido' });
    }

    const material = await materialRepo().save({
      nombre,
      descripcion: descripcion || null,
      estado: 'Disponible',
      proyectoId: proyectoId || null,
    });

    await historialRepo().save({
      materialId: material.id,
      estadoAnterior: null,
      estadoNuevo: 'Disponible',
      usuarioId: req.usuario.id,
      observacion: 'Alta inicial',
    });

    res.status(201).json(material);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/stock/:id/estado (solo admin/coordinador_logistica)
// Puede cambiar a cualquier estado: Disponible, Agotado o En_camino.
async function actualizarEstado(req, res, next) {
  try {
    const { estado, observacion } = req.body;

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Use: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    const material = await materialRepo().findOne({ where: { id: Number(req.params.id) } });
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    await materialRepo().update(material.id, { estado });

    await historialRepo().save({
      materialId: material.id,
      estadoAnterior: material.estado,
      estadoNuevo: estado,
      usuarioId: req.usuario.id,
      observacion: observacion || null,
    });

    const actualizado = await materialRepo().findOne({ where: { id: material.id } });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/stock/:id/retiro (admin, coordinador_logistica y colaborador)
// A diferencia de actualizarEstado, esto solo puede marcar el material
// como "Agotado" (retirado/usado). No permite reponerlo a Disponible.
async function retirarMaterial(req, res, next) {
  try {
    const material = await materialRepo().findOne({ where: { id: Number(req.params.id) } });
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    if (material.estado === 'Agotado') {
      return res.status(409).json({ error: 'El material ya fue retirado previamente' });
    }

    await materialRepo().update(material.id, { estado: 'Agotado' });

    await historialRepo().save({
      materialId: material.id,
      estadoAnterior: material.estado,
      estadoNuevo: 'Agotado',
      usuarioId: req.usuario.id,
      observacion: req.body.observacion || 'Retiro de bodega',
    });

    const actualizado = await materialRepo().findOne({ where: { id: material.id } });
    res.json(actualizado);
  } catch (err) {
    next(err);
  }
}

module.exports = { listarMateriales, obtenerMaterial, crearMaterial, actualizarEstado, retirarMaterial };
