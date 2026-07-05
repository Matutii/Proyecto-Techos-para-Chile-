import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { stockApi } from '../../api/stock.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';
import { RoleGate } from '../../components/common/RoleGate';
import { StockEntradaForm } from './StockEntradaForm';
import { StockAsignarForm } from './StockAsignarForm';

export function StockDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [material, setMaterial] = useState(null);
  const [error, setError] = useState(null);
  const [actualizandoEnCamino, setActualizandoEnCamino] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const datos = await stockApi.obtener(token, id);
      setMaterial(datos);
    } catch (err) {
      setError(err);
    }
  }, [token, id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function toggleEnCamino() {
    setActualizandoEnCamino(true);
    try {
      await stockApi.actualizarEnCamino(token, id, !material.enCaminoManual);
      await cargar();
    } catch (err) {
      setError(err);
    } finally {
      setActualizandoEnCamino(false);
    }
  }

  if (error && !material) return <ErrorState error={error} />;
  if (!material) return <LoadingState />;

  return (
    <div>
      <Link to="/stock">&larr; Volver a Stock</Link>
      <h1>{material.nombre}</h1>
      {material.descripcion && <p>{material.descripcion}</p>}

      <div className="cards-resumen">
        <div className="card">
          <div className="card-valor">{material.cantidadDisponible}</div>
          <div className="card-etiqueta">Cantidad disponible</div>
        </div>
        <div className="card">
          <div className="card-valor">{material.umbralBajoStock}</div>
          <div className="card-etiqueta">Umbral de bajo stock</div>
        </div>
        <div className="card">
          <div className="card-valor">
            <EstadoBadge estado={material.estado} />
          </div>
          <div className="card-etiqueta">Estado</div>
        </div>
      </div>

      <ErrorState error={error} />

      <RoleGate>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <StockEntradaForm materialId={id} onRegistrado={cargar} />
          <StockAsignarForm materialId={id} onAsignado={cargar} />
          <button type="button" className="boton-secundario" onClick={toggleEnCamino} disabled={actualizandoEnCamino}>
            {material.enCaminoManual ? 'Desmarcar "En camino"' : 'Marcar "En camino"'}
          </button>
        </div>
      </RoleGate>

      <h2>Historial de movimientos</h2>
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Proyecto</th>
            <th>Usuario</th>
            <th>Observación</th>
          </tr>
        </thead>
        <tbody>
          {material.historialStock.map((h) => (
            <tr key={h.id}>
              <td>{new Date(h.registradoEn).toLocaleString()}</td>
              <td>{h.tipoMovimiento}</td>
              <td>{h.cantidad}</td>
              <td>{h.proyectoId ?? '—'}</td>
              <td>{h.usuario?.nombre ?? '—'}</td>
              <td>{h.observacion ?? '—'}</td>
            </tr>
          ))}
          {material.historialStock.length === 0 && (
            <tr>
              <td colSpan={6} className="estado-info">
                Sin movimientos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
