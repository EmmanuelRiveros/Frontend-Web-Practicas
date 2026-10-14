import estilos from './boton-app.css?inline';

export class BotonApp extends HTMLElement {
  static observedAttributes = ['variante', 'deshabilitado', 'disabled'];
  private boton: HTMLButtonElement;

  // 1 constructor: crea la estructura, sin depender de atributos o del documento.
  constructor() {
    super();
    const sombra = this.attachShadow({ mode: 'open' });
    sombra.innerHTML = '<style></style><button type="button"><slot></slot></button>';
    sombra.querySelector('style')!.textContent = estilos;
    this.boton = sombra.querySelector('button')!;
  }

  // 2 entra al documento: ya puedo leer y pintar sus entradas.
  connectedCallback() { this.pintar(); }

  // 3 el navegador avisa cuando cambia una entrada observada.
  attributeChangedCallback() { this.pintar(); }

  // 4 al salir, aquí se limpiarían temporizadores o listeners externos.
  disconnectedCallback() {}

  // 5 al cambiar de documento, aquí se adaptaría al nuevo contexto.
  adoptedCallback() { this.pintar(); }

  private pintar() {
    const variante = this.getAttribute('variante') ?? 'primario';
    this.boton.className = ['primario', 'secundario', 'danger'].includes(variante)
      ? variante : 'primario';
    // Son atributos booleanos: importa que existan, no su valor textual.
    this.boton.disabled = this.hasAttribute('deshabilitado') || this.hasAttribute('disabled');
  }
}

customElements.define('boton-app', BotonApp);

declare global {
  interface HTMLElementTagNameMap { 'boton-app': BotonApp; }
}
