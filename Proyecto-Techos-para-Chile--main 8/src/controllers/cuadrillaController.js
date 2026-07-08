const { AppDataSource } = require('../config/configDb.mjs');

const cuadrillaRepo = () => AppDataSource.getRepository('Cuadrilla');
const cvRepo = () => AppDataSource.getRepository('CuadrillaVoluntario');

const ESPECIALIDADES_VALIDAS = ['fuerza_general', 'tecnico', 'logistica'];

// GET /api/cuadrillas
async function listarCuadrillas(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.especialidad) where.especialidad = req.query.especialidad;

    const cuadrillas = await cuadrillaRepo().find({
      where,
      relations: ['jefeCuadrilla', 'proyecto', 'voluntarios'],
      order: { creadoEn: 'DESC' },
    });

    res.json(cuadrillas);
  } catch (err) {
    next(err);
  }
}

// GET /api/cuadrillas/:id
async function obtenerCuadrilla(req, res, next) {
  try {
    const cuadrilla = await cuadrillaRepo().findOne({
      where: { id: Number(req.params.id) },
      relations: ['jefeCuadrilla', 'proyecto', 'voluntarios', 'voluntarios.voluntario'],
    });

    if (!cuadrilla) {
      return res.status(404).json({ error: 'Cuadrilla no encontrada' });
    }

    res.json(cuadrilla);
  } catch (err) {
    next(err);
  }
}

// POST /api/cuadrillas (solo admin/encargado_cuadrillas)
async function crearCuadrilla(req, res, next) {
  try {
    const { nombre, especialidad, jefeCuadrillaId, proyectoId } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (!ESPECIALIDADES_VALIDAS.includes(especialidad)) {
      return res.status(400).json({ error: `Especialidad inválida. Use: ${ESPECIALIDADES_VALIDAS.join(', ')}` });
    }

    const existente = await cuadrillaRepo().findOne({ where: { nombre } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuadrilla con ese nombre' });
    }

    const cuadrilla = await cuadrillaRepo().save({
      nombre,
      especialidad,
      estado: 'En_formacion',
      jefeCuadrillaId: jefeCuadrillaId || null,
      proyectoId: proyectoId || null,
    });

    res.status(201).json(cuadrilla);
  } catch (err) {
    next(err);
  }
}

// PUT /api/cuadrillas/:id (solo admin/encargado_cuadrillas)
async function actualizarCuadrilla(req, res, next) {
  try {
    const cuadrilla = await cuadrillaRepo().findOne({ where: { id: Number(req.params.id) } });
    if (!cuadrilla) {
      return res.status(404).json({ error: 'Cuadrilla no encontrada' });
    }

    const { nombre, especialidad, estado, jefeCuadrillaId, proyectoId } = req.body;

    if (nombre !== undefined) cuadrilla.nombre = nombre;
    if (especialidad !== undefined) cuadrilla.especialidad = especialidad;
    if (estado !== undefined) cuadrilla.estado = estado;
    if (jefeCuadrillaId !== undefined) cuadrilla.jefeCuadrillaId = jefeCuadrillaId;
    if (proyectoId !== undefined) cuadrilla.proyectoId = proyectoId;

    await cuadrillaRepo().save(cuadrilla);
    res.json(cuadrilla);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cuadrillas/:id (solo admin)
async function eliminarCuadrilla(req, res, next) {
  try {
    const cuadrilla = await cuadrillaRepo().findOne({ where: { id: Number(req.params.id) } });
    if (!cuadrilla) {
      return res.status(404).json({ error: 'Cuadrilla no encontrada' });
    }

    await cuadrillaRepo().remove(cuadrilla);
    res.json({ mensaje: 'Cuadrilla eliminada' });
  } catch (err) {
    next(err);
  }
}

// POST /api/cuadrillas/:id/voluntarios (solo admin/encargado_cuadrillas)
async function agregarVoluntario(req, res, next) {
  try {
    const cuadrillaId = Number(req.params.id);
    const { voluntarioId } = req.body;

    if (!voluntarioId) {
      return res.status(400).json({ error: 'voluntarioId es requerido' });
    }

    const cuadrilla = await cuadrillaRepo().findOne({ where: { id: cuadrillaId } });
    if (!cuadrilla) {
      return res.status(404).json({ error: 'Cuadrilla no encontrada' });
    }

    if (cuadrilla.estado === 'Disuelta') {
      return res.status(400).json({ error: 'No se pueden agregar voluntarios a una cuadrilla disuelta' });
    }

    const existente = await cvRepo().findOne({
      where: { cuadrillaId, voluntarioId: Number(voluntarioId), fechaFin: null },
    });
    if (existente) {
      return res.status(409).json({ error: 'El voluntario ya está asignado a esta cuadrilla' });
    }

    const asignacion = await cvRepo().save({
      cuadrillaId,
      voluntarioId: Number(voluntarioId),
      fechaInicio: new Date(),
    });

    res.status(201).json(asignacion);
  } catch (err) {
    next(err);
  }
}

// GET /api/cuadrillas/mi-cuadrilla
async function miCuadrilla(req, res, next) {
  try {
    const voluntarioRepo = () => AppDataSource.getRepository('Voluntario');
    const voluntario = await voluntarioRepo().findOne({ where: { email: req.usuario.email } });

    if (!voluntario) {
      return res.json({ asignado: false, mensaje: 'No estás registrado como voluntario' });
    }

    const asignacion = await cvRepo().findOne({
      where: { voluntarioId: voluntario.id, fechaFin: null },
      relations: ['cuadrilla', 'cuadrilla.proyecto'],
    });

    if (!asignacion) {
      return res.json({ asignado: false, mensaje: 'No tienes una cuadrilla asignada actualmente' });
    }

    res.json({
      asignado: true,
      cuadrilla: asignacion.cuadrilla,
      desde: asignacion.fechaInicio,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarCuadrillas,
  obtenerCuadrilla,
  crearCuadrilla,
  actualizarCuadrilla,
  eliminarCuadrilla,
  agregarVoluntario,
  miCuadrilla,
};
