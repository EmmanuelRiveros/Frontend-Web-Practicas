# Practicas Dominio y API HTTP

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

---

# Practica 4 De la capa de dominio a una API HTTP

En esta práctica la capa de dominio de la práctica anterior se expone por medio de una API REST hecha con Express. Las carpetas `dominio`, `infra` y `servicios` se conservaron sin cambios; la API solo traduce HTTP hacia el Service y convierte sus resultados al contrato público.

## Como correrla

```bash
npm install
npm run dev
```

También funciona `npm run servidor`. Al iniciar, abre `http://localhost:3000` para usar el cliente HTML o abre `practica4.http` con la extensión REST Client de VS Code para enviar las peticiones de prueba.
