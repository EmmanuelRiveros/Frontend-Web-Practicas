# Práctica 19 El panel del gimnasio en Angular

El tablero muestra ocho clases, 380 minutos y dos clases de una hora o más. Vaciar deja los indicadores en cero y activa el mensaje de @empty. Restaurar recupera el catálogo. Se usó el proyecto completo del profesor y se verificó que sus recursos coinciden con el código base.

## Ejecución

Usa Angular CLI 22 y Node compatible (22.22.3 o posterior de la serie 22, 24.15 o posterior de la serie 24, o 26 en adelante).

```sh
npm ci
npm start
npm run build
```

El servidor de desarrollo abre el panel en http://localhost:4200. Los datos y las imágenes se sirven desde este proyecto.

La estructura se puede generar con `ng new gimnasio-admin --routing=false --ssr=false --test-runner=none --skip-tests` y la tarjeta con `ng generate component componentes/tarjeta-clase --skip-tests`. La entrega se basa en el ZIP completo adjunto.

## Equivalencias con React y Vite

src/main.ts arranca Angular con bootstrapApplication, como main.tsx monta la aplicación React. src/app/app.ts y app.html contienen la clase raíz y su plantilla, el equivalente funcional de App.tsx. angular.json configura las tareas de compilación y desarrollo, los recursos y los estilos. Cumple el papel de configuración del proyecto que tenía vite.config.ts.

## Entrada de la tarjeta y seguimiento

clase() lee el valor del input.required<Clase>(), que devuelve un signal. track clase.id asocia cada tarjeta con su identificador para que Angular conserve y actualice los elementos que siguen en la lista. @if añade Larga desde 60 minutos y @empty muestra el estado vacío.

## Diagnósticos del compilador

Al quitar track clase.id, Angular devuelve NG5002. Al quitar TarjetaClase de los imports del componente raíz, devuelve NG8001 porque ya no reconoce app-tarjeta-clase. Las dos pruebas se hicieron en copias temporales. El proyecto final compila correctamente.

## Evidencias

- Ocho tarjetas con sus imágenes y el resumen de 380 minutos y dos clases largas. [Captura](evidencias/01-tablero-completo.png)
- Vaciar deja los indicadores en cero. En el navegador, Restaurar recuperó las ocho clases. [Captura](evidencias/02-tablero-vacio.png)
- Salida del compilador al retirar la expresión track. [Captura](evidencias/NG5002.png)
- Salida del compilador al retirar el componente del arreglo imports. [Captura](evidencias/NG8001.png)

Los archivos TXT conservan la salida original de Angular CLI. `verificacion.json` registra los valores observados en Chrome.
