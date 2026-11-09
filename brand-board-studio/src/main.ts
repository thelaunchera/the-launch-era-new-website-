
// @ts-nocheck
import './styles.css';
import './section-gallery.css';
import './editorial.css';
import {curatedGallery, EDITORIAL_PHOTO_SETS} from './demo-presets';
import {
  SECTION_DEFS,
  ensureGallery,
  sectionCount,
  addControl,
  galleryHTML,
  galleryManagerHTML,
  loadGallery,
  getGalleryPhotoSource,
  addFiles,
  removePhoto,
  movePhoto,
  movePhotoTo,
  toggleFit,
  galleryBackup,
  galleryRestore,
  appendixRows,
  duplicateGallery
} from './section-gallery';

const KEY='tle-brand-board-studio-v1';
// Values replaced only when they match an earlier published default; customized values remain intact.
const PRIOR_OFFICIAL_DEFAULTS = {
  "casa-brownie": {
    "site": "https://casa-brownie-demo-miami-ltg7rb.v2.appdeploy.ai/",
    "symbol": "\u2733"
  },
  "aftr": {
    "heroPhoto": "https://thelaunchera.com/demos/aftr/assets/hero-real-20261031.webp",
    "site": "https://aftr-las-vegas-nightclub-fwv6yu.v2.appdeploy.ai/"
  },
  "havana-19": {
    "detailPhoto": "https://thelaunchera.com/demos/umbral/photos/UMBRAL_03_Ropa_Vieja.jpeg"
  },
  "marea-wigs-miami": {
    "heroPhoto": "https://thelaunchera.com/demos/marea-wigs-miami/resources/01-hero.png"
  },
  "sova": {
    "heroPhoto": "https://thelaunchera.com/demos/sova/resources/01-hero.png",
    "colors": [
      "#171F35",
      "#3772DD",
      "#C1D6F0",
      "#F6F8FA",
      "#91A8DA",
      "#ECECF4"
    ],
    "symbol": "\u2733"
  },
  "golden-grid": {
    "detailPhoto": "https://thelaunchera.com/demos/golden-grid/resources/golden-2.png",
    "symbol": "\u2733"
  },
  "yummm": {
    "heroPhoto": "https://thelaunchera.github.io/demo-booking-landing-/yummm/images/10.webp",
    "symbol": "\u2733"
  },
  "la-vie-in-pink": {
    "category": "Bakery · Demo",
    "description": "Croissants gourmet, desayunos europeos y boutique pâtisserie bilingüe.",
    "tagline": "A little Europe, every day.",
    "tone": "Europea · artesanal · romántica",
    "colors": [
      "#3D2E26",
      "#7C2228",
      "#E8C6BB",
      "#FAF8F3",
      "#667650",
      "#D8C6B3"
    ],
    "heroPhoto": "https://thelaunchera.com/demos/la-vie-in-pink/resources/36a1bfe5-3660-4b7e-964d-8031fe824941.png",
    "detailPhoto": "https://thelaunchera.com/demos/la-vie-in-pink/resources/8572492e-4032-4e82-a5d3-7e087ec38613.png"
  },
  "ivory-bloom": {
    "detailPhoto": "https://raw.githubusercontent.com/thelaunchera/the-launch-era-new-website-/main/public/demos/ivory-and-bloom/images/hero-detail.webp"
  },
  "experience-cleaning": {
    "symbol": "\u2733"
  }
};

const DEMOS=[
  {
    id:'casa-brownie',name:'Casa Brownie',category:'Bakery · Demo',description:'Brownies horneados para hacer especial cualquier momento.',tagline:'Small moments, made sweeter.',
    monogram:'CB',symbol:'◈',titleFont:'Bodoni Moda',bodyFont:'DM Sans',tone:'Cálida · artesanal · deliciosa',style:'bakery',
    colors:['#422419','#BC7658','#E5D3A9','#FCF3E9','#A5AB91','#DEAF95'],
    heroPhoto:'https://thelaunchera.com/demos/casa-brownie/assets/hero-brownies.webp',
    detailPhoto:'https://thelaunchera.com/demos/casa-brownie/assets/regalo-lazo-rosa.webp',
    site:'https://thelaunchera.com/demos/casa-brownie/',logoImage:'',patternImage:'',imageY:50,imageX:50,imageScale:1
  },
  {
    id:'crumb',name:'CRUMB Cookies',category:'Cookie Shop · Demo',description:'Cookies oversized, horneadas frescas y llenas de personalidad.',tagline:'The good stuff, fresh from the oven.',
    monogram:'C',symbol:'✺',titleFont:'Manrope',bodyFont:'DM Sans',tone:'Azul · artesanal · cookies reales',style:'cookies',
    colors:['#24547D','#477BB3','#C9E2F4','#FAF8F3','#E5F1F9','#191919'],
    heroPhoto:'https://thelaunchera.com/demos/crumb/assets/CRUMB_Storefront_Approved_20261030.webp',
    detailPhoto:'https://thelaunchera.com/demos/crumb/assets/CRUMB_Our_Story_Approved_20261030.webp',
    site:'https://thelaunchera.com/demos/crumb/',logoImage:'',patternImage:'',imageY:50,imageX:50,imageScale:1
  },
  {
    id:'aftr',name:'AFTR Las Vegas',category:'Nightclub · Demo',description:'Nightlife de alta energía, música y experiencias después del anochecer.',tagline:'After dark. Beyond ordinary.',
    monogram:'A',symbol:'✦',titleFont:'Bebas Neue',bodyFont:'Manrope',tone:'Nocturna · eléctrica · sofisticada',style:'nightclub',
    colors:['#0B0911','#9A6AFF','#FF3F9D','#F3F0F7','#D9FF52','#C6C9D4'],
    heroPhoto:'https://thelaunchera.com/demos/aftr/media/hero-motion-poster-hq.webp',
    detailPhoto:'https://thelaunchera.com/demos/aftr/assets/dj-real-20261031.webp',
    site:'https://thelaunchera.com/demos/aftr/',logoImage:'',patternImage:'',imageY:50,imageX:50,imageScale:1
  },
  {
    id: "lavender-edit",
    name: "The Lavender Edit",
    category: "Beauty · Demo",
    description: "Belleza editorial conceptual en tonos lavanda: ritual, texturas y campaña de regalo.",
    tagline: "A softer state of mind.",
    monogram: "LE",
    symbol: "✦",
    titleFont: "Italiana",
    bodyFont: "DM Sans",
    tone: "Suave · editorial · sensorial",
    style: "beauty",
    colors: [
      "#3E2B43",
      "#9C73A4",
      "#E9DDEC",
      "#FAF7F6",
      "#C3A5CB",
      "#F5EEE9"
    ],
    heroPhoto: "https://thelaunchera.com/demos/lavender-edit/photos/01_Soft_Lavender_Hero.png",
    detailPhoto: "https://thelaunchera.com/demos/lavender-edit/photos/02_Lavender_Mood_Macro.png",
    site: "https://thelaunchera.com/demos/lavender-edit/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "havana-19",
    name: "Havana 19",
    category: "Restaurante · Demo",
    description: "Concepto editorial de restaurante cubano en Boston, con atmósfera burdeos y gastronomía.",
    tagline: "A Cuban story, beautifully served.",
    monogram: "H19",
    symbol: "✦",
    titleFont: "Cormorant Garamond",
    bodyFont: "DM Sans",
    tone: "Cálida · clásica · gastronómica",
    style: "restaurant",
    colors: [
      "#241713",
      "#AE8061",
      "#E9CFC3",
      "#F6EFE7",
      "#471E20",
      "#DAC0AC"
    ],
    heroPhoto: "https://thelaunchera.com/demos/havana-19/photos/HAVANA19_Hero_Fachada_Borgona.jpeg",
    detailPhoto: "https://thelaunchera.com/demos/umbral/photos/UMBRAL_10_Interior.jpeg",
    site: "https://thelaunchera.com/demos/havana-19/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "marea-wigs-miami",
    name: "Marea Wigs · Miami",
    category: "Beauty · Demo",
    description: "Concepto de boutique de pelucas editorial con colección de looks y galería.",
    tagline: "Your next look starts here.",
    monogram: "MW",
    symbol: "✺",
    titleFont: "Cormorant Garamond",
    bodyFont: "DM Sans",
    tone: "Miami · luminosa · sofisticada",
    style: "beauty",
    colors: [
      "#1D2528",
      "#7BBFC0",
      "#C7E7E3",
      "#FAF9F5",
      "#E8A5A0",
      "#D4BAA1"
    ],
    heroPhoto: "https://thelaunchera.com/demos/marea-wigs-miami/media/hero-motion-poster-hq.webp",
    detailPhoto: "https://thelaunchera.com/demos/marea-wigs-miami/resources/02-long.png",
    site: "https://thelaunchera.com/demos/marea-wigs-miami/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "sova",
    name: "SOVA Headphones",
    category: "Audio · Demo",
    description: "Marca conceptual de audífonos con campaña editorial y colección de colores.",
    tagline: "Tune into your world.",
    monogram: "S",
    symbol: "◉",
    titleFont: "DM Serif Display",
    bodyFont: "DM Sans",
    tone: "Moderna · acústica · audaz",
    style: "audio",
    colors: ['#171F35','#1051C5','#C1D6F0','#F6F8FA','#91A8DA','#ECECF4'],
    heroPhoto: "https://thelaunchera.com/demos/sova/media/SOVA_01_MUSIC.png",
    detailPhoto: "https://thelaunchera.com/demos/sova/media/SOVA_02_RELAX.png",
    site: "https://thelaunchera.com/demos/sova/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "golden-grid",
    name: "Golden Grid · Waffle Co.",
    category: "Food · Demo",
    description: "Waffles, desayunos y empaques en un universo visual colorido.",
    tagline: "Morning, but golden.",
    monogram: "GG",
    symbol: "▦",
    titleFont: "Bebas Neue",
    bodyFont: "DM Sans",
    tone: "Divertida · colorida · deliciosa",
    style: "food",
    colors: [
      "#173E57",
      "#D93624",
      "#F4D776",
      "#FDFBF4",
      "#BCE8EE",
      "#F6E7B1"
    ],
    heroPhoto: "https://thelaunchera.com/demos/golden-grid/resources/golden-1.png",
    detailPhoto: "https://thelaunchera.com/demos/golden-grid/media/golden-grid-human-01.webp",
    site: "https://thelaunchera.com/demos/golden-grid/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "jaramillo-boutique",
    name: "Jaramillo Boutique",
    category: "Boutique · Demo",
    description: "Moda femenina editorial con colecciones, tallas y selección de looks.",
    tagline: "Made to be noticed.",
    monogram: "JB",
    symbol: "✧",
    titleFont: "Cormorant Garamond",
    bodyFont: "DM Sans",
    tone: "Femenina · burdeos · editorial",
    style: "fashion",
    colors: [
      "#331C23",
      "#8B384F",
      "#DFB3B1",
      "#FAF7F3",
      "#EAD9CB",
      "#8D6C6F"
    ],
    heroPhoto: "https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/assets/hero-editorial-user.jpg",
    detailPhoto: "https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/assets/colombian-jeans.webp",
    site: "https://thelaunchera.github.io/demo-booking-landing-/jaramillo-boutique/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "yummm",
    name: "YUMMM · Coffee & Sweets",
    category: "Food · Demo",
    description: "Cafetería creativa, bakery y dulces en una experiencia visual interactiva.",
    tagline: "A little joy in every bite.",
    monogram: "Y",
    symbol: "◇",
    titleFont: "DM Serif Display",
    bodyFont: "DM Sans",
    tone: "Joven · dulce · cálida",
    style: "food",
    colors: [
      "#43241D",
      "#D65441",
      "#F5D8BE",
      "#FDF7EE",
      "#C5A380",
      "#E5E0C9"
    ],
    heroPhoto: "https://thelaunchera.github.io/demo-booking-landing-/yummm/media/hero-motion-poster-hq.webp",
    detailPhoto: "https://thelaunchera.github.io/demo-booking-landing-/yummm/images/02.webp",
    site: "https://thelaunchera.github.io/demo-booking-landing-/yummm/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "la-vie-in-pink",
    name: "La Vie in Pink",
    category: "Boutique · Demo",
    description: "Boutique café, repostería y moda en una experiencia editorial rosa.",
    tagline: "Coffee, couture & little pink moments.",
    monogram: "LV",
    symbol: "✦",
    titleFont: "Cormorant Garamond",
    bodyFont: "DM Sans",
    tone: "Romántica · editorial · café y moda",
    style: "bakery",
    colors: ['#284B70','#F28DBA','#FADCE9','#FFFAFC','#426C9A','#D990A3'],
    heroPhoto: "https://thelaunchera.com/demos/la-vie-in-pink/photos/lavie_pink_hero_editorial.png",
    detailPhoto: "https://thelaunchera.com/demos/la-vie-in-pink/photos/lavie_people_cafe_portrait.png",
    site: "https://thelaunchera.com/demos/la-vie-in-pink/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "soluna-yoga",
    name: "SOLUNA Yoga",
    category: "Wellness · Demo",
    description: "Estudio de yoga conceptual con clases, comunidad y bienestar sin pagos reales.",
    tagline: "Find your softer rhythm.",
    monogram: "SY",
    symbol: "✧",
    titleFont: "Cormorant Garamond",
    bodyFont: "DM Sans",
    tone: "Serena · orgánica · luminosa",
    style: "wellness",
    colors: [
      "#3C4338",
      "#829681",
      "#D2DDC9",
      "#F8F5EB",
      "#C8B29E",
      "#E6D9CA"
    ],
    heroPhoto: "https://raw.githubusercontent.com/thelaunchera/demo-booking-landing-/main/demos/soluna-yoga/images/soluna-hero-editorial.webp",
    detailPhoto: "https://raw.githubusercontent.com/thelaunchera/demo-booking-landing-/main/demos/soluna-yoga/images/studio-interior.webp",
    site: "https://thelaunchera.github.io/demo-booking-landing-/soluna-yoga/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "ivory-bloom",
    name: "IVORY & BLOOM",
    category: "Bakery · Demo",
    description: "Atelier ficticio de pasteles de boda con campañas editoriales y galería.",
    tagline: "Beautifully made for the moment.",
    monogram: "IB",
    symbol: "✿",
    titleFont: "Cormorant Garamond",
    bodyFont: "DM Sans",
    tone: "Nupcial · floral · elegante",
    style: "bakery",
    colors: [
      "#2D2832",
      "#B47789",
      "#EEDADE",
      "#FAF8F3",
      "#A6B09C",
      "#D2BDA9"
    ],
    heroPhoto: "https://raw.githubusercontent.com/thelaunchera/the-launch-era-new-website-/main/public/demos/ivory-and-bloom/images/hero-cake-artist.webp",
    detailPhoto: "https://thelaunchera.com/demos/ivory-and-bloom/images/atelier-interior.webp",
    site: "https://thelaunchera.com/demos/ivory-and-bloom/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "cb-depot",
    name: "CB Depot",
    category: "Cliente real",
    description: "Proyecto de cliente de detailing móvil y solicitud de reservas; preservar sus imágenes aprobadas.",
    tagline: "Professional detailing, on your schedule.",
    monogram: "CB",
    symbol: "✧",
    titleFont: "Manrope",
    bodyFont: "DM Sans",
    tone: "Automotriz · precisa · profesional",
    style: "detailing",
    colors: [
      "#202428",
      "#E1B985",
      "#CBD6DD",
      "#F7F6F1",
      "#58636C",
      "#C4D4CC"
    ],
    heroPhoto: "https://thelaunchera.com/assets/clients/cb-depot/photos/hero-desktop.webp",
    detailPhoto: "https://thelaunchera.com/assets/clients/cb-depot/photos/exterior.webp",
    site: "https://cb-depot-booking.pages.dev/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: "experience-cleaning",
    name: "Experience Cleaning",
    category: "Cleaning · Demo",
    description: "Demostración de reserva residencial y cotización comercial, sin reservas reales.",
    tagline: "A simpler way to book.",
    monogram: "EC",
    symbol: "◇",
    titleFont: "DM Serif Display",
    bodyFont: "DM Sans",
    tone: "Clara · confiable · profesional",
    style: "cleaning",
    colors: [
      "#191919",
      "#6EABC8",
      "#DBE8EF",
      "#FAF8F3",
      "#F2D85B",
      "#CED7DE"
    ],
    heroPhoto: "https://thelaunchera.com/assets/cleaning-demo/hero-cleaner-original.jpg",
    detailPhoto: "https://thelaunchera.com/assets/drive-house-gallery/whole-home.png",
    site: "https://thelaunchera.com/experience-cleaning/",
    logoImage: "",
    patternImage: "",
    imageY: 50,
    imageX: 50,
    imageScale: 1
  },
  {
    id: 'wok-social',
    name: 'WOK SOCIAL',
    category: 'Restaurante · Demo',
    description: 'Chinese Street Kitchen — concepto editorial con noodles, hibachi y escenas originales.',
    tagline: 'Good Food. Loud Flavor.',
    monogram: 'WS',
    symbol: 'WS',
    titleFont: 'Caprasimo',
    bodyFont: 'DM Sans',
    tone: 'Energética · editorial · gastronómica',
    style: 'restaurant',
    colors: ['#E32620','#171615','#FFE400','#F6F1E7','#AB1B16','#F9EACF'],
    heroPhoto: 'https://thelaunchera.github.io/demo-booking-landing-/wok-social/assets/hero-storefront.webp',
    detailPhoto: 'https://thelaunchera.github.io/demo-booking-landing-/wok-social/assets/01-noodle-signature.webp',
    site: 'https://thelaunchera.github.io/demo-booking-landing-/wok-social/',
    logoImage: '', patternImage: '', imageY: 50, imageX: 50, imageScale: 1
  },
  {
    id: 'freska',
    name: 'FRESKA',
    category: 'Bebidas · Demo',
    description: 'Concepto editorial de sodas frutales y smoothies con campaña fotográfica rosa/azul, sabores interactivos y compra ilustrativa.',
    tagline: 'Sip happy. Stay colorful.',
    monogram: 'F',
    symbol: 'F',
    titleFont: 'Manrope',
    bodyFont: 'DM Sans',
    tone: 'Joven · divertida · fresca · atrevida',
    style: 'beverages',
    colors: ['#2349EF','#FB3A91','#FFF0F5','#FFF8F1','#FFD650','#171520'],
    heroPhoto: 'https://thelaunchera.com/demos/freska/media/freska-hero-owner-approved-20261109.jpg',
    detailPhoto: 'https://thelaunchera.com/demos/freska/media/pink-crush.webp',
    site: 'https://thelaunchera.com/demos/freska/',
    logoImage: '',
    patternImage: '',
    imageY: 28,
    imageX: 50,
    imageScale: 1
  },
  {
    id:'sneekiefs',
    name:'Sneekiefs',
    category:'Sneakers · Demo',
    description:'Tienda conceptual de sneakers con campaña original, tres pares de muestra y una dirección editorial de azul Canyon y naranja Sandstone.',
    tagline:'Move your way.',
    monogram:'S',symbol:'S',
    titleFont:'Archivo Black',bodyFont:'Space Grotesk',
    tone:'Urbana · editorial · dinámica',style:'fashion',
    colors:['#168DD2','#D65A24','#DDEFF8','#FAF8F3','#16212D','#E8CFB2'],
    heroPhoto:'https://thelaunchera.com/demos/sneekiefs/assets/07-editorial-poster.webp',
    detailPhoto:'https://thelaunchera.com/demos/sneekiefs/assets/01-studio-shoe.webp',
    site:'https://thelaunchera.com/demos/sneekiefs/',
    logoImage:'',patternImage:'',imageY:50,imageX:50,imageScale:1
  },
];
const TYPES=['Bebidas · Demo','Bakery · Demo','Cookie Shop · Demo','Nightclub · Demo','Boutique · Demo','Beauty · Demo','Wellness · Demo','Restaurante · Demo','Audio · Demo','Food · Demo','Cleaning · Demo','Sneakers · Demo','Cliente real','Otra categoría'];
const FONTS=['Italiana','Bodoni Moda','DM Serif Display','Cormorant Garamond','Bebas Neue','Caprasimo','Georgia','Manrope','DM Sans','Archivo Black','Space Grotesk','Arial'];
const clone=x=>JSON.parse(JSON.stringify(x));
const $=id=>document.getElementById(id);
const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&#39;':'&#39;'}[c]||'&#39;'));
const cssUrl=x=>'url('+JSON.stringify(x||'')+')';
const hex=(v,f='#FFFFFF')=>/^#[0-9a-fA-F]{6}$/.test(v||'')?v:f;
const FONT_MAP={'Archivo Black':"'Archivo Black',Impact,sans-serif",'Space Grotesk':"'Space Grotesk',sans-serif",'Caprasimo':"'Caprasimo',Georgia,serif",'Italiana':"'Italiana',Georgia,serif",'Bodoni Moda':"'Bodoni Moda',Georgia,serif",'DM Serif Display':"'DM Serif Display',Georgia,serif",'Cormorant Garamond':"'Cormorant Garamond',Georgia,serif",'Bebas Neue':"'Bebas Neue',Arial,sans-serif",Georgia:'Georgia,serif',Manrope:"Manrope,sans-serif",'DM Sans':"'DM Sans',sans-serif",Arial:'Arial,sans-serif'};
const font=v=>FONT_MAP[v]||FONT_MAP['DM Sans'];
function hydrate(){
  let previous=[];
  try{previous=JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){}
  if(!Array.isArray(previous))previous=[];
  const base=clone(DEMOS);
  if(!previous.length)return base;
  const existing=previous.map(b=>{
    const d=base.find(x=>x.id===b.id)||base[0];
    const merged={...clone(d),...b};
    // Replace only historical placeholder images, never uploaded or customised assets.
    const legacy={
      'casa-brownie':[
        ['https://www.amummytoo.co.uk/wp-content/uploads/2025/04/big-batch-brownies-SQUARE.jpg','heroPhoto'],
        ['https://images.ctfassets.net/brcxfsm84vq2/3XfvKaeEjct7Rjgweuzp5r/174011d220376e0cf240558c79796251/Fudge_Brownies_Salted_Caramel.jpg?w=600','detailPhoto']
      ],
      crumb:[
        ['https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/e5bb099c-dc60-4ebe-884c-2c33dccfab62.jpg','heroPhoto'],
        ['https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/678a8c92-21bd-410c-b72f-18e051b620c8.jpg','detailPhoto']
      ],
      aftr:[
        ['https://raw.githubusercontent.com/thelaunchera/demo-booking-landing-/main/aftr-nightclub/assets/hero.webp','heroPhoto'],
        ['https://raw.githubusercontent.com/thelaunchera/demo-booking-landing-/main/aftr-nightclub/assets/dj.webp','detailPhoto']
      ]
    }[b.id]||[];
    for(const [oldValue,key] of legacy){if(b[key]===oldValue)merged[key]=d[key];}
    // Migrate historical default CRUMB imagery/palette only; preserve custom edits.
    if(b.id==='crumb'){
      const brown=['#392720','#BA8E6A','#E9DBCA','#FAF7F0','#B9AB8F','#DFC2A4'];
      const hadBrown=Array.isArray(b.colors)&&b.colors.length===6&&b.colors.every((value,i)=>String(value).toLowerCase()===brown[i].toLowerCase());
      if(hadBrown){merged.colors=d.colors;if(b.titleFont==='Cormorant Garamond')merged.titleFont=d.titleFont;}
      if(b.detailPhoto==='https://thelaunchera.com/demos/crumb/assets/brand-packaging.webp')merged.detailPhoto=d.detailPhoto;
      if(b.site==='https://crumb-cookies-animated-demo-w1fcop.v2.appdeploy.ai/')merged.site=d.site;
    }

    // Keep all sixteen published brand defaults current without touching local custom edits.
    const previousDefaults = PRIOR_OFFICIAL_DEFAULTS[b.id] || {};
    for (const [field, former] of Object.entries(previousDefaults)) {
      if (field === 'colors') {
        if (Array.isArray(b.colors) && b.colors.length === former.length &&
            b.colors.every((value, index) => String(value).toLowerCase() === String(former[index]).toLowerCase())) {
          merged.colors = clone(d.colors);
        }
      } else if (b[field] === former) {
        merged[field] = d[field];
      }
    }
    // Migrate the two prior SOVA official photos; preserve individually customized images.
    if (b.id === 'sova') {
      if (b.heroPhoto === 'https://thelaunchera.com/demos/sova/media/sova-hero-seamless-cobalt-20261108.png') merged.heroPhoto = d.heroPhoto;
      if (b.detailPhoto === 'https://thelaunchera.com/demos/sova/resources/02-product.png') merged.detailPhoto = d.detailPhoto;
    }
    // An intentionally deleted photo must stay empty after reload; only migrate absent fields.
    if(!Object.prototype.hasOwnProperty.call(b,'heroPhoto'))merged.heroPhoto=d.heroPhoto;
    if(!Object.prototype.hasOwnProperty.call(b,'detailPhoto'))merged.detailPhoto=b.referenceImage||d.detailPhoto;
    if(!b.titleFont||b.titleFont==='Georgia')merged.titleFont=d.titleFont;
    if(!merged.style)merged.style=d.style;
    if(!Array.isArray(merged.colors)||merged.colors.length!==6)merged.colors=d.colors;
    ensureGallery(merged);
    if(!Number.isFinite(Number(merged.imageX)))merged.imageX=50;
    if(!Number.isFinite(Number(merged.imageY)))merged.imageY=50;
    if(!Number.isFinite(Number(merged.imageScale)))merged.imageScale=1;
    return merged;
  });
  // Preserve edits and user-created boards, and append only missing official demos.
  const known=new Set(existing.map(b=>b.id));
  for(const demo of base){
    if(!known.has(demo.id)){
      ensureGallery(demo);
      existing.push(demo);
    }
  }
  return existing;
}
let brands=hydrate();
const requestedBrand=new URLSearchParams(window.location.search).get('brand');
let activeId=(requestedBrand&&brands.some(x=>x.id===requestedBrand)?requestedBrand:localStorage.getItem(KEY+'-active'))||brands[0].id;
if(!brands.some(x=>x.id===activeId))activeId=brands[0].id;
let view='board',tab='identity',focused=false,toastId;
let uploadSection = 'identity';
let replacementPhotoId = '';
let draggedGallery = null;
const active=()=>brands.find(x=>x.id===activeId)||brands[0];
function notify(s){
  document.querySelector('.toast')?.remove();
  const t=document.createElement('div');t.className='toast';t.textContent=s;document.body.append(t);
  clearTimeout(toastId);toastId=setTimeout(()=>t.remove(),3600);
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(brands));localStorage.setItem(KEY+'-active',activeId);return true;}
  catch(e){notify('No hay espacio suficiente para guardar imágenes. Usa fotos más pequeñas o descarga un respaldo.');return false;}
}
function asset(b,key){return b[key]||'';}
function imageMarkup(url,cls='',alt='Fotografía'){
  if(!url)return '<div class="'+cls+' no-photo">Fotografía</div>';
  return '<img src="'+html(url)+'" alt="'+html(alt)+'" loading="eager" draggable="false" onerror="this.style.opacity=0">';
}
function wordmark(b,variant=''){
  const style='font-family:'+font(b.titleFont)+';';
  if(b.logoImage&&variant==='element')return '<img class="logo-uploaded" src="'+html(b.logoImage)+'" alt="Logo de '+html(b.name)+'">';
  if(b.style==='bakery'&&b.name.toLowerCase()==='casa brownie')return '<span style="'+style+'">casa<br><em>brownie.</em></span>';
  if(b.style==='cookies'&&b.name.toLowerCase()==='crumb cookies')return '<span style="'+style+'">crumb<span style="opacity:.55">.</span></span>';
  if(b.style==='nightclub'&&b.name.toLowerCase()==='aftr las vegas')return '<span style="'+style+'">AFTR</span>';
  return '<span style="'+style+'">'+html(b.name)+'</span>';
}
function galleryPreview(brand, section) {
  const uploads = ensureGallery(brand)[section] || [];
  return uploads.length ? galleryHTML(brand, section) : curatedGallery(brand, section);
}
function contrastText(bg) {
  const s=hex(bg).slice(1);
  const rgb=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4));
  const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  return luminance>.18?'#191919':'#FAF8F3';
}
function board(b){
  const c=b.colors.map((v,i)=>hex(v,DEMOS[0].colors[i]));
  const cssVars='--ink:'+c[0]+';--accent:'+c[1]+';--soft:'+c[2]+';--paper:'+c[3]+';--extra:'+c[4]+';--detail:'+c[5]+';--muted:'+c[0]+'99;';
  const picX=Math.max(0,Math.min(100,Number(b.imageX)||50)),picY=Math.max(0,Math.min(100,Number(b.imageY)||50)),scale=Math.max(1,Math.min(2,Number(b.imageScale)||1));
  const photostyle='object-position:'+picX+'% '+picY+'%;transform:scale('+scale+');';
  const showPhoto=b.heroPhoto?imageMarkup(b.heroPhoto,'hero-shot',b.name):'<div class="no-photo" style="height:100%">Arrastra una fotografía</div>';
  const graphic=b.style==='nightclub'?'✧':b.style==='cookies'?'✺':b.symbol||'◈';
  const paintPattern=b.patternImage?'<img class="pattern-image" src="'+html(b.patternImage)+'" alt="Patrón de la marca">':'';
  const packageMark=b.style==='nightclub'
    ?'<div class="pkg-ticket" style="color:'+c[3]+';background:'+c[0]+';border-color:'+c[2]+'">'+html(b.monogram)+' / VIP</div>'
    :'<div class="pkg-box" style="background:'+c[0]+';color:'+c[3]+';font-family:'+font(b.titleFont)+'">'+html(b.monogram)+'</div><div class="pkg-cup" style="background:'+c[3]+';color:'+c[0]+'">'+html(graphic)+'</div>';
  const block=(text,section)=>'<div class="art-label"><span>'+text+'</span>'+
    addControl(section)+'</div>';
  return '<div class="artboard" id="artboard" data-brand="'+html(b.id)+'" style="'+cssVars+'">'+
    '<header class="art-head" style="background:'+c[0]+';color:'+c[3]+'">'+
      '<div class="head-copy"><div class="art-meta"><span>THE LAUNCH ERA / CREATIVE STUDIO</span><span>IDENTITY 001</span></div>'+
      '<div class="wordmark '+html(b.style==='nightclub'?'aftr':'')+'">'+wordmark(b)+'</div><div class="hero-small">'+html(b.tagline)+'</div></div>'+
      '<div class="art-photo image-drop" data-drop="heroPhoto" title="Arrastra aquí una foto o mueve la imagen verticalmente">'+
      (b.heroPhoto?'<div class="hero-image-inner">'+showPhoto+'</div>':showPhoto)+
      '<span class="photo-hint">↕ Arrastra para ajustar</span>'+
      addControl('hero', '＋ Fotos') + '</div>'+
    '</header>'+
    '<div class="gallery-hero-wrap">'+galleryPreview(b,'hero')+'</div>'+
    '<section class="art-body">'+
      block('01 &nbsp; Elementos de identidad','identity')+
      '<div class="elements">'+
        '<div class="element logo-cell" style="background:'+c[0]+';color:'+c[3]+';font-family:'+font(b.titleFont)+'"><small>Wordmark</small>'+wordmark(b,'element')+'</div>'+
        '<div class="element monogram-cell" style="background:'+c[1]+';color:'+contrastText(c[1])+';font-family:'+font(b.titleFont)+'"><small>Monograma</small>'+html(b.monogram)+'</div>'+
        '<div class="element mark-cell" style="background:'+c[2]+';color:'+c[0]+'"><small>Símbolo / pattern</small>'+html(graphic)+'</div>'+
      '</div>'+
      galleryPreview(b,'identity')+
      '<div class="art-section">'+block('02 &nbsp; Paleta de color','palette')+
        '<div class="palettes">'+c.map((col,i)=>'<div class="coloritem"><div class="colorcircle" style="background:'+col+'"></div><div class="colorname">'+['Principal','Acento','Suave','Fondo','Extra','Detalle'][i]+'</div><div class="colorcode">'+col.toUpperCase()+'</div></div>').join('')+'</div>'+
      galleryPreview(b,'palette')+'</div>'+
      '<div class="art-section">'+block('03 &nbsp; Tipografías y voz','typography')+
        '<div class="typeboard" style="background:'+c[0]+';color:'+c[3]+'">'+
        '<div class="bigtype"><div class="type-char" style="font-family:'+font(b.titleFont)+'">Aa</div><div class="type-meta">Titulares · '+html(b.titleFont)+'</div></div>'+
        '<div class="type-samples"><div class="typequote" style="font-family:'+font(b.titleFont)+'">'+html(b.tagline)+'</div>'+
        '<div class="sample-sub" style="font-family:'+font(b.bodyFont)+'">'+html(b.description||b.tone)+'</div><div class="type-meta">Texto · '+html(b.bodyFont)+'</div></div></div>'+
        galleryPreview(b,'typography')+
      '</div>'+
      '<div class="art-section double">'+
        '<div>'+block('04 &nbsp; Patrón','pattern')+'<div class="pattern-preview" data-pattern="'+html(graphic+'  '+graphic+'  '+graphic+'  '+graphic+'  '+graphic+'  '+graphic)+'" style="background:'+c[2]+';color:'+c[0]+'">'+paintPattern+'</div>'+galleryPreview(b,'pattern')+'</div>'+
        '<div>'+block('05 &nbsp; Packaging / aplicación','applications')+'<div class="package-area" style="background:'+c[4]+'">'+packageMark+'</div>'+galleryPreview(b,'applications')+'</div>'+
      '</div>'+
      '<div class="art-section">'+block('06 &nbsp; Universo visual','universe')+
        '<div class="mood-strip">'+
          '<div class="mood-photo">'+imageMarkup(b.detailPhoto,'',b.name+' referencia secundaria')+'</div>'+
          '<div class="mood-photo">'+imageMarkup(b.heroPhoto,'',b.name+' fotografía de referencia')+'</div>'+
          '<div class="mood-photo" style="background:'+c[1]+';color:'+contrastText(c[1])+';font-family:'+font(b.titleFont)+'">'+html(graphic)+'</div>'+
        '</div>'+galleryPreview(b,'universe')+
      '</div>'+
      '<div class="art-footer"><span>'+html(b.tone)+'</span><span>CONCEPT BRAND  /  THE LAUNCH ERA</span></div>'+
    '</section></div>';
}
function editor(b){
  let inside='';
  if(tab==='identity')inside=
    '<label class="field wide">Nombre de la marca<input data-field="name" maxlength="55" value="'+html(b.name)+'"></label>'+
    '<label class="field wide">Frase principal / tagline<input data-field="tagline" maxlength="110" value="'+html(b.tagline)+'"></label>'+
    '<label class="field wide">Qué hace esta marca<textarea data-field="description" maxlength="240">'+html(b.description||'')+'</textarea></label>'+
    '<label class="field wide">Categoría<select data-field="category">'+[...new Set([b.category,...TYPES])].map(t=>'<option '+(t===b.category?'selected':'')+'>'+html(t)+'</option>').join('')+'</select></label>'+
    '<label class="field">Monograma<input data-field="monogram" maxlength="5" value="'+html(b.monogram)+'"></label>'+
    '<label class="field">Símbolo<input data-field="symbol" maxlength="3" value="'+html(b.symbol)+'"></label>'+
    '<label class="field wide">Personalidad de la marca<input data-field="tone" maxlength="100" value="'+html(b.tone)+'"></label>'+
    '<div class="helper">💡 <strong>Dirección creativa:</strong> primero define cómo se siente la marca, después sus colores y fotos. Esto evita que todas nuestras demos se parezcan.</div>';
  else if(tab==='style')inside=
    '<div class="field wide">Paleta de seis colores</div>'+
    b.colors.map((v,i)=>'<label class="colorfield"><input type="color" data-color="'+i+'" value="'+hex(v)+'"><span><strong>'+['Principal','Acento','Suave','Fondo','Complementario','Detalle'][i]+'</strong><span>'+['Base para identidad','Color de acento','Fondos suaves','Fondo claro','Contraste adicional','Pequeños detalles'][i]+'</span></span><span class="colorhex">'+hex(v).toUpperCase()+'</span></label>').join('')+
    '<label class="field wide">Tipografía de títulos<select data-field="titleFont">'+FONTS.map(f=>'<option '+(b.titleFont===f?'selected':'')+'>'+f+'</option>').join('')+'</select></label>'+
    '<label class="field wide">Tipografía de textos<select data-field="bodyFont">'+FONTS.map(f=>'<option '+(b.bodyFont===f?'selected':'')+'>'+f+'</option>').join('')+'</select></label>'+
    '<button class="fullbtn" type="button" data-action="css">Copiar estilos para el website ↗</button>'+
    '<div class="helper">Al cambiar un color o tipografía, el board se actualiza inmediatamente. Los códigos HEX están listos para usar en las demos.</div>';
  else inside=
    '<div class="helper">Sube tus propias imágenes para que el tablero se vea como tu marca real. También puedes soltar una foto sobre la imagen grande.</div>'+
    assetBox(b,'heroPhoto','Foto principal','Reemplazar foto')+
    assetBox(b,'detailPhoto','Foto secundaria','Subir foto')+
    assetBox(b,'logoImage','Logotipo en PNG','Subir logo')+
    assetBox(b,'patternImage','Textura o patrón','Subir patrón')+
    galleryManagerHTML(b)+
    '<label class="field">Posición horizontal<div class="sliderrow"><input type="range" data-range="imageX" min="0" max="100" value="'+Math.round(b.imageX??50)+'"><span>'+Math.round(b.imageX??50)+'%</span></div></label>'+
    '<label class="field">Posición vertical<div class="sliderrow"><input type="range" data-range="imageY" min="0" max="100" value="'+Math.round(b.imageY??50)+'"><span>'+Math.round(b.imageY??50)+'%</span></div></label>'+
    '<label class="field">Acercamiento<div class="sliderrow"><input type="range" data-range="imageScale" min="1" max="2" step=".05" value="'+Number(b.imageScale||1)+'"><span>'+Math.round(Number(b.imageScale||1)*100)+'%</span></div></label>'+
    '<div class="helper">Las imágenes subidas se guardan en este navegador. Descarga un respaldo después de trabajar para no perderlas.</div>';
  return '<aside class="editor" id="editor"><div class="editor-head"><h2>Personalizar marca</h2><p>Tu identidad, un cambio a la vez.</p></div>'+
    '<div class="editor-tabs"><button class="edit-tab '+(tab==='identity'?'active':'')+'" data-tab="identity">Identidad</button><button class="edit-tab '+(tab==='style'?'active':'')+'" data-tab="style">Estilo</button><button class="edit-tab '+(tab==='assets'?'active':'')+'" data-tab="assets">Fotos</button></div>'+
    '<div class="formbody">'+inside+'</div>'+
    '<div class="panel-foot"><button type="button" class="btn save-brand-button" data-action="save-brand">Guardar cambios</button><p class="save-local-note">Tus cambios se guardan en este navegador. Puedes descargar un respaldo para conservarlos.</p><div class="panel-secondary-actions"><button type="button" class="btn" data-action="duplicate">⧉ Duplicar</button><button type="button" class="btn danger" data-action="delete">Eliminar marca</button></div></div></aside>';
}
function assetBox(b,key,title,cta){
  const img=b[key];
  const changeLabel=img?(key==='logoImage'?'Cambiar logo':key==='patternImage'?'Cambiar patrón':'Cambiar foto'):cta;
  return '<div class="uploadbox" data-drop="'+key+'"><div class="upload-thumb">'+(img?'<img src="'+html(img)+'" alt="'+html(title)+'">':'＋')+'</div>'+
    '<div class="upload-info"><strong>'+title+'</strong><p>JPG, PNG o WEBP</p>'+
    '<input type="file" data-upload="'+key+'" accept="image/png,image/jpeg,image/webp" aria-label="'+html(changeLabel)+'">'+
    '<div class="upload-actions"><button type="button" data-action="choose-file" data-target="'+key+'">'+html(changeLabel)+'</button>'+
    (img?'<button type="button" class="remove-photo-button" data-action="remove-image" data-target="'+key+'">Eliminar foto</button>':'')+
    '</div></div></div>';
}
function guide(b){
  const c=b.colors.map(x=>hex(x));
  const code=cssTokens(b);
  return '<section class="guide"><div class="guide-label">TLE — Guía de marca / 001</div><h2>'+html(b.name)+'<br><em>Brand Guidelines</em></h2>'+
    '<p>'+html(b.description||'')+' Su estilo se define por una estética '+html(b.tone.toLowerCase())+'. Usa esta guía para mantener la misma identidad en website, piezas visuales, publicaciones y presentaciones.</p>'+
    '<div class="guide-grid"><div class="guide-card"><h3>Paleta oficial</h3><div class="guide-swatch">'+c.map(x=>'<span title="'+x+'" style="background:'+x+'"></span>').join('')+'</div>'+
    '<p>'+c.join(' · ')+'</p></div>'+
    '<div class="guide-card"><h3>Tipografías</h3><p><b>Display:</b> '+html(b.titleFont)+'<br><b>Body:</b> '+html(b.bodyFont)+'</p></div>'+
    '<div class="guide-card"><h3>Estilo y tono</h3><p>'+html(b.tone)+'<br>'+html(b.tagline)+'</p></div>'+
    '<div class="guide-card"><h3>Variables para tu website</h3><pre>'+html(code)+'</pre><button class="btn dark" data-action="css">Copiar CSS</button></div></div>'+
    '<div style="margin-top:25px;display:flex;gap:9px;flex-wrap:wrap"><button class="btn" data-action="json">↓ Descargar ficha JSON</button><button class="btn" data-action="print">↓ Imprimir guía</button></div></section>';
}
function mockups(b){
  const c=b.colors.map(x=>hex(x));
  return '<section class="mockups-view"><div class="guide-label">Vista de aplicaciones / 002</div><h2>Una identidad que<br><em>vive fuera del tablero.</em></h2><p>Estas son simulaciones visuales de cómo podrían verse el website y las piezas de marca. No modifican los demos publicados.</p>'+
    '<div class="mockup-grid">'+
    '<div class="mockup-card" style="background:'+c[2]+'"><div class="phone"><div class="phone-notch"></div><div class="phone-hero">'+imageMarkup(b.heroPhoto,'',b.name)+'</div><h3 style="font-family:'+font(b.titleFont)+';color:'+c[0]+'">'+html(b.name)+'</h3><p style="color:'+c[0]+'">'+html(b.tagline)+'</p><div class="tinycta" style="background:'+c[0]+';color:'+c[3]+'">EXPLORE THE EXPERIENCE</div></div></div>'+
    '<div class="mockup-card" style="background:'+c[4]+'"><div class="cardmock" style="background:'+c[0]+';color:'+c[3]+'"><div class="smallmark">'+html(b.monogram)+'</div><strong style="font-family:'+font(b.titleFont)+'">'+html(b.name)+'</strong><small>'+html(b.tagline)+'</small></div></div>'+
    '</div></section>';
}
function render(){
  const b=active();
  const content=view==='board'
    ?'<div class="stage"><div class="stage-top"><strong>Vista previa · Identidad completa</strong><div class="stage-controls"><span>Brand Board 01</span><button class="microbtn" data-action="focus">'+(focused?'Mostrar editor':'Ampliar vista')+'</button></div></div>'+board(b)+'</div>'
    :view==='mockups'?mockups(b):guide(b);
  $('app').innerHTML=
    '<div class="shell"><aside class="sidebar">'+
      '<div class="brandlock"><span class="brandlock-icon">L.</span><span><strong>The Launch Era</strong><small>BRAND BOARD STUDIO</small></span></div>'+
      '<div class="sidebar-caption">Mis marcas demo</div><div class="sidebar-navgroup">'+
      '<div class="brand-drawer"><button type="button" class="brand-drawer-toggle" data-toggle-brand-drawer aria-expanded="false" aria-controls="brandlist-panel"><span>Mis Brand Boards <small>'+brands.length+' marcas individuales</small></span><span class="brand-drawer-chevron" aria-hidden="true">⌄</span></button><nav class="brandlist" id="brandlist-panel" aria-label="Marcas separadas">'+
      brands.map(x=>'<button class="brandnav '+(x.id===b.id?'active':'')+'" data-brand="'+html(x.id)+'"><span class="navlogo" style="background:'+hex(x.colors[1])+';color:'+contrastText(x.colors[1])+'">'+html(x.monogram.slice(0,3))+'</span><span class="navinfo"><strong>'+html(x.name)+'</strong><small>'+html(x.category)+'</small></span><span class="navarrow">›</span></button>').join('')+
      '</nav></div><button class="newbrand" data-action="new">＋ Nueva marca</button></div>'+
      '<div class="sidefoot"><a href="'+html(b.site||'#')+'" '+(b.site?'target="_blank" rel="noopener noreferrer"':'')+'>↗ Abrir demo actual</a><a href="#" data-action="backup">↓ Respaldo de mis marcas</a><a href="#" data-action="import">↑ Importar respaldo</a><span>Área de trabajo creativa de The Launch Era. Los cambios se guardan solo en este navegador.</span></div>'+
    '</aside><div class="content"><header class="header"><div class="breadcrumb">The Launch Era &nbsp; / &nbsp; Demo Studio &nbsp; / &nbsp; <b>Brand Boards</b></div>'+
      '<div class="header-end"><span class="savepoint"></span><span class="savetext">Guardado local</span><span class="head-avatar">L</span></div></header>'+
      '<main class="workspace"><div class="page-intro"><div><div class="kicker">Creative direction · Brand identity</div><h1>'+html(b.name)+'</h1><p>'+html(b.category)+' &nbsp; · &nbsp; Una identidad lista para llevar al siguiente diseño.</p></div>'+
      '<div class="main-actions"><button class="btn" data-action="backup">↓ Respaldo</button><button class="btn" data-action="print">PDF</button><button class="btn dark" data-action="png">↓ Exportar PNG</button></div></div>'+
      '<div class="switcher"><button class="viewtab '+(view==='board'?'active':'')+'" data-view="board">✦ Brand Board</button>'+
      '<button class="viewtab '+(view==='mockups'?'active':'')+'" data-view="mockups">Aplicaciones</button>'+
      '<button class="viewtab '+(view==='guide'?'active':'')+'" data-view="guide">Guía de marca</button>'+
      '<span class="viewspacer"></span>'+(b.site?'<a class="btn ghost" href="'+html(b.site)+'" target="_blank" rel="noopener noreferrer">↗ Ver demo</a>':'')+'</div>'+
      '<div class="workspace-grid '+(focused?'focus':'')+'"><div class="left-stage">'+content+
      '<p class="workspace-hint">El tablero se actualiza al editar. Puedes cargar nuevas fotos y exportar el resultado sin modificar tus demos.</p></div>'+
      (focused?'':editor(b))+'</div></main></div></div>'+
      '<dialog id="new-dialog"><form method="dialog" class="dialog-body" id="new-form"><h3>Nueva marca demo</h3><p>Empieza con una dirección visual propia, no con un tablero vacío.</p>'+
      '<label class="field">Nombre de la marca<input name="brandname" class="modal-input" maxlength="55" required placeholder="Ej. Miel Coffee Studio"></label>'+
      '<label class="field" style="margin-top:14px">Tipo de marca<select name="brandtype" class="modal-input">'+TYPES.map(x=>'<option>'+html(x)+'</option>').join('')+'</select></label>'+
      '<div class="dialog-actions"><button type="button" class="btn" data-action="cancel-new">Cancelar</button><button type="submit" class="btn dark">Crear Brand Board</button></div></form></dialog>'+
      '<input type="file" accept="application/json,.json" id="import-file" hidden>'+
      '<input type="file" id="section-upload" accept="image/png,image/jpeg,image/webp" multiple hidden>';
  syncPhoto();
  const current = b.id;
  loadGallery(b).then(loaded => {
    if (loaded && activeId === current && view === 'board') preview();
  }).catch(() => {});
}
function syncPhoto(){
  const b=active();const img=document.querySelector('.art-photo img');
  if(img){img.style.objectPosition=b.imageX+'% '+b.imageY+'%';img.style.transform='scale('+b.imageScale+')';}
}
function preview(){
  const b=active();
  if(view==='board'){
    const st=document.querySelector('.artboard');
    if(st){st.outerHTML=board(b);syncPhoto();}
  }else{
    const box=document.querySelector('.guide,.mockups-view');
    if(box)box.outerHTML=view==='guide'?guide(b):mockups(b);
  }
  const page=document.querySelector('.page-intro h1');if(page)page.textContent=b.name;
  document.querySelectorAll('.colorhex').forEach((e,i)=>e.textContent=hex(b.colors[i]).toUpperCase());
}
function tokenName(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-');}
function cssTokens(b){
  return ':root {\n'+b.colors.map((x,i)=>'  --brand-'+['primary','accent','soft','background','extra','detail'][i]+': '+hex(x)+';').join('\n')+
    '\n  --font-display: '+font(b.titleFont)+';\n  --font-body: '+font(b.bodyFont)+';\n}';
}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},1000);}
async function backup(){
  try {
    const photos = await galleryBackup(brands);
    const data = JSON.stringify({format:'the-launch-era-brand-boards',version:3,brands,photos},null,2);
    download(new Blob([data],{type:'application/json'}),'tle-brandboards-respaldo.json');
    notify('Respaldo con fotos descargado. Guárdalo fuera del navegador.');
  } catch(e) { notify('No se pudo preparar el respaldo completo.'); }
}
function exportJSON(){const b=active(),doc={brand:b.name,category:b.category,tagline:b.tagline,description:b.description,personality:b.tone,colors:b.colors,typography:{display:b.titleFont,body:b.bodyFont},css:cssTokens(b)};download(new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),'guia-'+tokenName(b.name)+'.json');}
async function loadImage(src){
  if(!src)return null;
  return new Promise(resolve=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
}
function canvasImage(ctx,img,x,y,w,h,pX=50,pY=50,scale=1,mode='cover'){
  if(!img)return false;
  const fit=(mode==='contain'?Math.min(w/img.width,h/img.height):Math.max(w/img.width,h/img.height))*scale;
  const iw=img.width*fit,ih=img.height*fit;
  const dx=mode==='contain'?x+(w-iw)/2:x-(iw-w)*(pX/100);
  const dy=mode==='contain'?y+(h-ih)/2:y-(ih-h)*(pY/100);
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,dx,dy,iw,ih);ctx.restore();return true;
}
function write(ctx,s,x,y,size,color,fontName='Arial',weight='normal'){
  ctx.fillStyle=color;ctx.font=weight+' '+size+'px '+fontName;ctx.fillText(String(s),x,y);
}
function wrap(ctx,s,x,y,maxw,sz,color,f='Georgia',leading=1.14){
  ctx.font=sz+'px '+f;const words=String(s).split(/\s+/);let text='',line=0;
  words.forEach(w=>{const test=text?text+' '+w:w;if(ctx.measureText(test).width>maxw&&text){write(ctx,text,x,y+line*sz*leading,sz,color,f);line++;text=w;}else{text=test;}});
  if(text)write(ctx,text,x,y+line*sz*leading,sz,color,f);return line;
}
async function exportPNG(){
  const b=active(),c=b.colors.map(v=>hex(v)),W=1400;
  // Export approved brand photography alongside user-supplied images without changing stored projects.
  const galleryRows=await appendixRows(b);
  const published=EDITORIAL_PHOTO_SETS[b.id]||[];
  const included=new Set(galleryRows.flatMap(row=>row.photos.map(photo=>photo.src)));
  const campaign=published.slice(1).filter(src=>src&&!included.has(src)).slice(0,9);
  if(campaign.length && galleryRows.length<=2){
    galleryRows.push({
      title:'Campaña original de la marca',
      photos:campaign.map(src=>({src,fit:'contain',x:50,y:50}))
    });
  }
  const photoHeight=418,rowStep=440;
  const appendixHeight=galleryRows.reduce((sum,row)=>sum+92+Math.ceil(row.photos.length/3)*rowStep+25,0);
  const H=1900+appendixHeight;
  const pixelRatio=Math.max(1,Math.min(2,15000/H,Math.sqrt(32000000/(W*H))));
  const can=document.createElement('canvas');
  can.width=Math.round(W*pixelRatio);
  can.height=Math.round(H*pixelRatio);
  const g=can.getContext('2d');
  if(!g){notify('No se pudo preparar el PNG.');return;}
  g.scale(pixelRatio,pixelRatio);
  g.fillStyle=c[3];g.fillRect(0,0,W,H);g.fillStyle=c[0];g.fillRect(0,0,W,410);
  const [hero,detail,logo,pattern]=await Promise.all([loadImage(b.heroPhoto),loadImage(b.detailPhoto),loadImage(b.logoImage),loadImage(b.patternImage)]);
  g.fillStyle=c[2];g.fillRect(700,0,700,410);
  canvasImage(g,hero,700,0,700,410,b.imageX,b.imageY,b.imageScale,'contain');
  g.fillStyle=c[3];g.fillRect(40,38,12,12);write(g,'THE LAUNCH ERA / CREATIVE STUDIO',72,49,15,c[3],'Arial','bold');
  const display=b.titleFont==='Italiana'?'Italiana':b.titleFont==='Bebas Neue'?'Impact':b.titleFont==='Cormorant Garamond'||b.titleFont==='Bodoni Moda'||b.titleFont==='DM Serif Display'?'Georgia':'Arial';
  if(b.style==='bakery'&&b.name.toLowerCase()==='casa brownie'){write(g,'casa',69,225,118,c[3],display);write(g,'brownie.',69,332,113,c[3],display);}
  else if(b.style==='cookies'&&b.name.toLowerCase()==='crumb cookies'){write(g,'crumb.',65,266,139,c[3],display);}
  else if(b.style==='nightclub'&&b.name.toLowerCase()==='aftr las vegas'){write(g,'AFTR',65,275,179,c[3],display,'bold');}
  else wrap(g,b.name,65,234,600,b.name.length>19?60:95,c[3],display);
  wrap(g,b.tagline,67,367,580,22,c[3],'Arial');
  const title=(s,y)=>write(g,s.toUpperCase(),52,y,20,c[0],'Arial','bold');
  title('01  Brand elements',467);
  for(let i=0;i<3;i++){g.fillStyle=c[i];g.fillRect(52+i*435,490,416,185);}
  if(logo){const w=Math.min(330,logo.width),h=Math.min(130,logo.height);g.drawImage(logo,108,520,w,h);}
  else write(g,b.name.length>18?b.monogram:b.name,75,598,b.name.length>18?95:53,c[3],display);
  write(g,b.monogram,625,613,95,c[3],display);
  write(g,b.symbol,1100,614,115,c[0],display);
  title('02  Color palette',737);
  for(let i=0;i<6;i++){
    const x=54+i*223;
    g.beginPath();g.arc(x+90,841,79,0,Math.PI*2);g.fillStyle=c[i];g.fill();
    write(g,['PRIMARY','ACCENT','SOFT','BACKGROUND','EXTRA','DETAIL'][i],x+2,955,14,c[0],'Arial','bold');
    write(g,c[i],x+2,982,17,c[0],'Arial');
  }
  title('03  Typography / voice',1063);
  g.fillStyle=c[0];g.fillRect(52,1091,1296,276);
  write(g,'Aa',90,1272,165,c[3],display);
  write(g,'DISPLAY / '+b.titleFont.toUpperCase(),89,1332,17,c[3],'Arial');
  wrap(g,b.tagline,603,1194,697,51,c[3],display);
  wrap(g,b.description||b.tone,607,1290,690,21,c[3],'Arial');
  title('04  Pattern and applications',1431);
  g.fillStyle=c[2];g.fillRect(52,1462,622,281);
  if(pattern){canvasImage(g,pattern,52,1462,622,281);}
  else{for(let i=0;i<15;i++){write(g,b.symbol,65+(i%5)*125,1548+Math.floor(i/5)*86,60,c[0],display);}}
  g.fillStyle=c[4];g.fillRect(688,1462,660,281);
  g.save();g.translate(950,1605);g.rotate(-.15);
  g.fillStyle=c[0];g.fillRect(-125,-88,250,180);
  write(g,b.monogram,-66,30,83,c[3],display);g.restore();
  if(b.style==='nightclub'){write(g,'AFTR  /  VIP',1044,1641,68,c[3],display);}
  else{g.fillStyle=c[3];g.fillRect(1100,1516,127,186);write(g,b.symbol,1137,1632,55,c[0],display);}
  title('05  Visual universe',1800);
  if(detail)canvasImage(g,detail,52,1815,224,64);
  if(hero)canvasImage(g,hero,287,1815,224,64);
  write(g,b.tone,553,1857,19,c[0],'Arial');
  write(g,'THE LAUNCH ERA / CONCEPT BRAND',1068,1865,15,c[0],'Arial');
  let galleryY=1900,missingImages=0;
  for(const row of galleryRows){
    g.fillStyle=c[3];g.fillRect(0,galleryY,W,92);
    write(g,'GALERÍA / '+row.title.toUpperCase(),52,galleryY+56,26,c[0],'Arial','bold');
    galleryY+=92;
    for(let i=0;i<row.photos.length;i++){
      const col=i%3,r=Math.floor(i/3),x=52+col*438,y=galleryY+r*rowStep;
      g.fillStyle=c[2];g.fillRect(x,y,418,photoHeight);
      const photo=await loadImage(row.photos[i].src);
      if(photo){
        canvasImage(g,photo,x,y,418,photoHeight,row.photos[i].x,row.photos[i].y,1,row.photos[i].fit||'contain');
      }else{
        missingImages++;
        write(g,'Imagen no disponible en este PNG',x+18,y+208,16,c[0],'Arial');
        write(g,'Revisar enlace del original',x+18,y+232,14,c[0],'Arial');
      }
    }
    galleryY+=Math.ceil(row.photos.length/3)*rowStep+25;
  }
  can.toBlob(blob=>{if(blob){download(blob,'brand-board-'+tokenName(b.name)+'.png');notify(missingImages||(!hero&&b.heroPhoto)?'PNG descargado con avisos: algunas fotos externas no pudieron exportarse. Revisa las imágenes antes de publicar.':'PNG editorial HD descargado con fotografías de campaña.');}else notify('No se pudo generar el PNG.');},'image/png');
}
async function resizeFile(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Formato no permitido');
  if(file.size>14*1024*1024)throw Error('La imagen supera 14 MB');
  const u=URL.createObjectURL(file);
  try{
    const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src=u;});
    const scale=Math.min(1,1100/Math.max(im.width,im.height));const cv=document.createElement('canvas');
    cv.width=Math.round(im.width*scale);cv.height=Math.round(im.height*scale);
    cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
    return cv.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.83);
  }finally{URL.revokeObjectURL(u);}
}
async function assignImage(file,key){
  if(!file||!['heroPhoto','detailPhoto','logoImage','patternImage'].includes(key))return;
  const id=activeId;
  try{
    const img=await resizeFile(file);const b=brands.find(x=>x.id===id);if(!b)return;
    const prev=b[key];b[key]=img;
    if(!save()){b[key]=prev;save();return;}
    if(id===activeId){tab='assets';render();}notify('Imagen colocada en el Brand Board.');
  }catch(e){notify(e.message||'No se pudo procesar la foto.');}
}
function openNew(){const dialog=$('new-dialog');if(dialog?.showModal)dialog.showModal();else notify('Tu navegador no admite este formulario.');}
function addBrand(name,type){
  const id='brand-'+Date.now().toString(36);const starter=clone(DEMOS[0]);
  const fallback=type.includes('Nightclub')?DEMOS[2]:type.includes('Cookie')?DEMOS[1]:DEMOS[0];
  Object.assign(starter,clone(fallback),{id,name,category:type,tagline:'Una marca con una historia propia.',description:'Una nueva identidad creada para un proyecto demo.',monogram:name.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase(),site:'',logoImage:'',patternImage:'',heroPhoto:'',detailPhoto:'',imageY:50,imageX:50,imageScale:1});
  brands.push(starter);activeId=id;save();tab='identity';view='board';focused=false;render();notify('Nueva marca creada. Ahora puedes darle identidad.');
}
async function openPhotoReview(section,id){
  const source=await getGalleryPhotoSource(id);
  if(!source){notify('No se pudo cargar la imagen para revisarla.');return;}
  document.querySelector('#gallery-photo-review')?.remove();
  const dialog=document.createElement('dialog');
  dialog.id='gallery-photo-review';
  dialog.className='gallery-photo-review-dialog';
  const heading=document.createElement('h3');
  heading.textContent='Revisa la fotografía antes de usarla';
  const image=document.createElement('img');
  image.src=source;image.alt='Vista ampliada de la foto seleccionada';
  const note=document.createElement('p');
  note.textContent='Especialmente si la hiciste con IA: revisa pies, manos, rostro, proporciones y detalles de fondo. La aplicación no puede garantizar automáticamente que una foto generada sea correcta.';
  const bar=document.createElement('div');bar.className='gallery-review-buttons';
  const close=document.createElement('button');close.type='button';close.textContent='Conservar foto';
  close.addEventListener('click',()=>dialog.close());
  const replace=document.createElement('button');replace.type='button';replace.textContent='Reemplazar foto';
  replace.addEventListener('click',()=>{
    dialog.close();
    uploadSection=section;replacementPhotoId=id;
    const input=$('section-upload');
    if(input){input.value='';input.multiple=false;input.click();}
  });
  const remove=document.createElement('button');remove.type='button';remove.textContent='Eliminar foto';
  remove.addEventListener('click',()=>{
    dialog.close();
    if(!confirm('¿Eliminar esta foto del Brand Board?'))return;
    removePhoto(active(),section,id,save).then(()=>{
      render();notify('Foto eliminada. Puedes reemplazarla por una versión corregida.');
    }).catch(e=>notify(e.message));
  });
  bar.append(close,replace,remove);
  dialog.append(heading,image,note,bar);
  document.body.append(dialog);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});
  dialog.showModal();
}

function perform(action,button){
  const b=active();
  if(action==='save-brand'){
    if(save())notify('Cambios de '+b.name+' guardados en este navegador.');
    return;
  }
  if(action==='new')openNew();
  if(action==='cancel-new')$('new-dialog')?.close();
  if(action==='duplicate'){
    const next=clone(b);next.id='brand-'+Date.now().toString(36);next.name=b.name+' · copia';
    brands.push(next);activeId=next.id;
    duplicateGallery(b,next).then(()=>{save();render();notify('Tablero y fotos duplicados.');})
      .catch(()=>{next.sectionPhotos={};save();render();notify('Tablero duplicado, pero algunas imágenes no se copiaron.');});
    return;
  }
  if(action==='delete'){
    if(brands.length===1){notify('Conserva al menos una marca.');return;}
    if(!confirm('¿Eliminar el Brand Board de '+b.name+'? Esto no se puede deshacer.'))return;
    brands=brands.filter(x=>x.id!==b.id);activeId=brands[0].id;save();render();notify('Marca eliminada.');
  }
  if(action==='backup')backup();
  if(action==='import'){$('import-file')?.click();return;}
  if(action==='section-add' || action==='gallery-replace') {
    uploadSection=button.dataset.section;
    replacementPhotoId=action==='gallery-replace' ? button.dataset.id : '';
    const input=$('section-upload');
    if (input) { input.value='';input.multiple=!replacementPhotoId;input.click(); }
    return;
  }
  if(action==='gallery-review') {void openPhotoReview(button.dataset.section,button.dataset.id);return;}
  if(action==='gallery-delete') {
    if(!confirm('¿Eliminar esta foto de la galería de '+b.name+'?'))return;
    removePhoto(b,button.dataset.section,button.dataset.id,save).then(()=>{
      render();notify('Foto eliminada.');
    }).catch(e=>notify(e.message));
    return;
  }
  if(action==='gallery-left'||action==='gallery-right') {
    movePhoto(b,button.dataset.section,button.dataset.id,action==='gallery-left'?-1:1,save);
    render();return;
  }
  if(action==='gallery-fit') {
    toggleFit(b,button.dataset.section,button.dataset.id,save);
    render();return;
  }
  if(action==='png')exportPNG();
  if(action==='json')exportJSON();
  if(action==='print')window.print();
  if(action==='focus'){focused=!focused;render();}
  if(action==='css'){
    const src=cssTokens(b);
    if(navigator.clipboard?.writeText){navigator.clipboard.writeText(src).then(()=>notify('Variables CSS copiadas.'),()=>prompt('Copia estas variables:',src));}
    else prompt('Copia estas variables:',src);
  }
  if(action==='choose-file'){
    const key=button?.dataset.target;
    const input=document.querySelector('input[data-upload="'+key+'"]');input?.click();
  }
  if(action==='remove-image'){
    const key=button?.dataset.target;
    if(!['heroPhoto','detailPhoto','logoImage','patternImage'].includes(key)||!b[key])return;
    if(!confirm('¿Eliminar esta imagen de '+b.name+'?'))return;
    const previous=b[key];b[key]='';
    if(!save()){b[key]=previous;return;}
    render();notify('Imagen eliminada de '+b.name+'.');
  }
}
document.addEventListener('click',event=>{
  // Only sidebar brand buttons navigate: the artboard also has data-brand for metadata.
  const nav=event.target.closest('.brandnav[data-brand]');
  if(nav){activeId=nav.dataset.brand;save();view='board';tab='identity';focused=false;render();return;}
  const viewBtn=event.target.closest('[data-view]');
  if(viewBtn){view=viewBtn.dataset.view;render();return;}
  const tabBtn=event.target.closest('[data-tab]');
  if(tabBtn){tab=tabBtn.dataset.tab;render();return;}
  const action=event.target.closest('[data-action]');
  if(action){if(action.tagName==='A')event.preventDefault();perform(action.dataset.action,action);}
});
document.addEventListener('input',event=>{
  const b=active(),t=event.target;
  const prop=t.dataset.field;
  if(prop){b[prop]=String(t.value).slice(0,prop==='description'?240:110);save();preview();}
  if(t.dataset.color!==undefined){
    const n=Number(t.dataset.color);if(Number.isInteger(n)&&n>=0&&n<6){b.colors[n]=hex(t.value);save();preview();}
  }
  if(t.dataset.range){
    const k=t.dataset.range;
    if(['imageX','imageY','imageScale'].includes(k)){
      b[k]=Number(t.value);save();syncPhoto();const label=t.closest('.sliderrow')?.querySelector('span');
      if(label)label.textContent=k==='imageScale'?Math.round(b[k]*100)+'%':Math.round(b[k])+'%';
    }
  }
});
document.addEventListener('change',async event=>{
  const t=event.target;
  if(t.id==='mobile-brand-selector'){
    if(brands.some(x=>x.id===t.value)){
      activeId=t.value;
      save();
      view='board';
      tab='identity';
      focused=false;
      render();
    }
    return;
  }
  if(t.dataset.upload&&t.files?.[0])await assignImage(t.files[0],t.dataset.upload);
  if(t.id==='section-upload' && t.files?.length) {
    const current=activeId;
    try {
      const count=await addFiles(active(),uploadSection,t.files,save,replacementPhotoId);
      if(activeId===current)render();
      notify(count+' foto(s) añadidas a la sección.');
    } catch(e) {notify(e.message||'No se pudieron subir las imágenes.');}
    return;
  }
  if(t.id==='import-file'&&t.files?.[0]){
    try{
      const data=JSON.parse(await t.files[0].text());
      if(data.format!=='the-launch-era-brand-boards'||!Array.isArray(data.brands)||!data.brands.length||data.brands.length>150||!data.brands.every(x=>x.id&&x.name&&Array.isArray(x.colors)&&x.colors.length===6))throw Error();
      if(!confirm('¿Reemplazar los Brand Boards de este dispositivo por los del respaldo?'))return;
      await galleryRestore(data.photos);
      brands=data.brands;activeId=brands[0].id;save();render();notify('Respaldo e imágenes restaurados.');
    }catch(e){notify('Este archivo no es un respaldo válido.');}
  }
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='new-form')return;
  event.preventDefault();const f=new FormData(event.target),name=String(f.get('brandname')||'').trim(),type=String(f.get('brandtype')||TYPES[0]);
  if(!name){notify('Escribe un nombre.');return;}
  $('new-dialog')?.close();addBrand(name,type);
});
document.addEventListener('dragstart', event => {
  const card=event.target.closest('.gallery-photo-card');
  draggedGallery=card?{section:card.dataset.section,id:card.dataset.imageId}:null;
  if (card) card.classList.add('dragging');
});
document.addEventListener('dragend', () => {
  draggedGallery=null;
  document.querySelectorAll('.dragging,.over').forEach(el=>el.classList.remove('dragging','over'));
});
document.addEventListener('dragover',event=>{
  const gallery=event.target.closest('[data-section-drop]');
  if(gallery){event.preventDefault();gallery.classList.add('over');return;}
  const target=event.target.closest('[data-drop]');if(!target)return;
  event.preventDefault();target.classList.add('over');
});
document.addEventListener('dragleave',event=>{
  const target=event.target.closest('[data-drop],[data-section-drop]');
  if(target&&!target.contains(event.relatedTarget))target.classList.remove('over');
});
document.addEventListener('drop',event=>{
  const gallery=event.target.closest('[data-section-drop]');
  if(gallery){
    event.preventDefault();gallery.classList.remove('over');
    const section=gallery.dataset.section,files=event.dataTransfer?.files;
    if(draggedGallery && draggedGallery.section===section){
      const card=event.target.closest('.gallery-photo-card');
      if(card)movePhotoTo(active(),section,draggedGallery.id,card.dataset.imageId,save);
      draggedGallery=null;render();return;
    }
    if(files?.length){
      addFiles(active(),section,files,save).then(count=>{
        render();notify(count+' foto(s) añadidas a '+section+'.');
      }).catch(e=>notify(e.message));
    }
    return;
  }
  const target=event.target.closest('[data-drop]');if(!target)return;
  event.preventDefault();target.classList.remove('over');const file=event.dataTransfer?.files?.[0];
  if(file)assignImage(file,target.dataset.drop);
});
let pointerStart=null;
document.addEventListener('pointerdown',event=>{
  const hit=event.target.closest('.art-photo');
  if(!hit||!active().heroPhoto||event.pointerType==='mouse'&&event.button!==0)return;
  pointerStart={x:event.clientX,y:event.clientY,bX:Number(active().imageX||50),bY:Number(active().imageY||50),id:event.pointerId};
  hit.setPointerCapture?.(event.pointerId);
});
document.addEventListener('pointermove',event=>{
  if(!pointerStart||event.pointerId!==pointerStart.id)return;
  if(!event.target.closest('.art-photo')&&!event.target.closest('.art-head'))return;
  const b=active();
  b.imageY=Math.max(0,Math.min(100,pointerStart.bY-(event.clientY-pointerStart.y)*.23));
  b.imageX=Math.max(0,Math.min(100,pointerStart.bX-(event.clientX-pointerStart.x)*.23));
  syncPhoto();
});
document.addEventListener('pointerup',event=>{
  if(pointerStart&&event.pointerId===pointerStart.id){pointerStart=null;save();}
});
document.addEventListener('pointercancel',()=>{pointerStart=null;});
// Mobile vertical list of every brand; no dropdown with hidden projects.
document.addEventListener('click',event=>{
  const toggle=event.target.closest('[data-toggle-brand-drawer]');
  if(!toggle)return;
  const drawer=toggle.closest('.brand-drawer');
  if(!drawer)return;
  const open=drawer.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded',String(open));
});
render();
