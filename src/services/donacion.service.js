const { AppDataSource } = require('../config/configDb.mjs');

const donacionRepo = () => AppDataSource.getRepository('Donacion');

const ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'rechazada'];

// Crea una nueva donación con estado 'pendiente'
async function crearDonacion(datos) {
  if (!datos.monto || Number(datos.monto) <= 0) {
    throw Object.assign(new Error('El monto debe ser mayor a 0'), { status: 400 });
  }

  const donacion = await donacionRepo().save({
    donanteNombre: datos.donanteNombre || null,
    donanteEmail:  datos.donanteEmail  || null,
    monto:         Number(datos.monto),
    metodoPago:    datos.metodoPago    || null,
    usuarioId:     datos.usuarioId     || null,
    estado:        'pendiente',
  });

  return donacion;
}

// Lista donaciones con filtros opcionales por estado o método de pago
async function listarDonaciones(filtros = {}) {
  const where = {};

  if (filtros.estado)     where.estado     = filtros.estado;
  if (filtros.metodoPago) where.metodoPago = filtros.metodoPago;

  return await donacionRepo().find({
    where,
    order: { creadoEn: 'DESC' },
    relations: ['usuario'],
    select: { usuario: { id: true, nombre: true } },
  });
}

// Actualiza el estado de una donación (aceptar = confirmada, rechazar = rechazada)
async function actualizarEstado(id, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw Object.assign(new Error(`Estado inválido. Use: ${ESTADOS_VALIDOS.join(', ')}`), { status: 400 });
  }

  const donacion = await donacionRepo().findOne({ where: { id: Number(id) } });
  if (!donacion) {
    throw Object.assign(new Error('Donación no encontrada'), { status: 404 });
  }

  donacion.estado = estado;
  await donacionRepo().save(donacion);

  return donacion;
}

// Retorna la lista estática de métodos de pago disponibles
async function obtenerInfoMetodosPago() {
  return [
    { id: 'transferencia', nombre: 'Transferencia bancaria' },
    { id: 'tarjeta',       nombre: 'Tarjeta de crédito/débito' },
    { id: 'efectivo',      nombre: 'Efectivo' },
  ];
}

module.exports = {
  crearDonacion,
  listarDonaciones,
  actualizarEstado,
  obtenerInfoMetodosPago,
};