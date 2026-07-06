import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Topbar() {
  const { usuario, logout } = useAuth();

  return (
    <header className="topbar">
      <div />
      {usuario && (
        <div className="topbar-usuario">
          <div className="topbar-avatar" aria-hidden="true">
            {usuario.nombre?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="topbar-identidad">
            <span className="topbar-nombre">{usuario.nombre}</span>
            <span className="topbar-email">{usuario.email}</span>
          </div>
          <span className="topbar-rol">{usuario.rol}</span>
          <button type="button" onClick={logout} className="boton-secundario topbar-salir">
            <LogOut size={15} strokeWidth={2.2} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
