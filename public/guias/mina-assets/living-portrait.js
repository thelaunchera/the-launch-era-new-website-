// ===== LIVING PORTRAIT =====
// A photo-like head on a soft sheet. Every expression, gaze and blink is a separately generated
// picture of the same face; the code only decides which one to show and makes the skin move.
(() => {
  const P = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_';
  const SHEETW = innerWidth < 760 ? 640 : 1024;
  const url = id => P + id + '.png&w=' + SHEETW + '&q=90';
  const IDS = {"left":"20261031_041539_0c28e75d-625c-458f-8856-6b453a928025","closed":"20261031_041538_8fc82176-77a6-4184-8f32-945745b2f221","shock":"20261031_041539_ee462c23-6248-4ef8-83d4-807441048b67","tongue":"20261031_041539_75259b31-bca1-4dcd-adb9-31a25fa07a11","right":"20261031_041648_92b934ff-4d25-4e28-972f-cef1e88f054f","downleft":"20261031_041648_94ec5df2-86e4-481d-a104-6604cd3ee36b","upright":"20261031_041648_8de72dda-4c29-4d52-a259-acb682b21567","up":"20261031_041648_736f4839-4571-4677-898f-c5f64bfeb525","downright":"20261031_041649_eed87373-0d0c-4401-ab76-ad8da40421d3","down":"20261031_041649_143660e6-f71a-4874-b97f-fb8890d5b1a1","half":"20261031_041704_053e92a5-721a-4f93-86d8-631c1b8ea31a","cross":"20261031_041705_dc163465-5cfa-40c1-8c43-76c5deb789a0","angry":"20261031_041706_bc89f0b6-438d-46fc-86bd-d3ae08b1a561","scrunch":"20261031_041706_87b48b08-cc37-4278-96c2-8ac49d48a165","winkr":"20261031_041705_f622e78c-2c3d-4635-b4ac-bab0e5b2862a","winkl":"20261031_041705_df901488-4988-4b29-9517-44d417ead6f2","raised":"20261031_041705_53d6bed3-91ae-47f4-a306-6615fc30c3a7","puff":"20261031_041721_69a2bd4b-a663-4638-9fe1-952d640726e5","laugh":"20261031_041722_402f7a03-a57c-418c-a513-65d5ee89aecf","yawn":"20261031_041726_3ccd0f66-112a-408b-870d-84a73b907211","grin":"20261031_041722_14bedc29-1d7e-407f-800c-f8a584be9743","kiss":"20261031_041722_c9dfa379-7ad7-469a-a7a1-2207ea3b2132","cry":"20261031_041725_ab6d29ed-9c51-4d18-9a19-15161a42b914","smug":"20261031_041726_941343db-f191-42e2-a20d-76471622963b","scared":"20261031_041742_76d19aad-5f53-4657-bda1-ed0ba07d0919","fish":"20261031_041738_1b8b311f-0b40-4014-9301-f855cadf7775","blue":"20261031_041743_0d2ae3ce-1ef4-4e25-bde2-f850d836a452","dizzy":"20261031_041739_d2d94cc6-c8a8-4948-b160-433b4ee8d335","blonde":"20261031_041745_54be8d58-68ad-4cdc-b894-57f3820521fc","pink":"20261031_041742_b07d9eeb-d0c2-4684-bd82-dd0a34faae70","wind":"20261031_041748_a042c812-0a19-4c44-8e26-19ebba49d827","sse":"20261031_041847_06cd56a3-85a3-428f-9761-40f0455fea28","nnw":"20261031_041848_c954304f-6a0f-40e7-90a7-61e760ec3217","ese":"20261031_041848_cf01800b-186c-4534-b3fa-839000a9ab40","ene":"20261031_041848_5baf5c75-5af4-43cc-9e36-6d5bb7268cc9","wnw":"20261031_041848_9b609e34-57f0-47f0-a733-270f3d487766","ssw":"20261031_041848_08ae5fa2-0ba2-43b3-948c-dcde293d6957","wsw":"20261031_041849_84482741-9730-4a28-be2f-e85c04206a2d","ouch":"20261031_041903_1df48a13-6d25-42e4-9666-f762bc338f2a","deadpan":"20261031_041904_18bc71c8-d88a-4c12-9e43-82b8ac222b00","yawn1":"20261031_041904_3b68d48d-633a-4761-9af7-e574da308039","yawn2":"20261031_041904_7027967a-59be-4eec-b6e1-6ec2255df748","whistle1":"20261031_041905_03626778-4a7a-4bd8-9136-658e44c36fe3","nne":"20261031_041903_73a000c6-37b6-48a1-a60a-628954160c41","yawn4":"20261031_041905_66ce2f38-8e7d-4ade-b678-9020af378b08","sneeze1":"20261031_041920_d4fee90e-7fb7-43ff-b378-bc549653f68d","gum1":"20261031_041921_3c249ba4-f88e-49f5-b985-c7380ec5c91a","gum2":"20261031_041922_8d65cee5-5d05-4c89-a3c9-8a397c060e04","whistle2":"20261031_041920_ba051a0a-45bb-4004-b0e6-73d2cd519d71","sneeze2":"20261031_041920_f30e74cb-21f3-4f11-8b9d-e4a1f469307e","gum3":"20261031_041923_a427c4d9-f78a-41e5-acd6-91adc3c79025","gumpop":"20261031_041926_358ed853-58d5-45c0-bcb6-f052169c6f2d","hearts":"20261031_041938_b3929b4d-e3d9-4e5d-8cd0-7ec8ef5248ba","stars":"20261031_041940_4128a9d8-9ce2-4b51-a8b7-84cdcb0b4f12","snore":"20261031_041936_e5a6759e-7dd8-4425-a913-98ac6633603f","shy":"20261031_041937_7f0eff0c-37ce-4d0c-9f5d-547d75e45e93","sick":"20261031_041941_59aa6c28-2fc5-40d7-bb9a-699fd8539d59","rest":"20261031_040619_2f6f349e-a4a7-40db-8e9b-03b6acd8b99a"};

  // Sixteen gaze sectors, using the supplied northwest frame for its neighboring sector.
  const RING = ['e', 'ene', 'ne', 'nne', 'n', 'nnw', 'nw', 'wnw', 'w', 'wsw', 'sw', 'ssw', 's', 'sse', 'se', 'ese'];
  const EYEFILE = {e: 'right', ene: 'ene', ne: 'upright', nne: 'nne', n: 'up', nnw: 'nnw', nw: 'wnw', wnw: 'wnw', w: 'left', wsw: 'wsw', sw: 'downleft', ssw: 'ssw', s: 'down', sse: 'sse', se: 'downright', ese: 'ese', half: 'half', closed: 'closed'};
  const HAIRS = ['pink', 'blue', 'blonde'];

  const OVER = 1.7, N = 72, M = N + 1, SPAN = OVER / N, ORIGIN = .5 - OVER / 2;
  const WOBBLE = 2.3 * 2 * Math.PI, REACH = .085 / SPAN, C = REACH * WOBBLE, GAMMA = 2 * .14 * WOBBLE, NU = .2 * C;
  const wrap = document.getElementById('magnetWrap'), canvas = document.getElementById('faceGl');
  const fallback = document.getElementById('faceFallback');
  const fly = document.getElementById('faceFly'), hand = document.getElementById('faceHand');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = canvas?.getContext('webgl', {alpha: true, premultipliedAlpha: true, antialias: true});
  if (!gl || reduced) return;
  window.__faceEngine = true;

  const VS = `attribute vec2 a, d; attribute float s; varying vec2 vUv; varying float vS;
    uniform vec2 lean; uniform float overS;
    void main(){ vUv = a; vS = s; vec2 p = a + d + lean; gl_Position = vec4(vec2(p.x-.5, .5-p.y)*2./overS, 0., 1.); }`;
  const FS = `precision mediump float; varying vec2 vUv; varying float vS;
    uniform sampler2D faceA, faceB;
    uniform float fade;
    void main(){
      if(vUv.x<0.||vUv.y<0.||vUv.x>1.||vUv.y>1.){ gl_FragColor = vec4(0.); return; }
      vec4 c = mix(texture2D(faceA,vUv), texture2D(faceB,vUv), fade);
      if(c.a<.004){ gl_FragColor = vec4(0.); return; }
      gl_FragColor = vec4(c.rgb*vS, c.a);
    }`;
  const sh = (t, s) => {
    const shader = gl.createShader(t);
    gl.shaderSource(shader, s);
    gl.compileShader(shader);
    return shader;
  };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const U = {over_: gl.getUniformLocation(pr, 'overS')};
  for (const n of ['lean', 'faceA', 'faceB', 'fade']) U[n] = gl.getUniformLocation(pr, n);
  gl.uniform1f(U.over_, OVER);
  gl.uniform1i(U.faceA, 0); gl.uniform1i(U.faceB, 1);

  // The sheet uses a damped wave equation on each node's displacement.
  const count = M * M, ux = new Float32Array(count), uy = new Float32Array(count), vx = new Float32Array(count), vy = new Float32Array(count);
  const rest = new Float32Array(count * 2), dyn = new Float32Array(count * 3);
  const sx = new Float32Array(count), sy = new Float32Array(count);
  for (let j = 0, k = 0; j < M; j++) for (let i = 0; i < M; i++) { rest[k++] = ORIGIN + i * SPAN; rest[k++] = ORIGIN + j * SPAN; }
  const idx = new Uint16Array(N * N * 6);
  for (let j = 0, k = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = j * M + i, b = a + 1, c = a + M, d = c + 1;
    idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, rest, gl.STATIC_DRAW);
  const aa = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(aa); gl.vertexAttribPointer(aa, 2, gl.FLOAT, false, 0, 0);
  const dynBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf); gl.bufferData(gl.ARRAY_BUFFER, dyn, gl.DYNAMIC_DRAW);
  const ad = gl.getAttribLocation(pr, 'd'), as = gl.getAttribLocation(pr, 's');
  gl.enableVertexAttribArray(ad); gl.vertexAttribPointer(ad, 2, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(as); gl.vertexAttribPointer(as, 1, gl.FLOAT, false, 12, 8);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

  let brush = null;
  function takeHold(u, v, radius = .22) {
    const list = [];
    for (let k = 0; k < count; k++) {
      const dx = rest[k * 2] + ux[k] - u, dy = rest[k * 2 + 1] + uy[k] - v, w = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
      if (w > .02) list.push([k, w, ux[k], uy[k]]);
    }
    brush = {u, v, list, px: 0, py: 0, distance: 0};
  }

  // Reorder every row and column before rendering to keep neighboring nodes apart.
  const GAP = SPAN * .34, lineA = new Float32Array(M), lineB = new Float32Array(M), lineP = new Float32Array(M);
  function order(start, stride, field, base) {
    for (let i = 0; i < M; i++) { const k = start + i * stride; lineP[i] = base[k] + field[k]; }
    lineA[0] = lineP[0]; for (let i = 1; i < M; i++) lineA[i] = Math.max(lineP[i], lineA[i - 1] + GAP);
    lineB[N] = lineP[N]; for (let i = N - 1; i >= 0; i--) lineB[i] = Math.min(lineP[i], lineB[i + 1] - GAP);
    for (let i = 0; i < M; i++) { const k = start + i * stride; field[k] = (lineA[i] + lineB[i]) / 2 - base[k]; }
  }
  const restX = new Float32Array(count), restY = new Float32Array(count);
  for (let k = 0; k < count; k++) { restX[k] = rest[k * 2]; restY[k] = rest[k * 2 + 1]; }
  function untangle() {
    for (let pass = 0; pass < 2; pass++) {
      for (let j = 0; j < M; j++) order(j * M, 1, sx, restX);
      for (let i = 0; i < M; i++) order(i, M, sy, restY);
    }
  }

  const H = 1 / 240; let simLeft = 0;
  function step(dt) {
    const c2 = C * C, wo2 = WOBBLE * WOBBLE;
    for (let j = 1; j < N; j++) for (let i = 1; i < N; i++) {
      const k = j * M + i, l = k - 1, r = k + 1, t = k - M, b = k + M;
      const lx = ux[l] + ux[r] + ux[t] + ux[b] - 4 * ux[k], ly = uy[l] + uy[r] + uy[t] + uy[b] - 4 * uy[k];
      const lvx = vx[l] + vx[r] + vx[t] + vx[b] - 4 * vx[k], lvy = vy[l] + vy[r] + vy[t] + vy[b] - 4 * vy[k];
      vx[k] += (c2 * lx - wo2 * ux[k] - GAMMA * vx[k] + NU * lvx) * dt;
      vy[k] += (c2 * ly - wo2 * uy[k] - GAMMA * vy[k] + NU * lvy) * dt;
    }
    if (brush) for (const [k, w, u0, v0] of brush.list) {
      const K = 3000 * w, D = 90 * w;
      vx[k] += ((u0 + brush.px * w - ux[k]) * K - vx[k] * D) * dt;
      vy[k] += ((v0 + brush.py * w - uy[k]) * K - vy[k] * D) * dt;
    }
    for (let k = 0; k < count; k++) { ux[k] += vx[k] * dt; uy[k] += vy[k] * dt; }
  }
  function poke(u, v, dx, dy, radius = .09) {
    for (let k = 0; k < count; k++) {
      const ax = rest[k * 2] - u, ay = rest[k * 2 + 1] - v, w = Math.exp(-(ax * ax + ay * ay) / (radius * radius));
      vx[k] += dx * w; vy[k] += dy * w;
    }
  }
  function pullToward(u, v) {
    if (!brush) return;
    const dx = u - brush.u, dy = v - brush.v, distance = Math.hypot(dx, dy), limit = .24;
    const scale = distance ? limit * (1 - Math.exp(-distance / limit)) / distance : 0;
    brush.distance = distance;
    brush.px = dx * scale;
    brush.py = dy * scale;
  }

  const tex = {};
  const param = () => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const load = name => new Promise(res => {
    const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = url(IDS[name]);
  });
  function upload(name, img) {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); param(); tex[name] = t;
  }
  function hitMap(img) {
    const a = document.createElement('canvas'); a.width = a.height = 128;
    const ac = a.getContext('2d', {willReadFrequently: true});
    ac.drawImage(img, 0, 0, 128, 128);
    alphaMap = ac.getImageData(0, 0, 128, 128).data;
  }

  const SPOT = {nose: [.5, .54], cheekR: [.66, .57]};
  // [picture or eye cell, crossfade ms, hold ms, extras]
  const ACTS = {
    yawn: [['yawn1', 140, 240], ['yawn2', 140, 200], ['yawn', 170, 900], ['yawn2', 150, 130], ['yawn4', 180, 700]],
    whistle: [['whistle1', 150, 700], ['whistle2', 100, 700], ['whistle1', 100, 620], ['whistle2', 100, 620]],
    shifty: [['eye:w', 60, 520], ['eye:e', 60, 600], ['eye:w', 60, 400], ['eye:rest', 60, 260]],
    roll: [['eye:w', 70, 200], ['eye:wnw', 50, 55], ['eye:nw', 50, 55], ['eye:nnw', 50, 60], ['eye:n', 50, 140], ['eye:nne', 50, 60], ['eye:ne', 50, 55], ['eye:ene', 50, 55], ['eye:e', 50, 240], ['eye:rest', 90, 200], ['deadpan', 120, 700]],
    sneeze: [['sneeze1', 130, 380], ['half', 90, 120], ['sneeze1', 90, 560], ['sneeze2', 50, 300, {jolt: [.5, .6, 0, 1.5, .34], lean: [0, .03]}], ['dizzy', 110, 620], ['shy', 140, 650]],
    gum: [['gum1', 130, 800], ['gum2', 180, 460], ['gum3', 200, 760], ['gumpop', 40, 1300, {jolt: [.5, .63, 0, -1.1, .3]}], ['deadpan', 200, 700], ['laugh', 130, 700]],
    doze: [['half', 450, 700, {lean: [.006, .006]}], ['closed', 320, 500, {lean: [.012, .012]}], ['half', 200, 340], ['closed', 400, 1100, {lean: [.02, .02]}], ['snore', 260, 3400, {lean: [.03, .03]}], ['shock', 50, 650, {jolt: [.5, .5, 0, -.9, .3]}]],
    flirt: [['smug', 130, 520], ['winkr', 80, 420], ['kiss', 120, 560], ['hearts', 120, 900], ['shy', 160, 620]],
    cheeky: [['winkl', 90, 340], ['tongue', 110, 900], ['grin', 120, 620]],
    cross: [['cross', 140, 800], ['fish', 130, 800], ['puff', 120, 700, {jolt: [.5, .6, 0, -.25, .3]}], ['laugh', 90, 800]],
    sad: [['raised', 140, 500], ['cry', 240, 1500], ['shy', 200, 520]],
    wow: [['stars', 130, 1000], ['grin', 140, 640]],
    fly: 'fly', tug: 'tug', hair: 'hair'
  };
  const ROTATION = ['yawn', 'shifty', 'gum', 'fly', 'flirt', 'roll', 'sneeze', 'hair', 'tug', 'cross', 'whistle', 'doze', 'cheeky', 'wow', 'sad'];
  const ZONES = {
    hover: {eyeL: 'winkl', eyeR: 'winkr', nose: 'cross', mouth: 'kiss'},
    tap: {brow: 'angry', eyeL: 'ouch', eyeR: 'ouch', nose: 'act:sneeze', mouth: 'tongue', cheek: 'puff', chin: 'laugh'}
  };
  const zoneAt = (u, v) => {
    const a = (u - .505) / .225, b = (v - .485) / .33;
    if (a * a + b * b > 1 || v < .23) return 'hair';
    if (v < .385) return 'brow';
    if (Math.abs(v - .455) < .05 && u > .33 && u < .455) return 'eyeL';
    if (Math.abs(v - .455) < .05 && u > .545 && u < .67) return 'eyeR';
    if (Math.abs(u - .5) < .055 && v < .6) return 'nose';
    if (v > .6 && v < .71 && Math.abs(u - .5) < .1) return 'mouth';
    return v > .71 ? 'chin' : 'cheek';
  };

  let ready = false, alphaMap = null, tStart = 0, last = performance.now();
  let pu = .5, pv = .5, onHead = false, zone = null, zoneSince = 0;
  let lastInput = -1e9, awake = false, openingUntil = 0, pressed = null, downAt = 0, downU = 0, downV = 0;
  let lastPoint = null, speed = 0, shake = 0;
  let moodFace = null, moodUntil = 0, pulls = [], lookAt = null;
  let act = null, actI = 0, actT = 0, idleAct = false, rotation = [], nextIdle = idleDelay();
  let faceA = 'rest', faceB = 'rest', fadeT = 0, fadeMs = 1;
  let logical = 'rest', logicalMs = 70, eyeNow = 'rest', eyeNowMs = 40;
  let nextBlink = 0, blinkStep = -1, blinkT = 0;
  let leanX = 0, leanY = 0, lvX = 0, lvY = 0, wantLean = [0, 0];
  let hairI = -1;
  const fileOf = cell => cell === 'rest' ? 'rest' : EYEFILE[cell];
  const setFace = (n, ms) => { logical = n; logicalMs = ms; };
  const setEye = (cell, ms) => { if (tex[fileOf(cell)]) { eyeNow = cell; eyeNowMs = ms; } };
  function show(n, ms, now) {
    if (!tex[n] || n === faceB) return;
    faceA = (now - fadeT) / fadeMs > .5 ? faceB : faceA;
    faceB = n; fadeT = now; fadeMs = Math.min(70, Math.max(1, ms));
  }
  function compose(now) {
    if (logical !== 'rest') show(logical, logicalMs, now);
    else if (hairI >= 0 && !act) show(HAIRS[hairI], 70, now);
    else show(fileOf(eyeNow), eyeNowMs, now);
  }
  const ringFor = (dx, dy) => RING[Math.round(((Math.atan2(-dy, dx) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 8)) % 16];

  function startAct(name, now, idle = false) {
    endAct();
    const a = ACTS[name];
    if (a === 'fly') act = flyAct(); else if (a === 'tug') act = tugAct(); else if (a === 'hair') act = hairAct(); else act = a;
    idleAct = idle;
    actI = -1; advance(now);
  }
  function endAct() {
    act = null; idleAct = false; wantEyes = null; wantLean = [0, 0];
    fly.style.opacity = 0; hand.style.opacity = 0; lookAt = null; handGrip = false;
    if (handHeld) { handHeld = false; brush = null; }
  }
  function advance(now) {
    actI++;
    if (!act || actI >= act.length) { endAct(); return; }
    const [picture, fade, , x] = act[actI]; actT = now;
    if (picture.startsWith('eye:')) { setFace('rest', fade); wantEyes = picture.slice(4); }
    else if (picture === 'half' || picture === 'closed') { setFace('rest', fade); wantEyes = picture; }
    else { wantEyes = null; setFace(picture, fade); }
    wantLean = x?.lean || [0, 0];
    if (x?.jolt) poke(...x.jolt);
    if (x?.call) x.call(now);
  }
  let wantEyes = null, handHeld = false, handFrom = [1.4, .9], handTo = [1.4, .9], flyFrom = [1.4, 0], flyTo = [1.4, 0], moveT = 0, moveMs = 1;
  const place = (el, u, v) => { el.style.left = (u * 100) + '%'; el.style.top = (v * 100) + '%'; };
  const moveHand = (u, v, ms) => now => { handFrom = handTo; handTo = [u, v]; moveT = now; moveMs = ms; };
  const moveFly = (u, v, ms) => now => { flyFrom = flyTo; flyTo = [u, v]; moveT = now; moveMs = ms; };
  function flyAct() {
    flyTo = [1.35, .02]; fly.style.opacity = 1; lookAt = () => flyPos;
    const hop = (u, v, ms) => ['rest', 40, ms, {call: moveFly(u, v, ms * .9)}];
    return [hop(.92, .2, 620), hop(.1, .32, 680), hop(.9, .66, 640), hop(.16, .62, 600), hop(...SPOT.nose, 520),
      ['cross', 110, 950, {jolt: [.5, .54, 0, .28, .05]}],
      ['whistle1', 90, 340, {call: moveFly(.5, .3, 280)}], ['deadpan', 110, 480, {call: moveFly(...SPOT.nose, 320)}],
      ['cross', 90, 560, {jolt: [.5, .54, 0, .28, .05]}],
      ['whistle2', 90, 620, {call: moveFly(1.5, -.35, 600)}], ['smug', 120, 600]];
  }
  function tugAct() {
    handTo = [1.3, .86]; hand.style.opacity = 1; hand.classList.remove('shut');
    const g = (u, v, ms, face, grip) => [face, 90, ms, {call: now => { moveHand(u, v, ms * .8)(now); handGrip = grip; }}];
    return [g(...SPOT.cheekR, 760, 'eye:se', false), g(...SPOT.cheekR, 240, 'shock', 'on'),
      g(.95, .5, 620, 'ouch', 'pull'), g(.86, .56, 240, 'ouch', 'pull'), g(.98, .48, 240, 'ouch', 'pull'), g(.9, .52, 260, 'ouch', 'pull'),
      g(1.4, .22, 1000, 'dizzy', 'off'), ['angry', 120, 620]];
  }
  let handGrip = false;
  function hairAct() { return [['pink', 70, 950], ['blue', 70, 850], ['blonde', 70, 950], ['rest', 70, 200]]; }

  const toUv = (x, y) => {
    const r = canvas.getBoundingClientRect();
    return [((x - r.left) / r.width - .5) * OVER + .5, ((y - r.top) / r.height - .5) * OVER + .5];
  };
  const solid = (u, v) => alphaMap && u >= 0 && v >= 0 && u < 1 && v < 1 && alphaMap[((v * 128 | 0) * 128 + (u * 128 | 0)) * 4 + 3] > 40;
  function idleDelay() { return 30000 + Math.random() * 15000; }
  function activity(now, opensEyes = true) {
    lastInput = now;
    nextIdle = idleDelay();
    if (idleAct) endAct();
    if (!awake && opensEyes) {
      awake = true; openingUntil = now + 125; nextBlink = now + 2200 + Math.random() * 3400;
    }
  }

  addEventListener('pointermove', e => {
    if (pressed !== null && e.pointerId !== pressed) return;
    const now = performance.now();
    const dx = lastPoint ? e.clientX - lastPoint[0] : 0, dy = lastPoint ? e.clientY - lastPoint[1] : 0;
    lastPoint = [e.clientX, e.clientY];
    [pu, pv] = toUv(e.clientX, e.clientY);
    speed += Math.hypot(dx, dy) * .004;
    activity(now);
    onHead = solid(pu, pv);
    const z = onHead && e.pointerType !== 'touch' ? zoneAt(pu, pv) : null;
    if (z !== zone) { zone = z; zoneSince = now; }
    wrap.style.cursor = pressed !== null ? 'grabbing' : onHead ? 'grab' : '';
    if (onHead && pressed === null) poke(pu, pv, dx * .00035, dy * .00035, .07);
    if (pressed !== null) pullToward(pu, pv);
  });
  wrap.addEventListener('pointerdown', e => {
    const now = performance.now(), [u, v] = toUv(e.clientX, e.clientY);
    if (pressed !== null || e.button !== 0 || !solid(u, v)) return;
    activity(now); endAct();
    pressed = e.pointerId; downAt = now; downU = u; downV = v;
    takeHold(u, v); moodFace = null; wrap.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  function release(e) {
    if (pressed !== e.pointerId || !brush) return;
    const now = performance.now(), L = brush.distance, z = zoneAt(downU, downV), held = now - downAt;
    pressed = null; brush = null; wrap.style.cursor = onHead ? 'grab' : '';
    activity(now);
    if (e.type !== 'pointerup') return;
    pulls = pulls.filter(t => now - t < 14000);
    if (L < .03 && held < 380) {
      if (z === 'hair') hairI = hairI + 1 >= HAIRS.length ? -1 : hairI + 1;
      else {
        const reaction = ZONES.tap[z];
        if (reaction.startsWith('act:')) startAct(reaction.slice(4), now);
        else { moodFace = reaction; moodUntil = now + 1100; }
        poke(downU, downV, 0, .5, .06);
      }
      return;
    }
    if (L < .03) return;
    pulls.push(now);
    const n = pulls.length;
    moodFace = n >= 8 ? 'cry' : n >= 5 ? 'angry' : L > .28 ? 'dizzy' : 'scrunch';
    moodUntil = now + (n >= 5 ? 2600 : 700 + L * 1800);
  }
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  wrap.addEventListener('lostpointercapture', release);
  document.documentElement.addEventListener('pointerleave', () => { zone = null; lastPoint = null; });
  addEventListener('pointerdown', () => activity(performance.now(), false));
  addEventListener('keydown', () => activity(performance.now(), false));
  document.querySelectorAll('.contact-btn').forEach(b => {
    b.addEventListener('pointerenter', () => {
      const now = performance.now(); activity(now); endAct(); moodFace = 'hearts'; moodUntil = Infinity;
    });
    b.addEventListener('pointerleave', () => { moodFace = 'grin'; moodUntil = performance.now() + 700; });
  });
  let lastScroll = scrollY, scrollUntil = 0;
  addEventListener('scroll', () => {
    const now = performance.now();
    if (Math.abs(scrollY - lastScroll) > 2) { scrollUntil = now + 500; lastScroll = scrollY; }
    activity(now, false);
  }, {passive: true});

  let flyPos = [1.4, 0], visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, {threshold: 0}).observe(wrap);
  new ResizeObserver(() => {
    const r = Math.min(devicePixelRatio || 1, 2), b = canvas.getBoundingClientRect();
    canvas.width = b.width * r; canvas.height = b.height * r;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }).observe(canvas);
  canvas.addEventListener('webglcontextlost', () => {
    ready = false;
    fallback.style.visibility = 'visible';
  });

  function frame(now) {
    if (!ready) return;
    requestAnimationFrame(frame);
    const dt = Math.min(.04, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    const f = r => 1 - Math.exp(-dt * r);
    speed *= Math.exp(-dt * 6); shake += ((speed > 1.5 ? 1 : 0) - shake) * f(speed > 1.5 ? 1.2 : .9);

    if (act) { if (now - actT > act[actI][2]) advance(now); }
    else if (pressed === null && now > moodUntil && tStart && now - Math.max(lastInput, tStart) > nextIdle) {
      if (!rotation.length) rotation = [...ROTATION];
      startAct(rotation.shift(), now, true);
      lastInput = now; nextIdle = idleDelay();
    }

    if (act) {
      const mk = Math.min(1, (now - moveT) / moveMs), me = mk * mk * (3 - 2 * mk);
      if (lookAt) {
        const drift = mk >= 1 ? .15 : 1;
        flyPos = [flyFrom[0] + (flyTo[0] - flyFrom[0]) * me + Math.sin(now * .02) * .012 * drift, flyFrom[1] + (flyTo[1] - flyFrom[1]) * me + Math.cos(now * .027) * .012 * drift];
        place(fly, flyPos[0], flyPos[1]);
      }
      if (handGrip) {
        const hp = [handFrom[0] + (handTo[0] - handFrom[0]) * me, handFrom[1] + (handTo[1] - handFrom[1]) * me];
        place(hand, hp[0], hp[1]);
        if (handGrip === 'on' && !handHeld) { takeHold(hp[0], hp[1]); handHeld = true; hand.classList.add('shut'); handGrip = 'pull'; }
        if (handHeld) pullToward(hp[0], hp[1]);
        if (handGrip === 'off' && handHeld) { handHeld = false; brush = null; hand.classList.remove('shut'); }
      } else if (hand.style.opacity === '1') {
        place(hand, handFrom[0] + (handTo[0] - handFrom[0]) * me, handFrom[1] + (handTo[1] - handFrom[1]) * me);
      }
    }

    let want = 'rest';
    const pull = brush?.distance || 0;
    if (act) want = null;
    else if (pressed !== null) want = pull > .24 ? 'scared' : pull > .1 ? 'ouch' : pull > .02 ? 'shock' : 'rest';
    else if (moodFace && now < moodUntil) want = moodFace;
    else if (shake > .55) want = shake > .92 ? 'sick' : 'wind';
    else if (now >= openingUntil && zone && now - zoneSince > 80 && ZONES.hover[zone]) want = ZONES.hover[zone];
    if (want) setFace(want, want === 'rest' ? 110 : 90);

    if (logical === 'rest') {
      if (wantEyes) setEye(wantEyes, 60);
      else if (now < openingUntil) setEye('half', 45);
      else if (!awake && !act) setEye('closed', 70);
      else if (blinkStep >= 0) {
        const s = (now - blinkT) / 62 | 0;
        if (s !== blinkStep) { blinkStep = s; if (s === 0) setEye('half', 20); else if (s === 1) setEye('closed', 20); else if (s === 2) setEye('half', 20); else blinkStep = -1; }
      } else {
        let target;
        if (lookAt) { const p = lookAt(); target = [p[0] - .5, p[1] - .46]; }
        else if (now < scrollUntil) target = [0, 1];
        else target = [pu - .5, pv - .46];
        setEye(Math.hypot(target[0], target[1]) < .13 ? 'rest' : ringFor(target[0], target[1]), 50);
        if (awake && !act && now > nextBlink) {
          blinkStep = 0; blinkT = now; setEye('half', 20);
          nextBlink = now + 2200 + Math.random() * 3400;
        }
      }
    }
    compose(now);

    const clamp = x => Math.max(-1, Math.min(1, x));
    const tx = (pressed !== null || handHeld ? (brush ? brush.px * .16 : 0) : awake ? clamp(pu - .5) * .012 : 0) + wantLean[0] + Math.sin(now * .0009) * .0015;
    const ty = (pressed !== null || handHeld ? (brush ? brush.py * .16 : 0) : awake ? clamp(pv - .46) * .008 : 0) + wantLean[1] + Math.sin(now * .0013) * .0022;
    lvX += ((tx - leanX) * 70 - lvX * 8) * dt; lvY += ((ty - leanY) * 70 - lvY * 8) * dt;
    leanX += lvX * dt; leanY += lvY * dt;

    simLeft += dt;
    let steps = 0;
    while (simLeft >= H && steps < 9) { step(H); simLeft -= H; steps++; }
    if (steps === 9) simLeft %= H;
    for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
      const k = j * M + i, edge = i === 0 || j === 0 || i === N || j === N;
      sx[k] = edge ? ux[k] : (ux[k] * 4 + ux[k - 1] + ux[k + 1] + ux[k - M] + ux[k + M]) / 8;
      sy[k] = edge ? uy[k] : (uy[k] * 4 + uy[k - 1] + uy[k + 1] + uy[k - M] + uy[k + M]) / 8;
    }
    untangle();
    for (let k = 0, o = 0; k < count; k++) {
      dyn[o++] = sx[k]; dyn[o++] = sy[k];
      const r = k % M, c = k / M | 0;
      let shade = 1;
      if (r > 0 && r < N && c > 0 && c < N) shade = Math.max(.86, Math.min(1.16, 1 - ((sx[k + 1] - sx[k - 1]) + (sy[k + M] - sy[k - M])) * 1.8));
      dyn[o++] = shade;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[faceA] || tex.rest);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[faceB] || tex.rest);
    gl.uniform1f(U.fade, Math.min(1, (now - fadeT) / fadeMs));
    gl.uniform2f(U.lean, leanX, leanY);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    fallback.style.visibility = 'hidden';
  }

  (async () => {
    const take = async name => { const img = await load(name); if (img) upload(name, img); return img; };
    const [base] = await Promise.all(['rest', 'closed', 'half'].map(take));
    if (!base) return;
    hitMap(base);
    if (tex.closed && !awake) faceA = faceB = 'closed';
    ready = true; tStart = performance.now(); requestAnimationFrame(frame);
    const early = ['right', 'left', 'down', 'up', 'winkl', 'winkr', 'cross', 'kiss', 'hearts', 'grin'];
    const names = [...early, ...Object.keys(IDS).filter(n => !['rest', 'closed', 'half', ...early].includes(n))];
    let i = 0;
    await Promise.all(Array.from({length: 6}, async () => { while (i < names.length) await take(names[i++]); }));
  })();
})();
