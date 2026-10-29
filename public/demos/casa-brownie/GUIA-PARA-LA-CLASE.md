# Casa Brownie · Manual de referencia para grabar «Tu primera web con IA»

## Fuente oficial (IMPORTANTE)

**La web aprobada es la de este repositorio**, no una versión antigua del editor. El resultado principal se enseña **sin video**; el video queda como bono:

- Demo que debe verse en los videos: https://thelaunchera.com/demos/casa-brownie/
- Código fuente oficial: `public/demos/casa-brownie/`
- La copia de AppDeploy que se utilizó inicialmente **no se debe volver a publicar encima de esta versión**: contiene una versión editorial anterior.
- El alumno puede usar AppDeploy para construir **su propia web**, pero el ejemplo definitivo de Casa Brownie se enseña desde la URL del repositorio.

**Estado del negocio:** marca ficticia, en español, brownies tradicionales, entrega local ilustrativa limitada a Miami. Es una demostración educativa **sin pedidos, pagos, entregas, precios ni registro de datos reales**. No se activará Stripe ni una automatización desde esta demo.

## Estructura visual que NO cambia

1. Header con símbolo de casita y corazón.
2. En móvil, video de brownies apilados **antes del texto**; imagen fija si no se reproduce.
3. Hero: **«Brownies hechos en casa»**; botón «Descubrir sabores».
4. Seis sabores y ficha de cada uno.
5. Bloque editorial «Una forma bonita de decir pensé en ti», con las dos fotografías aprobadas: caja con lazo rosa y bolsa/cajas de regalo.
6. Entrega de ejemplo **solo Miami**; zonas exactas, fechas y costos sin definir.
7. Simulación interactiva de pedido que no envía información, con aviso explícito de demostración.
8. Footer con la identificación educativa y aviso de que no hay ventas.
9. Sin flechas decorativas; no repetir «amor real».

## Dos etapas para enseñar sin repetir la web

- **Paso principal, sin video:** https://thelaunchera.com/demos/casa-brownie/?etapa=sin-video — misma página oficial, mismo hero con fotografía fija; el script no reproduce el MP4.
- **Resultado final aprobado, con video:** https://thelaunchera.com/demos/casa-brownie/ — mantiene la animación original. Es la **revelación del bono**, no una lección que el estudiante deba completar para aprobar.
- No son dos proyectos publicados distintos. Son **dos vistas del mismo código oficial**, evitando diferencias de diseño, fotos o textos.
- La grabación original de creación **no existe**: se hará una reconstrucción auténtica desde un proyecto de práctica nuevo y vacío. Decirlo así, sin simular material de archivo.
- Los recursos de producción, las fotografías aprobadas y los prompts específicos por sección están en **Studio → Clases · grabación → Casa Brownie · de cero al demo final**. Allí también están los pasos para reconstruir la web, copiar cada prompt y comprobar las etapas.
- **Orden de rodaje:** mostrar brevemente resultado final en introducción; reconstruir identidad, fotos, textos, hero estático, seis sabores, regalos, entrega, simulación, footer y móvil; al final revelar video como **bono independiente**. No convertir el truco del video en parte de las nueve grabaciones principales.
- **Fotos actuales de sabores:** el catálogo aprobado todavía enlaza fotografías de terceros; no entregarlas como recursos propios para descargar. Crear seis imágenes originales individuales aprobadas antes de distribuir el paquete.

## Cómo verificarlo antes de grabar

- Abrir URL oficial con caché limpia en iPhone/Safari, Android/Chrome si se dispone, tableta y desktop.
- Verificar en **iPhone**: video/póster visible antes del texto, sin scroll horizontal ni bloqueo de carga.
- Activar «Reducir movimiento» y confirmar que queda la imagen de respaldo.
- Tocar los seis sabores, abrir/cerrar fichas, seleccionar un sabor, completar la simulación y confirmar que **no pide nombre, dirección, correo ni tarjeta**.
- Abrir navegación móvil, probar links de secciones, icono de búsqueda, botón de bolsa, info de Miami y avisos de la demo; probar Escape y tabulación en desktop.
- Revisar nitidez de las dos fotos de regalo (1448×1086 y 1240×1269 originales) y el encuadre de cada una.
- Confirmar que no hay errores de red en fotografías externas. Registrar cuál falla si hay alguno; no sustituir una foto aprobada por otra sin revisión editorial.
- Revisar que video no tiene audio, que el bucle es discreto y que existe un póster cuando falla.
- Prueba de 360 px de ancho y de pantalla grande: ninguna parte importante queda cortada.
- Grabar un clip de recorrido **sin barras del navegador ni datos privados**.

## Lista de recursos y advertencias

| Recurso | Dónde se encuentra | Estado |
| --- | --- | --- |
| Fotografías aprobadas de las dos cajas de regalo | `assets/regalo-lazo-rosa.webp` y `assets/regalos-bolsa-y-cajas.webp` | Locales, nitidez corregida |
| Video de brownies apilados y póster | `assets/hero-brownies.mp4` y `assets/hero-brownies.webp` si su importación y QA terminan correctamente | Clip original de la demo **ahora local y optimizado**; pendiente revisar visualmente el bucle y derechos de imagen fuente |
| Seis fotos de sabores | URLs de terceros en `index.html` y `main.js` | **No aprobadas para redistribución:** comprobar permisos/licencias o producir seis fotografías propias antes de distribuir materiales |
| Identidad del sitio | SVG en `index.html` y CSS local | Aprobado |
| Código de interacción | `main.js` | Sin backend ni almacenaje de datos |

**Importante sobre derechos:** que una imagen sea visible en una web pública no autoriza a copiarla ni distribuirla. La demo actualmente enlaza fotografías de sitios externos. El video del hero se creó usando como referencia una foto externa, por lo que también debe revisarse el derecho sobre la imagen fuente antes de incluirlo en un producto comercial. No atribuir autores ni inventar permisos.

## Qué grabar en cada una de las nueve lecciones

| Video | Dónde entrar | Qué demostrar sin improvisar |
| --- | --- | --- |
| **00 · Bienvenida** | Demo oficial de Casa Brownie; aula | Mostrar el resultado final, explicar frontend visible y backend opcional. Señalar «DEMO EDUCATIVA». |
| **01 · La idea** | ChatGPT y carpeta de Drive | Ficha de negocio ficticio, destinatario, valor, objetivo informativo, territorio Miami. Separar información real de ejemplos. |
| **02 · Inspiración** | Tres referencias propias y esta demo | Qué es jerarquía, proporción del hero, presentación de regalos, identidad. Inspirarse sin copiar imágenes ajenas. |
| **03 · Fotografías** | Recursos autorizados y ChatGPT | Cómo solicitar hero, foto de producto, detalle y caja de regalo; guardar originales individuales y optimizaciones web. |
| **04 · Textos** | ChatGPT y demo oficial | Redactar el hero «Brownies hechos en casa», explicar sabores, entrega y footer; revisar tono, hechos y botones. |
| **05 · Construcción** | AppDeploy en el proyecto **nuevo del alumno** | Conectar si está disponible, pegar prompt con sus propios textos/fotos, crear preview y publicar URL HTTPS sin dominio propio. **No sobrescribir el demo oficial**. |
| **06 · Móvil** | Demo oficial en teléfono y versión de práctica | Recorte de imágenes, legibilidad, video al principio, póster de respaldo, navegación, botones, fotos en regalo. |
| **07 · Pagos y automatizaciones, opcionales** | Materiales privados del aula | Diferenciar página informativa de procesos internos; explicar Stripe de prueba → Make → Gmail, secretos, API keys, sin conectar nada en Casa Brownie. |
| **08 · Footer y publicación** | Footer del demo, lista de QA y la URL propia del alumno | Avisos y enlaces reales según país, privacidad si se recogen datos, prueba móvil, captura, compartir sin claves. |

## Carpeta simple para estudiantes

Dentro de **Mi Primera Web**:

- `00_IDEA`: idea y público
- `01_TEXTOS`: textos revisados
- `02_FOTOS`: fotos autorizadas, con originales y versiones web
- `03_PROMPTS`: prompts probados, sin credenciales
- `04_DISENO`: referencias, colores y logo
- `05_WEB`: enlaces, versión aprobada y capturas
- `06_PRUEBAS`: lista de enlaces, móvil, errores y resultados
- `07_GASTOS`: servicios, precio y renovación, **sin contraseñas**

No compartir contraseñas, claves API secretas, SSN, banco, datos de clientes ni códigos de acceso en capturas, carpetas o prompts. El Proyecto de ChatGPT de cada estudiante debe ser privado.

## Qué significa «demo aprobado para grabar»

- [x] Estructura editorial y contenido base guardados en repo
- [x] Fotos de regalo locales en su resolución original
- [x] Checkout y recopilación de datos desactivados
- [ ] QA visual manual en iPhone y escritorio después de cualquier cambio de video
- [ ] Verificar que la fuente del hero y las seis fotos tienen licencia/permiso o sustituirlas por material propio autorizado
- [ ] Aceptación editorial definitiva del bucle del video y del peso de descarga
- [ ] Realizar una grabación completa de ejemplo sin mostrar información privada

**No confundir** pasar tests automatizados con que la pieza ya fue revisada en un dispositivo real.
