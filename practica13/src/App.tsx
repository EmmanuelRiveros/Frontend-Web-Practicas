import { useState } from 'react';
import { productos, type Producto } from './datos';
import { Layout } from './Layout';
import { Encabezado } from './Encabezado';
import { PiePagina } from './PiePagina';
import { Filtros } from './Filtros';
import { Catalogo } from './Catalogo';

const categorias = ['todas', ...new Set(productos.map(producto => producto.categoria))];

export default function App() {
  const [categoria, setCategoria] = useState('todas');
  const [carrito, setCarrito] = useState<Producto[]>([]);

  // Datos derivados: no necesitan otro estado ni un efecto para sincronizarlos.
  const visibles = categoria === 'todas'
    ? productos
    : productos.filter(producto => producto.categoria === categoria);
  const total = carrito.reduce((suma, producto) => suma + producto.precio, 0);

  function agregar(producto: Producto) {
    if (producto.existencia === 0) return;
    setCarrito(anterior => [...anterior, producto]);
  }

  return (
    <Layout
      encabezado={<Encabezado piezas={carrito.length} />}
      pie={<PiePagina piezas={carrito.length} total={total} />}
    >
      <section className="portada">
        <h1>Catálogo de temporada</h1>
        <p>{visibles.length} productos</p>
      </section>
      <Filtros categorias={categorias} activa={categoria} onCambiar={setCategoria} />
      <Catalogo productos={visibles} onAgregar={agregar} />
    </Layout>
  );
}
