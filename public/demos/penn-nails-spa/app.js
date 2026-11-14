const categories = {
  hands: [[null, [
    ["Classic Manicure", "$20"],
    ["Classic Manicure with Hot Wax Paraffin", "+$15", "Add-on to Classic Manicure"],
    ["Deluxe Ocean Manicure", "$39", "Includes hot wax paraffin."],
  ]]],
  feet: [[null, [
    ["Classic Pedicure", "$30"],
    ["Classic Pedicure with Hot Wax Paraffin", "+$15", "Add-on to Classic Pedicure"],
    ["Deluxe Ocean Pedicure", "$43"],
    ["Deluxe Ocean Pedicure with Hot Wax Paraffin", "+$12", "Add-on to Deluxe Ocean Pedicure"],
    ["Hot Rock Volcano Pedicure", "$55"],
    ["Hot Rock Volcano Pedicure with Hot Wax Paraffin", "+$12", "Add-on to Hot Rock Volcano Pedicure"],
  ]]],
  sets: [
    ["Dipping Powder (NexGen / SNS)", [
      ["Full Set (Clear or Color)", "$40+"], ["Pink & White", "$50+"],
      ["Ombré", "$60+"], ["Extension", "$5"],
    ]],
    ["Acrylic Nails", [
      ["Full Set", "$40+"], ["Fill-in", "$25+"], ["Ombré", "$60+"],
    ]],
    ["Liquid Gel / UV Gel", [["Full Set", "$65"], ["Fill-in", "$50"]]],
    ["Nail Add-ons", [
      ["Medium or Long Length", "$5+"], ["Special Shape (Coffin, Stiletto, etc.)", "$5+"],
      ["Gel Color", "$15"], ["French Tips", "$5"], ["Nail Art", "$5+"],
    ]],
  ],
  extras: [[null, [
    ["Fingernail Color Change", "$11"], ["Fingernail Color Change with French Tips", "$15"],
    ["Toenail Color Change", "$13"], ["Toenail Color Change with French Tips", "$17"],
    ["Buff & Shine", "$3"], ["Nail Repair", "$5+"], ["Acrylic Removal", "$15"],
    ["Dip Removal", "$10"], ["10-Minute Hot Rock Foot Massage", "$15"],
  ]]],
  kids: [["Ages 12 and under", [["Kids’ Manicure", "$12"], ["Kids’ Pedicure", "$23"]]]],
  wax: [[null, [
    ["Eyebrows", "$12"], ["Lip", "$7"], ["Chin", "$8+"], ["Full Face", "$40+"],
    ["Chest", "$40+"], ["Sideburns", "$10+"], ["Half Arms", "$25+"], ["Full Arms", "$40+"],
    ["Underarms", "$20"], ["Half Legs", "$35+"], ["Full Legs", "$55+"], ["Back", "$50+"],
  ]]],
};

const tabs = Array.from(document.querySelectorAll("[data-menu]"));
const menuPanel = document.querySelector("#service-panel");
const rows = document.querySelector("#menu-rows");

function renderMenuGroup([heading, services]) {
  const group = document.createElement("div");
  group.className = "menu-group";
  if (heading) {
    const label = document.createElement("h3");
    label.textContent = heading;
    group.append(label);
  }
  const list = document.createElement("ul");
  list.className = "menu-rows";
  for (const [name, price, description] of services) {
    const row = document.createElement("li");
    const details = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = name;
    details.append(title);
    if (description) {
      const note = document.createElement("span");
      note.textContent = description;
      details.append(note);
    }
    const amount = document.createElement("span");
    amount.className = "service-price";
    amount.textContent = price;
    row.append(details, amount);
    list.append(row);
  }
  group.append(list);
  return group;
}

function selectMenu(tab) {
  tabs.forEach((item) => {
    item.setAttribute("aria-selected", String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  menuPanel.setAttribute("aria-labelledby", tab.id);
  rows.replaceChildren(...categories[tab.dataset.menu].map(renderMenuGroup));
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
for (const [category, groups] of Object.entries(categories)) {
  const options = document.createElement("optgroup");
  options.label = tabs.find((tab) => tab.dataset.menu === category).textContent;
  for (const [heading, services] of groups) {
    for (const [service, price] of services) {
      if (price.startsWith("+") || heading === "Nail Add-ons") continue;
      const name = heading && category === "sets" ? `${heading} — ${service}` : service;
      options.append(new Option(name, name));
    }
  }
  form.elements.service.append(options);
}

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const caption = document.querySelector("#lightbox-caption");
const gallery = document.querySelector("#gallery-track");
const cards = Array.from(gallery.querySelectorAll(".gallery-card"));
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
  showPhoto(index);
  lightbox.showModal();
}));
document.querySelector("#photo-prev").addEventListener("click", () => showPhoto(activePhoto - 1));
document.querySelector("#photo-next").addEventListener("click", () => showPhoto(activePhoto + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("keydown", (event) => {
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
    form.elements.service.value = book.dataset.book || "";
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
