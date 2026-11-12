const current = new URL(location.href);
const library = document.body.dataset.library;
const legacySections = new Set(["#inicio", "#guias", "#recursos", "#prompts-fotos", "#proximamente", "#suscripcion", "#como", "#productos", "#contacto"]);
const legacyAction = ["guide", "confirm_freebie", "unsubscribe_freebie"].some(key => current.searchParams.has(key));

if (legacyAction || legacySections.has(current.hash)) {
  location.replace(library + current.search + current.hash);
} else {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = new URL("./landing.css", import.meta.url).href;
  document.head.append(style);
  import("./landing.js").then(() => import("./living-portrait.js")).catch(error => {
    console.error("Could not initialize the Mina landing:", error);
  });
}
