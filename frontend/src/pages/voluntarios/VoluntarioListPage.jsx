import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { voluntariosApi } from '../../api/voluntarios.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';

const ESTADOS = ['Pendiente', 'Activo', 'Rechazado'];
const ESPECIALIDADES = ['fuerza_general', 'tecnico', 'jefe_cuadrilla'];

export function VoluntarioListPage() {
  const { token } = useAuth();
  const [voluntarios, setVoluntarios] = useState(null);
  const [estado, setEstado] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    voluntariosApi
      .listar(token, { estado: estado || undefined, especialidad: especialidad || undefined })
      .then(setVoluntarios)
      .catch(setError);
  }, [token, estado, especialidad]);

  return (
    <div>
      <h1>Voluntarios</h1>

      <div style={{ marginBottom: 16 }}>
        <Link to="/voluntarios/inscripcion" className="boton-primario">
          Inscribir voluntario
        </Link>
      </div>

      <div className="filtros">
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
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

      {voluntarios === null ? (
        <LoadingState />
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Especialidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {voluntarios.map((v) => (
              <tr key={v.id}>
                <td>
                  <Link to={`/voluntarios/${v.id}`}>
                    {v.nombre} {v.apellido}
                  </Link>
                </td>
                <td>{v.email}</td>
                <td>{v.especialidad.replaceAll('_', ' ')}</td>
                <td>
                  <EstadoBadge estado={v.estado} />
                </td>
              </tr>
            ))}
            {voluntarios.length === 0 && (
              <tr>
                <td colSpan={4} className="estado-info">
                  No hay voluntarios para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
