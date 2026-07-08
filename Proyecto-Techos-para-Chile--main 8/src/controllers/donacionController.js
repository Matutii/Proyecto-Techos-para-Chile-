const { AppDataSource } = require('../config/configDb.mjs');

const donacionRepo = () => AppDataSource.getRepository('Donacion');

const METODOS_VALIDOS = ['transferencia', 'tarjeta', 'efectivo'];

const ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'rechazada'];

// POST /api/donaciones
async function crearDonacion(req, res, next) {
  try {
    const { donanteNombre, donanteEmail, monto, metodoPago } = req.body;

    if (!monto || Number(monto) <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    if (metodoPago && !METODOS_VALIDOS.includes(metodoPago)) {
      return res.status(400).json({ error: `Método de pago inválido. Use: ${METODOS_VALIDOS.join(', ')}` });
    }

    const pendiente = await donacionRepo().findOne({
      where: { usuarioId: req.usuario.id, estado: 'pendiente' },
    });
    if (pendiente) {
      return res.status(400).json({ error: 'Ya tienes una donación pendiente. Espera a que sea revisada antes de realizar otra.' });
    }

    const comprobante = req.file ? req.file.filename : null;

    const donacion = await donacionRepo().save({
      donanteNombre: donanteNombre || null,
      donanteEmail: donanteEmail || null,
      monto: Number(monto),
      metodoPago: metodoPago || null,
      usuarioId: req.usuario.id,
      estado: 'pendiente',
      comprobante,
    });

    res.status(201).json(donacion);
  } catch (err) {
    next(err);
  }
}

// GET /api/donaciones (admin, coordinador_logistica)
async function listarDonaciones(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.metodoPago) where.metodoPago = req.query.metodoPago;

    const donaciones = await donacionRepo().find({
      where,
      order: { creadoEn: 'DESC' },
      relations: ['usuario'],
    });

    res.json(donaciones);
  } catch (err) {
    next(err);
  }
}

// GET /api/donaciones/mis-donaciones (visitante)
async function misDonaciones(req, res, next) {
  try {
    const donaciones = await donacionRepo().find({
      where: { usuarioId: req.usuario.id },
      order: { creadoEn: 'DESC' },
    });
    res.json(donaciones);
  } catch (err) {
    next(err);
  }
}

// GET /api/donaciones/metodos-pago (público)
async function metodosPago(req, res) {
  res.json([
    { id: 'transferencia', nombre: 'Transferencia bancaria' },
    { id: 'tarjeta', nombre: 'Tarjeta de crédito/débito' },
    { id: 'efectivo', nombre: 'Efectivo' },
  ]);
}

// PATCH /api/donaciones/:id/estado (admin, coordinador_logistica)
async function actualizarEstado(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Use: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    const donacion = await donacionRepo().findOne({ where: { id: Number(id) } });

    if (!donacion) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }

    donacion.estado = estado;
    await donacionRepo().save(donacion);

    res.json(donacion);
  } catch (err) {
    next(err);
  }
}

module.exports = { crearDonacion, listarDonaciones, misDonaciones, metodosPago, actualizarEstado };
