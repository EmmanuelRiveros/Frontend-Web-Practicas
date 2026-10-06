# Práctica 8 - Prisma, esquema y migraciones

Esta práctica deja el gimnasio modelado en MySQL. Usé el código base de las cuatro entidades y generé cinco migraciones reales, una por cada cambio pedido. La API de esta carpeta todavía trabaja con repositorios en memoria; la conexión de los repositorios a MySQL se hace en practica09.

## Cómo ejecutarla

Requisitos: Node.js 24, npm y MySQL 8 corriendo.

```powershell
cd practica08
npm ci
Copy-Item .env.example .env
# Editar DATABASE_URL con la contraseña local.
npm run prisma:migrate
npm run prisma:generate
npm run build
npm run start:dev
```

Para ver las tablas: `npm run prisma:studio`. La base local se llama `practica08_gimnasio`; contiene clases, horarios, miembros e inscripciones, además de la tabla interna _prisma_migrations. La contraseña queda solamente en .env, excluido de Git.

## Qué hice

Instalé Prisma 7.9.0, @prisma/client, @prisma/adapter-mariadb y dotenv. Ejecuté prisma init con MySQL, dejé dotenv/config en prisma.config.ts y configuré el cliente generado dentro de src/generado/prisma con moduleFormat cjs.

Después apliqué estos cambios en orden:

| Migración | Cambio |
| --- | --- |
| inicial | Clase y tabla clases |
| descripcion_clase | Descripción opcional de texto |
| horarios | Horario y llave foránea claseId |
| miembros | Miembro y correo único |
| inscripciones | Enum confirmada/cancelada, dos relaciones e índice único horarioId/miembroId |

Leí los cinco migration.sql completos y comprobé en MySQL que los cinco registros tienen finished_at. Después de la segunda etapa había dos migraciones; al terminar quedaron cinco. No usé db push como sustituto del historial.

## Respuestas de la guía

**¿Por qué el adaptador se llama adapter-mariadb si usamos MySQL?** Porque utiliza el driver mariadb de Node, que también habla el protocolo de MySQL. El nombre del paquete no cambia el servidor: aquí corre MySQL 8.0.42.

**¿Editar schema.prisma cambió algo antes de migrar?** No. Ese archivo describe cómo quiero que quede la base. El cambio se aplica cuando Prisma ejecuta el SQL de la migración.

**¿Las migraciones son una foto del esquema o un historial?** Son un historial. Cada carpeta conserva el cambio de ese momento, y juntas permiten llegar desde una base vacía hasta el esquema actual.

**¿Por qué Horario.clase sí crea columna y Clase.horarios no?** La columna real es Horario.claseId. El @relation indica que ese campo es la llave foránea hacia Clase.id. Clase.horarios es el lado inverso: sirve para navegar a los horarios relacionados y no agrega una columna con un arreglo dentro de clases.

**¿De dónde sale la relación muchos a muchos entre Miembro y Horario?** De Inscripcion. Cada inscripción apunta a un miembro y a un horario, así que esa tabla conecta ambos lados. Además guarda su estado y fecha.

## Evidencias y entrega

- capturas/01-tablas-mysql.png: captura real de Prisma Studio con las cuatro tablas y el historial.
- capturas/02-descripcion-clase.png: columnas de Clase, incluyendo descripcion.
- prisma/migrations: cinco migraciones generadas y aplicadas.
- schema.prisma: enum EstadoInscripcion e índices únicos.

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica08
Documentación consultada: https://www.prisma.io/docs/orm/overview/databases/mysql

La carpeta no publica .env, node_modules ni el cliente generado. Los informes editables se entregan por separado para agregar la portada.
