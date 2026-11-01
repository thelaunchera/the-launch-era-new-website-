/* Public cleaning sample only: reuse the existing Sonny AI conversation.
   This adjusts the launcher visually; it never sends booking-form data. */
(() => {
  "use strict";
  if (!/^\/sample-cleaning\/(?:index\.html)?$/.test(window.location.pathname)) return;
  const es = new URLSearchParams(window.location.search).get("lang") === "es";
  function init() {
    const launch = document.querySelector(".tle-ai-launch");
    const panel = document.querySelector(".tle-ai-panel");
    if (!launch || !panel || launch.dataset.tleSampleSonny === "true") return;
    launch.dataset.tleSampleSonny = "true";
    const makeAvatar = (className) => {
      const img = document.createElement("img");
      img.src = "/assets/lead-demo/ai-demo-robot.webp";
      img.alt = "";
      img.width = 52;
      img.height = 52;
      img.decoding = "async";
      img.className = className;
      return img;
    };
    launch.replaceChildren(makeAvatar("tle-sample-sonny-avatar"));
    launch.classList.add("tle-sample-sonny-launch");
    launch.setAttribute("aria-controls", "tleSampleSonnyPanel");
    launch.setAttribute("aria-label", es ? "Hablar con Sonny, asistente de reservas de prueba" : "Chat with Sonny, sample booking assistant");
    launch.title = es ? "Hablar con Sonny" : "Chat with Sonny";
    panel.id = "tleSampleSonnyPanel";
    const identity = panel.querySelector(".tle-ai-head > div");
    if (identity) identity.prepend(makeAvatar("tle-sample-sonny-header-avatar"));
    const note = panel.querySelector(".tle-ai-foot > p");
    if (note) note.textContent = es
      ? "Prueba con datos ficticios. Solo lo que escribas en este chat se envía al asistente; la solicitud de limpieza no se reserva ni se cobra."
      : "Use sample details. Only messages you type in this chat go to the assistant; no cleaning request is booked or charged.";
    if (!document.getElementById("tleSampleSonnyStyle")) {
      const style = document.createElement("style");
      style.id = "tleSampleSonnyStyle";
      style.textContent = `
        body[data-tle-experience="sample"] .tle-ai-launch.tle-sample-sonny-launch {
          width:58px!important;height:58px!important;min-width:58px!important;max-width:58px!important;
          min-height:58px!important;padding:4px!important;display:grid!important;place-items:center!important;
          right:calc(18px + env(safe-area-inset-right,0px))!important;
          bottom:calc(24px + env(safe-area-inset-bottom,0px))!important;
          background:#e3f3fc!important;border:1px solid #a3cfe7!important;border-radius:50%!important;
          box-shadow:0 9px 26px #18466235!important;overflow:hidden!important;
        }
        body[data-tle-experience="sample"] .tle-sample-sonny-avatar {width:49px;height:49px;display:block;object-fit:contain;border-radius:50%}
        body[data-tle-experience="sample"] .tle-sample-sonny-header-avatar {width:39px;height:39px;object-fit:contain;flex:none;border-radius:50%;background:#dceef9;margin-right:7px}
        body[data-tle-experience="sample"] .tle-ai-head>div {display:flex;align-items:center;gap:5px}
        body[data-tle-experience="sample"] .tle-ai-head>div>b,
        body[data-tle-experience="sample"] .tle-ai-head>div>small {display:block}
        body[data-tle-experience="sample"] .tle-ai-panel:not([hidden]) {bottom:calc(94px + env(safe-area-inset-bottom,0px))!important}
        body[data-tle-experience="sample"] .tle-ai-launch:focus-visible {outline:3px solid #327eaf!important;outline-offset:3px}
        @media(max-width:700px){
          body[data-tle-experience="sample"] .tle-ai-launch.tle-sample-sonny-launch {
            right:calc(12px + env(safe-area-inset-right,0px))!important;
            bottom:calc(16px + env(safe-area-inset-bottom,0px))!important;
          }
          body[data-tle-experience="sample"] .tle-ai-panel:not([hidden]) {
            top:var(--tle-ai-vv-top,0px)!important;bottom:auto!important;
          }
          body[data-tle-experience="sample"].tle-ai-chat-open .tle-ai-launch {visibility:hidden!important}
        }
      `;
      document.head.appendChild(style);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();