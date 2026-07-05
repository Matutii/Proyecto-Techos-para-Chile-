import { useAuth } from '../../context/AuthContext';

export function Topbar() {
  const { usuario, logout } = useAuth();

  return (
    <header className="topbar">
      <div />
      {usuario && (
        <div className="topbar-usuario">
          <span className="topbar-nombre">{usuario.nombre}</span>
          <span className="topbar-rol">{usuario.rol}</span>
          <button type="button" onClick={logout} className="boton-secundario">
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
