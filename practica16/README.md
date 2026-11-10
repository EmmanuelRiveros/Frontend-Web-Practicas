# Práctica 16 · El gimnasio y la sesión con JWT

El proveedor comparte la identidad con el encabezado y los formularios. Iniciar sesión y registrarse llaman a la API. El interceptor de Axios incorpora el encabezado `Authorization: Bearer <token>` cuando hay un JWT guardado. El nombre de la cuenta reaparece al recargar y Salir elimina los datos de sesión.

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

**¿Por qué usar contexto para la sesión?** El encabezado, Entrar y Registro necesitan la misma identidad o las mismas acciones. El proveedor centraliza esos datos y `useSesion` los lee desde cada consumidor. Con props habría que añadirlas a componentes intermedios que solo las reenviarían.

**¿Qué pasa si se lee la sesión fuera del proveedor?** El valor por defecto del contexto es `null`. `useSesion` detecta esa condición y lanza un error explícito que indica que falta `ProveedorSesion`.

**¿Dónde se guarda el token y qué riesgo tiene?** Se guardan `token` y `usuario` en `localStorage` del origen del frontend. Cualquier JavaScript ejecutado en ese origen puede leerlos. Una inyección XSS podría copiar el JWT y reutilizarlo hasta su vencimiento. El payload de un JWT firmado se puede decodificar y su firma solo se verifica con la clave correspondiente. La lectura en [jwt.io](https://www.jwt.io/) usa un ejemplo de demostración y el JWT real se decodificó localmente.

## Evidencias

La [carpeta de evidencias](evidencias) contiene el 401 de credenciales, la sesión restaurada, la petición con Authorization redactada, la lectura del JWT y el registro 201. `lectura-local.json` conserva solo los campos decodificados de la prueba, con el correo oculto. Se usaron las cuentas de demostración del seeder.

Referencias: [Contexto de React](https://react.dev/reference/react/useContext) y [Axios](https://axios-http.com/docs/interceptors).
