import { apiClient } from './client';

export const donacionesApi = {
  crear: (datos) => apiClient.post('/donaciones', datos),
  listar: (token, params) => apiClient.get('/donaciones', { token, params }),
  obtenerMetodosPago: () => apiClient.get('/donaciones/metodos-pago'),
};
