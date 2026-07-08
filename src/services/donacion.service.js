const { AppDataSource } = require('../config/configDb.mjs');

const donacionRepo = () => AppDataSource.getRepository('Donacion');

const ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'rechazada'];

async function crearDonacion(datos) {
  if (!datos.monto || Number(datos.monto) <= 0) {
    throw Object.assign(new Error('El monto debe ser mayor a 0'), { status: 400 });
  }

  if (datos.usuarioId) {
    const pendiente = await donacionRepo().findOne({
      where: { usuarioId: datos.usuarioId, estado: 'pendiente' },
    });
    if (pendiente) {
      throw Object.assign(
        new Error('Ya tienes una donación pendiente de revisión. Debes esperar a que sea aceptada o rechazada antes de hacer otra.'),
        { status: 400 }
      );
    }
  }

  const donacion = await donacionRepo().save({
    donanteNombre: datos.donanteNombre || null,
    donanteEmail:  datos.donanteEmail  || null,
    monto:         Number(datos.monto),
    metodoPago:    datos.metodoPago    || null,
    usuarioId:     datos.usuarioId     || null,
    comprobante:   datos.comprobante   || null,
    estado:        'pendiente',
  });

  return donacion;
}

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

async function listarDonacionesPorUsuario(usuarioId) {
  return await donacionRepo().find({
    where: { usuarioId },
    order: { creadoEn: 'DESC' },
  });
}

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
  listarDonacionesPorUsuario,
  obtenerInfoMetodosPago,
};
