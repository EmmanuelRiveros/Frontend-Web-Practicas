# Práctica 12 Hola React

Primera parte de la práctica 12 de Tópico de Aplicaciones Web. El proyecto se creó desde cero con `npm create vite@latest practica12 -- --template react-ts --no-interactive`, tomando los componentes del ZIP de clase como referencia. Se conserva exactamente el archivo `src/index.css` del profesor. Se retiraron las imágenes y los estilos de demostración de Vite.

## Ejecutar

Requisito de la guía: Node.js 22.18 o posterior. Se comprobó con Node.js 24.11.1.

```bash
cd practica12
npm ci
npm run dev
```

Abrir la dirección que muestra Vite, normalmente http://localhost:5173.

- `/`: saludo con nombre y tres tarjetas con props.
- `/?vista=sin-jsx`: título y tarjeta construidos únicamente con `createElement`, en `src/sin-jsx.ts`.

```bash
npm run build
npm run lint
```

`build` comprueba TypeScript en modo estricto y construye la aplicación. El contenedor inicial es `<div id="root"></div>` en `index.html`. El módulo `src/main.tsx` lo obtiene, llama a `createRoot` y usa `root.render` para colocar la vista elegida.

## Laboratorio SWC en una carpeta aparte

```bash
cd laboratorio-swc
npm ci
npx swc Saludo.jsx --no-swcrc
npm run clasico
npm run automatico
cd ..
npm run experimentos
```

El primer comando de compilación falla intencionalmente: el parser sin configuración no acepta JSX. La salida real indica `Expression expected` y `Expected ',', got 'ident'` al encontrar `<header className="saludo">`. No significa que React esté ejecutando el componente: el compilador todavía no pudo analizar el archivo.

`.swcrc.clasico` activa `jsc.parser.jsx` y establece `jsc.transform.react.runtime` en `classic`. `.swcrc.automatico` usa `automatic`. Las salidas están en `laboratorio-swc/salidas/clasico.js` y `automatico.js`. El laboratorio usa SWC de forma independiente; no se añadió SWC al proceso de Vite.

`npm run experimentos` repite las tres compilaciones y el caso de TypeScript. Guarda registros de texto y `evidencias/experimentos.json`. Termina correctamente solo si los dos errores esperados ocurren por la razón indicada y las dos compilaciones configuradas tienen éxito.

## Respuestas de la práctica

**¿En qué se convirtió cada etiqueta del JSX?** En el modo clásico, `header`, `h1` y `p` se convierten en llamadas anidadas a `React.createElement`. El nombre HTML es el primer argumento, los atributos forman el objeto de props y el texto y los elementos anidados se pasan como hijos. En el automático, SWC importa `jsx` y `jsxs` desde `react/jsx-runtime`: en esta salida `header` y `h1` usan `jsxs` porque tienen varios hijos, y `p` usa `jsx` porque tiene uno. Los hijos van dentro de `props.children`. El resultado describe elementos React; no es todavía el DOM del navegador.

**Si React es solo una biblioteca, ¿quién traduce el JSX?** Lo traduce una herramienta de compilación. En el experimento es SWC. En la aplicación se encarga la cadena de herramientas configurada por Vite y su plugin React. El navegador recibe JavaScript transformado; React no analiza el archivo JSX en tiempo de ejecución. El runtime automático aporta las funciones que utiliza la salida del compilador.

**¿Qué hace createRoot y qué hace render?** `createRoot(contenedor)` crea una raíz React asociada a un nodo DOM existente y devuelve un objeto raíz. `root.render(elemento)` le indica qué árbol debe mostrar. React calcula y aplica al DOM los cambios necesarios para mostrarlo y actualizarlo. El contenedor vacío no se llena por sí solo: el script de entrada ejecuta estas llamadas.

**¿Qué error aparece al quitar la prop obligatoria?** `SaludoProps` declara `nombre: string`. Al escribir `<Saludo />`, TypeScript produce `TS2741: Property 'nombre' is missing in type '{}' but required in type 'SaludoProps'.` El experimento está aislado en `experimentos/SaludoSinNombre.tsx`, fuera de `src`, para conservar el ejemplo incorrecto sin romper el build. El diagnóstico se obtuvo ejecutando TypeScript, el mismo sistema de tipos que utiliza el editor. En `App.tsx` se conserva el uso correcto: `<Saludo nombre="Emmanuel" />`.

**¿Por qué el nombre de un componente empieza con mayúscula?** El compilador distingue una etiqueta HTML de una referencia a un componente por esa convención: `<Saludo />` se traduce usando la función `Saludo`, mientras que `<saludo />` se interpreta como una etiqueta cuyo nombre es el texto `saludo`. Las interfaces permiten comprobar las props antes de ejecutar el programa; no hacen validación de datos externos en tiempo de ejecución.

## Componentes

`Saludo.tsx` recibe un nombre obligatorio. `TarjetaPerfil.tsx` recibe `nombre` y `carrera` como texto, y `semestre` como número. `App.tsx` reutiliza la misma tarjeta tres veces con los perfiles de ejemplo del profesor: Juan Pérez, María García y Carlos López. Las iniciales se calculan a partir del nombre. No se repite el marcado de la tarjeta en el componente principal.

La vista sin JSX usa un `h1` y una tarjeta con exactamente tres hijos directos: `h2`, `p` y `p`. Se conservan las dos vistas para poder revisar por separado cada paso de la guía.

## Evidencias reales

Las imágenes de SWC y TypeScript son capturas del registro real y de los archivos producidos, presentados en una página legible; no son capturas del editor ni de una terminal interactiva.

| Archivo en evidencias | Contenido |
| --- | --- |
| `01-swc-sin-configuracion.png` | Error al compilar sin configurar JSX |
| `02-swc-clasico.png` | Compilación y salida con createElement |
| `03-swc-automatico.png` | Compilación y salida con jsx y jsxs |
| `04-prop-obligatoria.png` | Diagnóstico TS2741 de TypeScript |
| `06-hola-sin-jsx.png` | Título y tarjeta sin JSX |
| `07-tres-tarjetas.png` | Página final con tres perfiles |
| `08-movil.png` | Vista a 390 píxeles sin desbordamiento |

Para repetir las capturas y las nueve comprobaciones del navegador:

```bash
npm run experimentos
npm run verificar
```

El verificador inicia y cierra su servidor en el puerto 5182. En Windows utiliza Google Chrome instalado; en otros sistemas, instalar antes el navegador con `npx playwright install chromium`. `evidencias/verificacion.json` registra los resultados: saludo, tres tarjetas, nombres, iniciales, semestres, ancho móvil, título sin JSX, tres hijos y ausencia de errores del navegador. Las nueve comprobaciones pasaron. Los cuatro experimentos también dieron el resultado esperado. `build` y `lint` pasaron; las instalaciones de la aplicación y el laboratorio terminaron sin vulnerabilidades reportadas por npm.

## Entrega

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica12

La carpeta incluye código, lockfiles, configuraciones, respuestas y evidencias. `.gitignore` excluye `node_modules`, `dist` y archivos locales. El reporte se entrega sin portada por indicación del alumno. Esta práctica cubre la primera parte; el muro corresponde a la segunda parte de la guía.

## Referencias

- Guía Práctica 12 Hola React y ZIP `hola-react.zip` proporcionados por el profesor.
- React createElement: https://react.dev/reference/react/createElement
- React createRoot: https://react.dev/reference/react-dom/client/createRoot
- React TypeScript: https://react.dev/learn/typescript
- SWC configuración JSX: https://swc.rs/docs/configuration/compilation
- Vite creación de proyectos: https://vite.dev/guide/
