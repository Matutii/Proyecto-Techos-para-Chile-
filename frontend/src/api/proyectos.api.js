import { apiClient } from './client';

export const proyectosApi = {
  listar: (token) => apiClient.get('/proyectos', { token }),
};
