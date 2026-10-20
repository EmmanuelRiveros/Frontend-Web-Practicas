import React from 'react';
export function Saludo({ nombre }) {
    return /*#__PURE__*/ React.createElement("header", {
        className: "saludo"
    }, /*#__PURE__*/ React.createElement("h1", null, "Hola, ", nombre), /*#__PURE__*/ React.createElement("p", null, "Mi primera aplicación de React"));
}

