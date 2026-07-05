import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorState } from '../components/common/ErrorState';

export function LoginPage() {
  const { estaAutenticado, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (estaAutenticado) {
    const destino = location.state?.from || '/dashboard';
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-pantalla">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Techos para Chile</h1>
        <p className="login-subtitulo">Iniciar sesión</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <ErrorState error={error} />

        <button type="submit" disabled={cargando} className="boton-primario">
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16 }}>
          ¿Querés ser voluntario? <Link to="/voluntarios/inscripcion">Inscríbete como voluntario</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 4 }}>
          ¿Querés donar? <Link to="/donaciones/nueva">Hacé tu donación</Link>
        </p>
      </form>
    </div>
  );
}
