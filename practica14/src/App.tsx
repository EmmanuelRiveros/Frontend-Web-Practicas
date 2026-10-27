import { useState } from 'react';
import { pesos, type Producto } from './datos';
import { Layout } from './Layout';
import { Encabezado } from './Encabezado';
import { PiePagina } from './PiePagina';
import { Filtros } from './Filtros';
import { Catalogo } from './Catalogo';
import { Cargando } from './Cargando';
import { ErrorCatalogo } from './ErrorCatalogo';
import { FormularioPago } from './FormularioPago';
import { useProductos } from './hooks/useProductos';
import type { ConfirmacionPedido } from './servicios/tienda';

export default function App() {
  const { datos: productos, cargando, error, reintentar } = useProductos();
  const [categoria, setCategoria] = useState('todas');
  const [carrito, setCarrito] = useState<Producto[]>([]);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionPedido | null>(null);
  const [pagando, setPagando] = useState(false);
  const categorias = ['todas', ...new Set(productos.map(p => p.categoria))];
  const visibles = categoria === 'todas' ? productos : productos.filter(p => p.categoria === categoria);
  const total = carrito.reduce((suma, producto) => suma + producto.precio, 0);
  function agregar(producto: Producto) {
    if (pagando || producto.existencia === 0) return;
    setConfirmacion(null);
    setCarrito(anterior => [...anterior, producto]);
  }
  function confirmar(pedido: ConfirmacionPedido) {
    setConfirmacion(pedido);
    setCarrito([]);
    reintentar();
  }
  return (
    <Layout encabezado={<Encabezado piezas={carrito.length} />} pie={<PiePagina piezas={carrito.length} total={total} />}>
      <section className="portada"><h1>Catálogo de temporada</h1><p>{cargando ? 'Consultando la tienda' : `${visibles.length} productos`}</p></section>
      {confirmacion && <div className="confirmacion" role="status">Pedido confirmado. Folio: {confirmacion.folio}. Total: {pesos.format(confirmacion.total)}.</div>}
      {carrito.length > 0 && <p><a href="#pago">Ir al pago simulado</a></p>}
      {cargando ? <Cargando /> : error ? <ErrorCatalogo mensaje={error} onReintentar={reintentar} /> : <>
        <Filtros categorias={categorias} activa={categoria} onCambiar={setCategoria} />
        <div inert={pagando}><Catalogo productos={visibles} onAgregar={agregar} /></div>
        {productos.length === 0 && <p>No hay productos disponibles en el catálogo.</p>}
      </>}
      <FormularioPago carrito={carrito} onConfirmado={confirmar} onProcesando={setPagando} />
    </Layout>
  );
}
