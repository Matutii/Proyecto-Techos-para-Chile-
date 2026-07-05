import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stockApi } from '../../api/stock.api';
import { ErrorState } from '../../components/common/ErrorState';

export function StockCreateForm({ onCreado }) {
  const { token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [umbralBajoStock, setUmbralBajoStock] = useState('');
  const [cantidadDisponible, setCantidadDisponible] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function limpiar() {
    setNombre('');
    setDescripcion('');
    setUmbralBajoStock('');
    setCantidadDisponible('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await stockApi.crear(token, {
        nombre,
        descripcion: descripcion || undefined,
        umbralBajoStock: Number(umbralBajoStock),
        cantidadDisponible: cantidadDisponible === '' ? undefined : Number(cantidadDisponible),
      });
      limpiar();
      setVisible(false);
      onCreado?.();
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  }

  if (!visible) {
    return (
      <button type="button" className="boton-primario" onClick={() => setVisible(true)}>
        Nuevo material
      </button>
    );
  }

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h3>Nuevo material</h3>

      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={3} maxLength={200} />

      <label htmlFor="descripcion">Descripción</label>
      <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} />

      <label htmlFor="umbral">Umbral de bajo stock</label>
      <input
        id="umbral"
        type="number"
        min={0}
        value={umbralBajoStock}
        onChange={(e) => setUmbralBajoStock(e.target.value)}
        required
      />

      <label htmlFor="cantidadInicial">Cantidad inicial (opcional)</label>
      <input
        id="cantidadInicial"
        type="number"
        min={0}
        value={cantidadDisponible}
        onChange={(e) => setCantidadDisponible(e.target.value)}
      />

      <ErrorState error={error} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="boton-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="boton-secundario" onClick={() => setVisible(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
