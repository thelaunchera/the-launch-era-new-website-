# Casa Brownie — demo educativo
Este directorio es la copia estática independiente del demo de la masterclass «Tu primera web con IA».

- Ruta pública prevista: `/demos/casa-brownie/`.
- Editor original: AppDeploy `casa-brownie-demo-miami-ltg7rb`.
- La interfaz está en español: fotos de brownies, seis sabores, simulación sin pedidos ni pagos, territorio ilustrativo de delivery local Miami.
- En móvil el video de brownies apilados aparece **antes** del texto principal; el título es **Brownies hechos en casa** y los CTA no muestran flechas decorativas.
- Prohibido conectar compradores, Stripe, guardar direcciones o iniciar entregas desde este demo sin flujo autorizado y pruebas de privacidad.
- El MP4 está referenciado externamente desde el video generado de Casa Brownie. El póster permanece visible si el video falla o la persona prefiere reducir movimiento. Antes de usarlo como producción comercial, guardar un activo propio estable y revisar licencias de todas las fotografías ilustrativas (actualmente externas).
- La ruta está autocontenida y no comparte estado, secretos, clientes, branding ni datos de CB Depot ni del demo privado de Booking.

## Mejoras de iconos y movimiento
- Tres etapas de entrega y el panel de Miami usan SVG propios, no caracteres del sistema.
- Los sellos de seis sabores comparten el mismo grosor de trazo y proporciones.
- `motion.css` + `motion.js`: apariciones discretas, tarjetas táctiles, barra de lectura y accesibilidad para movimiento reducido. No se mezclan con los efectos de clientes ni conectan datos.

## Dirección editorial de la clase
Enlace oficial: https://thelaunchera.com/demos/casa-brownie/
La clase organiza el ejemplo en un recorrido simple: **ocasión humana → producto y fotos → detalle para regalar → cobertura de Miami (ejemplo) → simulación sin compras**. Se conserva el nombre Casa Brownie y el titular «Brownies hechos en casa», pero se evitan títulos repetitivos y CTA que no hacen nada.
La sección «Una forma bonita de decir pensé en ti» utiliza una ilustración de empaque y una nota hechas con CSS, para no repetir fotografías del catálogo. No representa un testimonio ni un producto realmente vendido.
El enlace original de edición de AppDeploy sigue siendo una versión anterior; el código oficial actualizado es esta carpeta del repositorio.

## Ajuste Safari móvil y banner
- Se carga `editorial-center-v2.css` con nombre único y se versionan todas las referencias CSS/JS para impedir que una actualización HTML reutilice un CSS de una versión anterior.
- En móvil, el regalo, la nota, la historia, los pasos de entrega y la invitación final quedan centrados, con alturas reales y sin recortes ni espacios falsos.
- Banner horizontal marrón continuo entre video y sabores, dos bloques idénticos, animación lenta; con `prefers-reduced-motion` se queda estático.
- Abrir en iPhone Safari para verificar apariencia antes de marcar la tarea del Studio como terminada.
