const prisma = require('../config/prisma');

function clasificarEspecialidad(experienciaAnos, habilidades) {
  const texto = (habilidades || '').toLowerCase();
  const tieneKeywordTecnica = /(electric|gasfit|carpint|tecnic|plomer|albañil|maestr)/.test(texto);

  if (experienciaAnos >= 5) return 'jefe_cuadrilla';
  if (experienciaAnos >= 2 && tieneKeywordTecnica) return 'tecnico';
  return 'fuerza_general';
}

async function inscribirVoluntario(req, res, next) {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      datosMedicos,
      contactoEmergenciaNombre,
      contactoEmergenciaTelefono,
      experienciaAnos,
      habilidades,
    } = req.body;

    const existente = await prisma.voluntario.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un voluntario registrado con ese email' });
    }

    const especialidad = clasificarEspecialidad(
      Number(experienciaAnos) || 0,
      habilidades,
    );

    const voluntario = await prisma.voluntario.create({
      data: {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        datosMedicos,
        contactoEmergenciaNombre,
        contactoEmergenciaTelefono,
        terminosAceptados: true,
        terminosAceptadosEn: new Date(),
        estado: 'Activo',
        especialidad,
        experienciaAnos: Number(experienciaAnos) || 0,
        habilidades: habilidades || null,
      },
    });

    res.status(201).json(voluntario);
  } catch (err) {
    next(err);
  }
}

async function listarVoluntarios(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.especialidad) where.especialidad = req.query.especialidad;

    const voluntarios = await prisma.voluntario.findMany({
      where,
      orderBy: { inscritoEn: 'desc' },
    });
    res.json(voluntarios);
  } catch (err) {
    next(err);
  }
}

async function obtenerVoluntario(req, res, next) {
  try {
    const voluntario = await prisma.voluntario.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    res.json(voluntario);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inscribirVoluntario,
  listarVoluntarios,
  obtenerVoluntario,
};
