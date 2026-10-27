import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Producto } from './datos';
import { crearPedido } from './servicios/tienda';
import type { ConfirmacionPedido } from './servicios/tienda';
import { mensajeDeError } from './servicios/api';
interface Props {
  carrito: Producto[];
  onConfirmado: (pedido: ConfirmacionPedido) => void;
  onProcesando: (procesando: boolean) => void;
}
export function FormularioPago({ carrito, onConfirmado, onProcesando }: Props) {
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const bloqueado = useRef(false);
  async function pagar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bloqueado.current) return;
    setError(null);
    if (!correo.trim().includes('@')) { setError('El correo debe contener @.'); return; }
    if (!/^\d{10}$/.test(telefono)) { setError('El teléfono debe tener exactamente 10 dígitos.'); return; }
    if (carrito.length === 0) { setError('Agrega productos al carrito antes de pagar.'); return; }
    bloqueado.current = true; setEnviando(true); onProcesando(true);
    try {
      const pedido = await crearPedido({ correo: correo.trim(), telefono, productos: carrito.map(p => p.id) });
      onConfirmado(pedido);
      setCorreo(''); setTelefono('');
    } catch (fallo: unknown) { setError(mensajeDeError(fallo)); }
    finally { bloqueado.current = false; setEnviando(false); onProcesando(false); }
  }
  return (
    <form id="pago" className="pago" onSubmit={pagar} noValidate aria-busy={enviando} aria-labelledby="titulo-pago">
      <h2 id="titulo-pago">Pago simulado</h2>
      <p>No se realiza ningún cobro. {carrito.length === 0 ? 'Agrega productos para registrar un pedido.' : `Pedido de ${carrito.length} pieza(s).`}</p>
      <label>Correo<input type="email" name="correo" autoComplete="email" value={correo} onChange={e => setCorreo(e.target.value)} disabled={enviando} aria-describedby={error ? 'error-pago' : undefined} /></label>
      <label>Teléfono<input type="tel" name="telefono" autoComplete="tel" inputMode="numeric" value={telefono} onChange={e => setTelefono(e.target.value)} disabled={enviando} aria-describedby={error ? 'error-pago' : undefined} /></label>
      {error && <p id="error-pago" className="pago__error" role="alert">{error}</p>}
      <button type="submit" disabled={enviando || carrito.length === 0}>{enviando ? 'Enviando pedido…' : 'Pagar pedido simulado'}</button>
    </form>
  );
}
