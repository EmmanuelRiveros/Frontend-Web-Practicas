import './estilos.css';
import './boton-app';
import './tarjeta-producto';
import { productos } from './productos';

const rejilla = document.querySelector<HTMLElement>('#rejilla')!;
const cuenta = document.querySelector<HTMLElement>('#cuenta')!;
const vaciar = document.querySelector<HTMLElement>('#vaciar')!;
let enCarrito = 0;

for (const producto of productos) {
  const tarjeta = document.createElement('tarjeta-producto');
  tarjeta.setAttribute('producto-id', producto.id);
  tarjeta.setAttribute('nombre', producto.nombre);
  tarjeta.setAttribute('precio', String(producto.precio));
  tarjeta.setAttribute('imagen', producto.imagen);
  tarjeta.setAttribute('existencia', String(producto.existencia));
  rejilla.append(tarjeta);
}

// Un único listener de producción para las doce tarjetas.
rejilla.addEventListener('agregar', (evento) => {
  enCarrito++;
  cuenta.textContent = String(enCarrito);
  console.log('Agregado:', evento.detail.nombre, evento.detail.precio);
});

vaciar.addEventListener('click', () => {
  enCarrito = 0;
  cuenta.textContent = '0';
});
