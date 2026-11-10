/* The Launch Era — public demo imagery is view-only.
   Removes casual save/drag affordances, not a DRM or copyright guarantee.
   Do not include in private Studio, Content Lab or owner export tools.
*/
(() => {
  'use strict';
  if (!location.pathname.startsWith('/demos/')) return;
  const style = document.createElement('style');
  style.textContent = [
    'html body img, html body picture, html body video {',
    '  -webkit-touch-callout: none;',
    '  -webkit-user-select: none;',
    '  user-select: none;',
    '  -webkit-user-drag: none;',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);
  // Keep normal taps, lightboxes, carousels, zoom and keyboard controls.
  document.addEventListener('dragstart', event => {
    if (event.target instanceof Element &&
        event.target.closest('img, picture, video')) event.preventDefault();
  }, true);
  document.addEventListener('contextmenu', event => {
    if (event.target instanceof Element &&
        event.target.closest('img, picture, video')) event.preventDefault();
  }, true);
})();
