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

// Calcula el estado del material a partir de su cantidad y umbral
function calcularEstado(cantidadDisponible, umbralBajoStock) {
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
    estado: calcularEstado(m.cantidadDisponible, m.umbralBajoStock),
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

  // El historial guarda solo proyectoId; se agrega el nombre para mostrarlo en la UI
  const proyectos = await proyectoRepo().find();
  const nombrePorId = {};
  proyectos.forEach((p) => { nombrePorId[p.id] = p.nombre; });

  const historialConProyecto = historial.map((h) => ({
    ...h,
    proyectoNombre: h.proyectoId ? (nombrePorId[h.proyectoId] || null) : null,
  }));

  return {
    ...material,
    estado: calcularEstado(material.cantidadDisponible, material.umbralBajoStock),
    historialStock: historialConProyecto,
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

// Edita los datos descriptivos de un material (la cantidad solo cambia por entradas/retiros)
async function actualizarMaterial(materialId, datos) {
  const material = await materialRepo().findOne({ where: { id: Number(materialId) } });

  if (!material) {
    throw errorNoEncontrado('Material no encontrado');
  }

  if (datos.nombre !== undefined) material.nombre = datos.nombre;
  if (datos.descripcion !== undefined) material.descripcion = datos.descripcion;
  if (datos.umbralBajoStock !== undefined) material.umbralBajoStock = Number(datos.umbralBajoStock);

  await materialRepo().save(material);

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

// Devuelve, por cada proyecto, el detalle de materiales asignados (con cantidad y estado)
async function vistaPorProyectos() {
  const proyectos = await proyectoRepo().find({ order: { id: 'ASC' } });
  const asignaciones = await asignacionRepo().find({ relations: ['material'] });

  return proyectos.map((p) => {
    const materiales = asignaciones
      .filter((a) => a.proyectoId === p.id)
      .map((a) => ({
        materialId: a.material.id,
        nombre: a.material.nombre,
        cantidadAsignada: a.cantidadAsignada,
        estado: calcularEstado(a.material.cantidadDisponible, a.material.umbralBajoStock),
      }));

    return {
      id: p.id,
      nombre: p.nombre,
      materiales,
    };
  });
}

module.exports = {
  calcularEstado,
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarMaterial,
  registrarEntrada,
  asignarAProyecto,
  retirarStock,
  vistaPorProyectos,
};
