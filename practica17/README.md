# Práctica 17 · Rutas protegidas e inscripciones

`RutaProtegida` guarda la ubicación solicitada y abre Entrar cuando falta sesión. Tras autenticarse se recupera la ruta completa, incluidos sus parámetros de búsqueda y fragmento. El botón Inscribirme crea la inscripción, muestra el resultado de la API y recarga el detalle para actualizar el cupo. Si el servidor devuelve 401 para el JWT vigente, se borra la sesión.

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

**¿La ruta protegida hace segura la aplicación?** La ruta de React evita mostrar la pantalla a un visitante sin sesión. El servidor protege los datos al validar la firma y vencimiento del JWT en cada petición protegida y comprobar la identidad, el rol y la pertenencia de los registros. La comprobación independiente de la interfaz devuelve HTTP 401:

```sh
curl -i http://localhost:3000/inscripciones/mias
```

**¿Por qué no se manda `miembroId` al inscribirse?** El cuerpo lleva solo `horarioId`. El backend obtiene el identificador del miembro de la identidad autenticada, de modo que el cliente no puede escoger la cuenta a la que se atribuye la inscripción.

**¿Qué diferencia hay entre 401 y 403?** 401 indica que falta una autenticación válida, como una petición sin token o con un token inválido. 403 indica que el servidor reconoce la identidad pero su rol carece del permiso solicitado. Un 409 representa un conflicto con una regla del gimnasio, por ejemplo una inscripción duplicada.

## Evidencias

La [carpeta de evidencias](evidencias) incluye la redirección y el regreso, el alta y el cupo actualizado, el 409 por duplicado, el 403 con una cuenta entrenadora, el cierre tras enviar un token de prueba inválido y la respuesta real de curl.

Referencia: [Navegación con React Router](https://reactrouter.com/api/hooks/useNavigate).
