import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

const ROLES_GESTION = ['admin', 'coordinador_logistica'];

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const login = useCallback(async (email, password) => {
    const resultado = await authApi.login(email, password);
    setToken(resultado.token);
    const perfil = await authApi.obtenerPerfil(resultado.token);
    setUsuario(perfil);
    return perfil;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
  }, []);

  const puedeGestionar = useCallback(
    (roles = ROLES_GESTION) => !!usuario && roles.includes(usuario.rol),
    [usuario],
  );

  const value = useMemo(
    () => ({ token, usuario, login, logout, puedeGestionar, estaAutenticado: !!token }),
    [token, usuario, login, logout, puedeGestionar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
