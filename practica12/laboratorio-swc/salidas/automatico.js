import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function Saludo({ nombre }) {
    return /*#__PURE__*/ _jsxs("header", {
        className: "saludo",
        children: [
            /*#__PURE__*/ _jsxs("h1", {
                children: [
                    "Hola, ",
                    nombre
                ]
            }),
            /*#__PURE__*/ _jsx("p", {
                children: "Mi primera aplicación de React"
            })
        ]
    });
}

