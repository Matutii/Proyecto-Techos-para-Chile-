import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cuadrillasApi } from '../../api/cuadrillas.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';
import { RoleGate } from '../../components/common/RoleGate';
import { CuadrillaAgregarVoluntarioForm } from './CuadrillaAgregarVoluntarioForm';

export function CuadrillaDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cuadrilla, setCuadrilla] = useState(null);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const datos = await cuadrillasApi.obtener(token, id);
      setCuadrilla(datos);
    } catch (err) {
      setError(err);
    }
  }, [token, id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function handleEliminar() {
    if (!window.confirm('¿Eliminar esta cuadrilla? Esta acción no se puede deshacer.')) return;
    setEliminando(true);
    try {
      await cuadrillasApi.eliminar(token, id);
      navigate('/cuadrillas');
    } catch (err) {
      setError(err);
      setEliminando(false);
    }
  }

  if (error && !cuadrilla) return <ErrorState error={error} />;
  if (!cuadrilla) return <LoadingState />;

  return (
    <div>
      <Link to="/cuadrillas">&larr; Volver a Cuadrillas</Link>
      <h1>{cuadrilla.nombre}</h1>

      <div className="cards-resumen">
        <div className="card">
          <div className="card-valor">
            <EstadoBadge estado={cuadrilla.estado} />
          </div>
          <div className="card-etiqueta">Estado</div>
        </div>
        <div className="card">
          <div className="card-valor">{cuadrilla.especialidad.replaceAll('_', ' ')}</div>
          <div className="card-etiqueta">Especialidad</div>
        </div>
        <div className="card">
          <div className="card-valor">{cuadrilla.proyecto?.nombre ?? '—'}</div>
          <div className="card-etiqueta">Proyecto</div>
        </div>
        <div className="card">
          <div className="card-valor">
            {cuadrilla.jefeCuadrilla ? `${cuadrilla.jefeCuadrilla.nombre} ${cuadrilla.jefeCuadrilla.apellido}` : '—'}
          </div>
          <div className="card-etiqueta">Jefe de cuadrilla</div>
        </div>
      </div>

      <ErrorState error={error} />

      <RoleGate>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link to={`/cuadrillas/${id}/editar`} className="boton-secundario">
            Editar
          </Link>
          <CuadrillaAgregarVoluntarioForm cuadrillaId={id} onAgregado={cargar} />
        </div>
      </RoleGate>

      <RoleGate roles={['admin']}>
        <button type="button" className="boton-secundario" onClick={handleEliminar} disabled={eliminando}>
          {eliminando ? 'Eliminando...' : 'Eliminar cuadrilla'}
        </button>
      </RoleGate>

      <h2 style={{ marginTop: 24 }}>Integrantes</h2>
      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Desde</th>
          </tr>
        </thead>
        <tbody>
          {cuadrilla.voluntarios.map((cv) => (
            <tr key={cv.id}>
              <td>
                {cv.voluntario.nombre} {cv.voluntario.apellido}
              </td>
              <td>{cv.voluntario.especialidad?.replaceAll('_', ' ') ?? '—'}</td>
              <td>{new Date(cv.fechaInicio).toLocaleDateString()}</td>
            </tr>
          ))}
          {cuadrilla.voluntarios.length === 0 && (
            <tr>
              <td colSpan={3} className="estado-info">
                Sin integrantes asignados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
