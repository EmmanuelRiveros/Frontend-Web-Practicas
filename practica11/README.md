# Práctica 11 Componentes con TypeScript puro

Construí un catálogo de 12 productos con Vite y TypeScript, sin React, Angular ni otro framework de interfaz. El botón y la tarjeta son Web Components del navegador. Las tarjetas agotadas no agregan al carrito y Vaciar reinicia el contador.

## Cómo ejecutarla

Requisito: Node.js 24.

~~~powershell
cd practica11
npm ci
npm run dev -- --host 127.0.0.1
~~~

Abrir http://127.0.0.1:5173. Para compilar:

~~~powershell
npm run build
~~~

Para repetir las 19 comprobaciones y las capturas, con el servidor activo:

~~~powershell
npx playwright install chromium
npm run verificar:componentes
~~~

El script también acepta CHROME_PATH para usar un Chrome instalado y BASE_URL para otra dirección. Playwright solo sirve para las pruebas; no está en el código que recibe el usuario del catálogo.

## Procedencia de los recursos

La lista conserva los nombres, precios, categorías y existencias del main.ts publicado por el profesor. Los dos componentes se basan en sus Gists. El HTML, el CSS y las doce ilustraciones SVG locales son de elaboración propia. No presento esas ilustraciones como fotografías del código base.

Fuentes de la guía:

- https://gist.github.com/CharlyCastrejon/ab9b5953a14cefacb864f4bd0ef22be1
- https://gist.github.com/CharlyCastrejon/4ee2d178b960c125cc92c037192958be
- https://gist.github.com/CharlyCastrejon/e87d38a51f6403af0bb4d7361c1c145a

## Cómo funciona el botón

BotonApp hereda de HTMLElement y se registra como boton-app. El constructor crea su Shadow DOM y coloca el CSS importado con ?inline, un botón nativo y un slot. El texto que escribo entre las etiquetas se muestra en ese slot.

Las entradas son variante y los atributos booleanos deshabilitado o disabled. El navegador observa los cambios y vuelve a pintar el botón. La variante danger queda roja, secundario tiene borde azul y primario tiene fondo azul. El deshabilitado usa el estado disabled real del botón interno.

## Cómo funciona la tarjeta y el carrito

TarjetaProducto recibe producto-id, nombre, precio, imagen y existencia. Convierte precio y existencia con Number. Usa Intl.NumberFormat para el precio y cambia la disponibilidad cuando se modifica un atributo.

La tarjeta utiliza boton-app por dentro. Si la existencia es cero, pone Agotado en rojo y deshabilita el botón. Al agregar un producto disponible emite agregar con id, nombre y precio. La rejilla tiene un solo listener de producción que aumenta el contador; Vaciar lo vuelve a cero.

El evento se emite desde el botón que está dentro de la sombra de la tarjeta. Ajusté ese punto del Gist: emitirlo desde this, que es el host, no exige cruzar el Shadow DOM y no demuestra el efecto de composed. Con el origen interno sí pude verificar la diferencia.

## Respuestas y observaciones

**¿Por qué el nombre de una etiqueta propia debe llevar guion?** Es parte de la regla de nombres de customElements.define. Así se distingue de las etiquetas nativas y se evita chocar con nombres que el estándar agregue después. Uso boton-app y tarjeta-producto.

**¿Qué pasó al cambiar la variante en el HTML?** Cambié el atributo de Vaciar a danger sin editar TypeScript. attributeChangedCallback actualizó la clase del botón interno y cambió su apariencia a rojo. Al agregar disabled el botón quedó deshabilitado. Quitar el atributo lo habilitó otra vez.

**¿Cómo llega el texto del botón?** Como contenido entre las etiquetas, por ejemplo Vaciar. El slot lo muestra sin que el componente tenga que recibir otro atributo o conocer ese texto de antemano.

**¿Por qué convertir precio y existencia?** getAttribute devuelve texto o null. Number permite comparar la existencia contra cero y formatear el precio como dinero. El detalle del evento lleva precio como número: comprobé el valor 1299, no el texto 1299.

**¿Para qué sirven bubbles y composed?** bubbles permite que el evento suba a un antecesor como la rejilla. composed permite que cruce la frontera de la sombra. Como el origen está dentro de la tarjeta, necesito las dos opciones para que llegue al listener externo.

**¿Qué pasó sin composed?** En una prueba aislada forcé composed false al crear agregar. Hice clic y el contador siguió en 3, sin ningún error JavaScript. Restauré composed true y el siguiente clic lo llevó a 4. El código entregado conserva composed true.

**¿Por qué escuchar una sola vez en la rejilla?** Las doce tarjetas emiten el mismo tipo de aviso. Aprovecho la propagación y dejo que el contenedor lo reciba, en lugar de registrar doce listeners para el contador. La tarjeta no necesita conocer el carrito.

**¿Qué queda encapsulado?** El marcado y el CSS internos. Un selector button de la página no selecciona el botón dentro de la sombra: lo comprobé con una regla externa verde. Eso no convierte Shadow DOM en una barrera de seguridad. El modo open permite inspeccionar shadowRoot; además pueden heredarse propiedades y variables CSS.

**¿Cómo funcionan los cinco momentos del ciclo de vida?** El constructor crea la estructura. connectedCallback pinta cuando entra al documento. attributeChangedCallback reacciona a las entradas observadas. disconnectedCallback sirve para limpiar trabajo externo cuando sale. adoptedCallback avisa si pasa a otro documento. Aquí no hay temporizadores ni listeners de window pendientes de limpieza.

**¿Qué hacen los agotados y Vaciar?** Licra y chamarra tienen existencia cero, muestran Agotado y no emiten agregar al intentar pulsar su botón nativo. Tres productos disponibles llevaron el contador a 3. Vaciar lo regresó a 0.

## Evidencias reales

Se verificaron 19 casos en Chrome: las 12 tarjetas y sus imágenes, variantes, slot, detalle numérico, contador, atributos dinámicos, composed, agotados, aislamiento del CSS, vista móvil y ausencia de errores JavaScript.

- 01-variantes.png y 08-variante-danger.png: variantes y cambio por atributo.
- 02-catalogo.png: las doce tarjetas.
- 03-contador.png y 04-vaciar.png: contador después de agregar y después de vaciar.
- 05-licra-agotada.png y 06-chamarra-agotada.png: detalle de los agotados.
- 07-shadow-root.png: lectura del DOM real mediante la API del navegador; no simula una ventana de DevTools.
- 09-deshabilitado.png y 10-movil.png: estado disabled y adaptación móvil.
- resultados.json: valores observados y resultados de las 19 comprobaciones.

Repositorio: https://github.com/EmmanuelRiveros/Frontend-Web-Practicas/tree/main/practica11

Referencias: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements, https://developer.mozilla.org/en-US/docs/Web/API/Event/composed y https://vite.dev/guide/features.html.

node_modules y dist quedan fuera de Git. El informe DOCX se entrega por separado, sin portada.
