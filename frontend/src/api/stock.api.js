import { apiClient } from './client';

export const stockApi = {
  listar: (token, params) => apiClient.get('/stock', { token, params }),
  obtener: (token, id) => apiClient.get(`/stock/${id}`, { token }),
  crear: (token, datos) => apiClient.post('/stock', datos, { token }),
  registrarEntrada: (token, id, datos) => apiClient.post(`/stock/${id}/entrada`, datos, { token }),
  asignarAProyecto: (token, id, datos) => apiClient.post(`/stock/${id}/asignar`, datos, { token }),
  actualizarEnCamino: (token, id, enCaminoManual) =>
    apiClient.patch(`/stock/${id}/en-camino`, { enCaminoManual }, { token }),
  vistaPorProyectos: (token) => apiClient.get('/stock/proyectos', { token }),
};
