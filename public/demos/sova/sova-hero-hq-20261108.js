/* SOVA | original landscape Canva hero, iPad/Safari playback recovery.
   Autoplay where supported; offer a real tap-to-play when iOS Low Power Mode,
   reduced motion, or autoplay policy keeps the hero at its still poster. */
(() => {
  "use strict";
  if (document.documentElement.dataset.tleOneMotion !== "sova") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = navigator.connection?.saveData === true;
  const source = new URL("./media/hero-canva-blue-20261108.mp4", document.baseURI).href;
  const poster = new URL("./media/hero-canva-blue-poster-20261108.webp", document.baseURI).href;
  let host = null, video = null, button = null, queued = false;
  let manuallyPaused = false, manuallyStarted = false, autoplayBlocked = false;

  const labels = () => {
    const es = (document.documentElement.lang || "").toLowerCase().startsWith("es") ||
               localStorage.getItem("sova-language") === "es";
    return es ? ["Reproducir video", "Pausar video"] : ["Play video", "Pause video"];
  };
  function inView() {
    if (!host || !host.isConnected || document.hidden) return false;
    const r = host.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom >= -60 && r.top <= innerHeight + 60;
  }
  function updateButton() {
    if (!button) return;
    const playing = !!video && !video.paused && video.readyState >= 2;
    const label = labels()[playing ? 1 : 0];
    button.textContent = label;
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-pressed", String(playing));
    button.dataset.state = playing ? "playing" : "paused";
  }
  function reveal(v) {
    if (v !== video || !v.isConnected || v.paused || v.readyState < 2) return;
    const apply = () => {
      if (v !== video || v.paused || !v.isConnected || !inView()) return;
      v.classList.add("sova-motion-playing");
      updateButton();
    };
    if (typeof v.requestVideoFrameCallback === "function") {
      v.requestVideoFrameCallback(apply);
      // Safari may omit the callback after background-tab or low-power changes.
      requestAnimationFrame(() => requestAnimationFrame(apply));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(apply));
    }
  }
  function pauseForVisibility() {
    if (!video) return;
    if (!inView() && !video.paused) video.pause();
    updateButton();
  }
  function autoPlay() {
    if (!video || !inView() || autoplayBlocked || manuallyPaused ||
        reduced.matches || saveData) { pauseForVisibility(); return; }
    if (!video.paused) { reveal(video); updateButton(); return; }
    const v = video;
    const request = v.play();
    if (request?.then) {
      request.then(() => { if (v === video) reveal(v); })
             .catch(() => { if (v === video) { autoplayBlocked = true; updateButton(); } });
    }
  }
  function manualToggle() {
    if (!video) return;
    if (!video.paused) {
      manuallyPaused = true;
      video.pause();
      video.classList.remove("sova-motion-playing");
      updateButton();
      return;
    }
    manuallyPaused = false;
    manuallyStarted = true;
    autoplayBlocked = false;
    // A deliberate tap overrides reduced-motion's automatic-play restriction.
    host?.classList.add("sova-user-started");
    const v = video;
    const request = v.play(); // Must be called synchronously inside this click handler for iOS.
    if (request?.then) {
      request.then(() => { if (v === video) reveal(v); })
             .catch(() => { if (v === video) updateButton(); });
    }
    updateButton();
  }
  function remove() {
    if (video) { video.pause(); video.remove(); }
    if (button) button.remove();
    if (host) host.classList.remove("sova-motion-ready","sova-user-started");
    video = null; button = null; host = null;
    manuallyPaused = false; manuallyStarted = false; autoplayBlocked = false;
  }
  function applyPoster(target) {
    const img = target.querySelector(":scope > img");
    if (!img) return;
    if (img.getAttribute("src") === poster && img.complete && img.naturalWidth) {
      target.classList.add("sova-poster-ready"); return;
    }
    target.classList.remove("sova-poster-ready");
    img.addEventListener("load", () => {
      if (target.isConnected && img.src === poster) target.classList.add("sova-poster-ready");
    },{once:true});
    img.addEventListener("error", () => {
      if (target.isConnected) target.classList.remove("sova-poster-ready");
    },{once:true});
    img.src = poster;
    img.removeAttribute("srcset");
    if (img.complete && img.naturalWidth) target.classList.add("sova-poster-ready");
  }
  function mount() {
    const found = document.querySelector(".hero .hero-media");
    if (!found) { if (host && !host.isConnected) remove(); return; }
    if (found === host && video?.isConnected) { autoPlay(); updateButton(); return; }
    if (host) remove();
    host = found;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    applyPoster(host);

    const v = document.createElement("video");
    v.dataset.sovaHqMotion = "";
    v.setAttribute("data-tle-cinematic-hero","sova");
    v.setAttribute("aria-hidden","true");
    v.muted = true; v.defaultMuted = true; v.volume = 0;
    v.setAttribute("muted","");
    v.playsInline = true; v.setAttribute("playsinline",""); v.setAttribute("webkit-playsinline","");
    v.loop = true; v.setAttribute("loop","");
    v.autoplay = !reduced.matches && !saveData;
    v.controls = false; v.tabIndex = -1;
    v.disablePictureInPicture = true; v.disableRemotePlayback = true;
    v.preload = saveData ? "metadata" : "auto";
    v.poster = poster;

    const b = document.createElement("button");
    b.type = "button";
    b.className = "sova-video-control";
    b.setAttribute("data-sova-video-control","");
    b.addEventListener("click", manualToggle);
    host.append(v,b);
    video = v; button = b;
    host.classList.add("sova-motion-ready");
    updateButton();

    v.addEventListener("loadedmetadata", () => {
      if (v !== video) return;
      const ratio = v.videoWidth / Math.max(v.videoHeight,1);
      if (v.videoWidth < 1200 || v.videoHeight < 850 || ratio < 1.32 || ratio > 1.48) {
        v.pause(); v.remove(); video = null; b.remove(); button = null;
        host?.classList.remove("sova-motion-ready"); return;
      }
      autoPlay();
    });
    v.addEventListener("loadeddata", () => reveal(v));
    v.addEventListener("playing", () => reveal(v));
    v.addEventListener("timeupdate", () => reveal(v));
    v.addEventListener("pause", () => updateButton());
    v.addEventListener("error", () => {
      if (v !== video) return;
      v.pause(); v.remove(); video = null;
      b.remove(); button = null;
      host?.classList.remove("sova-motion-ready");
    });
    v.src = source;
    autoPlay();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  }
  function boot() {
    mount();
    window.addEventListener("scroll", autoPlay, {passive:true});
    window.addEventListener("resize", schedule, {passive:true});
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseForVisibility();
      else if (manuallyStarted && !manuallyPaused && !reduced.matches) autoPlay();
      else autoPlay();
    });
    reduced.addEventListener?.("change", schedule);
    const root = document.querySelector("#app") || document.body;
    new MutationObserver(changes => {
      if (changes.some(c => [...c.addedNodes,...c.removedNodes].some(n =>
        n.nodeType === 1 && (n.matches?.(".hero,.hero-media") ||
          n.querySelector?.(".hero .hero-media"))))) schedule();
    }).observe(root,{childList:true,subtree:true});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
