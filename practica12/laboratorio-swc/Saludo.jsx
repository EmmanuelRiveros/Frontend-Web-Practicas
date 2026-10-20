import React from 'react';

export function Saludo({ nombre }) {
  return (
    <header className="saludo">
      <h1>Hola, {nombre}</h1>
      <p>Mi primera aplicación de React</p>
    </header>
  );
}
