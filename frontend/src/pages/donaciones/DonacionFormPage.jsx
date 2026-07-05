import { useEffect, useState } from 'react';
import { donacionesApi } from '../../api/donaciones.api';
import { ErrorState } from '../../components/common/ErrorState';

export function DonacionFormPage() {
  const [donanteNombre, setDonanteNombre] = useState('');
  const [donanteEmail, setDonanteEmail] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [metodosPago, setMetodosPago] = useState([]);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    donacionesApi.obtenerMetodosPago().then(setMetodosPago).catch(() => setMetodosPago([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await donacionesApi.crear({
        donanteNombre: donanteNombre || undefined,
        donanteEmail: donanteEmail || undefined,
        monto: Number(monto),
        metodoPago: metodoPago || undefined,
      });
      setExito(true);
      setDonanteNombre('');
      setDonanteEmail('');
      setMonto('');
      setMetodoPago('');
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <div className="login-pantalla">
        <div className="login-card">
          <h1>¡Gracias por tu donación!</h1>
          <p>Tu aporte quedó registrado como pendiente de confirmación.</p>
          <button type="button" className="boton-primario" onClick={() => setExito(false)}>
            Hacer otra donación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-pantalla">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Donar</h1>
        <p className="login-subtitulo">Podés donar de forma anónima o dejar tus datos</p>

        <label htmlFor="donanteNombre">Nombre (opcional)</label>
        <input
          id="donanteNombre"
          value={donanteNombre}
          onChange={(e) => setDonanteNombre(e.target.value)}
          minLength={3}
          maxLength={150}
        />

        <label htmlFor="donanteEmail">Email (opcional)</label>
        <input id="donanteEmail" type="email" value={donanteEmail} onChange={(e) => setDonanteEmail(e.target.value)} />

        <label htmlFor="monto">Monto</label>
        <input
          id="monto"
          type="number"
          min={0.01}
          step="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />

        <label htmlFor="metodoPago">Método de pago (opcional)</label>
        <select id="metodoPago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="">Sin especificar</option>
          {metodosPago.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>

        <ErrorState error={error} />

        <button type="submit" className="boton-primario" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Donar'}
        </button>
      </form>
    </div>
  );
}
