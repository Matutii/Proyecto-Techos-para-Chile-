import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cuadrillasApi } from '../../api/cuadrillas.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';
import { RoleGate } from '../../components/common/RoleGate';

const ESTADOS = ['En_formacion', 'Lista_para_asignacion', 'Disuelta'];
const ESPECIALIDADES = ['fuerza_general', 'tecnico', 'logistica'];

export function CuadrillaListPage() {
  const { token } = useAuth();
  const [cuadrillas, setCuadrillas] = useState(null);
  const [estado, setEstado] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    cuadrillasApi
      .listar(token, { estado: estado || undefined, especialidad: especialidad || undefined })
      .then(setCuadrillas)
      .catch(setError);
  }, [token, estado, especialidad]);

  return (
    <div>
      <h1>Cuadrillas</h1>

      <RoleGate>
        <div style={{ marginBottom: 16 }}>
          <Link to="/cuadrillas/nueva" className="boton-primario">
            Nueva cuadrilla
          </Link>
        </div>
      </RoleGate>

      <div className="filtros">
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
          <option value="">Todas las especialidades</option>
          {ESPECIALIDADES.map((e) => (
            <option key={e} value={e}>
              {e.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <ErrorState error={error} />

      {cuadrillas === null ? (
        <LoadingState />
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Jefe de cuadrilla</th>
              <th>Proyecto</th>
            </tr>
          </thead>
          <tbody>
            {cuadrillas.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/cuadrillas/${c.id}`}>{c.nombre}</Link>
                </td>
                <td>{c.especialidad.replaceAll('_', ' ')}</td>
                <td>
                  <EstadoBadge estado={c.estado} />
                </td>
                <td>{c.jefeCuadrilla ? `${c.jefeCuadrilla.nombre} ${c.jefeCuadrilla.apellido}` : '—'}</td>
                <td>{c.proyecto?.nombre ?? '—'}</td>
              </tr>
            ))}
            {cuadrillas.length === 0 && (
              <tr>
                <td colSpan={5} className="estado-info">
                  No hay cuadrillas para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
