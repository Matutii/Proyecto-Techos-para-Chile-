import { apiClient } from './client';

export const voluntariosApi = {
  inscribir: (datos) => apiClient.post('/voluntarios/inscripcion', datos),
  listar: (token, params) => apiClient.get('/voluntarios', { token, params }),
  obtener: (token, id) => apiClient.get(`/voluntarios/${id}`, { token }),
};
