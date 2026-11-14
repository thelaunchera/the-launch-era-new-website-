const categories = {
  hands: [
    ["Classic Manicure", "$20", "A clean shape and a fresh polish."],
    ["Deluxe Ocean Manicure", "$39", "Includes hot wax paraffin."],
  ],
  feet: [
    ["Classic Pedicure", "$30"],
    ["Deluxe Ocean Pedicure", "$43"],
    ["Hot Rock Volcano Pedicure", "$55"],
  ],
  sets: [
    ["Dipping Powder Full Set", "$40+"],
    ["Acrylic Full Set", "$40+"],
    ["Acrylic Fill", "$25+"],
    ["Liquid Gel / UV Gel Full Set", "$65"],
  ],
  wax: [
    ["Eyebrow Wax", "$12"],
    ["Lip Wax", "$7"],
    ["Chin Wax", "$8+"],
    ["Full Face Wax", "$40+"],
  ],
};

const tabs = Array.from(document.querySelectorAll("[data-menu]"));
const menuPanel = document.querySelector("#service-panel");
const rows = document.querySelector("#menu-rows");
function selectMenu(tab) {
  tabs.forEach((item) => {
    item.setAttribute("aria-selected", String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  menuPanel.setAttribute("aria-labelledby", tab.id);
  rows.replaceChildren(...categories[tab.dataset.menu].map(([name, price, description]) => {
    const row = document.createElement("li");
    const details = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = name;
    details.append(title);
    if (description) {
      const text = document.createElement("span");
      text.textContent = description;
      details.append(text);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-price";
    button.dataset.book = name;
    button.textContent = price;
    button.setAttribute("aria-label", `Request ${name}, ${price}`);
    row.append(details, button);
    return row;
  }));
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectMenu(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const nextIndex = { Home: 0, End: tabs.length - 1, ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length }[event.key];
    event.preventDefault();
    selectMenu(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });
});

const booking = document.querySelector("#booking");
const form = document.querySelector("#booking-form");
const confirmation = document.querySelector("#confirmation");
const summary = document.querySelector("#request-summary");
Object.values(categories).flat().forEach(([name]) => form.elements.service.add(new Option(name, name)));

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const caption = document.querySelector("#lightbox-caption");
const gallery = document.querySelector("#gallery-track");
const cards = Array.from(gallery.querySelectorAll(".gallery-card"));
const controls = lightbox.querySelector(".lightbox-controls");
let activePhoto = 0;
function showPhoto(index) {
  activePhoto = (index + cards.length) % cards.length;
  const card = cards[activePhoto];
  const image = card.querySelector("img");
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  caption.textContent = card.querySelector("span").textContent;
}
cards.forEach((card, index) => card.addEventListener("click", () => {
  controls.hidden = false;
  showPhoto(index);
  lightbox.showModal();
}));
document.querySelector("[data-menu-photo]").addEventListener("click", () => {
  controls.hidden = true;
  lightboxImage.src = "assets/menu.webp";
  lightboxImage.alt = "Original Penn Nails & Spa service and price sign";
  caption.textContent = "Original price list";
  lightbox.showModal();
});
document.querySelector("#photo-prev").addEventListener("click", () => showPhoto(activePhoto - 1));
document.querySelector("#photo-next").addEventListener("click", () => showPhoto(activePhoto + 1));
lightbox.addEventListener("keydown", (event) => {
  if (controls.hidden) return;
  if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
  if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
});
for (const [direction, sign] of [["prev", -1], ["next", 1]]) {
  document.querySelector(`#gallery-${direction}`).addEventListener("click", () => {
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    gallery.scrollBy({ left: sign * (cards[0].offsetWidth + 12), behavior });
  });
}

document.addEventListener("contextmenu", (event) => {
  if (event.target instanceof HTMLImageElement) event.preventDefault();
});
document.querySelectorAll("img").forEach((image) => { image.draggable = false; });

document.addEventListener("click", (event) => {
  const book = event.target.closest("[data-book]");
  if (book) {
    form.reset();
    form.hidden = false;
    confirmation.hidden = true;
    form.elements.service.value = book.dataset.book;
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    form.elements.date.min = today.toISOString().slice(0, 10);
    booking.showModal();
  }
  const close = event.target.closest("[data-close]");
  if (close) document.getElementById(close.dataset.close).close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  summary.textContent = `${data.get("service")} · ${data.get("date")} · ${data.get("time")}. This request stays in the preview.`;
  form.hidden = true;
  confirmation.hidden = false;
  summary.focus();
});
