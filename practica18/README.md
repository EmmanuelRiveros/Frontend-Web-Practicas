# Práctica 18 · Carga diferida y Zustand

Las cinco páginas de contenido se importan con `React.lazy`. `Suspense` vive alrededor del `Outlet` para mantener visibles encabezado y pie. El catálogo usa `loading="lazy"` en sus imágenes. Un store de Zustand permite que el contador, el detalle y Mis inscripciones lean las mismas inscripciones.

## Ejecución local

Con Node 20.19 o posterior compatible con Vite y MySQL 8, prepara el backend incluido en [la práctica 15](../practica15/README.md). Aplica su migración y su seeder en una base de demostración y arranca la API en http://localhost:3000. Conserva el origen permitido http://localhost:5173.

En esta carpeta:

```sh
npm ci
npm run build
npm run preview -- --port 5173 --strictPort
```

Abre http://localhost:5173. Para trabajar con recarga automática usa `npm run dev -- --port 5173 --strictPort` en lugar de preview. `VITE_API_URL` en `.env` permite ajustar la dirección de la API.

## Respuestas de la guía

**¿Cuánto se ahorró y por qué es pequeño?** Con la misma versión de Vite y el mismo código, se compararon importaciones estáticas contra `React.lazy`. La única diferencia del escenario inicial son las importaciones de las páginas. La suma de archivos se calcula con el manifiesto, contabilizando cada JS una vez.

| JavaScript | Estático | Diferido | Diferencia |
| --- | ---: | ---: | ---: |
| Archivo de entrada | 328 275 B | 219 123 B | −109 152 B (−33,25 %) |
| Inicio real en `/clases`, incluidos sus módulos | 328 275 B | 324 885 B | −3 390 B (−1,03 %) |
| Inicio estimado en gzip, por archivo | 105 090 B | 105 960 B | +870 B (+0,83 %) |

Los módulos que necesita el catálogo incluyen buena parte de React, React Router y Axios. Las pantallas diferidas son pequeñas y la separación añade código de carga. Por eso reducir el archivo de entrada no equivale a reducir en la misma medida la transferencia inicial. Gzip es una estimación local con Node, no tráfico medido desde el servidor de preview.

**¿Por qué falla la API en 4173?** CORS distingue los orígenes por esquema, host y puerto. El backend del ejercicio permite `http://localhost:5173`. Una página servida desde `http://localhost:4173` tiene un origen diferente y Chrome bloquea el acceso a la respuesta si la API no lo autoriza. Para reproducir el caso, sirve el build en 4173 con la configuración del backend sin modificar y abre la consola de Chrome.

**¿Cuándo conviene contexto y cuándo un store?** Contexto funciona bien para identidad y acciones de sesión, leídas por varios componentes y con pocos cambios. Zustand permite que partes separadas se suscriban a porciones concretas de datos que cambian con frecuencia, como la cantidad de inscripciones o la lista de horarios. El store se carga al iniciar o restaurar sesión y se vacía al cerrar. Una respuesta tardía de una sesión anterior se descarta.

## Evidencias

La [carpeta de evidencias](evidencias) incluye las salidas de ambos builds, el chunk de detalle en Network, el bloqueo CORS en 4173 y el contador antes y después de inscribirse. Mis inscripciones usa la lista compartida sin disparar otro GET al abrirse. `medicion.json` contiene el desglose de archivos, bytes y gzip.

Referencias: [React.lazy](https://react.dev/reference/react/lazy) y [acciones de Zustand](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript).
