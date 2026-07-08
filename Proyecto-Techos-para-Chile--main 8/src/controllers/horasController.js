const { AppDataSource } = require('../config/configDb.mjs');

const registroRepo = () => AppDataSource.getRepository('RegistroHoras');
const proyectoRepo = () => AppDataSource.getRepository('Proyecto');

// POST /api/horas
async function registrarHoras(req, res, next) {
  try {
    const { proyectoId, horas, descripcion } = req.body;

    if (!proyectoId) {
      return res.status(400).json({ error: 'El proyecto es requerido' });
    }

    if (horas === undefined || horas === null) {
      return res.status(400).json({ error: 'La cantidad de horas es requerida' });
    }

    const horasNum = Number(horas);
    if (isNaN(horasNum) || horasNum <= 0) {
      return res.status(400).json({ error: 'Las horas deben ser un número positivo' });
    }

    if (horasNum > 24) {
      return res.status(400).json({ error: 'No se pueden registrar más de 24 horas en un solo día' });
    }

    const proyecto = await proyectoRepo().findOne({ where: { id: Number(proyectoId) } });
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const registro = await registroRepo().save({
      proyectoId: Number(proyectoId),
      usuarioId: req.usuario.id,
      horas: horasNum,
      descripcion: descripcion || null,
    });

    const totalActual = Number(proyecto.horasTotales) || 0;
    await proyectoRepo().update(proyecto.id, { horasTotales: totalActual + horasNum });

    const proyectoActualizado = await proyectoRepo().findOne({ where: { id: proyecto.id } });

    res.status(201).json({
      registro,
      proyecto: proyectoActualizado,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/horas/proyecto/:id
async function horasPorProyecto(req, res, next) {
  try {
    const registros = await registroRepo().find({
      where: { proyectoId: Number(req.params.id) },
      order: { registradoEn: 'DESC' },
      relations: ['usuario'],
    });

    const proyecto = await proyectoRepo().findOne({ where: { id: Number(req.params.id) } });

    res.json({
      registros,
      totalHoras: proyecto ? proyecto.horasTotales : 0,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/horas/mis-registros
async function misRegistros(req, res, next) {
  try {
    const registros = await registroRepo().find({
      where: { usuarioId: req.usuario.id },
      order: { registradoEn: 'DESC' },
      relations: ['proyecto'],
    });
    res.json(registros);
  } catch (err) {
    next(err);
  }
}

// GET /api/proyectos (público con sesión)
async function listarProyectos(req, res, next) {
  try {
    const proyectos = await proyectoRepo().find({
      order: { nombre: 'ASC' },
    });
    res.json(proyectos);
  } catch (err) {
    next(err);
  }
}

module.exports = { registrarHoras, horasPorProyecto, misRegistros, listarProyectos };
