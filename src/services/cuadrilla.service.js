const { AppDataSource } = require('../config/configDb.mjs');

const cuadrillaRepo = () => AppDataSource.getRepository('Cuadrilla');
const cvRepo = () => AppDataSource.getRepository('CuadrillaVoluntario');

// Lista cuadrillas con filtros opcionales por estado o especialidad
async function listarCuadrillas(filtros = {}) {
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.especialidad) where.especialidad = filtros.especialidad;

  return await cuadrillaRepo().find({
    where,
    relations: ['jefeCuadrilla', 'proyecto'],
    order: { creadoEn: 'DESC' },
  });
}

// Obtiene una cuadrilla por ID incluyendo sus integrantes
async function obtenerCuadrilla(id) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(id) },
    relations: ['jefeCuadrilla', 'proyecto', 'voluntarios', 'voluntarios.voluntario'],
  });

  if (!cuadrilla) {
    throw new Error('Cuadrilla no encontrada');
  }

  return cuadrilla;
}

// Crea una nueva cuadrilla validando nombre único
async function crearCuadrilla(datos) {
  const existente = await cuadrillaRepo().findOne({
    where: { nombre: datos.nombre },
  });

  if (existente) {
    throw new Error('Ya existe una cuadrilla con ese nombre');
  }

  const cuadrilla = await cuadrillaRepo().save({
    nombre: datos.nombre,
    especialidad: datos.especialidad,
    estado: datos.estado || 'En_formacion',
    jefeCuadrillaId: datos.jefeCuadrillaId || null,
    proyectoId: datos.proyectoId || null,
  });

  return cuadrilla;
}

// Actualiza los datos de una cuadrilla existente
async function actualizarCuadrilla(id, datos) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(id) },
  });

  if (!cuadrilla) {
    throw new Error('Cuadrilla no encontrada');
  }

  if (datos.nombre && datos.nombre !== cuadrilla.nombre) {
    const existente = await cuadrillaRepo().findOne({
      where: { nombre: datos.nombre },
    });

    if (existente) {
      throw new Error('Ya existe una cuadrilla con ese nombre');
    }
  }

  await cuadrillaRepo().update(id, {
    ...(datos.nombre !== undefined && { nombre: datos.nombre }),
    ...(datos.especialidad !== undefined && { especialidad: datos.especialidad }),
    ...(datos.estado !== undefined && { estado: datos.estado }),
    ...(datos.jefeCuadrillaId !== undefined && { jefeCuadrillaId: datos.jefeCuadrillaId }),
    ...(datos.proyectoId !== undefined && { proyectoId: datos.proyectoId }),
  });

  return await cuadrillaRepo().findOne({
    where: { id: Number(id) },
    relations: ['jefeCuadrilla', 'proyecto'],
  });
}

// Elimina una cuadrilla por ID
async function eliminarCuadrilla(id) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(id) },
  });

  if (!cuadrilla) {
    throw new Error('Cuadrilla no encontrada');
  }

  await cuadrillaRepo().remove(cuadrilla);
}

// Asigna un voluntario a una cuadrilla
async function agregarVoluntario(cuadrillaId, voluntarioId) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(cuadrillaId) },
  });

  if (!cuadrilla) {
    throw new Error('Cuadrilla no encontrada');
  }

  if (cuadrilla.estado === 'Disuelta') {
    throw new Error('No se pueden agregar voluntarios a una cuadrilla disuelta');
  }

  const existente = await cvRepo().findOne({
    where: {
      cuadrillaId: Number(cuadrillaId),
      voluntarioId: Number(voluntarioId),
      fechaFin: null,
    },
  });

  if (existente) {
    throw new Error('El voluntario ya está asignado a esta cuadrilla');
  }

  const asignacion = await cvRepo().save({
    cuadrillaId: Number(cuadrillaId),
    voluntarioId: Number(voluntarioId),
    fechaInicio: new Date(),
  });

  return asignacion;
}

module.exports = {
  listarCuadrillas,
  obtenerCuadrilla,
  crearCuadrilla,
  actualizarCuadrilla,
  eliminarCuadrilla,
  agregarVoluntario,
};
