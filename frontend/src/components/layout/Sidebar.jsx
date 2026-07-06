import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Package,
  Users,
  HardHat,
  Heart,
  UserCog,
  BarChart3,
  Settings,
} from 'lucide-react';

const ITEMS_ACTIVOS = [
  { to: '/dashboard', label: 'Dashboard', Icono: LayoutDashboard },
  { to: '/stock', label: 'Stock', Icono: Package },
  { to: '/voluntarios', label: 'Voluntarios', Icono: Users },
  { to: '/cuadrillas', label: 'Cuadrillas', Icono: HardHat },
  { to: '/donaciones', label: 'Donaciones', Icono: Heart },
];

const ITEMS_SISTEMA = [
  { label: 'Usuarios', Icono: UserCog },
  { label: 'Reportes', Icono: BarChart3 },
  { label: 'Configuración', Icono: Settings },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-titulo">
        <Home size={22} strokeWidth={2.2} aria-hidden="true" />
        <span>Techos para Chile</span>
      </div>
      <nav className="sidebar-nav">
        {ITEMS_ACTIVOS.map(({ to, label, Icono }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' activo' : '')}
          >
            <Icono size={17} strokeWidth={2} aria-hidden="true" />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-seccion">Sistema</div>
        {ITEMS_SISTEMA.map(({ label, Icono }) => (
          <span key={label} className="sidebar-link deshabilitado" title="Próximamente">
            <Icono size={17} strokeWidth={2} aria-hidden="true" />
            {label}
          </span>
        ))}
      </nav>
    </aside>
  );
}
