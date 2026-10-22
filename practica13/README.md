# Práctica 13 La tienda

Tienda en React con composición de componentes, eventos por props y estado en memoria. Se creó el proyecto desde cero con la plantilla `react-ts` de Vite. Los estilos, los doce productos y las imágenes se conservan exactamente como vienen en `codigo-base-p13.zip`; los componentes se basan en `tienda-codigo-g.zip`.

## Ejecutar desde cero

Se necesita Node.js 20.19 o 22.12 en adelante y npm. Se comprobó con Node.js 24.11.1.

```bash
cd practica13
npm ci
npm run dev
```

Abrir la dirección que indique Vite, normalmente http://localhost:5173. Todo el catálogo es local: no requiere una API, una base de datos ni credenciales. El carrito vuelve a cero cuando se recarga la página.

```bash
npm run build
npm run lint
```

## Composición de la tienda

- `Layout` recibe `encabezado`, `pie` y `children` como `ReactNode`.
- `Encabezado` muestra la marca y el número de piezas del carrito.
- `PiePagina` muestra el resumen y el total en pesos, fijo en el borde inferior.
- `TarjetaProducto` recibe un `Producto` y `onAgregar`. Muestra la imagen, el nombre, el precio y la existencia; los agotados tienen el botón deshabilitado.
- `Catalogo` usa `.map` y `key={producto.id}` para crear las tarjetas.
- `Filtros` muestra las categorías con una clave única por botón y comunica la selección con `onCambiar`.
- `App` conserva únicamente el filtro y el carrito en `useState`. Calcula `visibles`, el contador y `total` en cada render.

Hay doce productos: cuatro de calzado, siete de ropa y uno de accesorios. Licra y chamarra tienen existencia cero. Agregar al carrito construye un arreglo nuevo mediante `setCarrito(anterior => [...anterior, producto])`. Cada clic representa una pieza; filtrar conserva lo agregado.

Como en el ejemplo del profesor, agregar al carrito no realiza una compra ni descuenta el inventario del catálogo. Los artículos agotados no se agregan. No se añadió un flujo de pago a esta práctica.

## Respuestas de la guía

**¿Por qué el Layout no necesita saber que es una tienda?** Porque solo organiza tres espacios. Recibe nodos de React para el encabezado, el pie y el contenido entre sus etiquetas. No importa `Producto`, no recibe el arreglo del carrito y no calcula importes. `App` decide qué colocar en cada espacio; el mismo patrón puede componer otra página con contenidos distintos.

**¿Qué pasa si escribes `onClick={onAgregar(producto)}` sin la flecha?** JavaScript evalúa esa expresión al renderizar, por lo que llama a `onAgregar` antes de que exista un clic. Con la firma de esta práctica, la función devuelve `void`, que no es un manejador válido: TypeScript muestra TS2322. Si se ejecuta de todos modos y la función actualiza el estado durante ese render, puede producir un ciclo. El experimento aislado reproduce el mensaje real de React `Too many re-renders`. `onClick={() => onAgregar(producto)}` entrega una función y aplaza la llamada hasta el clic.

**¿Por qué con `carrito.push(...)` el contador no se mueve y no sale ningún error?** `push` es una operación válida de JavaScript que modifica el mismo arreglo. React no observa sus cambios internos para decidir si renderiza. Si no se llama al setter, no se solicita una actualización; si se pasa el mismo arreglo al setter, su referencia sigue siendo igual y React puede omitirla con `Object.is`. En el experimento, la longitud interna pasó a uno y el contador visible permaneció en cero, sin errores. Otro render mostró después esa mutación. La solución es crear un arreglo nuevo y entregarlo al setter.

## Recursos conservados y ajustes

`src/datos.ts`, `src/index.css` y los trece archivos de `public/img` coinciden byte por byte con el código base. `evidencias/recursos-originales.json` registra sus hashes SHA-256.

Se conservaron el marcado y las clases de los componentes de clase. En los agotados se mantienen las dos clases de existencia del HTML base. El título queda en su propia sección, como en la vista previa; los filtros y el catálogo son sus hermanos para que el selector `.portada p` no cambie los estilos de los párrafos de las tarjetas. Se añadieron nombres accesibles, `aria-pressed` y avisos del contador con `aria-live`, sin cambiar el CSS.

La entrega se ubica en `practica13`: la referencia a `practica12` en una línea de la guía se interpretó como una errata, de acuerdo con el título, el README solicitado y el nombre de archivo P13.

## Verificación y evidencias

```bash
npm run verificar
```

El verificador inicia y cierra un servidor de Vite en el puerto 5183. Usa Playwright y Google Chrome instalado en Windows. En otro sistema, instalar el navegador de pruebas con `npx playwright install chromium`. No necesita un servidor iniciado por separado.

Las 30 comprobaciones pasaron: catálogo, imágenes, filtros, clase activa, productos agotados, suma, cambios rápidos, estado al filtrar, pie fijo, vista móvil, recarga y ausencia de solicitudes externas o avisos de React en la tienda. También verifica los errores intencionales en ejemplos independientes.

| Evidencia | Contenido |
| --- | --- |
| `01-catalogo.png` | Las doce tarjetas y el carrito vacío |
| `02-filtro-calzado.png` | Cuatro productos y filtro activo |
| `03-ropa-y-carrito.png` | Siete productos de ropa y tres piezas por $3,247.00 |
| `04-filtro-accesorios.png` | Únicamente las calcetas; el carrito se conserva |
| `05-carrito-detalle.png` | Resumen fijo con tres piezas y total |
| `06-licra-agotada.png` y `07-chamarra-agotada.png` | Productos agotados con botón deshabilitado |
| `08-movil.png` | Vista de 390 píxeles sin desbordamiento |
| `09-onclick-durante-render.png` | Error real capturado por el límite de errores del laboratorio |
| `10-mutacion-sin-render.png` | Arreglo de longitud uno y contador visible en cero |
| `11-estado-actualizado.png` | Actualización posterior con un arreglo nuevo |
| `12-onclick-typescript.png` | Registro real del diagnóstico TS2322 |

La suma de prueba es Vento $1,299 + Cross $1,549 + playera seca $399 = $3,247. Dos clics adicionales en Vento llevan el contador a cinco y el total a $5,845. Las imágenes de TypeScript muestran el texto real producido por el compilador en una página legible; no simulan una terminal o un editor.

## Repetir los experimentos de errores

Con `npm run dev` abierto:

- `/experimentos/index.html`: mutación del arreglo y posterior actualización correcta.
- `/experimentos/index.html?caso=onclick`: llamada durante el render, contenida por un límite de errores.

`experimentos/OnClickIncorrecto.tsx` conserva el caso que TypeScript debe rechazar. Está fuera de `src` y no rompe el build. `npm run verificar` ejecuta su comprobación por separado. Los experimentos no forman parte del punto de entrada de producción de la tienda y se prueban con el servidor de desarrollo.

## Entrega

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica13

El proyecto incluye código, archivos de bloqueo de versiones, respuestas y capturas. `node_modules` y `dist` quedan excluidos de Git. El reporte P13 se entrega sin portada para que el alumno la agregue.

## Referencias

- Guía Práctica 13 La tienda y ZIP del código base y de clase, proporcionados por el profesor.
- https://react.dev/learn/passing-props-to-a-component
- https://react.dev/learn/responding-to-events
- https://react.dev/learn/updating-arrays-in-state
- https://react.dev/learn/you-might-not-need-an-effect
