/* global THREE, gsap */
'use strict';

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════════════════════════════════════════
const State = {
  cart: [],           // array of cart items
  currentView: 'home',
  currentProduct: null,
  specConfig: {
    duration: 'standard',
    durationMult: 1,
    scope: 'core',
    scopeMult: 1,
    addons: []          // [{label, price}]
  }
};

// ════════════════════════════════════════════════════════════════════════════
// SERVICES DATA
// ════════════════════════════════════════════════════════════════════════════
const services = [
  {
    id: 0, name: 'Brand Identity', sub: 'Packaging your essence',
    tag: 'Strategic', basePrice: 309120,
    color: '#d42b2b', accent: '#8b1010', type: 'box',
    desc: 'Full brand system — logo, color, type, voice, and guidelines. Everything you need on the shelf.',
    cardClass: 'card-red'
  },
  {
    id: 1, name: 'Web Design', sub: 'Digital storefront',
    tag: 'Digital', basePrice: 560280,
    color: '#1b3a6b', accent: '#0f2040', type: 'bottle',
    desc: 'Beautiful, high-converting websites. We design and build your digital flagship store from scratch.',
    cardClass: 'card-blue'
  },
  {
    id: 2, name: 'Motion & Video', sub: 'Moving products',
    tag: 'Media', basePrice: 231840,
    color: '#2d5a3d', accent: '#1a3324', type: 'can',
    desc: 'Animation, social content, reels, and brand films. Your brand in motion, in every format.',
    cardClass: 'card-green'
  },
  {
    id: 3, name: 'Strategy', sub: 'The recipe inside',
    tag: 'Consulting', basePrice: 173880,
    color: '#4a2060', accent: '#2a0f40', type: 'bag',
    desc: 'Market research, positioning, audience mapping. We figure out the formula before we print the label.',
    cardClass: 'card-purple'
  },
  {
    id: 4, name: 'Copywriting', sub: 'Words that convert',
    tag: 'Creative', basePrice: 86940,
    color: '#d4561a', accent: '#8b300a', type: 'tube',
    desc: 'Taglines, web copy, campaigns, and brand voice. Words so good they belong on the packaging.',
    cardClass: 'card-orange'
  },
  {
    id: 5, name: 'Campaigns', sub: 'The full grocery run',
    tag: 'Full Service', basePrice: 917700,
    color: '#c9973a', accent: '#7a5518', type: 'box',
    desc: 'End-to-end campaign concepting, production, and launch. The whole cart, handled.',
    cardClass: 'card-gold'
  }
];

// ════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════
function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function rebindCursor() {
  document.querySelectorAll('a, button, .product-card, input, label').forEach(el => {
    // prevent double-binding
    if (el._cursorBound) return;
    el._cursorBound = true;
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
      ring.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.opacity = '1';
    });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// CURSOR
// ════════════════════════════════════════════════════════════════════════════
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
rebindCursor();

// ════════════════════════════════════════════════════════════════════════════
// CART SYSTEM
// ════════════════════════════════════════════════════════════════════════════
const cartDrawer    = document.getElementById('cart-drawer');
const cartOverlay   = document.getElementById('cart-overlay');
const cartBadge     = document.getElementById('cart-badge');
const cartItemsList = document.getElementById('cart-items-list');
const cartEmptyMsg  = document.getElementById('cart-empty-msg');
const cartFooter    = document.getElementById('cart-footer');
const cartTotalEl   = document.getElementById('cart-total-price');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  renderCartDrawer();
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}

document.getElementById('cart-toggle-btn').addEventListener('click', openCart);
document.getElementById('cart-close-btn').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
document.getElementById('goto-checkout-btn').addEventListener('click', () => {
  closeCart();
  navigateTo('checkout');
});

function addToCart(item) {
  State.cart.push(item);
  updateCartBadge();
  flashBadge();
}

function removeFromCart(idx) {
  State.cart.splice(idx, 1);
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const count = State.cart.length;
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function flashBadge() {
  cartBadge.style.animation = 'none';
  requestAnimationFrame(() => {
    cartBadge.style.animation = 'badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
}

function cartTotal() {
  return State.cart.reduce((s, item) => s + item.price, 0);
}

function renderCartDrawer() {
  cartItemsList.innerHTML = '';

  if (State.cart.length === 0) {
    cartEmptyMsg.style.display = 'flex';
    cartFooter.style.display   = 'none';
    return;
  }
  cartEmptyMsg.style.display = 'none';
  cartFooter.style.display   = 'block';

  State.cart.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    const specsHtml = item.specs.map(s => `<div>${s}</div>`).join('');
    el.innerHTML = `
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-specs">${specsHtml}</div>
      </div>
      <div>
        <div class="cart-item-price">${formatINR(item.price)}</div>
        <button class="cart-item-remove" data-idx="${i}">Remove</button>
      </div>
    `;
    cartItemsList.appendChild(el);
  });

  cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn._cursorBound = false;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeFromCart(parseInt(btn.dataset.idx));
    });
    rebindCursor();
  });

  cartTotalEl.textContent = formatINR(cartTotal());
}

// ════════════════════════════════════════════════════════════════════════════
// SPA ROUTER
// ════════════════════════════════════════════════════════════════════════════
const views = {
  home:     document.getElementById('view-home'),
  product:  document.getElementById('view-product'),
  checkout: document.getElementById('view-checkout'),
};

// track per-view cleanup fns (Three.js disposal)
const viewCleanup = {};

function navigateTo(viewName, productId) {
  const prev = State.currentView;
  if (prev === viewName && viewName !== 'product') return;

  // cleanup previous view's GL contexts
  if (viewCleanup[prev]) { viewCleanup[prev](); delete viewCleanup[prev]; }

  // hide old
  const oldView = views[prev];
  if (oldView) {
    oldView.classList.add('view-exiting');
    setTimeout(() => {
      oldView.classList.remove('active', 'view-exiting');
    }, 400);
  }

  State.currentView = viewName;
  window.scrollTo(0, 0);

  // show new
  const newView = views[viewName];
  newView.classList.add('active', 'view-entering');
  setTimeout(() => newView.classList.remove('view-entering'), 500);

  // toggle nav styling
  document.getElementById('main-nav').dataset.view = viewName;

  // route-specific init
  if (viewName === 'product' && productId !== undefined) {
    State.currentProduct = productId;
    initSpecView(productId);
  }
  if (viewName === 'checkout') {
    initCheckoutView();
  }

  // update hash
  if (viewName === 'home')     history.pushState({view:'home'}, '', '#');
  if (viewName === 'product')  history.pushState({view:'product', id: productId}, '', `#product/${productId}`);
  if (viewName === 'checkout') history.pushState({view:'checkout'}, '', '#checkout');

  rebindCursor();
}

window.addEventListener('popstate', e => {
  const h = window.location.hash;
  if (!h || h === '#') {
    navigateTo('home');
  } else if (h.startsWith('#product/')) {
    navigateTo('product', parseInt(h.split('/')[1]));
  } else if (h === '#checkout') {
    navigateTo('checkout');
  }
});

// Nav logo → home
document.getElementById('nav-logo-btn').addEventListener('click', () => navigateTo('home'));
document.getElementById('spec-back-btn').addEventListener('click', e => {
  e.preventDefault(); navigateTo('home');
});
document.getElementById('checkout-back-btn').addEventListener('click', () => openCart());

// ════════════════════════════════════════════════════════════════════════════
// THREE.JS HELPERS
// ════════════════════════════════════════════════════════════════════════════
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
  key.position.set(5, 8, 6); key.castShadow = true;
  scene.add(key);
  const fill = new THREE.DirectionalLight(config.fillCol || 0xffeedd, config.fill || 0.6);
  fill.position.set(-5, 2, -4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, config.rim || 0.3);
  rim.position.set(0, -5, -8); scene.add(rim);
}

function makeLabel(opts) {
  const { w = 512, h = 256, bg, text, subtext, accent, stripes } = opts;
  const c   = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  if (stripes) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < w; i += 30) ctx.fillRect(i, 0, 15, h);
  }
  ctx.fillStyle = accent;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.floor(h * 0.28)}px 'Arial Black', Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(text, w / 2, h * 0.45);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${Math.floor(h * 0.13)}px 'Arial', monospace`;
  ctx.fillText(subtext, w / 2, h * 0.8);
  const bx = w / 2 - 40, by = h * 0.88, bw = 80;
  for (let i = 0; i < bw; i += 3) {
    ctx.fillStyle = i % 6 < 3 ? '#fff' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(bx + i, by, 2, 12);
  }
  return new THREE.CanvasTexture(c);
}

function makeTopLabel(opts) {
  const { w = 512, h = 512, bg, accent, text } = opts;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(w * 0.18)}px Arial Black, Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  return new THREE.CanvasTexture(c);
}

// ─── 3D PRODUCT FACTORIES ────────────────────────────────────────────────
function makeCerealBox(scene, opts) {
  const { x=0, y=0, z=0, color, accent, name, sub, scale=[1,1,1] } = opts;
  const grp = new THREE.Group();
  const labelTex = makeLabel({ w:512, h:256, bg:color, accent, text:name.toUpperCase(), subtext:sub, stripes:true });
  const topTex   = makeTopLabel({ w:256, h:256, bg:color, accent, text:name[0] });
  const geom = new THREE.BoxGeometry(1, 1.6, 0.5);
  const mats = [
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.3, metalness:0.05 }),
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.3, metalness:0.05 }),
    new THREE.MeshStandardMaterial({ map:topTex,   roughness:0.4 }),
    new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.5 }),
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.3 }),
    new THREE.MeshStandardMaterial({ color:parseInt(color.replace('#','0x')), roughness:0.5 })
  ];
  const mesh = new THREE.Mesh(geom, mats);
  mesh.castShadow = true; mesh.receiveShadow = true;
  grp.add(mesh); grp.position.set(x,y,z); grp.scale.set(...scale);
  scene.add(grp); return grp;
}

function makeCan(scene, opts) {
  const { x=0, y=0, z=0, color, accent, name, sub } = opts;
  const grp = new THREE.Group();
  const labelTex = makeLabel({ w:512, h:256, bg:color, accent, text:name.toUpperCase(), subtext:sub });
  const topTex   = makeTopLabel({ w:256, h:256, bg:'#aaa', accent, text:'★' });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 1.2, 64),
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.25, metalness:0.3 })
  );
  body.castShadow = true; grp.add(body);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.06, 64),
    new THREE.MeshStandardMaterial({ map:topTex, roughness:0.2, metalness:0.7 })
  );
  cap.position.y = 0.63; grp.add(cap);
  const tab = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
    new THREE.MeshStandardMaterial({ color:0xcccccc, metalness:0.9, roughness:0.1 })
  );
  tab.position.set(0.1, 0.69, 0); grp.add(tab);
  grp.position.set(x,y,z); scene.add(grp); return grp;
}

function makeBottle(scene, opts) {
  const { x=0, y=0, z=0, color, accent, name, sub } = opts;
  const grp = new THREE.Group();
  const labelTex = makeLabel({ w:512, h:256, bg:color, accent, text:name.toUpperCase(), subtext:sub });
  const pts = [];
  [[0.1,0],[0.35,0],[0.38,0.1],[0.4,0.3],[0.42,0.6],[0.44,0.9],
   [0.44,1.1],[0.4,1.2],[0.25,1.3],[0.15,1.45],[0.13,1.55],[0.15,1.7]]
    .forEach(([r,yv]) => pts.push(new THREE.Vector2(r,yv)));
  const bottle = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 48),
    new THREE.MeshStandardMaterial({ color:parseInt(color.replace('#','0x')), roughness:0.12, metalness:0.05, transparent:true, opacity:0.85 })
  );
  bottle.castShadow = true; grp.add(bottle);
  const lbl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.55, 48),
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.3 })
  );
  lbl.position.y = 0.55; grp.add(lbl);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.14, 24),
    new THREE.MeshStandardMaterial({ color:parseInt(accent.replace('#','0x')), roughness:0.3, metalness:0.5 })
  );
  cap.position.y = 1.76; grp.add(cap);
  grp.position.set(x,y,z); scene.add(grp); return grp;
}

function makeTube(scene, opts) {
  const { x=0, y=0, z=0, color, accent, name, sub } = opts;
  const grp = new THREE.Group();
  const labelTex = makeLabel({ w:512, h:256, bg:color, accent, text:name.toUpperCase(), subtext:sub, stripes:true });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.28, 1.4, 48),
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.25, metalness:0.1 })
  );
  grp.add(body);
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.22, 0.3, 32),
    new THREE.MeshStandardMaterial({ color:0xdddddd, metalness:0.6, roughness:0.2 })
  );
  nozzle.position.y = 0.85; grp.add(nozzle);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.15, 24),
    new THREE.MeshStandardMaterial({ color:parseInt(accent.replace('#','0x')), roughness:0.3 })
  );
  cap.position.y = 1.075; grp.add(cap);
  const bot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.08, 48),
    new THREE.MeshStandardMaterial({ color:parseInt(color.replace('#','0x')), roughness:0.5 })
  );
  bot.position.y = -0.74; grp.add(bot);
  grp.position.set(x,y,z); scene.add(grp); return grp;
}

function makeBag(scene, opts) {
  const { x=0, y=0, z=0, color, accent, name, sub } = opts;
  const grp = new THREE.Group();
  const labelTex = makeLabel({ w:512, h:256, bg:color, accent, text:name.toUpperCase(), subtext:sub, stripes:true });
  const bag = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 32),
    new THREE.MeshStandardMaterial({ map:labelTex, roughness:0.5, metalness:0.05 })
  );
  bag.scale.set(1, 1.3, 0.7); bag.castShadow = true; grp.add(bag);
  const seal = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.12, 0.1),
    new THREE.MeshStandardMaterial({ color:parseInt(accent.replace('#','0x')), roughness:0.3 })
  );
  seal.position.y = 0.7; grp.add(seal);
  grp.position.set(x,y,z); scene.add(grp); return grp;
}

function buildProduct(scene, svc, opts = {}) {
  const o = { color: svc.color, accent: svc.accent, name: svc.name.split(' ')[0], sub: svc.sub, ...opts };
  if (svc.type === 'box')    return makeCerealBox(scene, o);
  if (svc.type === 'bottle') return makeBottle(scene, o);
  if (svc.type === 'can')    return makeCan(scene, o);
  if (svc.type === 'bag')    return makeBag(scene, o);
  if (svc.type === 'tube')   return makeTube(scene, o);
}

// ════════════════════════════════════════════════════════════════════════════
// HERO SCENE
// ════════════════════════════════════════════════════════════════════════════
(function heroScene() {
  const canvas   = document.getElementById('hero-canvas');
  const renderer = createRenderer(canvas);
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.5, 7);
  addLights(scene, { amb:0.5, key:1.4, fill:0.7, fillCol:0xffeedd, rim:0.4 });

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.08, 4),
    new THREE.MeshStandardMaterial({ color:0xddd5c8, roughness:0.7 })
  );
  floor.position.y = -1.05; floor.receiveShadow = true; scene.add(floor);

  const heroProducts = [
    makeCerealBox(scene, { x:-2.5, y:-0.2, z:0.3, color:'#d42b2b', accent:'#8b1010', name:'BRAND', sub:'Identity System', scale:[0.9,0.9,0.9] }),
    makeBottle(scene,    { x:-0.8, y:-0.25, z:0.5, color:'#1b3a6b', accent:'#0f2040', name:'WEB',   sub:'Digital Design' }),
    makeCan(scene,       { x: 0.8, y:-0.45, z:0.4, color:'#2d5a3d', accent:'#1a3324', name:'SEO',   sub:'Growth Engine' }),
    makeCerealBox(scene, { x: 2.5, y:-0.2, z:0.3, color:'#c9973a', accent:'#7a5518', name:'ADS',   sub:'Campaign Kit',  scale:[0.9,0.9,0.9] }),
  ];

  let t = 0, active = true;
  function animate() {
    if (!active) return;
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

// ════════════════════════════════════════════════════════════════════════════
// SERVICE CARDS
// ════════════════════════════════════════════════════════════════════════════
const grid = document.getElementById('productsGrid');

services.forEach((svc, i) => {
  const card = document.createElement('div');
  card.className = `product-card reveal ${svc.cardClass}`;
  card.style.transitionDelay = `${i * 0.08}s`;
  card.dataset.serviceId = i;

  const wrap = document.createElement('div');
  wrap.className = 'product-canvas-wrap';
  const cvs = document.createElement('canvas');
  wrap.appendChild(cvs);
  card.appendChild(wrap);

  const priceStr = `Starting at ${formatINR(svc.basePrice)}`;
  card.innerHTML += `
    <div class="product-shelf"></div>
    <div class="product-info">
      <span class="product-tag">${svc.tag}</span>
      <div class="product-name">${svc.name}</div>
      <p class="product-desc">${svc.desc}</p>
      <div class="product-price">${priceStr} <small>/ project</small></div>
      <button class="product-add" data-id="${i}" title="Quick add to cart">+</button>
    </div>
  `;
  wrap.insertBefore(cvs, wrap.firstChild);
  grid.appendChild(card);

  // card click → product spec view (not on the + button)
  card.addEventListener('click', e => {
    if (e.target.classList.contains('product-add')) return;
    navigateTo('product', i);
  });

  // quick-add button
  const addBtn = card.querySelector('.product-add');
  addBtn.addEventListener('click', e => {
    e.stopPropagation();
    const item = {
      id: Date.now(),
      serviceId: i,
      name: svc.name,
      price: svc.basePrice,
      specs: ['Core Package', 'Standard (4 wks)']
    };
    addToCart(item);
    addBtn.textContent = '✓';
    addBtn.classList.add('added');
    setTimeout(() => {
      addBtn.textContent = '+';
      addBtn.classList.remove('added');
    }, 1800);
  });

  // per-card Three.js scene
  const renderer = createRenderer(cvs);
  const scene    = new THREE.Scene();
  const cam      = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  cam.position.set(0, 0.3, 3.5);
  addLights(scene, { amb:0.5, key:1.3, fill:0.5, fillCol:0xfff5ee, rim:0.3 });

  const product = buildProduct(scene, svc, { x:0, y:-0.3, z:0 });

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

// ════════════════════════════════════════════════════════════════════════════
// ABOUT SCENE
// ════════════════════════════════════════════════════════════════════════════
(function aboutScene() {
  const canvas   = document.getElementById('about-canvas');
  const renderer = createRenderer(canvas);
  const scene    = new THREE.Scene();
  const cam      = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.set(0, 1, 6);
  addLights(scene, { amb:0.4, key:1.2, fill:0.6, fillCol:0xffeedd, rim:0.5 });

  const items = [
    makeCerealBox(scene, { x:-1.5, y:0.5, z:0,   color:'#d42b2b', accent:'#8b1010', name:'A', sub:'', scale:[0.7,0.7,0.7] }),
    makeCan(scene,       { x: 0.8, y:-0.4, z:0.5, color:'#1b3a6b', accent:'#0f2040', name:'B', sub:'' }),
    makeBag(scene,       { x:-0.2, y:0.8, z:-0.5, color:'#2d5a3d', accent:'#1a3324', name:'C', sub:'' }),
    makeTube(scene,      { x: 1.6, y:0.6, z:-0.3, color:'#c9973a', accent:'#7a5518', name:'D', sub:'' }),
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

// ════════════════════════════════════════════════════════════════════════════
// TICKER + SHELF MARQUEE
// ════════════════════════════════════════════════════════════════════════════
const tickerWords = [
  'Brand Identity','Web Design','Motion Graphics','Strategy',
  'Packaging','UI / UX','Creative Direction','Copywriting',
  'Photography','Campaign Design'
];
const ti = document.getElementById('tickerInner');
const tickerHtml = tickerWords.map(w => `<b>${w}</b><span>✦</span>`).join('');
ti.innerHTML = tickerHtml + tickerHtml;

const shelfWords = ['BRAND','DESIGN','STRATEGY','MOTION','WEB','PRINT','IDENTITY','COPY'];
const st = document.getElementById('shelfTrack');
const shelfHtml = shelfWords.map((w, i) =>
  `<span class="shelf-item${i % 3 === 0 ? ' filled' : ''}">${w}</span>`
).join('');
st.innerHTML = shelfHtml + shelfHtml;

// ════════════════════════════════════════════════════════════════════════════
// SPEC VIEW (Screen A)
// ════════════════════════════════════════════════════════════════════════════
let specRenderer = null, specAnimId = null;

function disposeSpecScene() {
  if (specAnimId) { cancelAnimationFrame(specAnimId); specAnimId = null; }
  if (specRenderer) { specRenderer.dispose(); specRenderer = null; }
}

function calcSpecPrice(svc) {
  const base  = svc.basePrice;
  const dm    = State.specConfig.durationMult;
  const sm    = State.specConfig.scopeMult;
  const addonsTotal = State.specConfig.addons.reduce((s, a) => s + a.price, 0);
  return Math.round(base * dm * sm) + addonsTotal;
}

function initSpecView(serviceId) {
  const svc = services[serviceId];
  disposeSpecScene();

  // Reset config
  State.specConfig = { duration:'standard', durationMult:1, scope:'core', scopeMult:1, addons:[] };

  // Update labels
  document.getElementById('spec-label-tag').textContent  = svc.tag;
  document.getElementById('spec-label-name').textContent = svc.name;
  document.getElementById('spec-title').textContent      = svc.name;
  document.getElementById('spec-desc').textContent       = svc.desc;

  // Reset option buttons
  document.querySelectorAll('.spec-opt[data-key="duration"]').forEach(b => {
    b.classList.toggle('active', b.dataset.val === 'standard');
  });
  document.querySelectorAll('.spec-opt[data-key="scope"]').forEach(b => {
    b.classList.toggle('active', b.dataset.val === 'core');
  });
  document.querySelectorAll('#spec-addons input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  updateSpecPrice(svc);

  // Build Three.js scene on spec-canvas
  const canvas   = document.getElementById('spec-canvas');
  const renderer = createRenderer(canvas);
  specRenderer   = renderer;
  const scene    = new THREE.Scene();
  const cam      = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  cam.position.set(0, 0.2, 4.2);
  addLights(scene, { amb:0.4, key:1.4, fill:0.5, fillCol:0xffd5aa, rim:0.5 });

  const product = buildProduct(scene, svc, { x:0, y:-0.1, z:0 });

  let t = 0;
  function loop() {
    specAnimId = requestAnimationFrame(loop);
    t += 0.012;
    if (product) {
      product.rotation.y += 0.012;
      product.position.y  = -0.1 + Math.sin(t * 0.9) * 0.05;
      product.rotation.z  = Math.sin(t * 0.4) * 0.02;
    }
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      renderer.setSize(rect.width, rect.height);
      cam.aspect = rect.width / rect.height;
      cam.updateProjectionMatrix();
    }
    renderer.render(scene, cam);
  }
  loop();

  // register cleanup
  viewCleanup['product'] = disposeSpecScene;

  rebindCursor();
}

function updateSpecPrice(svc) {
  const price = calcSpecPrice(svc);
  const el = document.getElementById('spec-price-display');
  el.textContent = formatINR(price);
  // subtle scale pulse
  el.style.transform = 'scale(1.06)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
}

// Option buttons
document.querySelectorAll('.spec-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const key  = btn.dataset.key;
    const val  = btn.dataset.val;
    const mult = parseFloat(btn.dataset.mult);

    document.querySelectorAll(`.spec-opt[data-key="${key}"]`).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (key === 'duration') {
      State.specConfig.duration     = val;
      State.specConfig.durationMult = mult;
    } else if (key === 'scope') {
      State.specConfig.scope     = val;
      State.specConfig.scopeMult = mult;
    }

    const svc = services[State.currentProduct];
    if (svc) updateSpecPrice(svc);
  });
});

// Add-on checkboxes
document.querySelectorAll('#spec-addons input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const price = parseInt(cb.dataset.price);
    const label = cb.dataset.label;
    if (cb.checked) {
      State.specConfig.addons.push({ label, price });
    } else {
      State.specConfig.addons = State.specConfig.addons.filter(a => a.label !== label);
    }
    const svc = services[State.currentProduct];
    if (svc) updateSpecPrice(svc);
  });
});

// Spec "Add to Cart"
document.getElementById('spec-add-to-cart').addEventListener('click', () => {
  const svc   = services[State.currentProduct];
  const price = calcSpecPrice(svc);
  const specs = [
    `${State.specConfig.scope.charAt(0).toUpperCase() + State.specConfig.scope.slice(1)} Package`,
    `${State.specConfig.duration.charAt(0).toUpperCase() + State.specConfig.duration.slice(1)} Timeline`,
    ...State.specConfig.addons.map(a => a.label)
  ];
  addToCart({ id: Date.now(), serviceId: State.currentProduct, name: svc.name, price, specs });
  openCart();
});

// Spec "Proceed to Checkout"
document.getElementById('spec-checkout-btn').addEventListener('click', () => {
  // auto-add if cart empty
  if (!State.cart.some(c => c.serviceId === State.currentProduct)) {
    const svc   = services[State.currentProduct];
    const price = calcSpecPrice(svc);
    const specs = [
      `${State.specConfig.scope.charAt(0).toUpperCase() + State.specConfig.scope.slice(1)} Package`,
      `${State.specConfig.duration.charAt(0).toUpperCase() + State.specConfig.duration.slice(1)} Timeline`,
      ...State.specConfig.addons.map(a => a.label)
    ];
    addToCart({ id: Date.now(), serviceId: State.currentProduct, name: svc.name, price, specs });
  }
  navigateTo('checkout');
});

// ════════════════════════════════════════════════════════════════════════════
// CHECKOUT VIEW (Screen B)
// ════════════════════════════════════════════════════════════════════════════
function initCheckoutView() {
  const itemsList = document.getElementById('checkout-items-list');
  itemsList.innerHTML = '';

  if (State.cart.length === 0) {
    itemsList.innerHTML = '<p style="opacity:0.35;font-size:0.75rem;letter-spacing:0.1em;">No items in cart.</p>';
  } else {
    State.cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'co-item';
      const specsHtml = item.specs.map(s => `<div>${s}</div>`).join('');
      el.innerHTML = `
        <div class="co-item-name">${item.name}</div>
        <div class="co-item-specs">${specsHtml}</div>
        <div class="co-item-price">${formatINR(item.price)}</div>
      `;
      itemsList.appendChild(el);
    });
  }

  const subtotal = cartTotal();
  const tax      = subtotal * 0.18;
  const grand    = subtotal + tax;

  document.getElementById('co-subtotal').textContent = formatINR(subtotal);
  document.getElementById('co-tax').textContent      = formatINR(tax);
  document.getElementById('co-grand').textContent    = formatINR(grand);

  // reset form
  ['field-name', 'field-card', 'field-exp', 'field-cvv'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('card-num-display').textContent  = '•••• •••• •••• ••••';
  document.getElementById('card-holder-display').textContent = 'YOUR NAME';
  document.getElementById('card-exp-display').textContent  = 'MM / YY';
  document.getElementById('checkout-payment-form').style.display = 'block';
  document.getElementById('checkout-success').style.display      = 'none';
  document.getElementById('pay-btn-text').style.display   = 'inline';
  document.getElementById('pay-spinner').style.display    = 'none';
  document.getElementById('pay-now-btn').classList.remove('processing');

  // update nav to dark mode feel
  document.body.style.setProperty('--nav-bg', 'rgba(26,26,26,0.92)');

  rebindCursor();
}

// Live card preview
document.getElementById('field-name').addEventListener('input', function() {
  document.getElementById('card-holder-display').textContent = this.value.toUpperCase() || 'YOUR NAME';
});

document.getElementById('field-card').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').substring(0, 16);
  let formatted = v.match(/.{1,4}/g)?.join(' ') || '';
  this.value = formatted;
  const masked = formatted.padEnd(19, '•').replace(/[0-9]/g, (d, i) => i < 12 ? '•' : d);
  document.getElementById('card-num-display').textContent =
    (formatted + ' •••• •••• •••• ••••').substring(0, 19).trim() || '•••• •••• •••• ••••';
});

document.getElementById('field-exp').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').substring(0, 4);
  if (v.length > 2) v = v.substring(0,2) + ' / ' + v.substring(2);
  this.value = v;
  document.getElementById('card-exp-display').textContent = v || 'MM / YY';
});

document.getElementById('field-cvv').addEventListener('focus', function() {
  document.getElementById('card-preview').style.transform = 'rotateY(180deg)';
  document.getElementById('card-preview').style.transition = 'transform 0.5s';
});
document.getElementById('field-cvv').addEventListener('blur', function() {
  document.getElementById('card-preview').style.transform = 'rotateY(0deg)';
});

// Pay Now
document.getElementById('pay-now-btn').addEventListener('click', () => {
  // Basic validation
  const name = document.getElementById('field-name').value.trim();
  const card = document.getElementById('field-card').value.replace(/\s/g, '');
  const exp  = document.getElementById('field-exp').value.trim();
  const cvv  = document.getElementById('field-cvv').value.trim();

  if (!name || card.length < 16 || exp.length < 4 || cvv.length < 3) {
    // shake animation
    const payBtn = document.getElementById('pay-now-btn');
    payBtn.style.animation = 'shake 0.4s ease';
    setTimeout(() => { payBtn.style.animation = ''; }, 400);
    return;
  }

  // Processing state
  const payBtn = document.getElementById('pay-now-btn');
  payBtn.classList.add('processing');
  document.getElementById('pay-btn-text').style.display  = 'none';
  document.getElementById('pay-spinner').style.display   = 'inline';

  setTimeout(() => {
    // Show success
    document.getElementById('checkout-payment-form').style.display = 'none';
    document.getElementById('checkout-success').style.display      = 'flex';
    const orderId = 'AIS-' + Math.floor(10000 + Math.random() * 90000);
    document.getElementById('success-order-id').textContent = 'ORDER #' + orderId;
    // clear cart
    State.cart = [];
    updateCartBadge();
  }, 2200);
});

// Success → Home
document.getElementById('success-home-btn').addEventListener('click', () => {
  navigateTo('home');
  setTimeout(() => {
    document.getElementById('view-home').querySelector('#services')
      ?.scrollIntoView({ behavior: 'smooth' });
  }, 600);
});

// CTA section → open cart
document.getElementById('cta-cart-btn').addEventListener('click', e => {
  e.preventDefault(); openCart();
});

// ════════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ════════════════════════════════════════════════════════════════════════════
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ════════════════════════════════════════════════════════════════════════════
// GSAP ENTRANCE
// ════════════════════════════════════════════════════════════════════════════
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero-eyebrow', { opacity:0, y:20, duration:0.8, delay:0.2 });
    gsap.from('h1',            { opacity:0, y:40, duration:1,   delay:0.4, ease:'power3.out' });
    gsap.from('.hero-sub',     { opacity:0, y:20, duration:0.8, delay:0.7 });
    gsap.from('.hero-btns',    { opacity:0, y:20, duration:0.8, delay:0.9 });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL for data-scroll links
// ════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById(a.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// NAV STYLE for dark-bg views
// ════════════════════════════════════════════════════════════════════════════
const navEl = document.getElementById('main-nav');
const navObserver = new MutationObserver(() => {
  const v = navEl.dataset.view;
  if (v === 'checkout') {
    navEl.style.background = 'rgba(26,26,26,0.92)';
    navEl.style.borderBottomColor = 'rgba(255,255,255,0.06)';
    navEl.querySelectorAll('.nav-links a').forEach(a => a.style.color = 'rgba(255,255,255,0.6)');
    navEl.querySelector('.nav-logo').style.color = '#fff';
  } else {
    navEl.style.background = '';
    navEl.style.borderBottomColor = '';
    navEl.querySelectorAll('.nav-links a').forEach(a => a.style.color = '');
    navEl.querySelector('.nav-logo').style.color = '';
  }
});
navObserver.observe(navEl, { attributes: true, attributeFilter: ['data-view'] });

// ════════════════════════════════════════════════════════════════════════════
// SHAKE KEYFRAME (injected for pay validation)
// ════════════════════════════════════════════════════════════════════════════
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);
