import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donacionesApi } from '../../api/donaciones.api';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EstadoBadge } from '../../components/common/EstadoBadge';

const ESTADOS = ['pendiente', 'confirmada', 'rechazada'];
const METODOS = ['transferencia', 'tarjeta', 'efectivo'];

export function DonacionListPage() {
  const { token, puedeGestionar } = useAuth();
  const [donaciones, setDonaciones] = useState(null);
  const [estado, setEstado] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!puedeGestionar()) return;
    setError(null);
    donacionesApi
      .listar(token, { estado: estado || undefined, metodoPago: metodoPago || undefined })
      .then(setDonaciones)
      .catch(setError);
  }, [token, estado, metodoPago, puedeGestionar]);

  if (!puedeGestionar()) {
    return <p className="estado-info">No tenés permisos para ver el listado de donaciones.</p>;
  }

  return (
    <div>
      <h1>Donaciones</h1>

      <div className="filtros">
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="">Todos los métodos</option>
          {METODOS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <ErrorState error={error} />

      {donaciones === null ? (
        <LoadingState />
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Donante</th>
              <th>Email</th>
              <th>Monto</th>
              <th>Método de pago</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {donaciones.map((d) => (
              <tr key={d.id}>
                <td>{d.donanteNombre ?? 'Anónimo'}</td>
                <td>{d.donanteEmail ?? '—'}</td>
                <td>{d.monto}</td>
                <td>{d.metodoPago ?? '—'}</td>
                <td>
                  <EstadoBadge estado={d.estado} />
                </td>
                <td>{new Date(d.creadoEn).toLocaleString()}</td>
              </tr>
            ))}
            {donaciones.length === 0 && (
              <tr>
                <td colSpan={6} className="estado-info">
                  No hay donaciones para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
