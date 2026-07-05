import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StockListPage } from './pages/stock/StockListPage';
import { StockDetailPage } from './pages/stock/StockDetailPage';
import { StockProyectosPage } from './pages/stock/StockProyectosPage';
import { VoluntarioInscripcionPage } from './pages/voluntarios/VoluntarioInscripcionPage';
import { VoluntarioListPage } from './pages/voluntarios/VoluntarioListPage';
import { VoluntarioDetailPage } from './pages/voluntarios/VoluntarioDetailPage';
import { CuadrillaListPage } from './pages/cuadrillas/CuadrillaListPage';
import { CuadrillaDetailPage } from './pages/cuadrillas/CuadrillaDetailPage';
import { CuadrillaFormPage } from './pages/cuadrillas/CuadrillaFormPage';
import { DonacionFormPage } from './pages/donaciones/DonacionFormPage';
import { DonacionListPage } from './pages/donaciones/DonacionListPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/voluntarios/inscripcion', element: <VoluntarioInscripcionPage /> },
  { path: '/donaciones/nueva', element: <DonacionFormPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/stock', element: <StockListPage /> },
          { path: '/stock/proyectos', element: <StockProyectosPage /> },
          { path: '/stock/:id', element: <StockDetailPage /> },
          { path: '/voluntarios', element: <VoluntarioListPage /> },
          { path: '/voluntarios/:id', element: <VoluntarioDetailPage /> },
          { path: '/cuadrillas', element: <CuadrillaListPage /> },
          { path: '/cuadrillas/nueva', element: <CuadrillaFormPage /> },
          { path: '/cuadrillas/:id', element: <CuadrillaDetailPage /> },
          { path: '/cuadrillas/:id/editar', element: <CuadrillaFormPage /> },
          { path: '/donaciones', element: <DonacionListPage /> },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
