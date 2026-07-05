const { AppDataSource } = require('../config/configDb.mjs');

const donacionRepo = () => AppDataSource.getRepository('Donacion');

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
  });
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
  obtenerInfoMetodosPago,
};