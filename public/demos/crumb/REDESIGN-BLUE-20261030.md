# CRUMB — rediseño azul del demo (30 Oct 2026)

## Estado
- **CSS y primer ajuste editorial preparados en la rama**, sin publicar en producción.
- **7 fotografías finales en ChatGPT**, cada imagen independiente. Los binarios NO se han subido a GitHub ni a Supabase Storage.
- No fusionar esta rama antes de subir los WebP y completar QA responsive.

## Paleta fijada
- Powder blue `#C9E2F4` (fondos, hero strip, secciones)
- Medium blue `#477BB3` (logo / CTAs)
- Warm ivory `#FAF8F3` (lectura)
- Soft black `#191919` (texto)

## Asignación exacta de imágenes, sin repetición
1. **Hero desktop + mobile:** `CRUMB_Storefront_Hero_Blue.webp` (una sola fachada; logo oficial `crumb.`). Reemplazar `hero.webp` y `hero-mobile.webp` solo después de subir el nuevo asset. El hero no lleva overlay; calibrar object-fit en 1440, 1024, 820, 390 y 360px.
2. **Our Story:** `CRUMB_Lifestyle_Cookie_Blue.webp`, la persona comiendo cookie. Reemplazar `brand-lifestyle.webp` solo después de subir. No repetir en otra sección.
3. **Gifts:** `CRUMB_03_Gift_Box_Azul.webp`; nunca repetir en galería.
4. **Inside CRUMB:** tres imágenes distintas: degustación (ya existe `brand-tasting.webp`), maker (ya existe `brand-maker.webp`), y una foto única de packaging (preferencia `CRUMB_02_Bolsa_Azul.webp` o `CRUMB_04_Flat_Lay_Azul.webp`). La fachada se retira de la galería porque pertenece al hero.
5. **Cookie Edit:** seis fotografías de sabores existentes, diferentes y correctas. No reemplazar con imágenes del showcase.
6. **Brand showcase para Instagram/Studio:** cinco archivos PNG individuales `CRUMB_01_Packaging_Azul.png`, `CRUMB_02_Bolsa_Azul.png`, `CRUMB_03_Gift_Box_Azul.png`, `CRUMB_04_Flat_Lay_Azul.png`, `CRUMB_05_Detalle_Azul.png`.

## Reglas
Preservar lógica de bolsa, seis sabores y precios de ejemplo, formulario modal, mapa ilustrativo de Miami, textos legales y disclosures de demo ficticio. Nunca afirmar que la tienda existe ni que acepta pagos. Evitar collages, plantillas repetidas, nuevos componentes innecesarios y cambios en Casa Brownie.

## Aprobación pendiente
- [ ] Subir 7 imágenes a `public/demos/crumb/assets/` en WebP con nombres anteriores, después comprimir sin pérdida visual significativa.
- [ ] Sustituir los src reales en `index.html`, actualizar dimensiones, alt y versiones.
- [ ] Confirmar visibilidad y legibilidad de hero/logo y CTA responsive.
- [ ] Correr `node scripts/qa-crumb-demo.mjs` y QA visual 360/390/820/1024/1440.
- [ ] Verificar demo oficial después del deploy antes de aprobar esta rama.

## Notion / Studio
- [Biblioteca visual de CRUMB](https://app.notion.com/p/409a68f2ee6e81c7a8beef6f0eb0f34f)
- [Ficha de carrusel 31 Oct](https://app.notion.com/p/409a68f2ee6e815fbef7d81f29c3f805)
- Studio privado: ficha de ideas `class:landing-ai:crumb-blue-showcase-20261030`.
