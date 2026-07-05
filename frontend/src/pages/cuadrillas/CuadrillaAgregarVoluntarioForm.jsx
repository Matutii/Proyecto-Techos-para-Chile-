import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cuadrillasApi } from '../../api/cuadrillas.api';
import { voluntariosApi } from '../../api/voluntarios.api';
import { ErrorState } from '../../components/common/ErrorState';

export function CuadrillaAgregarVoluntarioForm({ cuadrillaId, onAgregado }) {
  const { token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [voluntarios, setVoluntarios] = useState([]);
  const [voluntarioId, setVoluntarioId] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible) {
      voluntariosApi.listar(token).then(setVoluntarios).catch(() => setVoluntarios([]));
    }
  }, [visible, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await cuadrillasApi.agregarVoluntario(token, cuadrillaId, Number(voluntarioId));
      setVoluntarioId('');
      setVisible(false);
      onAgregado?.();
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  }

  if (!visible) {
    return (
      <button type="button" className="boton-secundario" onClick={() => setVisible(true)}>
        Agregar voluntario
      </button>
    );
  }

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h3>Agregar voluntario</h3>

      <label htmlFor="voluntario">Voluntario</label>
      <select id="voluntario" value={voluntarioId} onChange={(e) => setVoluntarioId(e.target.value)} required>
        <option value="" disabled>
          Seleccionar voluntario
        </option>
        {voluntarios.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nombre} {v.apellido}
          </option>
        ))}
      </select>

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
