import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { vistaSinJsx } from './sin-jsx';

const contenedor = document.getElementById('root');
if (!contenedor) throw new Error('No se encontró el contenedor root');
const root = createRoot(contenedor);

if (new URLSearchParams(window.location.search).get('vista') === 'sin-jsx') {
  root.render(vistaSinJsx);
} else {
  root.render(<StrictMode><App /></StrictMode>);
}
