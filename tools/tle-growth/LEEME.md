# The Launch Era · herramientas locales

1. Descarga y extrae el ZIP completo en tu laptop Windows.
2. Abre `Start-TLE-Tools.cmd` con doble clic. Necesitas Python **3.10–3.12**, instalado desde https://www.python.org/downloads/windows/. Marca **Add Python to PATH** al instalar.
3. Pulsa **Instalar herramientas básicas**. Para leer imágenes, pulsa también **Instalar OCR local**. Las descargas iniciales necesitan internet; no hay cuentas, claves API ni servicios de pago.
4. Elige el documento o el informe y dónde guardar el resultado. Los resultados de OCR son para revisar: no se añaden automáticamente al CRM.

## Herramientas

- **PDF:** extrae texto existente con pypdf. Para páginas escaneadas, usa OCR.
- **OCR:** PaddleOCR + PaddlePaddle ejecutan el reconocimiento en el equipo. La primera ejecución descarga modelos; la velocidad depende de tu laptop. Revisa nombres, fechas y cantidades. No se sube el documento a un servicio remoto.
- **Investigación:** guarda una página pública en tu navegador como HTML y selecciónala. Scrapling extrae título, encabezados, texto y emails publicados. El resultado conserva la URL y se etiqueta como copia guardada, sin verificar actualidad ni entrega de correos. No elude inicios de sesión ni restricciones.
- **PowerPoint:** exporta primero el JSON desde Command Center → Sales tools → Reports y ábrelo aquí. También puedes descargar PowerPoint directamente desde esa pantalla.

El monitoreo diario de páginas y las próximas acciones se guardan en el Command Center; no necesitan que la laptop permanezca encendida. La herramienta local no incluye datos de clientes, credenciales ni conexión automática al CRM.

## Licencias y alcance

Los paquetes se instalan desde PyPI con versiones fijadas; conserva sus licencias si redistribuyes sus archivos. Scrapling: BSD-3-Clause; PaddleOCR/PaddlePaddle: Apache-2.0; pypdf: BSD-3-Clause; python-pptx: MIT. El ZIP contiene nuestro código y archivos de instalación, no copias de los modelos.

El CRM existente se conserva. No se incluye OpenSEO/DataForSEO porque los datos externos requieren pago por consumo. El análisis web de TLE cubre HTML básico; no reemplaza sus rankings, backlinks o volúmenes de búsqueda. Los conceptos de demo y las presentaciones son herramientas propias de TLE; no se presenta Website Cloner ni PPT Master como instalado o ejecutado.
