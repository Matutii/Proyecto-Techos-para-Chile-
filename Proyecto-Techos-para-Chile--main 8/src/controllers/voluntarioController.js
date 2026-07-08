const { AppDataSource } = require('../config/configDb.mjs');

const voluntarioRepo = () => AppDataSource.getRepository('Voluntario');

// Según los años de experiencia y las habilidades escritas, le asigna
// una especialidad automáticamente al voluntario.
function clasificarEspecialidad(experienciaAnos, habilidades) {
  const texto = (habilidades || '').toLowerCase();
  const esTecnica = /(electric|gasfit|carpint|tecnic|plomer|albañil|maestr)/.test(texto);

  if (experienciaAnos >= 5) return 'jefe_cuadrilla';
  if (experienciaAnos >= 2 && esTecnica) return 'tecnico';
  return 'fuerza_general';
}

// POST /api/voluntarios/inscripcion (público, no requiere cuenta)
async function inscribirVoluntario(req, res, next) {
  try {
    const {
      nombre, apellido, email, telefono,
      datosMedicos, contactoEmergenciaNombre, contactoEmergenciaTelefono,
      terminosAceptados, experienciaAnos, habilidades,
    } = req.body;

    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Nombre, apellido y email son requeridos' });
    }

    if (!datosMedicos || !contactoEmergenciaNombre || !contactoEmergenciaTelefono) {
      return res.status(400).json({ error: 'Datos médicos y contacto de emergencia son requeridos' });
    }

    if (terminosAceptados !== true) {
      return res.status(400).json({ error: 'Debes aceptar los términos' });
    }

    const existente = await voluntarioRepo().findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un voluntario registrado con ese email' });
    }

    const experiencia = Number(experienciaAnos) || 0;
    const especialidad = clasificarEspecialidad(experiencia, habilidades);

    const voluntario = await voluntarioRepo().save({
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
      experienciaAnos: experiencia,
      habilidades: habilidades || null,
    });

    res.status(201).json(voluntario);
  } catch (err) {
    next(err);
  }
}

// GET /api/voluntarios (admin, coordinador_logistica, encargado_cuadrillas)
async function listarVoluntarios(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.especialidad) where.especialidad = req.query.especialidad;

    const voluntarios = await voluntarioRepo().find({ where, order: { inscritoEn: 'DESC' } });
    res.json(voluntarios);
  } catch (err) {
    next(err);
  }
}

// GET /api/voluntarios/:id
async function obtenerVoluntario(req, res, next) {
  try {
    const voluntario = await voluntarioRepo().findOne({ where: { id: Number(req.params.id) } });
    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    res.json(voluntario);
  } catch (err) {
    next(err);
  }
}

module.exports = { inscribirVoluntario, listarVoluntarios, obtenerVoluntario };
