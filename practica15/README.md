# Práctica 15 — El gimnasio, rutas y layout

Frontend de Gimnasio Titanes con React, TypeScript y React Router. Consulta el catálogo y los horarios reales del backend proporcionado. Conserva el CSS, logo, tipos, servicios, componentes comunes, hook del catálogo y HTML de referencia de `practica-15` del ZIP del profesor.

## Ejecutar

Requisitos: Node 20.19 o posterior compatible con Vite y MySQL 8 iniciado. Esta práctica utiliza una base exclusiva `gimnasio_practica15`; no utiliza las bases de la tienda ni de mobiliario.

1. Extraer `recursos/gimnasio-backend.zip` como carpeta hermana del repositorio, por ejemplo `../gimnasio-backend` desde la raíz `Biblioteca`.
2. En el backend, copiar `.env.ejemplo` como `.env`. Configurar la contraseña local de MySQL y un `JWT_SECRET` aleatorio. No publicar ese archivo.
3. Crear en MySQL la base `gimnasio_practica15` con `utf8mb4`. Ejecutar en el backend:

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
npm run start:prod
```

El seeder reinicia los datos de esa base de demostración: ocho clases, dieciséis horarios y un horario lleno en Fuerza total, viernes a las 18:00. Usarlo únicamente en esa base.

4. En `practica15`, ejecutar:

```sh
npm ci
npm run dev
```

Abrir <http://localhost:5173>. La API corre en <http://localhost:3000>. Axios usa esa dirección por defecto; `.env.example` permite cambiarla con `VITE_API_URL`. El backend permite el origen `http://localhost:5173`.

## Rutas y comportamiento

| Ruta | Pantalla |
| --- | --- |
| `/` | Redirección con `Navigate replace` a `/clases` |
| `/clases` | Ocho tarjetas con imagen, categoría y duración |
| `/clases/:id` | Clase y horarios, entrenador, disponibilidad y estado Lleno |
| `/entrar` | Destino de Inscribirme mediante `useNavigate` |
| `*` | Página 404 con el mismo encabezado y pie |

`BrowserRouter` está en `main.tsx`. Una ruta sin path renderiza `Layout`; su `Outlet` muestra la página elegida. `clases` agrupa su índice y el hijo `:id`. Cada tarjeta usa `Link`. `useClase` depende de `[id, intento]`, ignora respuestas de efectos cancelados y permite reintentar; no presenta la clase anterior mientras llega otra. Se validan identificadores enteros positivos y se muestra el error de la API para clases inexistentes.

El formulario de sesión y JWT corresponden a la práctica 16. `/entrar` muestra explícitamente ese alcance. El enlace Mis inscripciones es parte del encabezado original y todavía lleva al 404; su página corresponde a las prácticas siguientes. Esta entrega no registra inscripciones.

## Respuestas

### 1. ¿Por qué el 404 sí tiene encabezado y pie?

La ruta `*` es hija de la ruta que renderiza `Layout`. Cuando no coincide una dirección conocida, `NoEncontrado` ocupa el `Outlet`. El encabezado y el pie están fuera de ese `Outlet`, dentro de `Layout`, y siguen visibles. Véase [la captura del 404](evidencias/05-no-encontrado.png).

### 2. ¿Qué cambia en Red al usar a href en lugar de Link?

`Link` intercepta la navegación interna, actualiza el historial y permite a React Router cambiar la página en el documento existente. En la prueba catálogo → Fuerza total hubo **cero peticiones de tipo Document**; sí se consultó `/clases/1` mediante XHR. `StrictMode` puede repetir la consulta del efecto durante el montaje en desarrollo.

Con `<a href="/clases/1">`, el navegador solicitó **un documento nuevo**, volvió a inicializar la aplicación y consultó de nuevo sus recursos y la API. Los scripts pueden obtenerse de caché o revalidarse con 304; no necesariamente se transfieren completos. Una variable de `window` sobrevivió con Link y desapareció con a href.

- [Network con Link, filtro All](evidencias/03-red-link.png).
- [Network con a href, filtro Doc](evidencias/04-red-href.png).
- [Registro de solicitudes completo](evidencias/red-comparacion.json).

Para reproducir: abrir DevTools → Network, borrar el registro y pulsar una tarjeta en `/clases`. Repetir desde `/experimentos/index.html`, que usa los mismos datos y tarjetas con enlaces HTML normales. El laboratorio solo funciona con el servidor de desarrollo y no se integra en la aplicación compilada.

### 3. ¿En qué tipo llega el id y qué pasa si no se convierte?

`useParams` devuelve el parámetro como `string` y puede ser `undefined` si no existe. Por ejemplo, llega `'1'`, no `1`. La página valida su formato y lo convierte con `Number(id)` antes de llamar al hook y al servicio cuyo contrato exige un número.

Sin conversión, `'1' + 1` da `'11'` y `'1' === 1` es falso; TypeScript también rechaza una cadena donde el servicio exige `number`. Interpolar la cadena en una URL podría funcionar porque el backend usa `ParseIntPipe`, pero no la convierte en número dentro del frontend. Se rechazan `abc`, `0`, decimales y enteros no seguros sin pedir `/clases/NaN`.

### 4. ¿Qué pasa de /clases/1 a /clases/2 si id no está en el efecto?

React Router puede reutilizar `PaginaClase` porque ambas URL coinciden con `/clases/:id`. Si el efecto tiene `[]`, solo consulta al montar: cambia el parámetro pero pueden permanecer la clase y los horarios de id 1. Con `[id, intento]` consulta otra vez al cambiar el identificador y actualiza los datos.

La [implementación correcta](evidencias/06-cambio-id.png) muestra Ciclismo indoor con sus dos horarios y Luis Fierro tras cambiar de 1 a 2. El [experimento aislado con el error](evidencias/07-efecto-sin-id.png) muestra parámetro 2 y todavía Fuerza total. Se reproduce en `/experimentos/index.html?caso=sin-id#/clases/1` pulsando Ir a clase 2; el laboratorio intencionalmente usa `[]` y no modifica el hook de la aplicación.

## Verificación y entrega

```sh
npm run build
npm run lint
npm run verificar:recursos
npm run verificar
```

`verificar` requiere Chrome instalado, base ya migrada y sembrada, backend ya compilado y puertos 3000, 5173 y 9333 disponibles. Inicia y cierra sus propios procesos; no modifica el seeder ni la base. Por defecto busca el backend como hermano de `Biblioteca`; se puede indicar otra ubicación con `GIMNASIO_BACKEND`. Realiza diez comprobaciones contra la API real y regenera las siete capturas y los registros JSON de `evidencias/`. La fidelidad de los recursos originales se comprueba con SHA-256.

El backend adjunto conserva sus controladores, servicios, esquema, migración, seeder e imágenes originales. Se actualizaron dependencias compatibles de Prisma y Swagger y se fijó Multer mediante override para ejecutar el material con las correcciones disponibles, sin modificar su lógica. La configuración local con contraseña no se incluye.

Se sigue el apartado Entrega de la guía: carpeta `practica15` en el repositorio público existente [Frontend-Web-Practicas](https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica15). También se publica la rama `Practica15`. El PDF y el Word del reporte se entregan por separado, sin portada a petición del alumno. No se incluyen dependencias ni secretos.

Material consultado: guía de la Práctica 15, Sesión 15 de rutas y layouts y Sesión 16 como referencia del trabajo posterior; documentación de [React Router](https://reactrouter.com/start/declarative/routing), [efectos de React](https://react.dev/reference/react/useEffect) y [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production).
