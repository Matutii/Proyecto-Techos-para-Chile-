import { useAuth } from '../../context/AuthContext';

// Oculta (o reemplaza por `fallback`) sus hijos si el usuario logueado no tiene uno de los roles permitidos.
export function RoleGate({ roles, fallback = null, children }) {
  const { puedeGestionar } = useAuth();

  if (!puedeGestionar(roles)) return fallback;

  return children;
}
