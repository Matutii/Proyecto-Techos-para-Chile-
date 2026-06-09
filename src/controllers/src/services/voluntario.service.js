const { AppDataSource } = require('../config/configDb.mjs');

const voluntarioRepo = () => AppDataSource.getRepository('Voluntario');

function clasificarEspecialidad(experienciaAnos, habilidades) {
  const texto = (habilidades || '').toLowerCase();
  const tieneKeywordTecnica = /(electric|gasfit|carpint|tecnic|plomer|albañil|maestr)/.test(texto);

  if (experienciaAnos >= 5) return 'jefe_cuadrilla';
  if (experienciaAnos >= 2 && tieneKeywordTecnica) return 'tecnico';
  return 'fuerza_general';
}

async function inscribirVoluntario(datos) {
  const existente = await voluntarioRepo().findOne({
    where: { email: datos.email },
  });

  if (existente) {
    throw new Error('Ya existe un voluntario registrado con ese email');
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
    estado: 'Activo',
    especialidad,
    experienciaAnos,
    habilidades: datos.habilidades || null,
  });

  return voluntario;
}

async function listarVoluntarios(filtros = {}) {
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.especialidad) where.especialidad = filtros.especialidad;

  return await voluntarioRepo().find({
    where,
    order: { inscritoEn: 'DESC' },
  });
}

async function obtenerVoluntario(id) {
  const voluntario = await voluntarioRepo().findOne({
    where: { id: Number(id) },
  });

  if (!voluntario) {
    throw new Error('Voluntario no encontrado');
  }

  return voluntario;
}

module.exports = {
  inscribirVoluntario,
  listarVoluntarios,
  obtenerVoluntario,
};
