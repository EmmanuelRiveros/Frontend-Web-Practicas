import type { Producto } from '../datos';
import { api, ErrorApi } from './api';
interface Sobre<T> { data: T; meta: { ruta: string; duracionMs: number; timestamp: string } }
export interface Pedido { correo: string; telefono: string; productos: string[] }
export interface ConfirmacionPedido { folio: string; total: number }
export async function pedirProductos(): Promise<Producto[]> {
  const respuesta = await api.get<Sobre<Producto[]>>('/productos');
  if (!Array.isArray(respuesta.data.data)) throw new ErrorApi('La API no devolvió una lista de productos.');
  return respuesta.data.data;
}
export async function crearPedido(pedido: Pedido): Promise<ConfirmacionPedido> {
  const respuesta = await api.post<Sobre<ConfirmacionPedido>>('/pedidos', pedido);
  return respuesta.data.data;
}
