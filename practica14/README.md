# Práctica 14 La tienda contra su API

Emmanuel Riveros, matrícula 00000240694. La tienda obtiene el catálogo desde el backend NestJS del profesor, guarda pedidos simulados en MySQL y muestra su folio. Los seis componentes de presentación de la práctica 13 se conservan sin cambios. El estilo se copió del ZIP de esta práctica y las imágenes siguen siendo las del profesor.

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica14

## Preparar el backend

El backend es una aplicación independiente, en la carpeta hermana `E:/Descargas/github/clase/tienda-backend`. La copia preparada está incluida en `recursos/tienda-backend.zip`: extraerla junto a la carpeta del repositorio de prácticas para obtener la carpeta hermana tienda-backend. Se entregó originalmente en el ZIP del profesor. No se mezcla con el servicio de mobiliario. Requiere MySQL 8 en ejecución y Node.js 22.12 o posterior; se verificó con MySQL 8.0.42 y Node.js 24.11.1.

En la carpeta tienda-backend:

```bash
npm ci
```

Copiar `.env.ejemplo` a `.env` y configurar valores locales. Ejemplo sin credenciales reales:

```dotenv
DATABASE_URL="mysql://TU_USUARIO:TU_PASSWORD@127.0.0.1:3306/tienda_practica14"
PORT=3001
```

La cuenta debe poder crear la base y aplicar migraciones. La contraseña real solo se configura localmente. Si contiene caracteres especiales, codificarlos para una URL. No subir `.env`.

```bash
npx prisma generate
npx prisma migrate dev --name inicial
npx prisma db seed
npm run build
npm run start:prod
```

Si MySQL no crea automáticamente la base, ejecutar `CREATE DATABASE tienda_practica14 CHARACTER SET utf8mb4;` con una cuenta autorizada y repetir la migración. `npx prisma db seed` carga los doce productos y **borra pedidos e inventario anteriores de esa base**: usar exclusivamente la base de demostración. Prisma 7 requiere ejecutar el seeder explícitamente.

Se conserva el código funcional del backend del profesor. En la copia local se actualizaron Prisma, Prisma Client y el adaptador a ~7.10.1 y se fijó una versión corregida de Multer con `overrides`. El archivo de bloqueo conserva las versiones verificadas. No se cambió el contrato de sus endpoints.

Comprobar http://localhost:3001/productos: debe responder `{ data: [...], meta: {...} }` con doce productos. El puerto 3001 evita ocupar el 3000 utilizado por otro proyecto. El CORS del backend permite http://localhost:5173.

## Ejecutar el frontend

Desde practica14:

```bash
npm ci
npm run dev -- --port 5173 --strictPort
```

Abrir **http://localhost:5173**. Mantener `localhost` en el navegador para coincidir con CORS. La dirección de la API predeterminada es http://localhost:3001. Si se necesita otra, copiar `.env.example` a `.env`, cambiar `VITE_API_URL` y reiniciar Vite. Esta variable es una dirección pública del servicio, no una credencial.

```bash
npm run build
npm run lint
npm run verificar:recursos
```

## Organización y flujo

- `src/servicios/api.ts`: única importación e instancia de Axios, baseURL, timeout de cinco segundos y normalización de errores HTTP, de conexión y de tiempo límite.
- `src/servicios/tienda.ts`: extrae `respuesta.data.data` del sobre al consultar productos y registrar pedidos.
- `src/hooks/useProductos.ts`: efecto con dependencia `revision`; expone datos, cargando, error y reintentar. Una bandera de limpieza ignora respuestas de un ciclo anterior.
- `src/App.tsx`: carrito inmutable, categoría, datos derivados, composición de los estados y confirmación. No importa Axios ni usa un catálogo local de respaldo.
- `src/FormularioPago.tsx`: correo y teléfono controlados, validación, envío y mensaje de la API.
- `Layout`, `Encabezado`, `PiePagina`, `Filtros`, `Catalogo` y `TarjetaProducto`: los mismos archivos de presentación de la práctica anterior.

Al pagar se envía `{ correo, telefono, productos: ["P-005", ...] }`. Un identificador repetido representa otra pieza. El total definitivo y el folio los devuelve el backend; el frontend no los inventa. En un éxito se muestra el folio, se vacía el carrito y se vuelve a pedir GET /productos. Un rechazo conserva el carrito y los campos. Durante el envío se deshabilitan el botón y los campos y se impide agregar piezas al carrito desde el catálogo.

El pago es simulado y no utiliza tarjetas ni realiza cargos. Los contactos usados en las capturas son ficticios. El carrito y el formulario viven en memoria; recargar reinicia esos estados. Los pedidos y existencias permanecen en MySQL.

## Respuestas de la práctica

### Por qué aparecen dos peticiones al cargar en la pestaña Red

La aplicación se monta dentro de StrictMode en `main.tsx`. En desarrollo, React ejecuta un ciclo adicional de configuración y limpieza del efecto para detectar problemas. El efecto inicia un GET por cada configuración, por lo que se observan dos GET /productos. No son dos pedidos ni dos cobros.

La limpieza marca la primera ejecución como no vigente para que una respuesta anterior no sobrescriba la más reciente. Se eligió ignorar su resultado; no se cancela la petición HTTP. Por eso ambas peticiones pueden terminar con 200. El ciclo adicional de StrictMode no ocurre en la construcción de producción. La captura `02-red-strictmode.png` muestra dos consultas reales.

### Qué pasa si se quita el arreglo de dependencias del efecto

Sin segundo argumento, el efecto se ejecuta después de cada render. En este caso, la respuesta contiene una lista nueva; guardarla en el estado produce otro render, que vuelve a ejecutar el efecto y a consultar la API. Se forma un ciclo de peticiones.

El laboratorio independiente `/experimentos/index.html` omite el arreglo y permite observar varias consultas consecutivas en Red. Tiene una pausa de 200 ms para que se puedan leer; esa pausa no corrige el ciclo. Se detiene cerrando la pestaña o navegando a otra página. La aplicación normal usa `[revision]`: carga al montar y vuelve a consultar cuando se solicita un reintento o se confirma un pedido.

No debe confundirse omitir el arreglo con escribir `[]`: un arreglo vacío evita volver a ejecutar el efecto por actualizaciones normales, aunque StrictMode mantenga su comprobación adicional de desarrollo.

### Qué hace e.preventDefault y qué pasa si se quita

En el manejador submit impide la acción predeterminada del formulario, que es enviar o navegar el documento. Así React puede validar, llamar a la API y mostrar el resultado en la misma página sin perder el estado del carrito y del formulario.

Si se quita, el navegador puede navegar o recargar, reiniciando esos estados e interfiriendo con la petición asíncrona. El laboratorio `/experimentos/index.html?caso=formulario` usa un formulario GET sin preventDefault: al enviarlo cambia la URL, aparecen sus campos como parámetros y el estado se reinicia. Solo se usan datos ficticios. En el formulario normal el teléfono se valida con exactamente diez dígitos y el correo debe contener @; el backend realiza una validación de correo más estricta y sus errores también se muestran.

## Evidencias y verificación

`npm run verificar` prepara el seeder, inicia sus propios procesos del backend y Vite, prueba la interfaz contra MySQL y guarda las capturas. Al terminar detiene únicamente esos procesos. Antes de ejecutarlo, dejar libres los puertos 3001, 5173 y 9333. Requiere Google Chrome instalado en Windows; en otras plataformas instalar Chromium con `npx playwright install chromium`.

El backend debe estar compilado en la carpeta hermana tienda-backend y su .env debe apuntar a **tienda_practica14**. Se puede indicar otra carpeta con BACKEND_DIR. La prueba rechaza otra base antes de ejecutar el seeder. No ejecutar mientras se esté usando el inventario de demostración.

Las capturas de Red corresponden al frontend auténtico de Chrome DevTools conectado a la pestaña de la aplicación. No son tablas fabricadas para parecerse al navegador. Las respuestas vienen de NestJS y MySQL reales; solo se agregó un retraso al tráfico de algunas comprobaciones para capturar el estado cargando y el bloqueo durante el envío.

| Evidencia | Archivo |
| --- | --- |
| Cargando y catálogo de la API | 01-cargando.png y 03-catalogo.png |
| Dos peticiones de StrictMode | 02-red-strictmode.png |
| Validación controlada | 04-validacion.png |
| POST confirmado y nueva consulta | 05-red-pedido.png |
| Folio y carrito vacío | 06-pedido-confirmado.png |
| Existencia actualizada | 07-existencia-actualizada.png |
| Mensaje 409 y petición en Red | 08-error-409.png y 09-red-409.png |
| API apagada | 10-api-apagada.png y 11-red-api-apagada.png |
| Reintento correcto | 12-reintento-correcto.png y 13-red-reintento.png |
| Efecto sin dependencias | 14-red-sin-dependencias.png y 15-sin-dependencias.png |
| Formulario sin preventDefault | 16-sin-preventdefault.png |
| Vista móvil | 17-movil.png |

`resultados.json` conserva las comprobaciones y la traza HTTP. `pedido-confirmado.json`, `rechazo-409.json` y `red.har` permiten contrastar las capturas. El verificador de recursos comprueba que los seis componentes siguen sin modificaciones y que CSS e imágenes coinciden con los archivos originales.

El PDF del reporte se entrega sin portada para que el alumno la agregue. El código se publica como practica14 en el repositorio de prácticas, sin node_modules, dist ni configuración privada.

## Fuentes

- Guía Práctica 14 La Tienda contra su API y los dos ZIP proporcionados por el profesor.
- https://react.dev/reference/react/StrictMode
- https://react.dev/reference/react/useEffect
- https://react.dev/reference/react-dom/components/input
- https://axios-http.com/docs/instance
- https://axios-http.com/docs/handling_errors
- https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
