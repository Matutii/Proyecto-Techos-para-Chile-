const prisma = require('../config/prisma');

async function listarMateriales(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.proyectoId) where.proyectoId = Number(req.query.proyectoId);

    const materiales = await prisma.material.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        proyecto: { select: { id: true, nombre: true } },
      },
    });
    res.json(materiales);
  } catch (err) {
    next(err);
  }
}

async function obtenerMaterial(req, res, next) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        proyecto: { select: { id: true, nombre: true } },
        historialStock: {
          orderBy: { registradoEn: 'desc' },
          include: {
            usuario: { select: { id: true, nombre: true } },
          },
        },
      },
    });
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }
    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function crearMaterial(req, res, next) {
  try {
    const { nombre, descripcion, estado, proyectoId } = req.body;
    const estadoFinal = estado || 'Disponible';

    const material = await prisma.material.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        estado: estadoFinal,
        proyectoId: proyectoId || null,
      },
    });

    await prisma.historialStock.create({
      data: {
        materialId: material.id,
        estadoAnterior: null,
        estadoNuevo: estadoFinal,
        usuarioId: req.usuario.id,
        observacion: 'Alta inicial',
      },
    });

    res.status(201).json(material);
  } catch (err) {
    next(err);
  }
}

async function actualizarEstado(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { estado, observacion } = req.body;

    const actual = await prisma.material.findUnique({ where: { id } });
    if (!actual) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    const material = await prisma.material.update({
      where: { id },
      data: { estado },
    });

    await prisma.historialStock.create({
      data: {
        materialId: id,
        estadoAnterior: actual.estado,
        estadoNuevo: estado,
        usuarioId: req.usuario.id,
        observacion: observacion || null,
      },
    });

    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function vistaPorProyectos(req, res, next) {
  try {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: { id: 'asc' },
      include: {
        materiales: { select: { estado: true } },
      },
    });

    const resultado = proyectos.map((p) => {
      const disponibles = p.materiales.filter((m) => m.estado === 'Disponible').length;
      const agotados = p.materiales.filter((m) => m.estado === 'Agotado').length;
      const enCamino = p.materiales.filter((m) => m.estado === 'En_camino').length;
      return {
        id: p.id,
        nombre: p.nombre,
        disponibles,
        agotados,
        enCamino,
      };
    });

    res.json({ proyectos: resultado });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarEstado,
  vistaPorProyectos,
};
