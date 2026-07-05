import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { stockApi } from '../../api/stock.api';
import { proyectosApi } from '../../api/proyectos.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';
import { RoleGate } from '../../components/common/RoleGate';
import { StockCreateForm } from './StockCreateForm';

const ESTADOS = ['Disponible', 'Bajo_Stock', 'Agotado', 'En_camino'];

export function StockListPage() {
  const { token } = useAuth();
  const [materiales, setMateriales] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [estado, setEstado] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const datos = await stockApi.listar(token, { estado: estado || undefined, proyectoId: proyectoId || undefined });
      setMateriales(datos);
    } catch (err) {
      setError(err);
    }
  }, [token, estado, proyectoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    proyectosApi.listar(token).then(setProyectos).catch(() => setProyectos([]));
  }, [token]);

  return (
    <div>
      <h1>Stock</h1>

      <div className="filtros">
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
          <option value="">Todos los proyectos</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <Link to="/stock/proyectos" className="boton-secundario">
          Vista por proyectos
        </Link>
      </div>

      <RoleGate>
        <div style={{ marginBottom: 16 }}>
          <StockCreateForm onCreado={cargar} />
        </div>
      </RoleGate>

      <ErrorState error={error} />

      {materiales === null ? (
        <LoadingState />
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad disponible</th>
              <th>Umbral</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link to={`/stock/${m.id}`}>{m.nombre}</Link>
                </td>
                <td>{m.cantidadDisponible}</td>
                <td>{m.umbralBajoStock}</td>
                <td>
                  <EstadoBadge estado={m.estado} />
                </td>
              </tr>
            ))}
            {materiales.length === 0 && (
              <tr>
                <td colSpan={4} className="estado-info">
                  No hay materiales para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
