# The Launch Era · Proceso oficial de demos en GitHub

Actualizado: 7 de noviembre de 2026. Esta política sustituye la indicación anterior de crear demos en AppDeploy.

## Destino definitivo

**Todos los demos públicos se desarrollan y se publican desde GitHub/GitHub Pages; AppDeploy no es parte del proceso.** No copiar una pantalla a GitHub y dejar el sitio operativo en otro proveedor.

- Repositorio principal: `thelaunchera/the-launch-era-new-website-`. Cada marca tiene su propia carpeta en `public/demos/<slug>/`. URL: `https://thelaunchera.com/demos/<slug>/`.
- Repositorio existente para demos específicos y Brand Board: `thelaunchera/demo-booking-landing-`. El código está en `demos/<slug>/` (o rama aprobada). GitHub Pages entrega `https://thelaunchera.github.io/demo-booking-landing-/<slug>/`. Conservar esta estructura; no duplicar lo que ya existe.
- Sitios reales de clientes, como CB Depot, mantienen su propio repositorio y alojamiento autorizado. No cambiar su destino sin revisar formularios, datos y dominio.
- Mantener **una sola web canónica** por demo. Casa Brownie con foto y con video son dos variantes del mismo demo, no dos proyectos.

## Flujo obligatorio

1. **Auditar antes de crear.** Revisar Studio → Demos terminados, GitHub y Drive: identificar carpeta, nombre, URL, assets aprobados, código original y rama. No duplicar.
2. **Construir directamente en GitHub.** Usar HTML/CSS/JS estático o el proyecto fuente de la marca, con controles accesibles y diseño editorial mobile-first. No publicar prototipos vacíos, capturas o enlaces que dependan de AppDeploy.
3. **Guardar fotografía y recursos originales.** Archivos web optimizados y locales con la página; PNG originales y prompts en su carpeta de Drive. Mantener marcas separadas y no reutilizar fotografías de otra marca sin aprobación.
4. **Publicar en GitHub Pages.** Verificar el workflow, el artefacto, la publicación de Pages, cada ruta, imágenes, CSS/JS y navegación. Un commit o un build exitoso **no** prueba por sí solo la publicación.
5. **Registrar en Studio** usando el proyecto `thelaunchera/todavia-estoy-a-tiempo`, archivo `estudio-control/src/FinishedDemos.tsx`: portada, URL del demo, enlace de código GitHub, carpeta Drive, imágenes individuales, prompts y reconstrucción paso a paso.
6. **Verificar iPhone.** Revisar especialmente 375 px, menús táctiles, hero, posición de fotos, carga de recursos, legibilidad y navegación. Reportar cualquier validación que no se haya podido realizar.
7. **Aula opcional.** `Agregar al Aula` siempre es decisión explícita de la propietaria; no publicar automáticamente los kits privados ni datos de clientes.

## Reglas de privacidad

- Studio privado y Content Lab comercial separados.
- Demos de clientes reales no se incorporan al Aula ni se exponen mediante catálogo público sin autorización; no usar datos personales en demostraciones.
- No crear cobros, reservas reales, testimonios, precios u horarios ficticios como si fueran auténticos.
- No declarar «terminado» si falta URL funcional, publicación de Pages, imágenes originales, prompts o validación adecuada.

## Catálogo de exhibición

La ruta `public/demos/index.html` contiene un catálogo de **demos conceptuales** con enlaces a los sitios en GitHub Pages y al código correspondiente. El catálogo público no sustituye ni expone el kit privado de Studio.

**Regla de operación:** crear, mantener y publicar los demos directamente en GitHub. No volver al proceso anterior.
