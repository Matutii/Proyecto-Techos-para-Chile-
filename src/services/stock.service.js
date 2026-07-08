const { In } = require('typeorm');
const { AppDataSource } = require('../config/configDb.mjs');

const materialRepo = () => AppDataSource.getRepository('Material');
const historialRepo = () => AppDataSource.getRepository('HistorialStock');
const proyectoRepo = () => AppDataSource.getRepository('Proyecto');
const asignacionRepo = () => AppDataSource.getRepository('AsignacionMaterial');

function errorNoEncontrado(mensaje) {
  const err = new Error(mensaje);
  err.status = 404;
  return err;
}

// Calcula el estado del material a partir de su cantidad, umbral y el flag manual de en camino
function calcularEstado(cantidadDisponible, umbralBajoStock, enCaminoManual) {
  if (enCaminoManual) return 'En_camino';
  if (cantidadDisponible > umbralBajoStock) return 'Disponible';
  if (cantidadDisponible > 0) return 'Bajo_Stock';
  return 'Agotado';
}

// Lista todos los materiales con filtros opcionales por estado o proyecto
async function listarMateriales(filtros = {}) {
  const where = {};

  if (filtros.proyectoId) {
    const asignaciones = await asignacionRepo().find({ where: { proyectoId: Number(filtros.proyectoId) } });
    const materialIds = asignaciones.map((a) => a.materialId);
    if (materialIds.length === 0) return [];
    where.id = In(materialIds);
  }

  const materiales = await materialRepo().find({ where, order: { id: 'ASC' } });

  const conEstado = materiales.map((m) => ({
    ...m,
    estado: calcularEstado(m.cantidadDisponible, m.umbralBajoStock, m.enCaminoManual),
  }));

  if (filtros.estado) {
    return conEstado.filter((m) => m.estado === filtros.estado);
  }

  return conEstado;
}

// Obtiene un material por ID incluyendo su estado calculado y su historial de movimientos
async function obtenerMaterial(id) {
  const material = await materialRepo().findOne({ where: { id: Number(id) } });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  const historial = await historialRepo().find({
    where: { materialId: material.id },
    relations: ['usuario'],
    select: { usuario: { id: true, nombre: true } },
    order: { registradoEn: 'DESC' },
  });

  return {
    ...material,
    estado: calcularEstado(material.cantidadDisponible, material.umbralBajoStock, material.enCaminoManual),
    historialStock: historial,
  };
}

// Crea un material y, si tiene cantidad inicial, registra la entrada en el historial
async function crearMaterial(datos, usuarioId) {
  const cantidadInicial = datos.cantidadDisponible ? Number(datos.cantidadDisponible) : 0;

  const material = await materialRepo().save({
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    umbralBajoStock: Number(datos.umbralBajoStock),
    cantidadDisponible: cantidadInicial,
  });

  if (cantidadInicial > 0) {
    await historialRepo().save({
      materialId: material.id,
      tipoMovimiento: 'entrada',
      cantidad: cantidadInicial,
      proyectoId: null,
      usuarioId,
      observacion: 'Alta inicial',
    });
  }

  return await obtenerMaterial(material.id);
}

// Registra una entrada de stock (llegada de nuevos materiales) y actualiza la cantidad disponible
async function registrarEntrada(materialId, cantidad, usuarioId, observacion) {
  const material = await materialRepo().findOne({ where: { id: Number(materialId) } });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  const cant = Number(cantidad);

  await materialRepo().update(material.id, {
    cantidadDisponible: material.cantidadDisponible + cant,
  });

  await historialRepo().save({
    materialId: material.id,
    tipoMovimiento: 'entrada',
    cantidad: cant,
    proyectoId: null,
    usuarioId,
    observacion: observacion || null,
  });

  return await obtenerMaterial(material.id);
}

// Asigna unidades de un material a un proyecto, descontando del stock general y acumulando la asignación
async function asignarAProyecto(materialId, proyectoId, cantidad, usuarioId, observacion) {
  const material = await materialRepo().findOne({ where: { id: Number(materialId) } });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  const proyecto = await proyectoRepo().findOne({ where: { id: Number(proyectoId) } });

  if (!proyecto) {
    throw errorNoEncontrado('Proyecto no encontrado');
  }

  const cant = Number(cantidad);

  if (material.cantidadDisponible < cant) {
    const err = new Error('Stock insuficiente');
    err.status = 400;
    throw err;
  }

  await materialRepo().update(material.id, {
    cantidadDisponible: material.cantidadDisponible - cant,
  });

  const existente = await asignacionRepo().findOne({
    where: { materialId: material.id, proyectoId: proyecto.id },
  });

  if (existente) {
    await asignacionRepo().update(existente.id, {
      cantidadAsignada: existente.cantidadAsignada + cant,
    });
  } else {
    await asignacionRepo().save({
      materialId: material.id,
      proyectoId: proyecto.id,
      cantidadAsignada: cant,
    });
  }

  await historialRepo().save({
    materialId: material.id,
    tipoMovimiento: 'asignacion',
    cantidad: cant,
    proyectoId: proyecto.id,
    usuarioId,
    observacion: observacion || null,
  });

  return await obtenerMaterial(material.id);
}

// Retira unidades del stock general (uso del colaborador en terreno), sin bajar de 0
async function retirarStock(materialId, cantidad, usuarioId, observacion) {
  const material = await materialRepo().findOne({ where: { id: Number(materialId) } });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  const cant = Number(cantidad);

  if (material.cantidadDisponible < cant) {
    const err = new Error('Stock insuficiente');
    err.status = 400;
    throw err;
  }

  await materialRepo().update(material.id, {
    cantidadDisponible: material.cantidadDisponible - cant,
  });

  await historialRepo().save({
    materialId: material.id,
    tipoMovimiento: 'retiro',
    cantidad: cant,
    proyectoId: null,
    usuarioId,
    observacion: observacion || null,
  });

  return await obtenerMaterial(material.id);
}

// Actualiza el flag manual de "en camino" de un material
async function actualizarEnCamino(materialId, enCaminoManual) {
  const material = await materialRepo().findOne({ where: { id: Number(materialId) } });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  await materialRepo().update(material.id, { enCaminoManual: !!enCaminoManual });

  return await obtenerMaterial(material.id);
}

// Devuelve, por cada proyecto, el conteo de materiales asignados según su estado actual
async function vistaPorProyectos() {
  const proyectos = await proyectoRepo().find({ order: { id: 'ASC' } });
  const asignaciones = await asignacionRepo().find({ relations: ['material'] });

  return proyectos.map((p) => {
    const estadosDelProyecto = asignaciones
      .filter((a) => a.proyectoId === p.id)
      .map((a) => calcularEstado(a.material.cantidadDisponible, a.material.umbralBajoStock, a.material.enCaminoManual));

    return {
      id: p.id,
      nombre: p.nombre,
      disponibles: estadosDelProyecto.filter((e) => e === 'Disponible').length,
      bajoStock: estadosDelProyecto.filter((e) => e === 'Bajo_Stock').length,
      agotados: estadosDelProyecto.filter((e) => e === 'Agotado').length,
      enCamino: estadosDelProyecto.filter((e) => e === 'En_camino').length,
    };
  });
}

module.exports = {
  calcularEstado,
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  registrarEntrada,
  asignarAProyecto,
  retirarStock,
  actualizarEnCamino,
  vistaPorProyectos,
};
