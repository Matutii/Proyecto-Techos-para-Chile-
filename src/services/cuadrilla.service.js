const { AppDataSource } = require('../config/configDb.mjs');

const cuadrillaRepo = () => AppDataSource.getRepository('Cuadrilla');
const cvRepo = () => AppDataSource.getRepository('CuadrillaVoluntario');
const voluntarioRepo = () => AppDataSource.getRepository('Voluntario');
const historialRepo = () => AppDataSource.getRepository('HistorialCuadrilla');

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

function errorSolicitudInvalida(mensaje) {
  const err = new Error(mensaje);
  err.status = 400;
  return err;
}

function errorNoAutorizado(mensaje) {
  const err = new Error(mensaje);
  err.status = 403;
  return err;
}

const ESPECIALIDADES_VOLUNTARIO_POR_CUADRILLA = {
  fuerza_general: 'fuerza_general',
  tecnico: 'tecnico',
  logistica: 'jefe_cuadrilla',
};

function especialidadEsCompatible(especialidadVoluntario, especialidadCuadrilla) {
  const esperada = ESPECIALIDADES_VOLUNTARIO_POR_CUADRILLA[especialidadCuadrilla];
  return especialidadVoluntario === esperada;
}

async function registrarHistorial({ cuadrillaId, accion, descripcion, usuario }) {
  await historialRepo().save({
    cuadrillaId: Number(cuadrillaId),
    accion,
    descripcion,
    usuarioId: usuario.id,
  });
}

// Lista cuadrillas con filtros opcionales por estado o especialidad
async function listarCuadrillas(filtros = {}) {
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.especialidad) where.especialidad = filtros.especialidad;

  return await cuadrillaRepo().find({
    where,
    relations: ['jefeCuadrilla', 'proyecto', 'voluntarios'],
    order: { creadoEn: 'DESC' },
  });
}

// Obtiene una cuadrilla por ID incluyendo sus integrantes e historial
async function obtenerCuadrilla(id) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(id) },
    relations: ['jefeCuadrilla', 'proyecto', 'voluntarios', 'voluntarios.voluntario', 'historial', 'historial.usuario'],
    order: { historial: { registradoEn: 'DESC' } },
  });

  if (!cuadrilla) {
    throw errorNoEncontrado('Cuadrilla no encontrada');
  }

  return cuadrilla;
}

// Crea una nueva cuadrilla (R1)
async function crearCuadrilla(datos, usuario) {
  // Validar código único
  const existenteCodigo = await cuadrillaRepo().findOne({
    where: { codigo: datos.codigo },
  });

  if (existenteCodigo) {
    throw errorConflicto('Ya existe una cuadrilla con ese código');
  }

  // Validar que el jefe de cuadrilla existe y está activo
  const jefe = await voluntarioRepo().findOne({ where: { id: Number(datos.jefeCuadrillaId) } });

  if (!jefe) {
    throw errorNoEncontrado('Jefe de cuadrilla no encontrado');
  }

  if (jefe.estado !== 'Activo') {
    throw errorSolicitudInvalida('El jefe de cuadrilla debe estar en estado Activo');
  }

  // Validar especialidad permitida
  const especialidadesPermitidas = ['fuerza_general', 'tecnico', 'logistica'];
  if (!especialidadesPermitidas.includes(datos.especialidad)) {
    throw errorSolicitudInvalida('Especialidad no válida. Use: fuerza_general, tecnico o logistica');
  }

  const cuadrilla = await cuadrillaRepo().save({
    codigo: datos.codigo,
    nombre: datos.nombre,
    especialidad: datos.especialidad,
    estado: 'Lista_para_asignacion',
    jefeCuadrillaId: Number(datos.jefeCuadrillaId),
    proyectoId: datos.proyectoId || null,
  });

  await registrarHistorial({
    cuadrillaId: cuadrilla.id,
    accion: 'creacion',
    descripcion: `Cuadrilla creada con código ${datos.codigo}, especialidad ${datos.especialidad}, jefe ${jefe.nombre} ${jefe.apellido}`,
    usuario,
  });

  return await cuadrillaRepo().findOne({
    where: { id: cuadrilla.id },
    relations: ['jefeCuadrilla', 'proyecto'],
  });
}

// Actualiza los datos de una cuadrilla existente
async function actualizarCuadrilla(id, datos, usuario) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(id) },
  });

  if (!cuadrilla) {
    throw errorNoEncontrado('Cuadrilla no encontrada');
  }

  if (cuadrilla.estado === 'Disuelta') {
    throw errorSolicitudInvalida('No se puede modificar una cuadrilla disuelta');
  }

  if (datos.codigo && datos.codigo !== cuadrilla.codigo) {
    const existente = await cuadrillaRepo().findOne({
      where: { codigo: datos.codigo },
    });
    if (existente) {
      throw errorConflicto('Ya existe una cuadrilla con ese código');
    }
  }

  // Si se cambia el jefe, validar
  if (datos.jefeCuadrillaId !== undefined && Number(datos.jefeCuadrillaId) !== cuadrilla.jefeCuadrillaId) {
    const jefe = await voluntarioRepo().findOne({ where: { id: Number(datos.jefeCuadrillaId) } });
    if (!jefe) {
      throw errorNoEncontrado('Jefe de cuadrilla no encontrado');
    }
    if (jefe.estado !== 'Activo') {
      throw errorSolicitudInvalida('El jefe de cuadrilla debe estar en estado Activo');
    }
  }

  const cambios = [];
  if (datos.codigo !== undefined && datos.codigo !== cuadrilla.codigo) cambios.push(`código: ${cuadrilla.codigo} → ${datos.codigo}`);
  if (datos.nombre !== undefined && datos.nombre !== cuadrilla.nombre) cambios.push(`nombre: ${cuadrilla.nombre} → ${datos.nombre}`);
  if (datos.especialidad !== undefined && datos.especialidad !== cuadrilla.especialidad) cambios.push(`especialidad: ${cuadrilla.especialidad} → ${datos.especialidad}`);
  if (datos.jefeCuadrillaId !== undefined && Number(datos.jefeCuadrillaId) !== cuadrilla.jefeCuadrillaId) cambios.push(`jefe de cuadrilla actualizado`);
  if (datos.proyectoId !== undefined && Number(datos.proyectoId) !== cuadrilla.proyectoId) cambios.push(`proyecto asignado actualizado`);

  await cuadrillaRepo().update(id, {
    ...(datos.codigo !== undefined && { codigo: datos.codigo }),
    ...(datos.nombre !== undefined && { nombre: datos.nombre }),
    ...(datos.especialidad !== undefined && { especialidad: datos.especialidad }),
    ...(datos.estado !== undefined && { estado: datos.estado }),
    ...(datos.jefeCuadrillaId !== undefined && { jefeCuadrillaId: Number(datos.jefeCuadrillaId) }),
    ...(datos.proyectoId !== undefined && { proyectoId: datos.proyectoId === null ? null : Number(datos.proyectoId) }),
  });

  if (cambios.length > 0) {
    await registrarHistorial({
      cuadrillaId: Number(id),
      accion: 'modificacion',
      descripcion: `Cambios realizados: ${cambios.join('; ')}`,
      usuario,
    });
  }

  return await cuadrillaRepo().findOne({
    where: { id: Number(id) },
    relations: ['jefeCuadrilla', 'proyecto'],
  });
}

// Disuelve una cuadrilla (R2)
async function disolverCuadrilla(id, usuario) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(id) },
    relations: ['voluntarios'],
  });

  if (!cuadrilla) {
    throw errorNoEncontrado('Cuadrilla no encontrada');
  }

  if (cuadrilla.estado === 'Disuelta') {
    throw errorSolicitudInvalida('La cuadrilla ya está disuelta');
  }

  // Liberar integrantes: establecer fechaFin a las asignaciones activas
  if (cuadrilla.voluntarios && cuadrilla.voluntarios.length > 0) {
    for (const cv of cuadrilla.voluntarios) {
      if (!cv.fechaFin) {
        await cvRepo().update(cv.id, { fechaFin: new Date() });
      }
    }
  }

  await cuadrillaRepo().update(id, { estado: 'Disuelta', proyectoId: null });

  await registrarHistorial({
    cuadrillaId: Number(id),
    accion: 'disolucion',
    descripcion: `Cuadrilla disuelta. ${cuadrilla.voluntarios ? cuadrilla.voluntarios.length : 0} integrantes liberados.`,
    usuario,
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
    throw errorNoEncontrado('Cuadrilla no encontrada');
  }

  await cuadrillaRepo().remove(cuadrilla);
}

// Asigna un voluntario a una cuadrilla (R2)
async function agregarVoluntario(cuadrillaId, voluntarioId, fechaInicio, fechaFin) {
  const cuadrilla = await cuadrillaRepo().findOne({
    where: { id: Number(cuadrillaId) },
  });

  if (!cuadrilla) {
    throw errorNoEncontrado('Cuadrilla no encontrada');
  }

  if (cuadrilla.estado === 'Disuelta') {
    throw errorSolicitudInvalida('No se pueden agregar voluntarios a una cuadrilla disuelta');
  }

  const voluntario = await voluntarioRepo().findOne({ where: { id: Number(voluntarioId) } });

  if (!voluntario) {
    throw errorNoEncontrado('Voluntario no encontrado');
  }

  // R2: Validar que el voluntario esté Activo
  if (voluntario.estado !== 'Activo') {
    throw errorSolicitudInvalida('Solo se pueden agregar voluntarios con estado Activo');
  }

  // R2: Validar especialidad compatible
  if (!especialidadEsCompatible(voluntario.especialidad, cuadrilla.especialidad)) {
    throw errorSolicitudInvalida(
      `El voluntario tiene especialidad "${voluntario.especialidad}" que no es compatible con la cuadrilla "${cuadrilla.especialidad}". ` +
      `Se requiere especialidad: ${ESPECIALIDADES_VOLUNTARIO_POR_CUADRILLA[cuadrilla.especialidad]}`
    );
  }

  // Validar que no esté ya asignado a esta misma cuadrilla activamente
  const existenteMisma = await cvRepo().findOne({
    where: {
      cuadrillaId: Number(cuadrillaId),
      voluntarioId: Number(voluntarioId),
      fechaFin: null,
    },
  });

  if (existenteMisma) {
    throw errorConflicto('El voluntario ya está asignado a esta cuadrilla');
  }

  // R2: Validar que no esté asignado a otra cuadrilla en el mismo rango de fechas (sobreasignación)
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  const fin = fechaFin ? new Date(fechaFin) : null;

  const todasLasAsignaciones = await cvRepo().find({
    where: { voluntarioId: Number(voluntarioId) },
  });

  for (const asignacion of todasLasAsignaciones) {
    if (asignacion.cuadrillaId === Number(cuadrillaId)) continue;

    const asigInicio = new Date(asignacion.fechaInicio);
    const asigFin = asignacion.fechaFin ? new Date(asignacion.fechaFin) : null;

    const haySolapamiento = (
      // Ambos sin fecha fin
      (!fin && !asigFin) ||
      // Esta asignación tiene fin y la existente no: solapan si inicio <= existente
      (fin && !asigFin && inicio <= asigInicio) ||
      // Esta no tiene fin y la existente sí: solapan si existente >= inicio
      (!fin && asigFin && asigInicio >= inicio) ||
      // Ambas tienen fin: solapan si rangos se cruzan
      (fin && asigFin && inicio < asigFin && fin > asigInicio)
    );

    if (haySolapamiento) {
      const c = await cuadrillaRepo().findOne({ where: { id: asignacion.cuadrillaId } });
      throw errorConflicto(
        `El voluntario ya está asignado a otra cuadrilla en el mismo rango de fechas. ` +
        `Cuadrilla: "${c ? c.nombre : asignacion.cuadrillaId}" (${asigInicio.toLocaleDateString()} - ${asigFin ? asigFin.toLocaleDateString() : 'indefinido'})`
      );
    }
  }

  const asignacion = await cvRepo().save({
    cuadrillaId: Number(cuadrillaId),
    voluntarioId: Number(voluntarioId),
    fechaInicio: inicio,
    fechaFin: fin,
  });

  return asignacion;
}

// Remueve un voluntario de una cuadrilla (R2)
async function removerVoluntario(cuadrillaId, voluntarioId) {
  const asignacion = await cvRepo().findOne({
    where: {
      cuadrillaId: Number(cuadrillaId),
      voluntarioId: Number(voluntarioId),
      fechaFin: null,
    },
  });

  if (!asignacion) {
    throw errorNoEncontrado('El voluntario no está asignado activamente a esta cuadrilla');
  }

  await cvRepo().update(asignacion.id, { fechaFin: new Date() });

  return { mensaje: 'Voluntario removido de la cuadrilla correctamente' };
}

module.exports = {
  listarCuadrillas,
  obtenerCuadrilla,
  crearCuadrilla,
  actualizarCuadrilla,
  disolverCuadrilla,
  eliminarCuadrilla,
  agregarVoluntario,
  removerVoluntario,
};
