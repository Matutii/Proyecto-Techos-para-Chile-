const { AppDataSource } = require('../config/configDb.mjs');

const materialRepo = () => AppDataSource.getRepository('Material');
const historialRepo = () => AppDataSource.getRepository('HistorialStock');

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

async function obtenerMaterial(id) {
  const material = await materialRepo().findOne({
    where: { id: Number(id) },
    relations: ['proyecto'],
  });

  if (!material) {
    throw new Error('Material no encontrado');
  }

  const historial = await historialRepo().find({
    where: { materialId: material.id },
    relations: ['usuario'],
    order: { registradoEn: 'DESC' },
  });

  return { ...material, historialStock: historial };
}

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

async function actualizarEstado(id, estado, observacion, usuarioId) {
  const actual = await materialRepo().findOne({ where: { id: Number(id) } });

  if (!actual) {
    throw new Error('Material no encontrado');
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

module.exports = {
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarEstado,
};
