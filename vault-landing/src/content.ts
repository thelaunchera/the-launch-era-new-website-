const higgs = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_";
const image = (id: string, width: number, quality: number) => higgs + id + ".png&w=" + width + "&q=" + quality;

export const portrait = image("20261031_040619_2f6f349e-a4a7-40db-8e9b-03b6acd8b99a", 1024, 92);

const preview = "https://motionsites.ai/assets/hero-";
export const previews = [
  "space-voyage-preview-eECLH3Yc", "codenest-preview-Cgppc2qV", "vex-ventures-preview-BczMFIiw",
  "stellar-ai-v2-preview-DjvxjG3C", "asme-preview-B_nGDnTP", "transform-data-preview-Cx5OU29N",
  "vitara-preview-Cjz2QYyU", "terra-preview-BFjrCr7T", "skyelite-preview-DHaZIgUv",
  "aethera-preview-DknSlcTa", "designpro-preview-D8c5_een", "stellar-ai-preview-D3HL6bw1",
  "xportfolio-preview-D4A8maiC", "orbit-web3-preview-BXt4OttD", "nexora-preview-cx5HmUgo",
  "evr-ventures-preview-DZxeVFEX", "planet-orbit-preview-DWAP8Z1P", "new-era-preview-CocuDUm9",
  "wealth-preview-B70idl_u", "luminex-preview-CxOP7ce6", "celestia-preview-0yO3jXO8",
].map(name => preview + name + ".gif");

const figma = "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/";
export const objects = [
  { file: "moon_icon.11395d36.png", className: "left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]", x: -80, delay: .1 },
  { file: "p59_1.4659672e.png", className: "bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]", x: -80, delay: .25 },
  { file: "lego_icon-1.703bb594.png", className: "right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]", x: 80, delay: .15 },
  { file: "Group_134-1.2e04f3ce.png", className: "bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]", x: 80, delay: .3 },
].map(object => ({ ...object, src: figma + object.file }));

export const projects = [
  {
    name: "Nextlevel Studio", category: "client",
    pictures: [
      "20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db",
      "20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8",
      "20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327",
    ],
  },
  {
    name: "Aura Brand Identity", category: "personal",
    pictures: [
      "20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f",
      "20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1",
      "20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea",
    ],
  },
  {
    name: "Solaris Digital", category: "client",
    pictures: [
      "20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f",
      "20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b",
      "20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee",
    ],
  },
].map(project => ({ ...project, images: project.pictures.map(id => image(id, 1280, 85)) }));

export const copy = {
  en: {
    about: "About", price: "Price", navProjects: "Projects", contact: "Contact",
    title: "Hi, i’m mina",
    intro: "a 3d creator driven by crafting striking and unforgettable projects",
    aboutTitle: "About me",
    aboutText: "With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!",
    contactMe: "Contact Me", servicesTitle: "Services", projectsTitle: "Project", liveProject: "Live Project",
    client: "Client", personal: "Personal", library: "Free AI guides", otherLanguage: "ES", close: "Close project preview",
    services: [
      ["3D Modeling", "Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations."],
      ["Rendering", "High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life."],
      ["Motion Design", "Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences."],
      ["Branding", "Crafting cohesive visual identities -- from logos to full brand systems -- that communicate a clear and memorable presence."],
      ["Web Design", "Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience."],
    ],
  },
  es: {
    about: "Acerca de", price: "Precios", navProjects: "Proyectos", contact: "Contacto",
    title: "Hola, soy Mina",
    intro: "creadora 3D dedicada a diseñar proyectos que sorprenden y se quedan en la memoria",
    aboutTitle: "Sobre mí",
    aboutText: "Llevo más de cinco años trabajando en diseño. Me especializo en identidad visual, diseño web y experiencia de usuario. Disfruto colaborar con negocios que quieren diferenciarse y mostrar su mejor versión. ¡Hagamos algo increíble juntos!",
    contactMe: "Contáctame", servicesTitle: "Servicios", projectsTitle: "Proyecto", liveProject: "Ver proyecto",
    client: "Cliente", personal: "Personal", library: "Guías gratis de IA", otherLanguage: "EN", close: "Cerrar vista del proyecto",
    services: [
      ["Modelado 3D", "Creación de objetos, personajes y entornos detallados a medida para videojuegos, productos y visualizaciones."],
      ["Renderizado", "Imágenes fotorrealistas con iluminación, texturas y materiales personalizados que le dan vida a cada concepto."],
      ["Diseño en movimiento", "Animaciones y gráficos en movimiento que cuentan historias para marcas, productos y experiencias digitales."],
      ["Identidad visual", "Desde un logotipo hasta un sistema visual completo, diseño identidades coherentes y fáciles de reconocer."],
      ["Diseño web", "Sitios web claros, modernos y orientados a la conversión, con atención al diseño, la tipografía y la experiencia de usuario."],
    ],
  },
};
