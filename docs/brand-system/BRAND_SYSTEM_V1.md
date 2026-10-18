# THE LAUNCH ERA® — Brand System 1.0
**Creative meets Premium** · 18 octubre 2026 · Dirección aprobada: **C**
**Estado:** propuesta de sistema de marca para revisión. Documento de referencia en rama/PR; **sin aplicación a producción**.

> Una marca creativa que entiende a los cleaning business owners y ofrece sistemas profesionales fáciles de usar.

## 01 · Esencia

**Promesa:** menos información dispersa, menos seguimiento manual y una manera más organizada de manejar las operaciones de un cleaning business.

**Percepción objetivo:** "They understand how my cleaning business actually works — and their system looks simple enough to use."

**Idea narrativa:** Human enough to understand your day. Smart enough to organize it.

**No somos:** una cuenta genérica de IA, una colección de plantillas, una web con efectos sin propósito, ni software empresarial complejo. **Sí somos:** una marca humana, editorial y profesional, enfocada en resolver problemas cotidianos de negocios de limpieza en EE.UU. (residencial y comercial).

### Tres pilares
1. **Human:** usar situaciones concretas — mensajes de clientes sin responder, quotes pendientes, bookings mezclados, cambios de agenda.
2. **Editorial:** un elemento visual protagonista, fuerte jerarquía tipográfica, tensión/composición interesante, espacio negativo y pocas palabras.
3. **Premium product:** claridad, fotos y screenshots reales, interfaz creíble, CTA evidente, comportamiento transparente y datos no inventados.

## 02 · Personalidad por canal

| Canal | Sensación | Composición | Intensidad | Meta |
|---|---|---|---|---|
| Instagram / reels / carruseles | Bold & Human | Editorial atrevido, titulares protagonistas, composición asimétrica, elementos que envuelven fotografías | Alta, con ritmo; no cada post | Que nos reconozcan y se identifiquen |
| Website Home | Creative + Premium | Hero fotográfico existente, foco tipográfico, bloques conectados, una acción principal | Media | Entender y explorar |
| Landings de productos | Premium + Clear | Problema → muestra real → cómo funciona → oferta/CTA | Media-baja | Decidir sin leer demasiado |
| Cleaning App y Command Center clientes | Calm & Functional | Navegación clara, estados visibles, un siguiente paso por pantalla | Baja | Trabajar sin fricción |
| Emails / demos | Human + Direct | Mensajes breves, identidad cuidada, estado y próxima acción honestos | Baja | Confianza y claridad |

Todos los textos públicos de marketing se redactan **en inglés** por defecto; las versiones ES tienen adaptación natural equivalente.

## 03 · Color — tokens canónicos propuestos

| Token | Valor | Uso |
|---|---|---|
| `--tle-brand-ivory` | `#FAF8F3` | Lienzo principal |
| `--tle-brand-blue` | `#D7EFFF` | CTA principal en marketing, superficies destacadas |
| `--tle-brand-ice` | `#EAF4FC` | Alternar secciones sin parecer otra página |
| `--tle-brand-black` | `#191919` | Títulos, texto principal, panel de alto contraste |
| `--tle-brand-slate` | `#52616B` | Texto secundario sobre fondos claros |
| `--tle-brand-blue-ink` | `#345E76` | Etiquetas pequeñas y enlaces legibles |
| `--tle-brand-border` | `#D9E3E8` | Bordes sutiles |
| `--tle-brand-focus` | `#356E8C` | Focus visible y estados accesibles |
| `--tle-brand-yellow` | `#F2D85B` | Acento pequeño, ocasional; **no CTA** |

**Normas:**
- CTA principal: fondo Soft Blue `#D7EFFF`, texto Soft Black `#191919`; hover `#C8E5F6`. Nunca amarillo ni rojo.
- Panel oscuro: `#191919` con texto marfil y acentos azul claro.
- Amarillo: nunca fondo dominante ni repetido junto con todos los colores en una misma pieza.
- No introducir rosado, verde, rojo, navy fuerte ni gradientes que contradigan la marca en nuevos módulos. Los existentes se revisan en lote y **no** se borran por una regla global.
- Evitar texto azul de poco contraste sobre azul. Para texto pequeño, usar Soft Black o Blue Ink y comprobar contraste.

## 04 · Tipografía

**Sistema:** Prompt = titulares y mensajes editoriales; Futura = cuerpo, UI y botones (fallback instalado DM Sans; no prometer que Futura cargará en un dispositivo que no la tiene).

| Rol | Tamaño sugerido (responsive) | Peso | Regla |
|---|---|---|---|
| H1 marketing | `clamp(2.5rem, 5vw, 4.5rem)` | Prompt 500–600 | Ideal 2–3 líneas |
| H2 de sección | `clamp(1.9rem, 3.3vw, 3rem)` | Prompt 500 | Un mensaje, no explicación |
| H3 tarjeta | `clamp(1.125rem, 1.7vw, 1.375rem)` | Prompt 500–600 | Nombres concretos |
| Body | 1rem (16px), 1.5–1.65 line-height | Futura / DM Sans 400–500 | Frases cortas |
| Eyebrow | 0.75rem (12px) mínimo | Futura / DM Sans 600 | Solo para orientar, no vender |
| CTA | 0.9375–1rem (15–16px) | Futura / DM Sans 600 | Verbo + resultado |
| Caption legal | 0.8125–0.875rem | Futura / DM Sans 400 | Visible, nunca escondido |

- Una sola frase puede llevar un segundo tono visual (azul), nunca tres fuentes nuevas.
- El efecto handwriting / remarkable **existente** es un acento específico y no obliga a sumar cursivas al resto del sitio.
- Titulares en sentence case. Evitar líneas desbalanceadas, textos mínimos y exceso de MAYÚSCULAS.
- Ajustar tipografía sin modificar nodos, wrappers o atributos usados por JS/CSS de animación.

## 05 · Composición editorial

### Website / landings
- Mantener contenedor actual de ~1170px, jerarquía clara, márgenes consistentes y espacios que permitan respirar.
- Distribución sugerida: titular relevante → frase de apoyo → CTA → prueba del producto/foto existente.
- Una idea por sección; alternar ivory/ice/soft-blue y panel oscuro donde ya funcione la narrativa.
- Cards: radios 16–23px, bordes suaves, sombras discretas y misma densidad en una fila.
- No obligar al usuario a explorar cinco secciones antes de comprender qué vendemos.
- Conservar fotos, encuadres, posiciones de hero, capas fotográficas y todos los assets actuales en la fase visual.
- No añadir cintas decorativas alrededor de formularios o elementos que bloqueen lectura; Instagram sí puede usar cintas editoriales envolventes.

### Instagram
- Posts de alto contraste editorial, con una sola acción visual característica por pieza: cinta, máscara, recorte fotográfico, layout asimétrico o tipografía protagonista.
- No repetir el mismo layout en posts consecutivos, no usar todo el esquema cromático en cada diseño.
- Hook solo en portada de carruseles; el resto enseña, demuestra o resuelve.
- Producto/screenshot real cuando hablemos de la App; evita promesas ilustradas como si fueran pantallas reales.
- Lo que tomamos de referencias externas es la energía editorial, **no** la paleta roja, composición idéntica, persona o fotografía.

## 06 · Componentes comunes

### CTA
- **Primario marketing:** soft-blue, ink negro, alto mínimo 48px, padding horizontal 20–24px, radio 999px; focus visible 3px.
- **Secundario:** texto oscuro y flecha discreta; mismo destino solo si es realmente útil, no enlaces repetidos.
- Un CTA primario por decisión: Home → demo personal; landing → demo o checkout específico según intención; App → entrada existente.
- No reescribir enlaces ni lógica de consentimiento/demostración/checkout en una tarea visual.

### Tarjetas y UI
- Iconos pequeños y consistentes; estados activos/hover/focus claros.
- Las tarjetas "flip" conservan su interacción real; el futuro polish será color, tipografía y bordes, **no sustituir el motor de efectos**.
- No usar badges decorativos repetidos ni demasiados chips en el hero.

### Evidencia comercial
- Mostrar pantallas reales del sistema, sin fingir mensajes/clientes/resultados auténticos.
- Si una captura contiene datos demostrativos, etiquetar como ejemplo.
- Reviews, before/after y números solo con evidencia verificable; no inventar testimonios.
- Información contractual material — precios, condiciones, plazos, cancelaciones y pago — sigue visible.

## 07 · Voz de marca y fórmula de copy

**Cadencia:** hook (situación que reconocen) → dolor → problema concreto → sistema → beneficio → próximo paso claro.

**Escribir como persona, nunca como una plataforma.** Verbos simples, contracciones naturales, sin marketing robótico, sin clichés de productividad.

| Situación | Evitar | Proponer (EN) |
|---|---|---|
| Booking | "Revolutionize your lead intake" | "A new cleaning request shouldn't get lost in your messages." |
| Follow-up | "AI-driven engagement optimization" | "Know which quote still needs a reply." |
| Cleaning App | "All-in-one end-to-end enterprise platform" | "Your jobs, clients and invoices. Finally, together." |
| Website Automation | "Automate your digital ecosystem" | "Your website is working. Your follow-ups should be too." |
| VA | "Scalable back-office solutions" | "You handle the cleaning. Get help with the admin." |

**CTA ejemplos:** "Get my personalized demo", "Explore the Cleaning App", "See how it works", "Get started". Usar solo si la acción real detrás del botón coincide con el texto.

## 08 · Inventario del sitio revisado (lectura de código 18/10/2026)

**Home** — `src/routes/index.tsx`, `src/components/editorial-sections.tsx`
- Ya tiene hero fotográfico, starfield, chips, CTA a demo, secciones interactivas, escena de casa y footer animado. No reemplazar ni duplicar.
- **Mejora futura:** uniformar botones azules, eliminar texto repetido y pulir ritmo de secciones sin tocar el hero ni su animación.

**Booking Automation** — `src/routes/booking-lead-automation.tsx`
- Hero con chips, precios y mensajes aclaratorios. **Mejora futura:** consolidar microcopy, jerarquía de notas y CTA azul; conservar flujo, consentimiento y rutas.
- No modificar importes/descuentos al aplicar el sistema visual.

**Cleaning App** — `src/components/cleaning-app-editorial.tsx`
- Ya prioriza una demo de interfaz y recorrido. **Mejora futura:** consolidar colores/tipografía de marketing sin alterar la App runtime, capturas, funciones, pruebas ni pagos internos.

**Website Automation** — `src/routes/website-automation.tsx`
- Fondo inicial rosado `#faf4f7` en código y repetición de "Keep your website" entre H1 y cuerpo.
- **Mejora futura:** alinear fondo al sistema e introducir copy más compacto. Mantener demo interactiva y checkout.

**Virtual Assistant** — `src/routes/virtual-assistant.tsx`
- Fondo inicial `#fffaf1` en código. **Mejora futura:** alinear superficie de marketing con la paleta ivory/blue; no cambiar alcance ni oferta.

**Páginas Solutions / How it Works** — `src/routes/solutions.tsx`, `src/routes/how-it-works.tsx`
- Mensajería elegante pero bastante abstracta. **Mejora futura:** conectar títulos con situaciones reales de los clientes, preservando rutas y estructura.

**Capas actuales:** `public/assets/tle-editorial-refresh.css`, `public/assets/tle-sales.css`, `public/assets/tle-mobile.css`, `src/routes/__root.tsx`.
- Actualmente el `DESIGN_SYSTEM.md` prescribe CTA primario negro. Esta versión 1.0 propone **CTA principal azul claro**, según nueva dirección aprobada. No alterar hojas de estilos ni su orden desde esta PR documental.

## 09 · Contrato de preservación de efectos y fotos

**Prohibido en el trabajo de marca:**
- Cambiar `src` de fotos, archivos de assets, `object-position` o crop, filtros fotográficos, overlay del hero, videos, screenshots o foto de before/after.
- Editar engines/scripts/RAF/Three.js/Lenis, helpers de scroll, `transform`, `transition`, `animation`, canvas, contenedores con `data-*` o `id` utilizados por efectos.
- Modificar jerarquía DOM de hero, componentes de tarjetas flip, walkthroughs o booking wizard.
- Alterar HTML funcional, links, prices, Supabase, Stripe, demo gate, Jessie/Sonny, formulario, auth o notificaciones.

**Permitido solo en futura rama visual aprobada:** variables y reglas tipográficas/colores/espaciado cuidadosamente limitadas a páginas públicas; con captura before/after y pruebas de regresión. Los clientes/tags multi-tenant están fuera del alcance.

## 10 · Flujo de implementación y QA

1. Aprobar este documento y registrar cambios en cola central; detectar PRs/agentes concurrentes.
2. Aplicar por lotes pequeños: primero Home marketing, después Booking landing, Cleaning App *landing*, Website Automation, VA, Solutions, How it Works y ES.
3. Cambios solo en rama aislada / PR de revisión; **no merge, no deploy** antes de aprobación al final del día.
4. QA EN/ES en 360/390/768/820/1024/1440; iOS Safari/Android Chrome/desktop.
5. Comparación visual exacta de fotos, hero, animations, 3D house, scroll, menú, CTA, tarjetas flip y footer.
6. QA de interacción: click + destino, demo privado/funnel, booking state, formularios, checkout, accesibilidad (tab/focus y `prefers-reduced-motion`).
7. Ejecutar skill `skills/the-launch-era-qa/SKILL.md` y `node scripts/qa-route-integrity.mjs --static` además de tests existentes pertinentes. Verificar preview antes de publicar.

**Fuente de verdad funcional existente:** `DESIGN_SYSTEM.md`, `docs/VOICE-AND-PUBLIC-COPY.md`, `TLE_PRICING_POLICY.md`, `skills/the-launch-era-qa/{SKILL,ROUTE_MAP,INCIDENT_LOG}.md`. Cualquier conflicto sobre pagos, fechas, permisos o flujos se resuelve **fuera** de una revisión exclusivamente visual.

---
**Este archivo es una especificación editorial para discusión. No implica que se haya cambiado el website o que la QA de producción esté aprobada.**
