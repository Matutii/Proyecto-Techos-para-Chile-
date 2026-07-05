const { AppDataSource } = require('../config/configDb.mjs');

const materialRepo = () => AppDataSource.getRepository('Material');
const historialRepo = () => AppDataSource.getRepository('HistorialStock');
const proyectoRepo = () => AppDataSource.getRepository('Proyecto');

function errorNoEncontrado(mensaje) {
  const err = new Error(mensaje);
  err.status = 404;
  return err;
}

// Lista todos los materiales con filtros opcionales por estado o proyecto
async function listarMateriales(filtros = {}) {
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.proyectoId) where.proyectoId = Number(filtros.proyectoId);

  return await materialRepo().find({
    where,
    order: { id: 'ASC' },
    relations: ['proyecto'],
  });
}

// Obtiene un material por ID incluyendo su historial de cambios de estado
async function obtenerMaterial(id) {
  const material = await materialRepo().findOne({
    where: { id: Number(id) },
    relations: ['proyecto'],
  });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  const historial = await historialRepo().find({
    where: { materialId: material.id },
    relations: ['usuario'],
    order: { registradoEn: 'DESC' },
  });

  return { ...material, historialStock: historial };
}

// Crea un material y registra su estado inicial en el historial
async function crearMaterial(datos, usuarioId) {
  const estadoFinal = datos.estado || 'Disponible';

  const material = await materialRepo().save({
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    estado: estadoFinal,
    proyectoId: datos.proyectoId || null,
  });

  await historialRepo().save({
    materialId: material.id,
    estadoAnterior: null,
    estadoNuevo: estadoFinal,
    usuarioId,
    observacion: 'Alta inicial',
  });

  return material;
}

// Actualiza el estado de un material y registra el cambio en el historial
async function actualizarEstado(id, estado, observacion, usuarioId) {
  const actual = await materialRepo().findOne({ where: { id: Number(id) } });

  if (!actual) {
    throw errorNoEncontrado('Material no encontrado');
  }

  await materialRepo().update(id, { estado });

  await historialRepo().save({
    materialId: Number(id),
    estadoAnterior: actual.estado,
    estadoNuevo: estado,
    usuarioId,
    observacion: observacion || null,
  });

  return await materialRepo().findOne({ where: { id: Number(id) } });
}

// Devuelve, por cada proyecto, el conteo de materiales según su estado
async function vistaPorProyectos() {
  const proyectos = await proyectoRepo().find({ order: { id: 'ASC' } });
  const materiales = await materialRepo().find();

  return proyectos.map((p) => {
    const delProyecto = materiales.filter((m) => m.proyectoId === p.id);
    return {
      id: p.id,
      nombre: p.nombre,
      disponibles: delProyecto.filter((m) => m.estado === 'Disponible').length,
      agotados: delProyecto.filter((m) => m.estado === 'Agotado').length,
      enCamino: delProyecto.filter((m) => m.estado === 'En_camino').length,
    };
  });
}

module.exports = {
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarEstado,
  vistaPorProyectos,
};
