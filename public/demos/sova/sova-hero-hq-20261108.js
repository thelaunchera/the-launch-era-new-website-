/* SOVA | exact owner-uploaded cobalt-blue Canva landscape clip.
   No white margins, no zoom, no crop. No other demo is changed. */
(() => {
  "use strict";
  if (document.documentElement.dataset.tleOneMotion !== "sova") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = navigator.connection?.saveData === true;
  const url = new URL("./media/hero-canva-blue-20261108.mp4", document.baseURI).href;
  const poster = new URL("./media/hero-canva-blue-poster-20261108.webp", document.baseURI).href;
  let host = null, video = null, queued = false;
  function inView() {
    if (!host || !host.isConnected || document.hidden) return false;
    const r = host.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom >= -60 && r.top <= window.innerHeight + 60;
  }
  function clear() {
    if (video) { video.pause(); video.remove(); }
    if (host) host.classList.remove("sova-motion-ready");
    host = null; video = null;
  }
  function visibleFrame(v) {
    if (v !== video || !v.isConnected || !inView() || reduced.matches) return;
    const reveal = () => {
      if (v === video && !v.paused && inView()) v.classList.add("sova-motion-playing");
    };
    if (typeof v.requestVideoFrameCallback === "function") v.requestVideoFrameCallback(reveal);
    else requestAnimationFrame(() => requestAnimationFrame(reveal));
  }
  function play() {
    if (!video) return;
    if (document.hidden || !inView() || reduced.matches || saveData) {
      video.pause(); return;
    }
    const active = video;
    const playing = active.play();
    if (playing?.then) playing.then(() => visibleFrame(active)).catch(() => {});
  }
  function mount() {
    const found = document.querySelector(".hero .hero-media");
    if (!found) { if (host && !host.isConnected) clear(); return; }
    if (found === host && (video?.isConnected || reduced.matches || saveData)) { play(); return; }
    clear();
    host = found;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    // Replace the old still with a first frame that matches this exact clip.
    const img = host.querySelector(":scope > img");
    if (img && img.getAttribute("src") !== poster) {
      host.classList.remove("sova-poster-ready");
      img.addEventListener("load", () => {
        if (host === found) found.classList.add("sova-poster-ready");
      }, {once:true});
      img.addEventListener("error", () => {
        if (host === found) found.classList.remove("sova-poster-ready");
      }, {once:true});
      img.src = poster;
      img.removeAttribute("srcset");
      if (img.complete && img.naturalWidth) found.classList.add("sova-poster-ready");
    } else if (img?.complete && img.naturalWidth) {
      host.classList.add("sova-poster-ready");
    }
    if (saveData || reduced.matches) return;
    const v = document.createElement("video");
    v.dataset.sovaHqMotion = "";
    v.setAttribute("data-tle-cinematic-hero","sova");
    v.setAttribute("aria-hidden","true");
    v.muted = true; v.defaultMuted = true;
    v.playsInline = true; v.loop = true; v.autoplay = true; v.controls = false;
    v.disablePictureInPicture = true; v.disableRemotePlayback = true;
    v.preload = "auto"; v.poster = poster; v.tabIndex = -1;
    v.addEventListener("loadedmetadata", () => {
      const ratio = v.videoWidth / Math.max(v.videoHeight,1);
      if (v.videoWidth < 1200 || v.videoHeight < 850 || ratio < 1.32 || ratio > 1.48) {
        if (v === video) { v.pause(); v.remove(); video = null; }
        return;
      }
      play();
    });
    v.addEventListener("loadeddata", () => visibleFrame(v));
    v.addEventListener("playing", () => visibleFrame(v));
    v.addEventListener("error", () => {
      if (v === video) { v.pause(); v.remove(); video = null; }
    });
    host.append(v); video = v; host.classList.add("sova-motion-ready");
    v.src = url; play();
  }
  function schedule() {
    if (queued) return;
    queued = true; requestAnimationFrame(() => { queued = false; mount(); });
  }
  function boot() {
    mount();
    window.addEventListener("scroll", play, {passive:true});
    window.addEventListener("resize", schedule, {passive:true});
    document.addEventListener("visibilitychange",play);
    reduced.addEventListener?.("change",schedule);
    const root = document.querySelector("#app") || document.body;
    new MutationObserver(changes => {
      if (changes.some(c => [...c.addedNodes, ...c.removedNodes].some(n =>
        n.nodeType === 1 && (n.matches?.(".hero,.hero-media") ||
        n.querySelector?.(".hero .hero-media"))))) schedule();
    }).observe(root,{childList:true,subtree:true});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
