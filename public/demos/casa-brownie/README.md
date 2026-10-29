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
