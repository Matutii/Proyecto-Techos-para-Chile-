import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stockApi } from '../../api/stock.api';
import { ErrorState } from '../../components/common/ErrorState';

export function StockEntradaForm({ materialId, onRegistrado }) {
  const { token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await stockApi.registrarEntrada(token, materialId, {
        cantidad: Number(cantidad),
        observacion: observacion || undefined,
      });
      setCantidad('');
      setObservacion('');
      setVisible(false);
      onRegistrado?.();
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  }

  if (!visible) {
    return (
      <button type="button" className="boton-secundario" onClick={() => setVisible(true)}>
        Registrar entrada
      </button>
    );
  }

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h3>Registrar entrada</h3>

      <label htmlFor="cantidadEntrada">Cantidad</label>
      <input
        id="cantidadEntrada"
        type="number"
        min={1}
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        required
      />

      <label htmlFor="observacionEntrada">Observación (opcional)</label>
      <textarea
        id="observacionEntrada"
        value={observacion}
        onChange={(e) => setObservacion(e.target.value)}
        maxLength={500}
      />

      <ErrorState error={error} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="boton-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Confirmar'}
        </button>
        <button type="button" className="boton-secundario" onClick={() => setVisible(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
