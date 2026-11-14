# Práctica 20 Signals y servicios en el panel del gimnasio

Catalogo concentra las clases, la categoría y la selección. El tablero y el filtro obtienen el servicio mediante inject(). Al elegir Cardio se muestran cuatro clases y 175 minutos. Al seleccionar una tarjeta, su detalle aparece al lado.

## Ejecución

Usa Angular CLI 22 y Node compatible (22.22.3 o posterior de la serie 22, 24.15 o posterior de la serie 24, o 26 en adelante).

```sh
npm ci
npm start
npm run build
```

El servidor de desarrollo abre el panel en http://localhost:4200. Los datos y las imágenes se sirven desde este proyecto.

## Estado editable y valores derivados

signal guarda un valor que puede cambiar con set o update y se parece a useState. computed obtiene un valor de otros signals, se evalúa al leerse y guarda el resultado mientras sus dependencias sigan vigentes. Se parece a useMemo, pero Angular detecta las dependencias al leerlas. La lista visible y sus minutos son valores derivados.

## Instancia compartida del catálogo

Con inject(Catalogo), el filtro y el tablero usan la instancia que entrega el inyector. Con new Catalogo(), el filtro tendría sus propios signals. Cambiar su categoría dejaría intactos la lista y el resumen que lee el tablero.

## Evento de selección y diagnóstico

La tarjeta emite Clase mediante output() y recibe activa mediante input(). Catalogo limpia la selección si deja de pertenecer al filtro. Para provocar NG8109 se interpoló catalogo.minutosTotales sin paréntesis en una copia. Angular advirtió que el signal debe invocarse. La plantilla final usa catalogo.minutosTotales().

## Evidencias

- Cardio muestra cuatro clases de 45, 60, 40 y 30 minutos. [Captura](evidencias/01-filtro-cardio.png)
- Seleccionar Ciclismo indoor marca la tarjeta y abre el detalle. [Captura](evidencias/02-detalle-seleccionado.png)
- Cambiar a Fuerza limpia la selección y actualiza el resumen a dos clases y 105 minutos. [Captura](evidencias/03-seleccion-limpiada.png)
- Advertencia del compilador por interpolar el signal sin llamarlo. [Captura](evidencias/NG8109.png)

Los archivos TXT conservan la salida original de Angular CLI. `verificacion.json` registra los valores observados en Chrome.
