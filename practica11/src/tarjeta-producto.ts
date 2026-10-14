import estilos from './tarjeta-producto.css?inline';
import './boton-app';
import type { BotonApp } from './boton-app';
import type { DetalleAgregar } from './tipos';

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export class TarjetaProducto extends HTMLElement {
  static observedAttributes = ['producto-id', 'nombre', 'precio', 'imagen', 'existencia'];
  private imagen: HTMLImageElement;
  private nombre: HTMLHeadingElement;
  private precio: HTMLParagraphElement;
  private existencia: HTMLParagraphElement;
  private boton: BotonApp;
  private agotado = true;

  constructor() {
    super();
    const sombra = this.attachShadow({ mode: 'open' });
    sombra.innerHTML = '<style></style><article class="tarjeta"><img><div class="cuerpo"><h3></h3><p class="precio"></p><p class="existencia"></p><boton-app>Agregar al carrito</boton-app></div></article>';
    sombra.querySelector('style')!.textContent = estilos;
    this.imagen = sombra.querySelector('img')!;
    this.nombre = sombra.querySelector('h3')!;
    this.precio = sombra.querySelector('.precio')!;
    this.existencia = sombra.querySelector('.existencia')!;
    this.boton = sombra.querySelector('boton-app')!;
    this.boton.addEventListener('click', () => {
      if (this.agotado) return;
      const detalle: DetalleAgregar = {
        id: this.getAttribute('producto-id') ?? '',
        nombre: this.getAttribute('nombre') ?? '',
        precio: Number(this.getAttribute('precio')),
      };
      // El origen está DENTRO de la sombra de la tarjeta, no en su host.
      // Así composed sí es necesario para salir hacia #rejilla.
      this.boton.dispatchEvent(new CustomEvent<DetalleAgregar>('agregar', {
        detail: detalle, bubbles: true, composed: true,
      }));
    });
  }

  connectedCallback() { this.pintar(); }
  attributeChangedCallback() { if (this.isConnected) this.pintar(); }

  private pintar() {
    const nombre = this.getAttribute('nombre') ?? '';
    const precio = Number(this.getAttribute('precio'));
    const existencia = Number(this.getAttribute('existencia'));
    this.agotado = !Number.isFinite(existencia) || existencia <= 0;
    // textContent y propiedades evitan interpretar los atributos como HTML.
    this.nombre.textContent = nombre;
    this.imagen.src = this.getAttribute('imagen') ?? '';
    this.imagen.alt = nombre;
    this.precio.textContent = pesos.format(Number.isFinite(precio) ? precio : 0);
    this.existencia.textContent = this.agotado ? 'Agotado' : existencia + ' disponibles';
    this.existencia.classList.toggle('agotado', this.agotado);
    this.boton.toggleAttribute('deshabilitado', this.agotado);
  }
}

customElements.define('tarjeta-producto', TarjetaProducto);

declare global {
  interface HTMLElementTagNameMap { 'tarjeta-producto': TarjetaProducto; }
}
