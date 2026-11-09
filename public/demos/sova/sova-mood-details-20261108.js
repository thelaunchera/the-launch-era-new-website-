/* SOVA — five distinct listening-mood stories; in-page instead of raw image tabs. */
(() => {
  'use strict';
  if (document.documentElement.dataset.tleOneMotion !== 'sova') return;

  const moods = ['MUSIC', 'RELAX', 'VIBE', 'FOCUS', 'DREAM'];
  const stories = {
    en: {
      MUSIC: {
        headline: 'A soundtrack for everything.',
        description: 'Some songs turn an ordinary day into your favorite scene. MUSIC is for the playlists you know by heart, the tracks you discover by accident, and the moments you want to make completely yours.',
        moment: 'Your commute, a long walk, or the song you cannot stop replaying.',
        tags: ['EVERYDAY PLAYLISTS', 'DISCOVERY', 'ON REPEAT']
      },
      RELAX: {
        headline: 'Press play. Let go.',
        description: 'Slow the pace and make room for yourself. RELAX is the mood for quiet mornings, softer sounds, and those little rituals that help the rest of the world fade into the background.',
        moment: 'A slow morning, an afternoon reset, or unwinding after a full day.',
        tags: ['SLOW MORNINGS', 'SOFT SOUNDS', 'UNWIND']
      },
      VIBE: {
        headline: 'Turn the moment up.',
        description: 'The right track changes the energy of a room. VIBE is for getting ready, moving to the beat, and finding a reason to smile before the chorus even hits.',
        moment: 'Getting ready with friends, spontaneous dance breaks, and feel-good afternoons.',
        tags: ['GOOD ENERGY', 'FAVORITE BEATS', 'FEEL-GOOD']
      },
      FOCUS: {
        headline: 'Find your own frequency.',
        description: 'Make space for the ideas that need your attention. FOCUS is a listening ritual for finding your rhythm, following a thought, and giving your next big thing the time it deserves.',
        moment: 'Study sessions, creative projects, and the work you love getting lost in.',
        tags: ['STUDY', 'CREATIVE FLOW', 'YOUR RHYTHM']
      },
      DREAM: {
        headline: 'A little further from ordinary.',
        description: 'Not every listening moment needs a destination. DREAM is for cinematic playlists, wandering thoughts, and letting your imagination take the long way home.',
        moment: 'Evening reflections, late-night ideas, and music that takes you somewhere else.',
        tags: ['IMAGINATION', 'NIGHT PLAYLISTS', 'ESCAPE']
      }
    },
    es: {
      MUSIC: {
        headline: 'Una canción para cada momento.',
        description: 'Hay canciones que convierten un día cualquiera en tu escena favorita. MUSIC es para las playlists que conoces de memoria, los descubrimientos inesperados y los momentos que quieres hacer tuyos.',
        moment: 'El camino de todos los días, una caminata o esa canción que repites sin parar.',
        tags: ['TUS PLAYLISTS', 'DESCUBRIR', 'EN REPETICIÓN']
      },
      RELAX: {
        headline: 'Dale play. Suelta el día.',
        description: 'Baja el ritmo y regálate un espacio. RELAX es para las mañanas tranquilas, los sonidos suaves y esos pequeños rituales que te ayudan a desconectar del ruido cotidiano.',
        moment: 'Una mañana sin prisa, una pausa por la tarde o el final de un día intenso.',
        tags: ['SIN PRISA', 'SONIDOS SUAVES', 'DESCONECTAR']
      },
      VIBE: {
        headline: 'Súbele a este momento.',
        description: 'La canción correcta transforma cualquier ambiente. VIBE es para prepararte para salir, moverte con el ritmo y sonreír incluso antes de que llegue el coro.',
        moment: 'Alistarte con amistades, bailar de repente y llenar la tarde de energía.',
        tags: ['BUENA ENERGÍA', 'TUS RITMOS', 'DISFRUTAR']
      },
      FOCUS: {
        headline: 'Encuentra tu frecuencia.',
        description: 'Dale espacio a las ideas que merecen tu atención. FOCUS es un ritual musical para encontrar tu ritmo, seguir una inspiración y dedicarle tiempo a eso que quieres crear.',
        moment: 'Estudiar, desarrollar un proyecto creativo o concentrarte en una nueva idea.',
        tags: ['ESTUDIO', 'CREATIVIDAD', 'TU RITMO']
      },
      DREAM: {
        headline: 'Deja volar tu imaginación.',
        description: 'No todos los momentos necesitan un destino. DREAM es para canciones de película, pensamientos sin prisa y dejar que tu imaginación te lleve mucho más lejos.',
        moment: 'Reflexionar al atardecer, imaginar de noche y escuchar música que te transporta.',
        tags: ['IMAGINACIÓN', 'NOCHES', 'ESCAPAR']
      }
    }
  };

  const labels = {
    en: { eyebrow:'SOVA / THE LISTENING EDIT', occasion:'MADE FOR', back:'Back to all moods', next:'Next mood', close:'Close story', explore:'Explore', number:'LISTENING MOOD' },
    es: { eyebrow:'SOVA / ESCUCHA A TU MANERA', occasion:'IDEAL PARA', back:'Volver a las cinco', next:'Siguiente mood', close:'Cerrar historia', explore:'Explorar', number:'ESTILO DE ESCUCHA' }
  };
  let dialog = null;
  let currentMood = null;
  let previousFocus = null;

  function locale() {
    const selected = Array.from(document.querySelectorAll('.language-switch button'))
      .find(button => button.getAttribute('aria-pressed') === 'true');
    const name = selected?.textContent?.trim().toLowerCase();
    if (name === 'es' || name === 'español') return 'es';
    if (name === 'en' || name === 'english') return 'en';
    return (document.documentElement.lang || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  }

  function getCard(mood) {
    const index = moods.indexOf(mood);
    return document.querySelectorAll('#sova-moods .sova-people-card')[index] || null;
  }

  function ensureDialog() {
    if (dialog && dialog.isConnected) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'sova-mood-dialog';
    dialog.setAttribute('aria-labelledby', 'sova-mood-heading');
    dialog.setAttribute('aria-describedby', 'sova-mood-description');
    dialog.innerHTML = '<div class="sova-mood-layout">' +
      '<div class="sova-mood-visual"><img class="sova-mood-photo" alt="">' +
      '<span class="sova-mood-word" aria-hidden="true"></span>' +
      '<button type="button" class="sova-mood-x" data-sova-mood-close aria-label="Close">×</button></div>' +
      '<div class="sova-mood-body"><div class="sova-mood-top">' +
      '<p class="sova-mood-kicker"></p><p class="sova-mood-index"></p></div>' +
      '<h2 id="sova-mood-heading"></h2><p id="sova-mood-description"></p>' +
      '<div class="sova-mood-occasion"><strong></strong><p></p></div>' +
      '<div class="sova-mood-tags"></div>' +
      '<div class="sova-mood-buttons">' +
      '<button type="button" class="sova-mood-back" data-sova-mood-close></button>' +
      '<button type="button" class="sova-mood-next" data-sova-mood-next></button></div>' +
      '<span class="sova-mood-credit">SOVA · Powered by The Launch Era</span>' +
      '</div></div>';
    document.body.appendChild(dialog);

    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('[data-sova-mood-close]')) {
        dialog.close();
      } else if (event.target.closest('[data-sova-mood-next]') && currentMood) {
        showMood(moods[(moods.indexOf(currentMood) + 1) % moods.length]);
      }
    });
    dialog.addEventListener('close', () => {
      currentMood = null;
      if (previousFocus && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
      previousFocus = null;
    });
    return dialog;
  }

  function showMood(mood) {
    if (!moods.includes(mood)) return;
    const card = getCard(mood);
    if (!card) return;
    const target = ensureDialog();
    const lang = locale();
    const data = stories[lang][mood];
    const copy = labels[lang];
    const index = moods.indexOf(mood);
    const photograph = card.querySelector('img');
    const modalPhoto = target.querySelector('.sova-mood-photo');
    modalPhoto.src = photograph?.src || card.href;
    modalPhoto.alt = photograph?.alt || mood;
    target.querySelector('.sova-mood-word').textContent = mood;
    target.querySelector('.sova-mood-kicker').textContent = copy.eyebrow;
    target.querySelector('.sova-mood-index').textContent = String(index+1).padStart(2,'0') + ' / 05 · ' + mood;
    target.querySelector('#sova-mood-heading').textContent = data.headline;
    target.querySelector('#sova-mood-description').textContent = data.description;
    target.querySelector('.sova-mood-occasion strong').textContent = copy.occasion;
    target.querySelector('.sova-mood-occasion p').textContent = data.moment;
    const tags = target.querySelector('.sova-mood-tags');
    tags.replaceChildren();
    data.tags.forEach(value => {
      const tag = document.createElement('span');
      tag.textContent = value;
      tags.appendChild(tag);
    });
    target.querySelector('.sova-mood-back').textContent = copy.back;
    target.querySelector('.sova-mood-next').textContent = copy.next + ' →';
    target.querySelector('.sova-mood-x').setAttribute('aria-label', copy.close);
    currentMood = mood;
    if (!target.open) {
      previousFocus = document.activeElement;
      if (typeof target.showModal === 'function') target.showModal();
      else target.setAttribute('open', '');
    }
    target.scrollTop = 0;
  }

  function refreshLabels() {
    const lang = locale();
    document.querySelectorAll('#sova-moods .sova-people-card').forEach((card, index) => {
      if (moods[index]) card.setAttribute('aria-label', labels[lang].explore + ' ' + moods[index]);
    });
    if (currentMood && dialog?.open) showMood(currentMood);
  }

  function start() {
    document.addEventListener('click', event => {
      const card = event.target.closest?.('#sova-moods .sova-people-card');
      if (card && !event.defaultPrevented) {
        const index = Array.prototype.indexOf.call(card.parentNode.children, card);
        if (moods[index]) {
          event.preventDefault();
          showMood(moods[index]);
        }
        return;
      }
      if (event.target.closest?.('.language-switch')) {
        window.setTimeout(refreshLabels, 0);
      }
    });

    const root = document.getElementById('app');
    if (root) {
      const observer = new MutationObserver(() => {
        if (document.querySelector('#sova-moods')) refreshLabels();
      });
      observer.observe(root, {childList:true, subtree:false});
    }
    refreshLabels();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
