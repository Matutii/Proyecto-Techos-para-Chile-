import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stockApi } from '../../api/stock.api';
import { proyectosApi } from '../../api/proyectos.api';
import { ErrorState } from '../../components/common/ErrorState';

export function StockAsignarForm({ materialId, onAsignado }) {
  const { token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible) {
      proyectosApi.listar(token).then(setProyectos).catch(() => setProyectos([]));
    }
  }, [visible, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await stockApi.asignarAProyecto(token, materialId, {
        proyectoId: Number(proyectoId),
        cantidad: Number(cantidad),
        observacion: observacion || undefined,
      });
      setProyectoId('');
      setCantidad('');
      setObservacion('');
      setVisible(false);
      onAsignado?.();
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  }

  if (!visible) {
    return (
      <button type="button" className="boton-secundario" onClick={() => setVisible(true)}>
        Asignar a proyecto
      </button>
    );
  }

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h3>Asignar a proyecto</h3>

      <label htmlFor="proyecto">Proyecto</label>
      <select id="proyecto" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} required>
        <option value="" disabled>
          Seleccionar proyecto
        </option>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <label htmlFor="cantidadAsignar">Cantidad</label>
      <input
        id="cantidadAsignar"
        type="number"
        min={1}
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        required
      />

      <label htmlFor="observacionAsignar">Observación (opcional)</label>
      <textarea
        id="observacionAsignar"
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
