# Práctica 5 - Mi primera API con NestJS

API mínima para consultar y agregar clases de un gimnasio. Los datos se guardan en un arreglo en memoria, así que se reinician cuando se detiene el servidor.

## Cómo ejecutarla

```bash
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.

## Rutas probadas

- `GET /` responde el mensaje inicial generado por NestJS.
- `GET /clases` devuelve las dos clases que ya vienen cargadas.
- `POST /clases` recibe un JSON como `{"identificador":"CL-003","nombre":"Zumba"}` y devuelve esa misma clase con estado `201 Created`.
- Otro `GET /clases` muestra que el arreglo creció durante la ejecución.

Las cuatro peticiones están listas en `practica05.http` para correrlas con REST Client.

## Respuestas de la práctica

**¿Qué generó `nest new`?** Generó la base del proyecto: configuración de TypeScript, dependencias, scripts de npm, una prueba, el módulo principal, controlador, servicio y el archivo que arranca el servidor.

**¿Qué hace el `AppService` generado?** Por ahora es un servicio muy sencillo. Tiene el método `getHello()` y le entrega el mensaje al controlador cuando alguien visita la ruta raíz.

**¿Por qué funciona la ruta sin declarar algo nuevo en `app.module.ts`?** Porque `AppController` ya quedó registrado en `controllers` desde que Nest creó el proyecto. Al agregar métodos decorados dentro de ese mismo controlador, Nest descubre las rutas automáticamente.

**¿Qué pasaría si el cuerpo de la petición llegara vacío?** En esta versión básica se agregaría un objeto vacío al arreglo porque todavía no hay validación. El siguiente paso lógico sería usar un DTO y `ValidationPipe` para rechazarlo con un 400.

**¿En qué archivo vive hoy toda la lógica de la práctica?** La lógica del catálogo está en `src/app.controller.ts`: ahí vive el arreglo y también las rutas para consultarlo y agregar una clase.