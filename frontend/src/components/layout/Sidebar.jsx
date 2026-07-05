import { NavLink } from 'react-router-dom';

const ITEMS_ACTIVOS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/stock', label: 'Stock' },
  { to: '/voluntarios', label: 'Voluntarios' },
  { to: '/cuadrillas', label: 'Cuadrillas' },
  { to: '/donaciones', label: 'Donaciones' },
];

const ITEMS_PROXIMAMENTE = ['Usuarios', 'Reportes', 'Configuración'];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-titulo">Techos para Chile</div>
      <nav className="sidebar-nav">
        {ITEMS_ACTIVOS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' activo' : '')}
          >
            {item.label}
          </NavLink>
        ))}
        {ITEMS_PROXIMAMENTE.map((label) => (
          <span key={label} className="sidebar-link deshabilitado" title="Próximamente">
            {label}
          </span>
        ))}
      </nav>
    </aside>
  );
}
