# CRUMB — identidad azul vigente, fotografías y demo (30 octubre 2026)

**Estado del proyecto:** el rediseño azul y sus activos están integrados en el repositorio. Esta ficha reemplaza las instrucciones históricas de "pendiente subir 7 archivos" y la lista de imágenes anterior. La publicación concreta del último cambio se confirma por separado en GitHub Pages; el estado de una PR fusionada no equivale a verificación visual en todos los dispositivos.

## Identidad aprobada (NO modificar sin nueva decisión)
- Nombre de marca: **crumb.** con logo original azul y emblema de cookie mordida.
- Color CRUMB Blue **#477BB3**, Powder Blue **#C9E2F4**, Warm Ivory **#FAF8F3**, Soft Black **#191919**; el kraft natural es solo el material del empaque. En tarjetas de sabores hay crema/butter suave junto al azul claro.
- Fotografía editorial premium, natural, rica en textura y apetito; nunca estética de Canva genérica, fondos mostaza, vino, mascotita de perro, logo de otra marca ni collages.
- Todo contenido público, headings, botones, sabores y disclaimers en **inglés estadounidense**. El proyecto es un demo de negocio ficticio en Miami, **sin checkout/pago real**.

## Registro oficial de las 12 fotos usadas en el demo

| Sección | Archivo activo en `assets/` | Uso |
| --- | --- | --- |
| Hero desktop/tablet/mobile | `CRUMB_Storefront_Approved_20261030.webp` | fachada azul; una única vez |
| Our Story | `CRUMB_Our_Story_Approved_20261030.webp` | mujer disfrutando cookie con café y caja abierta |
| Gifts | `CRUMB_03_Gift_Box_Azul.png` | regalo de cookies en packaging kraft/azul |
| Inside CRUMB · 1 / 3 | `CRUMB_Inside_Cookie_Moment_Blue.svg` | mesa de cookies y cinta azul |
| Inside CRUMB · 2 / 3 | `CRUMB_Inside_Made_With_Care_Blue.svg` | empleada con delantal CRUMB azul |
| Inside CRUMB · 3 / 3 | `CRUMB_02_Bolsa_Azul.png` | bolsa kraft + cookies sobre fondo azul |
| Cookie Edit · Classic Chocolate Chip | `classic.webp` | $3.50 |
| Cookie Edit · Double Chocolate | `double.webp` | $4.50 |
| Cookie Edit · Salted Caramel | `caramel.webp` | $5.50 |
| Cookie Edit · White Chocolate Raspberry | `raspberry.webp` | $6.00 |
| Cookie Edit · Nutty Dream | `nutty.webp` | $7.00 |
| Cookie Edit · Brownie Chip | `brownie.webp` | $5.00 |

Estas **12 rutas son las activas** comprobadas en el HTML del demo. El builder también reutiliza las seis imágenes de sabores en miniatura; no son nuevos assets ni fotos repetidas en secciones editoriales.

## Presentación aprobada actualmente
1. **Hero:** fachada azul en fuente vertical adaptable a pantallas; texto del hero por HTML/CSS (no impreso en imagen).
2. **Cookie Edit:** seis sabores con tarjetas individuales de rayas azul claro/crema, logo pequeño de cookie mordida, precio de muestra y el botón **+** azul, visualmente pequeño pero con área táctil de 44 px.
3. **Gifts:** fotografía independiente de la caja, tamaños 3/6/12, combinaciones y nota personalizada en builder de muestra.
4. **Inside CRUMB:** carrusel de exactamente **tres** fotografías diferentes y captions «The cookie moment», «Made with care», «Beautifully boxed»; swipe en móviles, puntos 1/3–3/3. Todas las fotos presentan recorte visual cuadrado coherente, sin barras azules de relleno ni marcos artificiales.
5. **Our Story:** mujer comiendo cookie con caja de regalo en la foto aprobada; sin sustituir por la bolsa antigua de otra sesión.
6. **Miami:** ruta ilustrativa y dirección **ficticia** claramente informada; sin geolocalizar usuarios ni prometer entregas reales.
7. **Footer / legal:** mantener descargo educativo, contacto simulado y el crédito discreto de The Launch Era.

## Activos archivados — no usar automáticamente para reemplazar
- `CRUMB_Storefront_Hero_Blue.png` y `CRUMB_Lifestyle_Cookie_Blue.png`: versiones **antiguas** del hero y Our Story, preservadas como histórico. No son los `src` activos.
- `CRUMB_01_Packaging_Azul.png`, `CRUMB_04_Flat_Lay_Azul.png`, `CRUMB_05_Detalle_Azul.png`: originales/editorial de showcase respaldados en Drive; no están asignados a una sección del demo actual.
- `brand-*.webp`, `hero.webp` y otras fotos de prototipo: históricos. No revertir el código a esos nombres sin autorización.

## Guías de producción y uso
- **Prompts fotográficos actuales de cada imagen y sabor:** [PHOTO-DIRECTION.md](./PHOTO-DIRECTION.md). Son instrucciones de reproducción de estilo, **no los prompts originales recuperados**.
- **HTML y orden real de fotos:** [index.html](./index.html).
- **CSS actual y efectos responsive:** [styles.css](./styles.css).
- **Lógica de las cajas (no alterar por fotos):** [main.js](./main.js).
- **Demo:** https://thelaunchera.com/demos/crumb/
- **Biblioteca en Notion:** https://app.notion.com/p/409a68f2ee6e81c7a8beef6f0eb0f34f
- **Assets de showcase previos en Drive:** https://drive.google.com/drive/folders/1H7fHys_iN4Hgw6v1m22fc_oN2vKdKRlE

## Verificación cuando se cambien fotografías en el futuro
- [ ] Cada composición individual con el logo correcto; sin collage ni elementos no aprobados.
- [ ] Comparar cada archivo y ruta en `index.html`; no inferir assets a partir de textos de referencia antiguos.
- [ ] Mantener los 6 productos, precios reales **dentro del demo ficticio** y botones `data-add`.
- [ ] QA local: `node scripts/qa-crumb-demo.mjs` + `node scripts/qa-route-integrity.mjs --static`.
- [ ] QA visual de 360, 390, 820, 1024 y 1440px; no darla por aprobada solo por tests DOM.
- [ ] Comprobar que GitHub Pages publique y el sitio sirva el HTML y fotos vigentes.

## Historial
- 30 oct: identidad de azul claro, estudio packaging y fotos originales definidas.
- Posteriormente: nuevo hero vertical de fachada, nueva mujer y caja en Our Story, seis sabores reales, fotos de las dos primeras tarjetas Inside, tercera bolsa, carrusel mobile y controles + pequeños.
- Los estados de "faltan imágenes", "hero antiguo", "sin publicar" y "Macadamia/Cream/Cinnamon" corresponden a versiones históricas y **no son tareas abiertas** de esta ficha.
