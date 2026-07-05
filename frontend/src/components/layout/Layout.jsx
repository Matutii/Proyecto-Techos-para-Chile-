import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-contenido">
        <Topbar />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
