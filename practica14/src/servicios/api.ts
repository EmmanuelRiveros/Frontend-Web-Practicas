import axios from 'axios';

export class ErrorApi extends Error {
  readonly estado: number | undefined;
  constructor(mensaje: string, estado?: number) { super(mensaje); this.name = 'ErrorApi'; this.estado = estado; }
}
// Única instancia HTTP. Los componentes y hooks no importan Axios.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 5000,
});
api.interceptors.response.use(respuesta => respuesta, (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const cuerpo: unknown = error.response?.data;
    const mensaje = cuerpo && typeof cuerpo === 'object' && 'message' in cuerpo ? cuerpo.message : undefined;
    if (typeof mensaje === 'string') return Promise.reject(new ErrorApi(mensaje, error.response?.status));
    if (Array.isArray(mensaje) && mensaje.every(m => typeof m === 'string')) return Promise.reject(new ErrorApi(mensaje.join(' '), error.response?.status));
    if (error.code === 'ECONNABORTED') return Promise.reject(new ErrorApi('La API tardó demasiado en responder. Intenta de nuevo.'));
    if (!error.response) return Promise.reject(new ErrorApi('No se pudo conectar con la API. Comprueba que esté encendida y vuelve a intentar.'));
    return Promise.reject(new ErrorApi(`La API respondió con estado ${error.response.status}.`, error.response.status));
  }
  return Promise.reject(new ErrorApi('No se pudo completar la petición.'));
});
export function mensajeDeError(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
