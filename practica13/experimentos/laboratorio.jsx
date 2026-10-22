import { Component, useState } from 'react';
import { createRoot } from 'react-dom/client';

const producto = { id: 'ejemplo', nombre: 'Producto de prueba', precio: 10 };

function Mutacion() {
  const [carrito, setCarrito] = useState([]);
  const [revision, setRevision] = useState(0);
  function mutar() {
    carrito.push(producto);
    setCarrito(carrito); // La misma referencia no solicita una actualización visible.
    // Registro externo de diagnóstico para observar la mutación sin forzar React.
    document.getElementById('registro').textContent = `Longitud interna tras push: ${carrito.length}; misma referencia: true`;
  }
  return (
    <main>
      <h1>Experimento aislado de mutación</h1>
      <p>El ejemplo usa un producto ficticio y no forma parte de la tienda.</p>
      <pre>{'carrito.push(producto);\nsetCarrito(carrito);'}</pre>
      <p>Contador renderizado: <strong data-testid="contador">{carrito.length}</strong></p>
      <output id="registro">Todavía no se ha modificado el arreglo.</output>
      <button onClick={mutar}>Mutar con push</button>
      <button onClick={() => setRevision(r => r + 1)}>Forzar otra actualización</button>
      <button onClick={() => setCarrito(actual => [...actual, producto])}>Agregar con un arreglo nuevo</button>
      <p>Otras actualizaciones: {revision}</p>
    </main>
  );
}

function OnClickIncorrecto() {
  const [carrito, setCarrito] = useState([]);
  function onAgregar(p) { setCarrito(actual => [...actual, p]); }
  return <button onClick={onAgregar(producto)}>Agregar ({carrito.length})</button>;
}

class LimiteDeError extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main><h1>Invocar onAgregar durante el render</h1><pre>{'onClick={onAgregar(producto)}'}</pre><p>React rechazó el ciclo de actualización sin ningún clic:</p><pre role="alert">{this.state.error.message}</pre><p>Este error intencional está aislado de la aplicación final.</p></main>;
    return this.props.children;
  }
}

const caso = new URLSearchParams(location.search).get('caso');
createRoot(document.getElementById('root')).render(caso === 'onclick' ? <LimiteDeError><OnClickIncorrecto /></LimiteDeError> : <Mutacion />);
