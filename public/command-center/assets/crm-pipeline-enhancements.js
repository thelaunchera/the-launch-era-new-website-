/* Progressive enhancement for existing, persisted CRM pipeline.
   No new data or backend privileges. Changes use the app's existing stage control. */
(() => {
  'use strict';
  const board = document.getElementById('board');
  if (!board) return;
  const stages = ['New', 'Contacted', 'Follow-up', 'Won'];
  const ownerOnly = () => document.body.classList.contains('crm-owner-view')
    && !document.body.classList.contains('crm-buyer-view');
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let drag = null;
  let announcement = null;

  function speak(message) {
    if (!announcement) {
      announcement = document.createElement('div');
      announcement.className = 'sr-only';
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
      board.parentNode.insertBefore(announcement, board);
    }
    announcement.textContent = message;
  }

  function moveByExistingControl(card, stage) {
    if (!ownerOnly() || !stages.includes(stage)) return;
    const control = card.querySelector('select[aria-label^="Move "]');
    if (!control || control.disabled || control.value === stage) return;
    control.value = stage;
    // Existing handler performs workspace-scoped Supabase update and error rollback.
    control.dispatchEvent(new Event('change', { bubbles: true }));
    speak('Saving the stage change. It will appear after the server confirms it.');
  }

  function removeTarget() {
    board.querySelectorAll('.crm-drag-target').forEach(el => el.classList.remove('crm-drag-target'));
  }

  function cleanup() {
    if (!drag) return;
    drag.card.classList.remove('crm-drag-origin');
    drag.ghost?.remove();
    removeTarget();
    drag = null;
  }

  function showGhost(pointer) {
    if (!drag || drag.ghost) return;
    const ghost = document.createElement('div');
    const title = document.createElement('strong');
    const hint = document.createElement('small');
    ghost.className = 'crm-stage-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    title.textContent = drag.business;
    hint.textContent = 'Move to another stage';
    ghost.append(title, hint);
    ghost.style.width = Math.min(drag.rect.width, 330) + 'px';
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.card.classList.add('crm-drag-origin');
    track(pointer);
  }

  function track(pointer) {
    if (!drag || !drag.ghost) return;
    drag.ghost.style.left = (pointer.clientX - Math.min(drag.rect.width, 330) / 2) + 'px';
    drag.ghost.style.top = (pointer.clientY - 38) + 'px';
    removeTarget();
    const el = document.elementFromPoint(pointer.clientX, pointer.clientY);
    const lane = el?.closest?.('#board .premium-lane');
    if (lane && stages.includes(lane.dataset.stage)) {
      lane.classList.add('crm-drag-target');
      drag.target = lane.dataset.stage;
    } else drag.target = null;
  }

  function enhance() {
    if (!ownerOnly()) return;
    board.querySelectorAll('.premium-lead').forEach(card => {
      if (card.dataset.crmDnDReady === 'true') return;
      const select = card.querySelector('select[aria-label^="Move "]');
      if (!select) return;
      card.dataset.crmDnDReady = 'true';
      const business = card.querySelector('.premium-lead-name')?.textContent?.trim() || 'lead';
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'crm-drag-handle';
      handle.textContent = '⠿';
      handle.setAttribute('aria-label', 'Drag ' + business + ' to another pipeline stage');
      handle.title = 'Drag to move · keyboard: focus card, use left/right arrows';
      handle.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
      handle.addEventListener('keydown', e => e.stopPropagation());
      card.prepend(handle);

      card.addEventListener('keydown', e => {
        if (!ownerOnly() || e.target !== card || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const current = stages.indexOf(select.value);
        const target = stages[current + (e.key === 'ArrowRight' ? 1 : -1)];
        if (!target) return;
        e.preventDefault();
        e.stopPropagation();
        moveByExistingControl(card, target);
      });

      handle.addEventListener('pointerdown', e => {
        if (!ownerOnly() || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = card.getBoundingClientRect();
        drag = { card, handle, business, rect, startX: e.clientX, startY: e.clientY, ghost: null, target: null };
        handle.setPointerCapture(e.pointerId);
      });
      handle.addEventListener('pointermove', e => {
        if (!drag || drag.handle !== handle) return;
        if (!drag.ghost && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) showGhost(e);
        if (drag.ghost) track(e);
      });
      handle.addEventListener('pointerup', e => {
        if (!drag || drag.handle !== handle) return;
        e.preventDefault();
        e.stopPropagation();
        const active = drag;
        if (active.ghost) track(e);
        const target = active.target;
        if (active.ghost && !reducedMotion()) {
          active.ghost.style.transition = 'opacity 160ms ease, transform 160ms ease';
          active.ghost.style.opacity = '0';
          active.ghost.style.transform = 'rotate(0) scale(.97)';
        }
        cleanup();
        if (target && target !== select.value) moveByExistingControl(card, target);
      });
      handle.addEventListener('pointercancel', cleanup);
      handle.addEventListener('lostpointercapture', () => {
        // Only a cancelled/aborted drag needs cleanup; normal pointerup already cleans.
        if (drag?.handle === handle) cleanup();
      });
    });
  }

  const observer = new MutationObserver(enhance);
  observer.observe(board, { childList: true });
  const bodyObserver = new MutationObserver(enhance);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  enhance();
})();
