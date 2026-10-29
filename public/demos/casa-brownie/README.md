# Casa Brownie — demo educativo
Este directorio es la copia estática independiente del demo de la masterclass «Tu primera web con IA».

- Ruta pública prevista: `/demos/casa-brownie/`.
- Editor original: AppDeploy `casa-brownie-demo-miami-ltg7rb`.
- La interfaz está en español: fotos de brownies, seis sabores, simulación sin pedidos ni pagos, territorio ilustrativo de delivery local Miami.
- En móvil el video de brownies apilados aparece **antes** del texto principal; el título es **Brownies hechos en casa** y los CTA no muestran flechas decorativas.
- Prohibido conectar compradores, Stripe, guardar direcciones o iniciar entregas desde este demo sin flujo autorizado y pruebas de privacidad.
- El video de brownies utilizado por esta versión ahora está guardado localmente como `assets/hero-brownies.mp4` (≈1,3 MB), junto a su póster `assets/hero-brownies.webp`. La imagen permanece visible si el video falla o la persona prefiere reducir movimiento. **El material proviene de un clip generado tomando como referencia una imagen de terceros**; revisar los derechos de la imagen fuente antes de uso comercial. Las seis fotos de sabores fueron sustituidas por imágenes originales generadas y aprobadas por Dailin el 29 de octubre; archivos locales assets/sabor-*.webp, compartidos por catálogo y fichas.
- La ruta está autocontenida y no comparte estado, secretos, clientes, branding ni datos de CB Depot ni del demo privado de Booking.

## Mejoras de iconos y movimiento
- Tres etapas de entrega y el panel de Miami usan SVG propios, no caracteres del sistema.
- Los sellos de seis sabores comparten el mismo grosor de trazo y proporciones.
- `motion.css` + `motion.js`: apariciones discretas, tarjetas táctiles, barra de lectura y accesibilidad para movimiento reducido. No se mezclan con los efectos de clientes ni conectan datos.

## Dirección editorial de la clase
Enlace oficial: https://thelaunchera.com/demos/casa-brownie/
La clase organiza el ejemplo en un recorrido simple: **ocasión humana → producto y fotos → detalle para regalar → cobertura de Miami (ejemplo) → simulación sin compras**. Se conserva el nombre Casa Brownie y el titular «Brownies hechos en casa», pero se evitan títulos repetitivos y CTA que no hacen nada.
La sección «Una forma bonita de decir pensé en ti» usa **las dos fotografías de regalo aprobadas** en archivos locales (caja con lazo rosa y bolsa/cajas de regalo). No representa un testimonio ni un producto realmente vendido.
**El demo aprobado es únicamente el que vive en esta carpeta del repositorio.** La versión editable de AppDeploy es anterior y no debe reemplazar ni sobrescribir esta página; AppDeploy solo se usa para enseñar a los alumnos a construir su propia versión.

## Ajuste Safari móvil y banner
- Se carga `editorial-center-v2.css` con nombre único y se versionan todas las referencias CSS/JS para impedir que una actualización HTML reutilice un CSS de una versión anterior.
- En móvil, el regalo, la nota, la historia, los pasos de entrega y la invitación final quedan centrados, con alturas reales y sin recortes ni espacios falsos.
- Banner horizontal marrón continuo entre video y sabores, dos bloques idénticos, animación lenta; con `prefers-reduced-motion` se queda estático.
- Abrir en iPhone Safari para verificar apariencia antes de marcar la tarea del Studio como terminada.

## Fotografías nuevas de regalo · 29 oct 2026
- En «Una forma bonita de decir pensé en ti» se sustituyeron ambas ilustraciones CSS por fotografías aportadas por la creadora: caja de regalo con lazo rosa (`assets/regalo-lazo-rosa.webp`) y bolsa/cajas con brownies (`assets/regalos-bolsa-y-cajas.webp`).
- No se crearon secciones nuevas, pedidos ni capturas de datos; las fotos tienen descripciones alternativas y encuadres adaptables en `gift-photos.css`.
- **Corrección de nitidez (29 oct 2026):** reemplazadas las miniaturas escaladas por copias optimizadas de los originales adjuntos: bolsa y cajas de **1448 × 1086 px** y caja con lazo de **1240 × 1269 px**. Se conserva el tamaño original con compresión WebP de calidad alta y se renuevan las URL de ambas imágenes para evitar caché antiguo en móvil.

## Preparación y pruebas de la masterclass
- Guía de las nueve grabaciones, revisión móvil y seguridad: [`GUIA-PARA-LA-CLASE.md`](./GUIA-PARA-LA-CLASE.md).
- Las pruebas automatizadas actuales verifican también los archivos locales de las dos fotografías y su estilo responsivo. Las fotos del catálogo son originales aprobados; revisar los encuadres en dispositivos reales.
