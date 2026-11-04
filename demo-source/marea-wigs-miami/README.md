# Marea Wigs · Miami

Demo editorial bilingüe creado inicialmente con AppDeploy.

- Web canónica: https://thelaunchera.com/demos/marea-wigs-miami/
- Prototipo AppDeploy: https://marea-wigs-miami-a54ksv.v2.appdeploy.ai/
- Fuente: https://github.com/thelaunchera/the-launch-era-new-website-/tree/main/demo-source/marea-wigs-miami
- Fotos y kit en Drive: https://drive.google.com/drive/folders/18fNKBKlyXDVZd4VSsc4hmgGV5Br1OSdM

## Reconstrucción

Los 14 PNG originales se conservan una sola vez, sin compresión ni cambio de bytes, en `public/demos/marea-wigs-miami/resources/` dentro del repositorio. `PROMPTS.md` y `PROMPTS.json` conservan los prompts fotográficos exactos y seis pasos de reconstrucción.

Desde esta carpeta:

```sh
npm install
npx tsc --noEmit
npm run build
```

El script de preparación copia los recursos canónicos al directorio local ignorado `public/resources/`. El resultado `dist/` se publica en `public/demos/marea-wigs-miami/`.

## Experiencia

Español por defecto, selector inglés persistente, filtros de cuatro looks, fichas, favoritos locales, buscador de tres pasos, galería de ocho piezas, ritual, comunidad, empaque, FAQ y consulta de muestra con validación. No existe backend, pagos, reservas ni envío de consultas. No inventa precios, testimonios o características comerciales.

## Studio

La ficha se registra en el estudio privado, en Demos terminados, con fotos, prompts y pasos. El control Agregar al Aula conserva el estado inicial No añadido al aula.

Powered by The Launch Era.
