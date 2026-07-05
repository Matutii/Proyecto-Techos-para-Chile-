import { apiClient } from './client';

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  obtenerPerfil: (token) => apiClient.get('/auth/perfil', { token }),
};
