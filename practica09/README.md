# Práctica 9 - Blindar la API

La API del gimnasio ya guarda sus datos en MySQL con Prisma. Mantiene las reglas de cupo y duplicados del servicio original, y agrega validación global, un filtro de errores de dominio y CORS.

## Cómo ejecutarla

Requisitos: Node.js 24, npm y MySQL 8.

```powershell
cd practica09
npm ci
Copy-Item .env.example .env
# Editar DATABASE_URL con la contraseña local.
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run build
npm run start:dev
```

La base local es practica09_gimnasio. La semilla limpia exclusivamente esa base de práctica y vuelve a cargar dos clases, tres horarios y tres miembros. No la uses si quieres conservar los datos que hayas agregado ahí.

Con el servidor activo, en otra terminal:

```powershell
cd practica09
npm run verificar:api
```

Antes de repetir toda la batería, ejecuta otra vez prisma:seed. También puedes abrir peticiones.http en REST Client y enviar los 40 bloques en orden.

## Qué quedó implementado

PrismaModule es global y exporta PrismaService. Los cuatro módulos usan repositorios Prisma mediante los mismos tokens e interfaces del código base. En practica09 ya no están los cuatro repositorios de memoria.

Los CrearXDto y ActualizarXDto son clases con decoradores. El ValidationPipe usa transform, whitelist, forbidNonWhitelisted y forbidUnknownValues, todas en true. El tsconfig conserva emitDecoratorMetadata y los DTO se importan como valores en el controlador: eso permite que Nest conozca la clase concreta al ejecutar la petición.

El filtro captura ErrorDeDominio. HorarioNoEncontradoError y MiembroNoEncontradoError responden 404; CupoLlenoError e InscripcionDuplicadaError responden 409. Todos esos errores usan statusCode, error, message, path y timestamp.

CORS permite http://localhost:5173 y http://localhost:3001. Expone Location y X-Request-Id. El middleware agrega el identificador de petición; el interceptor registra ruta y duración.

El esquema y sus cinco migraciones son los mismos de practica08, incluida descripcion y el enum. Para volver a inscribir una pareja cancelada, el repositorio reactiva su fila con upsert. Así se conserva el índice único sin modificar las reglas del servicio.

## Respuestas de la guía

**¿Qué línea del Service o Controller tuvo que cambiar para hablar con MySQL?** Ninguna por el cambio de almacenamiento. Cambió el useClass del módulo y la implementación del repositorio. Los cambios posteriores del controlador corresponden a validación y filtro, no a la conexión.

**¿Por qué InscripcionesService no cambió sus reglas?** Porque depende de InscripcionRepository y no de un arreglo ni de Prisma. La nueva implementación conserva las mismas operaciones. Comprobé que el archivo del servicio es idéntico al de practica08.

**¿Por qué una interfaz no valida en ejecución?** Porque TypeScript la borra al compilar. Una clase sí existe en JavaScript y sus decoradores dejan reglas que class-validator puede ejecutar.

**¿Qué responde la validación?** Un 400 Bad Request. El cuerpo trae statusCode, error y message, que es un arreglo de detalles. Por ejemplo, horarioId con texto falla como entero; un campo extra falla con property campoExtra should not exist. transform convierte el objeto plano a la clase DTO, whitelist identifica sus campos, forbidNonWhitelisted rechaza los extras y forbidUnknownValues rechaza objetos sin metadatos válidos. Para que esto tenga efecto son indispensables una clase DTO y emitDecoratorMetadata.

**¿Cuántas líneas quedó más corto el controlador?** InscripcionesController pasó de 81 a 59 líneas: 22 menos, contando comentarios y líneas vacías. Quité la comprobación manual del cuerpo y el try/catch que traducía errores; ahora lo hacen el pipe y el filtro.

**Si la respuesta llega con los dos orígenes, ¿quién bloquea y a quién protege?** El navegador bloquea el acceso al contenido desde un origen no permitido. La API puede responder 200 también a ese origen, pero no manda Access-Control-Allow-Origin. CORS protege la lectura desde JavaScript en el navegador; no autentica a curl, Postman ni otros clientes.

## Resultado de pruebas reales

Se ejecutaron los 32 casos suministrados y ocho complementarios: 40 de 40 con el código esperado. Se comprobaron también Location, X-Request-Id, la ruta y fecha del filtro, los detalles del 400 y los encabezados CORS.

| Grupo | Resultado |
| --- | --- |
| Crear y consultar entidades | 201 y 200 |
| Cupo lleno e inscripción duplicada | 409 del filtro |
| Horario o miembro inexistente | 404 del filtro |
| Tipos incorrectos, campos extra, correo y membresía inválidos | 400 de validación |
| Cancelar y reutilizar cupo | 200 y 201 |
| Volver a inscribir una pareja cancelada | 201 |
| CORS 5173 y 3001 | 200 con Allow-Origin y Expose-Headers |
| CORS 9999 | 200 sin Allow-Origin |

Las capturas son imágenes del navegador mostrando el informe generado a partir de respuestas HTTP reales, no una simulación de REST Client. capturas/respuestas.json conserva las respuestas completas e informe.html permite revisarlas.

Capturas requeridas: 01-validacion-400.png, 02-conflicto-409.png, 03-cors-permitido.png y 04-cors-no-permitido.png. Incluí también el campo desconocido y el segundo origen permitido.

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica09
Documentación consultada: https://docs.nestjs.com/techniques/validation y https://docs.nestjs.com/security/cors

.env y node_modules quedan fuera de Git. Los informes se entregan localmente, sin portada.
