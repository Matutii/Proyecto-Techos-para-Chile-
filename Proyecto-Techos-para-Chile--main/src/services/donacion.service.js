// TODO: Implementar por el compañero
// Dependencias necesarias:
//   - AppDataSource.getRepository('Donacion') desde ../config/configDb.mjs

const { AppDataSource } = require('../config/configDb.mjs');

const donacionRepo = () => AppDataSource.getRepository('Donacion');

/**
 * @param {object} datos - { donanteNombre, donanteEmail, monto, metodoPago, usuarioId? }
 * @returns {Promise<object>}
 */
async function crearDonacion(datos) {
  // 1. Validar que monto sea > 0
  // 2. Crear donacion con donacionRepo().save({ ...datos, estado: 'pendiente' })
  // 3. Retornar la donacion creada
  throw new Error('donacion.service.crearDonacion no implementado');
}

/**
 * @param {object} filtros - { estado?, metodoPago? }
 * @returns {Promise<Array>}
 */
async function listarDonaciones(filtros = {}) {
  // 1. Construir where con filtros opcionales (estado, metodoPago)
  // 2. Buscar con donacionRepo().find({ where, order: { creadoEn: 'DESC' }, relations: ['usuario'] })
  // 3. Retornar el listado
  throw new Error('donacion.service.listarDonaciones no implementado');
}

/**
 * @returns {Promise<Array>}
 */
async function obtenerInfoMetodosPago() {
  // 1. Retornar lista estática de métodos de pago disponibles:
  //    [ { id: 'transferencia', nombre: 'Transferencia bancaria' },
  //      { id: 'tarjeta', nombre: 'Tarjeta de crédito/débito' },
  //      { id: 'efectivo', nombre: 'Efectivo' } ]
  throw new Error('donacion.service.obtenerInfoMetodosPago no implementado');
}

module.exports = {
  crearDonacion,
  listarDonaciones,
  obtenerInfoMetodosPago,
};
