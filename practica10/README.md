# Práctica 10 JWT y OpenAPI

Terminé el backend del gimnasio con el filtro de dominio, identificación de peticiones, tiempos de ejecución, el sobre data/meta, CORS, autenticación JWT y autorización por roles. Los usuarios se guardan en MySQL. El catálogo de clases y horarios sigue público.

## Cómo ejecutarla

Requisitos: Node.js 24 y MySQL 8. La base aislada se llama practica10_gimnasio.

```powershell
cd practica10
npm ci
Copy-Item .env.ejemplo .env
# Editar DATABASE_URL y generar un JWT_SECRET aleatorio de al menos 32 caracteres.
npm run prisma:deploy
npm run prisma:generate
npm run prisma:seed
npm run build
npm run start:prod
```

Abrir http://localhost:3000/docs para usar Swagger. Las cuentas del seed son karla@itson.mx, ana@itson.mx y admin@itson.mx, con la contraseña de prueba gimnasio2026. Son datos académicos, no cuentas para producción.

Para ejecutar la batería automatizada, cerrar primero el servidor del puerto 3000:

```powershell
npm run prisma:seed
npm run build
npm run verificar:api
node scripts/probar-middleware.mjs
```

El verificador inicia su propio servidor, lo reinicia sin ejecutar seed y comprueba la persistencia. Se probaron 44 peticiones del profesor y 18 comprobaciones adicionales: 62 en total, incluida la decodificación local de claims. También probé login, Authorize, una inscripción propia 201 y una ajena 403 directamente en Swagger.

El seed limpia solamente la base de esta práctica. No lo ejecutes si quieres conservar los registros que hayas creado ahí.

## Qué cambió

El sobre envuelve únicamente las respuestas exitosas en data y meta. Los errores conservan su contrato de error. El filtro traduce la clase base ErrorDeDominio a 404 o 409. PeticionIdMiddleware conserva X-Request-Id si lo manda el cliente o genera un UUID. LoggingInterceptor registra los resultados exitosos. CORS permite únicamente http://localhost:5173.

JwtAuthGuard protege las rutas por omisión y lee la excepción Publico con Reflector. JwtStrategy verifica HS256, firma y caducidad. UsuarioActual toma req.user después de verificar el JWT. RolesGuard exige entrenador o admin para DELETE /inscripciones/:id; corre después del guard de autenticación.

Conservé las cinco migraciones previas, descripcion y el enum EstadoInscripcion. La sexta migración agrega usuarios. Leí el CREATE TABLE: id autoincremental, correo único, hash de contraseña, rol, miembroId opcional y creadoEn automático.

Corregí dos entradas inseguras del ejemplo: el registro público no acepta rol ni miembroId. Siempre crea una cuenta de miembro y el repositorio busca su asociación por el mismo correo, no por un ID elegido por el cliente. Mandar cualquiera de esos campos extra da 400. La verificación de propiedad del correo no forma parte del ejercicio; sería necesaria para un registro real en producción.

Actualicé Swagger dentro de Nest 11 y apliqué npm audit fix sin force. Siguen existiendo avisos en dependencias del código base; no presento esta práctica local como un despliegue de producción.

## Respuestas de la guía

**¿Por qué el filtro atrapa la clase base y no cada error por separado?** Porque los cuatro errores heredan de ErrorDeDominio. Con una sola entrada al filtro puedo traducir sus diferencias a 404 o 409. Si aparece otro error de dominio, no necesito copiar otro try/catch en cada controlador.

**¿Qué pasa si falta next?** El middleware pone el encabezado, pero no deja que la petición llegue al siguiente paso ni termina la respuesta. En la prueba aislada el cliente esperó hasta el timeout de 350 ms; al restaurar next recibió 200. El middleware final conserva next().

**¿Por qué el middleware no sería el lugar indicado para decidir permisos de una ruta?** En esa etapa todavía no tengo el contexto de ejecución del método seleccionado ni sus decoradores de roles. Un middleware puede comprobar cosas generales, pero el guard conoce al usuario y puede leer los metadatos del controlador y del método con Reflector.

**¿Por qué el 409 no aparece en el registro del interceptor?** Porque el tap del ejemplo escucha la emisión exitosa. Cuando el servicio lanza el error, ese camino se interrumpe. El filtro sí deja un aviso con Dominio y el nombre del error. Para medir también fallos podría usarse finalize, pero aquí conservé el comportamiento pedido.

**¿Por qué el sobre rompe a un cliente existente?** Antes GET /clases devolvía un arreglo y el cliente leía respuesta[0].nombre. Ahora el arreglo está en respuesta.data, así que debe leer respuesta.data[0].nombre. El status puede seguir siendo 200 aunque el contrato del cuerpo haya cambiado.

**Si el servidor respondió a los dos orígenes, quién bloquea y a quién protege?** El navegador impide que JavaScript de localhost:4000 lea el contenido porque no recibió Access-Control-Allow-Origin para ese origen. Para localhost:5173 sí aparece. CORS no reemplaza JWT ni bloquea curl o Postman; controla la lectura entre orígenes dentro del navegador.

**¿Por qué passwordHash y no password?** El nombre deja claro que guardo el resultado de bcrypt y no la contraseña original. bcrypt agrega una sal y usa un factor de trabajo de 10. En login uso compare; no descifro una contraseña guardada.

**¿Por qué los dos errores de login dicen lo mismo?** Tanto un correo inexistente como una contraseña incorrecta devuelven Credenciales invalidas. Así la respuesta no ayuda a averiguar qué correos tienen cuenta. Esto iguala el mensaje; no afirma que ambos casos tengan un tiempo de respuesta idéntico.

**Si el contenido del JWT se puede leer, qué protege la firma?** Protege la integridad y el origen del token, no su privacidad. Decodifiqué localmente el header y el payload: se ven sub, correo, rol, miembroId, iat y exp. El hash no aparece. Cambiar rol a admin sin recalcular una firma válida produjo 401. Leer esos datos no requiere JWT_SECRET.

**¿Por qué proteger todo y abrir a mano?** Una ruta nueva queda protegida aunque quien la crea olvide agregar un decorador. Las excepciones se reconocen por Publico: login, registro y el catálogo. Si olvido marcar una ruta pública, recibo un 401 visible; no dejo una ruta privada abierta accidentalmente.

**¿Cuál es la diferencia entre 401 y 403?** Un 401 significa que no hay autenticación válida: falta token, está modificado o venció. Un 403 significa que ya identifiqué al usuario, pero la acción no está permitida. Karla obtuvo 201 al inscribirse a sí misma y 403 al intentar inscribir al miembro 3.

**¿Cuántas líneas de AuthService hay que cambiar para pasar de memoria a MySQL y por qué?** Ninguna por el almacenamiento. AuthService usa el contrato UsuarioRepository; el módulo cambia useClass a UsuarioPrismaRepository. Los cambios que hice al registro para impedir privilegios elegidos por el cliente son un ajuste de seguridad separado, no una adaptación a SQL.

**¿Por qué tomar la identidad de los claims y no de la URL o del body?** sub identifica la cuenta y miembroId vincula al miembro. Después de verificar la firma, comparo ese miembroId con el solicitado. Si confiara solo en el body, Karla podría mandar miembroId 3 y crear una inscripción de Sofía. Lo mismo sucedería con una URL de datos de otro miembro si no se comprobara su dueño. Un claim alterado sin una firma válida se rechaza con 401; una identidad válida que pide actuar como otra se rechaza con 403.

## Tarea de roles

Creé Roles y RolesGuard. En la misma ruta DELETE /inscripciones/4 comprobé: sin token 401, con Karla 403 y con Ana 200. También comprobé que admin puede cancelar. El guard de roles se registra después del guard JWT.

## Evidencias

Las imágenes de respuestas provienen del informe visual de solicitudes HTTP reales guardadas en resultados.json. No simulan una ventana de REST Client. Las capturas de Swagger sí muestran su interfaz real. JWT reutilizables y contraseñas están omitidos en las copias de evidencia.

- 01 a 06: error 409, X-Request-Id, consola con tiempos, sobre y ambos orígenes CORS.
- 07 a 13: 401, login, claims, 403, Swagger, migración y login después del reinicio.
- 14-flujo-jwt.png y flujo-jwt.drawio: flujo y ramas de rechazo.
- 15 a 18: roles, firma modificada, experimento de next y pruebas desde Swagger.

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica10

Referencias técnicas consultadas: https://docs.nestjs.com/recipes/passport, https://docs.nestjs.com/security/authorization y https://docs.nestjs.com/openapi/cli-plugin.
