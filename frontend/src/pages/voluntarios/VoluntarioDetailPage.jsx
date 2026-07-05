import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { voluntariosApi } from '../../api/voluntarios.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';

export function VoluntarioDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [voluntario, setVoluntario] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    voluntariosApi.obtener(token, id).then(setVoluntario).catch(setError);
  }, [token, id]);

  if (error) return <ErrorState error={error} />;
  if (!voluntario) return <LoadingState />;

  return (
    <div>
      <Link to="/voluntarios">&larr; Volver a Voluntarios</Link>
      <h1>
        {voluntario.nombre} {voluntario.apellido}
      </h1>

      <div className="cards-resumen">
        <div className="card">
          <div className="card-valor">
            <EstadoBadge estado={voluntario.estado} />
          </div>
          <div className="card-etiqueta">Estado</div>
        </div>
        <div className="card">
          <div className="card-valor">{voluntario.especialidad.replaceAll('_', ' ')}</div>
          <div className="card-etiqueta">Especialidad</div>
        </div>
        <div className="card">
          <div className="card-valor">{voluntario.experienciaAnos}</div>
          <div className="card-etiqueta">Años de experiencia</div>
        </div>
      </div>

      <table className="tabla">
        <tbody>
          <tr>
            <th>Email</th>
            <td>{voluntario.email}</td>
          </tr>
          <tr>
            <th>Teléfono</th>
            <td>{voluntario.telefono ?? '—'}</td>
          </tr>
          <tr>
            <th>Datos médicos</th>
            <td>{voluntario.datosMedicos}</td>
          </tr>
          <tr>
            <th>Contacto de emergencia</th>
            <td>
              {voluntario.contactoEmergenciaNombre} — {voluntario.contactoEmergenciaTelefono}
            </td>
          </tr>
          <tr>
            <th>Habilidades</th>
            <td>{voluntario.habilidades ?? '—'}</td>
          </tr>
          <tr>
            <th>Inscrito el</th>
            <td>{new Date(voluntario.inscritoEn).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
