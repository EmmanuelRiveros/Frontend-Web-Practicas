export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
  existencia: number;
}
export const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
