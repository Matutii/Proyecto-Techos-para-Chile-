import { apiClient } from './client';

export const cuadrillasApi = {
  listar: (token, params) => apiClient.get('/cuadrillas', { token, params }),
  obtener: (token, id) => apiClient.get(`/cuadrillas/${id}`, { token }),
  crear: (token, datos) => apiClient.post('/cuadrillas', datos, { token }),
  actualizar: (token, id, datos) => apiClient.put(`/cuadrillas/${id}`, datos, { token }),
  eliminar: (token, id) => apiClient.delete(`/cuadrillas/${id}`, { token }),
  agregarVoluntario: (token, id, voluntarioId) =>
    apiClient.post(`/cuadrillas/${id}/voluntarios`, { voluntarioId }, { token }),
};
