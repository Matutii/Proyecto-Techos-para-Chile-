import { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cuadrillasApi } from '../../api/cuadrillas.api';
import { voluntariosApi } from '../../api/voluntarios.api';
import { proyectosApi } from '../../api/proyectos.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

const ESPECIALIDADES = ['fuerza_general', 'tecnico', 'logistica'];
const ESTADOS = ['En_formacion', 'Lista_para_asignacion', 'Disuelta'];

export function CuadrillaFormPage() {
  const { id } = useParams();
  const esEdicion = !!id;
  const { token, puedeGestionar } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('fuerza_general');
  const [estado, setEstado] = useState('En_formacion');
  const [jefeCuadrillaId, setJefeCuadrillaId] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [voluntarios, setVoluntarios] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(esEdicion);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    voluntariosApi.listar(token).then(setVoluntarios).catch(() => setVoluntarios([]));
    proyectosApi.listar(token).then(setProyectos).catch(() => setProyectos([]));
  }, [token]);

  useEffect(() => {
    if (!esEdicion) return;
    cuadrillasApi
      .obtener(token, id)
      .then((c) => {
        setNombre(c.nombre);
        setEspecialidad(c.especialidad);
        setEstado(c.estado);
        setJefeCuadrillaId(c.jefeCuadrillaId ?? '');
        setProyectoId(c.proyectoId ?? '');
      })
      .catch(setError)
      .finally(() => setCargandoDatos(false));
  }, [esEdicion, id, token]);

  if (!puedeGestionar()) {
    return <Navigate to="/cuadrillas" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const datos = {
      nombre,
      especialidad,
      estado,
      jefeCuadrillaId: jefeCuadrillaId === '' ? null : Number(jefeCuadrillaId),
      proyectoId: proyectoId === '' ? null : Number(proyectoId),
    };

    try {
      if (esEdicion) {
        await cuadrillasApi.actualizar(token, id, datos);
        navigate(`/cuadrillas/${id}`);
      } else {
        const creada = await cuadrillasApi.crear(token, datos);
        navigate(`/cuadrillas/${creada.id}`);
      }
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoDatos) return <LoadingState />;

  return (
    <div>
      <Link to="/cuadrillas">&larr; Volver a Cuadrillas</Link>
      <h1>{esEdicion ? 'Editar cuadrilla' : 'Nueva cuadrilla'}</h1>

      <form className="formulario" onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required minLength={3} maxLength={200} />

        <label htmlFor="especialidad">Especialidad</label>
        <select id="especialidad" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} required>
          {ESPECIALIDADES.map((e) => (
            <option key={e} value={e}>
              {e.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <label htmlFor="estado">Estado</label>
        <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <label htmlFor="jefe">Jefe de cuadrilla (opcional)</label>
        <select id="jefe" value={jefeCuadrillaId} onChange={(e) => setJefeCuadrillaId(e.target.value)}>
          <option value="">Sin asignar</option>
          {voluntarios.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre} {v.apellido}
            </option>
          ))}
        </select>

        <label htmlFor="proyecto">Proyecto (opcional)</label>
        <select id="proyecto" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
          <option value="">Sin asignar</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <ErrorState error={error} />

        <button type="submit" className="boton-primario" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
