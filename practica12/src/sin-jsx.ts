import { createElement } from 'react';

// Este archivo .ts no contiene JSX. La tarjeta tiene tres hijos directos.
export const vistaSinJsx = createElement(
  'main', { className: 'pagina' },
  createElement('header', { className: 'saludo' },
    createElement('h1', null, 'Hola mundo sin JSX'),
    createElement('p', null, 'Título y tarjeta construidos con createElement'),
  ),
  createElement('section', { className: 'equipo', 'aria-label': 'Tarjeta sin JSX' },
    createElement('article', { className: 'tarjeta' },
      createElement('h2', { className: 'tarjeta__nombre' }, 'Emmanuel Riveros'),
      createElement('p', { className: 'tarjeta__carrera' }, 'Ingeniería en Software'),
      createElement('p', { className: 'tarjeta__semestre' }, 'Tres elementos sin JSX'),
    ),
  ),
);
