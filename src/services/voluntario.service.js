const { AppDataSource } = require('../config/configDb.mjs');

const voluntarioRepo = () => AppDataSource.getRepository('Voluntario');

// Helper para lanzar errores con el status HTTP que espera el manejador central
function errorConflicto(mensaje) {
  const err = new Error(mensaje);
  err.status = 409;
  return err;
}

function errorNoEncontrado(mensaje) {
  const err = new Error(mensaje);
  err.status = 404;
  return err;
}

// Clasifica la especialidad del voluntario según experiencia y habilidades
function clasificarEspecialidad(experienciaAnos, habilidades) {
  const texto = (habilidades || '').toLowerCase();
  const tieneKeywordTecnica = /(electric|gasfit|carpint|tecnic|plomer|albañil|maestr)/.test(texto);

  if (experienciaAnos >= 5) return 'jefe_cuadrilla';
  if (experienciaAnos >= 2 && tieneKeywordTecnica) return 'tecnico';
  return 'fuerza_general';
}

// Inscribe un nuevo voluntario, validando email único y asignando especialidad
async function inscribirVoluntario(datos) {
  const existente = await voluntarioRepo().findOne({
    where: { email: datos.email },
  });

  if (existente) {
    throw errorConflicto('Ya existe un voluntario registrado con ese email');
  }

  const experienciaAnos = Number(datos.experienciaAnos) || 0;
  const especialidad = clasificarEspecialidad(experienciaAnos, datos.habilidades);

  const voluntario = await voluntarioRepo().save({
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    telefono: datos.telefono || null,
    datosMedicos: datos.datosMedicos,
    contactoEmergenciaNombre: datos.contactoEmergenciaNombre,
    contactoEmergenciaTelefono: datos.contactoEmergenciaTelefono,
    terminosAceptados: true,
    terminosAceptadosEn: new Date(),
    estado: 'Pendiente',
    especialidad,
    experienciaAnos,
    habilidades: datos.habilidades || null,
  });

  return voluntario;
}

// Lista voluntarios con filtros opcionales por estado o especialidad
async function listarVoluntarios(filtros = {}) {
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.especialidad) where.especialidad = filtros.especialidad;

  return await voluntarioRepo().find({
    where,
    order: { inscritoEn: 'DESC' },
  });
}

// Obtiene un voluntario por ID
async function obtenerVoluntario(id) {
  const voluntario = await voluntarioRepo().findOne({
    where: { id: Number(id) },
  });

  if (!voluntario) {
    throw errorNoEncontrado('Voluntario no encontrado');
  }

  return voluntario;
}

const ESTADOS_VALIDOS = ['Pendiente', 'Activo', 'Rechazado'];

// Aprueba o rechaza un voluntario pendiente (o revierte su estado)
async function actualizarEstado(id, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw Object.assign(new Error(`Estado inválido. Use: ${ESTADOS_VALIDOS.join(', ')}`), { status: 400 });
  }

  const voluntario = await voluntarioRepo().findOne({ where: { id: Number(id) } });
  if (!voluntario) {
    throw errorNoEncontrado('Voluntario no encontrado');
  }

  voluntario.estado = estado;
  await voluntarioRepo().save(voluntario);

  return voluntario;
}

module.exports = {
  inscribirVoluntario,
  listarVoluntarios,
  obtenerVoluntario,
  actualizarEstado,
};
