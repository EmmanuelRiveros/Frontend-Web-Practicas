# Practicas 3 y 4 Dominio y API HTTP

Solucion de la practica sobre la capa de dominio de un sistema de prestamos de biblioteca.

## Que se hizo

- Se declaro `Repository<T, ID = string>` con operaciones genericas y asincronas.
- `PrestamoRepository` extiende el contrato generico y agrega `findByLibro`.
- `InMemoryPrestamoRepository` guarda prestamos en un `Map` usando el folio como llave.
- El DTO de entrada usa `Omit` para que el cliente no mande folio, fecha, estado ni `costoReposicion`.
- El DTO de salida deja fuera `costoReposicion` y convierte la fecha a ISO.
- `PrestamoService` recibe la interfaz del repositorio y aplica la regla de no repetir ejemplares que siguen fuera.
- Se agregaron dos pruebas: camino feliz y ejemplar duplicado.

## Como comprobarlo

```bash
npm install
npm run typecheck
npm test
npm run dev
```

En `npm run dev`, el segundo escenario debe mostrar que el ejemplar 15 ya esta prestado y el cuarto debe mostrar `false` para `costoReposicion`.

## Respuestas de reflexion

### 1. Base de datos real y Repository

No hizo falta una base de datos real. El `Map` en memoria fue suficiente para guardar y consultar los prestamos mientras se probaba la regla. Eso muestra que `Repository` sirve para separar la forma de guardar los datos de la logica del negocio. El servicio trabaja con el contrato y no necesita saber si abajo hay un `Map`, PostgreSQL u otra cosa.

### 2. Usar la clase concreta en el Service

Si el servicio recibiera `InMemoryPrestamoRepository`, quedaria amarrado a esa implementacion. Cambiar la forma de guardar los datos obligaria a modificar el servicio, y tambien seria mas dificil probarlo con un repositorio falso. Al recibir `PrestamoRepository`, solo depende de lo que necesita.

### 3. Cambiar el Map por una base de datos real

En principio se tocaria el archivo de infraestructura donde esta `InMemoryPrestamoRepository`, creando otra clase que implemente el mismo contrato. Tambien se cambiaria el ensamblaje de `main.ts` para instanciar la nueva clase. El servicio, los DTO y la regla de negocio se quedan igual porque dependen de interfaces, no de la tecnologia de almacenamiento.

## Repositorio

https://github.com/EmmanuelRiveros/Frontend-Web-Practicas

---

# Practica 4 De la capa de dominio a una API HTTP

En esta práctica la capa de dominio de la práctica anterior se expone por medio de una API REST hecha con Express. Las carpetas `dominio`, `infra` y `servicios` se conservaron sin cambios; la API solo traduce HTTP hacia el Service y convierte sus resultados al contrato público.

## Como correrla

```bash
npm install
npm run dev
```

También funciona `npm run servidor`. Al iniciar, abre `http://localhost:3000` para usar el cliente HTML o abre `practica4.http` con la extensión REST Client de VS Code para enviar las peticiones de prueba.

## Respuestas esperadas

- `GET /api/prestamos?libroId=LIB-0417` responde `200` y una lista, vacía al inicio.
- El primer `POST /api/prestamos` responde `201` e incluye la cabecera `Location`.
- Repetir el ejemplar 15 responde `409`.
- Mandar `libroId` vacío, omitir `socioId` o enviar `ejemplares` con un tipo incorrecto responde `400` y regresa todos los detalles detectados.
- Una ruta que no existe responde `404`.

## Respuestas de reflexión de la práctica 4

### 1. Qué pasaría sin el manejo async de Express

Cada ruta async tendría que envolver su código en `try/catch` y pasar el error con `next(error)`. Sin eso, un rechazo de una promesa no llegaría al middleware central de errores y terminaríamos repitiendo la misma lógica en todas las rutas.

### 2. Por qué el Service no lanza un 409

El Service sabe de préstamos, no de HTTP. Para él, el problema es que un ejemplar ya está prestado, por eso lanza `EjemplarPrestadoError`. La capa HTTP es la que entiende que ese error debe viajar como un `409 Conflict`. Así la misma regla se puede usar después desde otro tipo de cliente sin meter códigos HTTP en el dominio.

### 3. Qué cambiaría para una app móvil

La app móvil puede consumir las mismas rutas y los mismos contratos de `contratos/prestamo.dto.ts`. Para agregarla no tendría que tocar el dominio, el Service ni el repositorio. Solo crearía el cliente móvil y, si necesitara campos o rutas nuevas, ajustaría el contrato y la capa HTTP de forma consciente.
