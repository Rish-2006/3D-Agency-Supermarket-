/* global THREE, gsap */

// ─── CURSOR ──────────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
  ring.style.left   = rx + 'px'; ring.style.top   = ry + 'px';
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a, button, .product-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    ring.style.opacity = '0';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.opacity = '1';
  });
});

// ─── TICKER ──────────────────────────────────────────────────────────────────
const tickerWords = [
  'Brand Identity','Web Design','Motion Graphics','Strategy',
  'Packaging','UI / UX','Creative Direction','Copywriting',
  'Photography','Campaign Design'
];
const ti   = document.getElementById('tickerInner');
const html = tickerWords.map(w => `<b>${w}</b><span>✦</span>`).join('');
ti.innerHTML = html + html; // duplicate for seamless loop

// ─── SHELF MARQUEE ───────────────────────────────────────────────────────────
const shelfWords = ['BRAND','DESIGN','STRATEGY','MOTION','WEB','PRINT','IDENTITY','COPY'];
const st         = document.getElementById('shelfTrack');
const shelfHtml  = shelfWords.map((w, i) =>
  `<span class="shelf-item${i % 3 === 0 ? ' filled' : ''}">${w}</span>`
).join('');
st.innerHTML = shelfHtml + shelfHtml;

// ─── THREE.JS HELPERS ────────────────────────────────────────────────────────
function createRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type    = THREE.PCFSoftShadowMap;
  return r;
}

function addLights(scene, config = {}) {
  const amb = new THREE.AmbientLight(0xffffff, config.amb || 0.4);
  scene.add(amb);
  const key = new THREE.DirectionalLight(0xffffff, config.key || 1.2);
  key.position.set(5, 8, 6);
  key.castShadow = true;
  scene.add(key);
  const fill = new THREE.DirectionalLight(config.fillCol || 0xffeedd, config.fill || 0.6);
  fill.position.set(-5, 2, -4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, config.rim || 0.3);
  rim.position.set(0, -5, -8);
  scene.add(rim);
}

// ─── CANVAS TEXTURE HELPERS ──────────────────────────────────────────────────
function makeLabel(opts) {
  const { w = 512, h = 256, bg, text, subtext, accent, stripes } = opts;
  const c   = document.createElement('canvas');
  c.width   = w; c.height = h;
  const ctx = c.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (stripes) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < w; i += 30) { ctx.fillRect(i, 0, 15, h); }
  }

  ctx.fillStyle = accent;
  ctx.fillRect(0, h * 0.62, w, h * 0.38); // accent band
  ctx.fillRect(0, 0, w, 10);              // top accent line

  ctx.fillStyle   = '#fff';
  ctx.font        = `bold ${Math.floor(h * 0.28)}px 'Arial Black', Arial`;
  ctx.textAlign   = 'center';
  ctx.fillText(text, w / 2, h * 0.45);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font      = `${Math.floor(h * 0.13)}px 'Arial', monospace`;
  ctx.fillText(subtext, w / 2, h * 0.8);

  // Barcode lines
  const bx = w / 2 - 40, by = h * 0.88, bw = 80, bh = 12;
  for (let i = 0; i < bw; i += 3) {
    ctx.fillStyle = i % 6 < 3 ? '#fff' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(bx + i, by, 2, bh);
  }

  return new THREE.CanvasTexture(c);
}

function makeTopLabel(opts) {
  const { w = 512, h = 512, bg, accent, text } = opts;
  const c   = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle    = '#fff';
  ctx.font         = `bold ${Math.floor(w * 0.18)}px Arial Black, Arial`;
  ctx.textAlign    = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  return new THREE.CanvasTexture(c);
}

// ─── 3D PRODUCT FACTORIES ────────────────────────────────────────────────────
function makeCerealBox(scene, opts) {
  const { x = 0, y = 0, z = 0, color, accent, name, sub, scale = [1, 1, 1] } = opts;
  const grp      = new THREE.Group();
  const labelTex = makeLabel({ w: 512, h: 256, bg: color, accent, text: name.toUpperCase(), subtext: sub, stripes: true });
  const topTex   = makeTopLabel({ w: 256, h: 256, bg: color, accent, text: name[0] });
  const W = 1, H = 1.6, D = 0.5;
  const geom = new THREE.BoxGeometry(W, H, D);
  const mats = [
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.3, metalness: 0.05 }),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.3, metalness: 0.05 }),
    new THREE.MeshStandardMaterial({ map: topTex,   roughness: 0.4 }),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: parseInt(color.replace('#', '0x')), roughness: 0.5 })
  ];
  const mesh = new THREE.Mesh(geom, mats);
  mesh.castShadow = true; mesh.receiveShadow = true;
  grp.add(mesh);
  grp.position.set(x, y, z);
  grp.scale.set(...scale);
  scene.add(grp);
  return grp;
}

function makeCan(scene, opts) {
  const { x = 0, y = 0, z = 0, color, accent, name, sub } = opts;
  const grp      = new THREE.Group();
  const labelTex = makeLabel({ w: 512, h: 256, bg: color, accent, text: name.toUpperCase(), subtext: sub });
  const topTex   = makeTopLabel({ w: 256, h: 256, bg: '#aaa', accent, text: '★' });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 1.2, 64),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.25, metalness: 0.3 })
  );
  body.castShadow = true;
  grp.add(body);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.06, 64),
    new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.2, metalness: 0.7 })
  );
  cap.position.y = 0.63;
  grp.add(cap);

  const tab = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 })
  );
  tab.position.set(0.1, 0.69, 0);
  grp.add(tab);

  grp.position.set(x, y, z);
  scene.add(grp);
  return grp;
}

function makeBottle(scene, opts) {
  const { x = 0, y = 0, z = 0, color, accent, name, sub } = opts;
  const grp      = new THREE.Group();
  const labelTex = makeLabel({ w: 512, h: 256, bg: color, accent, text: name.toUpperCase(), subtext: sub });

  const pts     = [];
  const profile = [
    [0.1, 0],[0.35, 0],[0.38, 0.1],[0.4, 0.3],[0.42, 0.6],[0.44, 0.9],
    [0.44, 1.1],[0.4, 1.2],[0.25, 1.3],[0.15, 1.45],[0.13, 1.55],[0.15, 1.7]
  ];
  profile.forEach(([r, yv]) => pts.push(new THREE.Vector2(r, yv)));

  const bottle = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 48),
    new THREE.MeshStandardMaterial({
      color: parseInt(color.replace('#', '0x')),
      roughness: 0.12, metalness: 0.05, transparent: true, opacity: 0.85
    })
  );
  bottle.castShadow = true;
  grp.add(bottle);

  const lbl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.55, 48),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.3 })
  );
  lbl.position.y = 0.55;
  grp.add(lbl);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.14, 24),
    new THREE.MeshStandardMaterial({ color: parseInt(accent.replace('#', '0x')), roughness: 0.3, metalness: 0.5 })
  );
  cap.position.y = 1.76;
  grp.add(cap);

  grp.position.set(x, y, z);
  scene.add(grp);
  return grp;
}

function makeTube(scene, opts) {
  const { x = 0, y = 0, z = 0, color, accent, name, sub } = opts;
  const grp      = new THREE.Group();
  const labelTex = makeLabel({ w: 512, h: 256, bg: color, accent, text: name.toUpperCase(), subtext: sub, stripes: true });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.28, 1.4, 48),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.25, metalness: 0.1 })
  );
  grp.add(body);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.22, 0.3, 32),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.6, roughness: 0.2 })
  );
  nozzle.position.y = 0.85;
  grp.add(nozzle);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: parseInt(accent.replace('#', '0x')), roughness: 0.3 })
  );
  cap.position.y = 1.075;
  grp.add(cap);

  const bot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: parseInt(color.replace('#', '0x')), roughness: 0.5 })
  );
  bot.position.y = -0.74;
  grp.add(bot);

  grp.position.set(x, y, z);
  scene.add(grp);
  return grp;
}

function makeBag(scene, opts) {
  const { x = 0, y = 0, z = 0, color, accent, name, sub } = opts;
  const grp      = new THREE.Group();
  const labelTex = makeLabel({ w: 512, h: 256, bg: color, accent, text: name.toUpperCase(), subtext: sub, stripes: true });

  const bag = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.5, metalness: 0.05 })
  );
  bag.scale.set(1, 1.3, 0.7);
  bag.castShadow = true;
  grp.add(bag);

  const seal = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.12, 0.1),
    new THREE.MeshStandardMaterial({ color: parseInt(accent.replace('#', '0x')), roughness: 0.3 })
  );
  seal.position.y = 0.7;
  grp.add(seal);

  grp.position.set(x, y, z);
  scene.add(grp);
  return grp;
}

// ─── HERO SCENE ──────────────────────────────────────────────────────────────
(function heroScene() {
  const canvas   = document.getElementById('hero-canvas');
  const renderer = createRenderer(canvas);
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.5, 7);

  addLights(scene, { amb: 0.5, key: 1.4, fill: 0.7, fillCol: 0xffeedd, rim: 0.4 });

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.08, 4),
    new THREE.MeshStandardMaterial({ color: 0xddd5c8, roughness: 0.7 })
  );
  floor.position.y = -1.05;
  floor.receiveShadow = true;
  scene.add(floor);

  const heroProducts = [
    makeCerealBox(scene, { x: -2.5, y: -0.2,  z: 0.3, color: '#d42b2b', accent: '#8b1010', name: 'BRAND', sub: 'Identity System', scale: [0.9, 0.9, 0.9] }),
    makeBottle(scene,    { x: -0.8, y: -0.25, z: 0.5, color: '#1b3a6b', accent: '#0f2040', name: 'WEB',   sub: 'Digital Design' }),
    makeCan(scene,       { x:  0.8, y: -0.45, z: 0.4, color: '#2d5a3d', accent: '#1a3324', name: 'SEO',   sub: 'Growth Engine' }),
    makeCerealBox(scene, { x:  2.5, y: -0.2,  z: 0.3, color: '#c9973a', accent: '#7a5518', name: 'ADS',   sub: 'Campaign Kit',  scale: [0.9, 0.9, 0.9] }),
  ];

  const shadowP = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 4),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.04 })
  );
  shadowP.rotation.x = -Math.PI / 2;
  shadowP.position.y = -1.02;
  scene.add(shadowP);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012;
    heroProducts.forEach((p, i) => {
      p.rotation.y = Math.sin(t * 0.7 + i * 1.2) * 0.15 + (i % 2 === 0 ? 0.1 : -0.1);
      p.position.y += Math.sin(t + i * 0.8) * 0.0008;
    });
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  animate();
})();

// ─── SERVICE CARDS (per-card Three.js scenes) ────────────────────────────────
const services = [
  { name: 'Brand Identity', sub: 'Packaging your essence', tag: 'Strategic',   price: 'Starting at ₹3,09,120', color: '#d42b2b', accent: '#8b1010', type: 'box',    desc: 'Full brand system — logo, color, type, voice, and guidelines. Everything you need on the shelf.' },
  { name: 'Web Design',     sub: 'Digital storefront',     tag: 'Digital',      price: 'Starting at ₹5,60,280', color: '#1b3a6b', accent: '#0f2040', type: 'bottle', desc: 'Beautiful, high-converting websites. We design and build your digital flagship store from scratch.' },
  { name: 'Motion & Video', sub: 'Moving products',        tag: 'Media',        price: 'Starting at ₹2,31,840', color: '#2d5a3d', accent: '#1a3324', type: 'can',    desc: 'Animation, social content, reels, and brand films. Your brand in motion, in every format.' },
  { name: 'Strategy',       sub: 'The recipe inside',      tag: 'Consulting',   price: 'Starting at ₹1,73,880', color: '#4a2060', accent: '#2a0f40', type: 'bag',    desc: 'Market research, positioning, audience mapping. We figure out the formula before we print the label.' },
  { name: 'Copywriting',    sub: 'Words that convert',     tag: 'Creative',     price: 'Starting at ₹86,940',   color: '#d4561a', accent: '#8b300a', type: 'tube',   desc: 'Taglines, web copy, campaigns, and brand voice. Words so good they belong on the packaging.' },
  { name: 'Campaigns',      sub: 'The full grocery run',   tag: 'Full Service', price: 'Starting at ₹9,17,700', color: '#c9973a', accent: '#7a5518', type: 'box',    desc: 'End-to-end campaign concepting, production, and launch. The whole cart, handled.' },
];

const cardColors = ['card-red', 'card-blue', 'card-green', 'card-purple', 'card-orange', 'card-gold'];
const grid       = document.getElementById('productsGrid');

services.forEach((svc, i) => {
  const card = document.createElement('div');
  card.className = `product-card reveal ${cardColors[i]}`;
  card.style.transitionDelay = `${i * 0.08}s`;

  const wrap = document.createElement('div');
  wrap.className = 'product-canvas-wrap';
  const cvs = document.createElement('canvas');
  wrap.appendChild(cvs);
  card.appendChild(wrap);

  card.innerHTML += `
    <div class="product-shelf"></div>
    <div class="product-info">
      <span class="product-tag">${svc.tag}</span>
      <div class="product-name">${svc.name}</div>
      <p class="product-desc">${svc.desc}</p>
      <div class="product-price">${svc.price} <small>/ project</small></div>
      <button class="product-add">+</button>
    </div>
  `;
  // Re-insert canvas because innerHTML replaced it
  wrap.insertBefore(cvs, wrap.firstChild);
  grid.appendChild(card);

  const renderer = createRenderer(cvs);
  const scene    = new THREE.Scene();
  const cam      = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  cam.position.set(0, 0.3, 3.5);
  addLights(scene, { amb: 0.5, key: 1.3, fill: 0.5, fillCol: 0xfff5ee, rim: 0.3 });

  const o = { x: 0, y: -0.3, z: 0, color: svc.color, accent: svc.accent, name: svc.name.split(' ')[0], sub: svc.sub };
  let product;
  if      (svc.type === 'box')    product = makeCerealBox(scene, { ...o, scale: [1, 1, 1] });
  else if (svc.type === 'bottle') product = makeBottle(scene, o);
  else if (svc.type === 'can')    product = makeCan(scene, o);
  else if (svc.type === 'bag')    product = makeBag(scene, o);
  else if (svc.type === 'tube')   product = makeTube(scene, o);

  let hovered = false, t = 0;
  card.addEventListener('mouseenter', () => { hovered = true; });
  card.addEventListener('mouseleave', () => { hovered = false; });

  (function loop() {
    requestAnimationFrame(loop);
    t += 0.015;
    if (product) {
      product.rotation.y  += hovered ? 0.03 : 0.006;
      product.position.y   = -0.3 + Math.sin(t + i) * 0.04;
    }
    const rect = cvs.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      renderer.setSize(rect.width, rect.height);
      cam.aspect = rect.width / rect.height;
      cam.updateProjectionMatrix();
    }
    renderer.render(scene, cam);
  })();
});

// ─── ABOUT SCENE ─────────────────────────────────────────────────────────────
(function aboutScene() {
  const canvas   = document.getElementById('about-canvas');
  const renderer = createRenderer(canvas);
  const scene    = new THREE.Scene();
  const cam      = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.set(0, 1, 6);
  addLights(scene, { amb: 0.4, key: 1.2, fill: 0.6, fillCol: 0xffeedd, rim: 0.5 });

  const items = [
    makeCerealBox(scene, { x: -1.5, y:  0.5, z:  0,   color: '#d42b2b', accent: '#8b1010', name: 'A', sub: '', scale: [0.7, 0.7, 0.7] }),
    makeCan(scene,       { x:  0.8, y: -0.4, z:  0.5, color: '#1b3a6b', accent: '#0f2040', name: 'B', sub: '' }),
    makeBag(scene,       { x: -0.2, y:  0.8, z: -0.5, color: '#2d5a3d', accent: '#1a3324', name: 'C', sub: '' }),
    makeTube(scene,      { x:  1.6, y:  0.6, z: -0.3, color: '#c9973a', accent: '#7a5518', name: 'D', sub: '' }),
  ];

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.01;
    items.forEach((item, i) => {
      item.rotation.y  += 0.008 + i * 0.002;
      item.rotation.x   = Math.sin(t * 0.5 + i) * 0.08;
      item.position.y  += Math.sin(t * 0.8 + i * 1.3) * 0.001;
    });
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      renderer.setSize(rect.width, rect.height);
      cam.aspect = rect.width / rect.height;
      cam.updateProjectionMatrix();
    }
    renderer.render(scene, cam);
  })();
})();

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ─── GSAP ENTRANCE ───────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, delay: 0.2 });
    gsap.from('h1',            { opacity: 0, y: 40, duration: 1,   delay: 0.4, ease: 'power3.out' });
    gsap.from('.hero-sub',     { opacity: 0, y: 20, duration: 0.8, delay: 0.7 });
    gsap.from('.hero-btns',    { opacity: 0, y: 20, duration: 0.8, delay: 0.9 });
  }
});
