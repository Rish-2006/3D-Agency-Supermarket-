# AISLE — Premium Creative Agency · Single-Page Application

<div align="center">

![AISLE](https://img.shields.io/badge/AISLE-Premium%20Agency-d42b2b?style=for-the-badge&labelColor=1a1a1a)
![Vanilla JS](https://img.shields.io/badge/Vanilla%20JS-ES2020-c9973a?style=for-the-badge&logo=javascript&logoColor=white&labelColor=1a1a1a)
![Three.js](https://img.shields.io/badge/Three.js-r128-white?style=for-the-badge&logo=three.js&logoColor=black&labelColor=1a1a1a)
![GSAP](https://img.shields.io/badge/GSAP-3.12-88ce02?style=for-the-badge&labelColor=1a1a1a)
![License](https://img.shields.io/badge/License-MIT-2d5a3d?style=for-the-badge&labelColor=1a1a1a)

**A brutalist-luxury agency storefront with WebGL product renders, a live cart system, a service configurator, and a payment simulation — zero build tools, zero dependencies beyond Three.js and GSAP.**

[Live Demo](#) · [Architecture Docs](./ARCHITECTURE.md) · [Changelog](#changelog) · [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Screens & User Flow](#screens--user-flow)
- [State Management](#state-management)
- [SPA Router](#spa-router)
- [Three.js Architecture](#threejs-architecture)
- [Pricing Logic](#pricing-logic)
- [Cart System](#cart-system)
- [Styling System](#styling-system)
- [Performance Considerations](#performance-considerations)
- [Browser Support](#browser-support)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AISLE** is a fully client-side, dependency-light creative agency website built around a singular metaphor: _every service is a product on a shelf_. The application is structured as a three-screen SPA (Single-Page Application) with hash-based routing, per-card WebGL renders, an animated cart drawer, a live pricing configurator, and a payment terminal simulation.

The entire application runs from three files:

| File | Role | Size |
|---|---|---|
| `index.html` | DOM structure, SPA view containers, external CDN links | ~16 KB |
| `styles.css` | Full design system — variables, layout, animations, all views | ~32 KB |
| `main.js` | State, router, Three.js scenes, cart logic, pricing engine | ~44 KB |

No bundler. No npm. No framework. Drop these three files on any static host and it works.

---

## Feature Highlights

**Storefront & Navigation**
- Fixed frosted-glass nav with live cart badge counter
- Custom SVG-free CSS cursor with ring-follow animation (`mix-blend-mode: multiply`)
- Scroll-triggered reveal animations via `IntersectionObserver`
- Infinite-scroll ticker and shelf marquee (`@keyframes`)
- GSAP-powered entrance sequence on load

**WebGL Product Renders (Three.js)**
- Six independent per-card WebGL scenes — each card owns its own `WebGLRenderer`, `Scene`, and `PerspectiveCamera`
- Hero scene: four products on a virtual shelf with ambient float
- About scene: four products in a floating cluster arrangement
- Product Spec view: a dedicated isolated canvas that auto-disposes on route change
- Five 3D model factories: `CerealBox`, `Can`, `Bottle`, `Tube`, `Bag` — all with procedurally generated `CanvasTexture` labels

**Cart System**
- Global `State.cart[]` array as single source of truth
- Slide-out drawer with enter animation, per-item remove, and running total
- Quick-add (`+` button) vs. configured-add (from Spec page) producing different line-item specs
- Badge pop animation on every add

**Service Configurator (Screen A)**
- Split-screen layout: sticky 3D canvas left, scrollable options panel right
- Three option groups: Timeline, Scope, Add-ons
- Multiplicative pricing engine — duration multiplier × scope multiplier × base price + flat add-on sum
- Animated price counter on every option change

**Checkout Terminal (Screen B)**
- Live credit card preview with real-time field reflection
- Card flip on CVV focus (`rotateY(180deg)`)
- Form validation with CSS shake on failure
- 2.2-second processing simulation followed by a success micro-interaction
- GST (18%) calculation on the order summary
- Cart auto-clears on successful "payment"

---

## Screenshots

> _Place your screenshots in a `/docs/screenshots/` directory and update these paths._

| Home — The Shelf | Spec Configurator | Checkout Terminal |
|---|---|---|
| `docs/screenshots/home.png` | `docs/screenshots/spec.png` | `docs/screenshots/checkout.png` |

| Cart Drawer | Success State |
|---|---|
| `docs/screenshots/cart.png` | `docs/screenshots/success.png` |

---

## Project Structure

```
aisle-app/
├── index.html          # HTML shell — all three view containers live here
├── styles.css          # Complete design system (CSS variables → responsive)
├── main.js             # Application logic (state · router · WebGL · cart)
├── README.md           # This file
├── ARCHITECTURE.md     # Deep-dive technical documentation
└── docs/
    └── screenshots/    # UI screenshots (add your own)
```

There are intentionally no subdirectories for JS or CSS modules. The codebase is structured through clearly marked section comments (`// ═══ SECTION NAME`) that act as a lightweight module system and are navigable in any editor with symbol search.

---

## Getting Started

### Prerequisites

- Any modern web browser (Chrome 90+, Firefox 88+, Safari 15+, Edge 90+)
- A local static file server (required — browsers block ES modules and canvas operations on `file://` in some configurations)

### Quick Start

**Option 1 — VS Code Live Server**
1. Open the `aisle-app/` folder in VS Code.
2. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
3. Right-click `index.html` → **Open with Live Server**.

**Option 2 — Python**
```bash
cd aisle-app
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 3 — Node.js (npx)**
```bash
cd aisle-app
npx serve .
# Open the URL printed in the terminal
```

**Option 4 — Any static host**

Upload all three files to Netlify Drop, Vercel, GitHub Pages, Cloudflare Pages, or any CDN. No build step required.

```bash
# Example: Netlify CLI
netlify deploy --dir . --prod
```

---

## Configuration

All services, pricing, and 3D model mappings are declared in the `services` array at the top of `main.js`. To add, remove, or modify a service, edit only this array:

```js
const services = [
  {
    id: 0,
    name: 'Brand Identity',        // Display name
    sub: 'Packaging your essence', // 3D label subtitle
    tag: 'Strategic',              // Card tag label
    basePrice: 309120,             // Base price in INR (integer paise-free)
    color: '#d42b2b',              // Primary 3D model / label color
    accent: '#8b1010',             // Accent band / cap color on 3D model
    type: 'box',                   // 3D model type: 'box' | 'bottle' | 'can' | 'bag' | 'tube'
    desc: 'Full brand system…',    // Card and spec page description
    cardClass: 'card-red'          // CSS theme class (see Styling System)
  },
  // ...
];
```

**Add-on prices** are defined inline in `index.html` as `data-price` attributes on the checkbox inputs inside `#spec-addons`. To change add-on pricing without touching JS:

```html
<input type="checkbox" data-price="18500" data-label="Source Files">
```

**Pricing multipliers** are defined as `data-mult` attributes on `.spec-opt` buttons:

```html
<button class="spec-opt" data-key="duration" data-val="express" data-mult="1.35">
  Express (2 wks) +35%
</button>
```

**CSS design tokens** are all in `:root` at the top of `styles.css`:

```css
:root {
  --cream:   #f5f0e8;
  --ivory:   #faf8f3;
  --charcoal:#1a1a1a;
  --red:     #d42b2b;
  --gold:    #c9973a;
  --green:   #2d5a3d;
  --blue:    #1b3a6b;
  --purple:  #4a2060;
  --orange:  #d4561a;
}
```

---

## Screens & User Flow

```
┌─────────────────────────────────────────────────────────┐
│  #  (HOME)                                              │
│  Hero → Ticker → Services Grid → Shelf → About → CTA   │
│                                                         │
│  Card click ──────────────────────────────►             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  #product/{id}  (SPEC CONFIGURATOR)              │   │
│  │  3D Canvas  |  Timeline · Scope · Add-ons        │   │
│  │  Live Price ─→ Add to Cart / Proceed             │   │
│  │                                  │               │   │
│  └──────────────────────────────────┼───────────────┘   │
│                                     │                   │
│  Cart Drawer (overlay, any view) ◄──┘                   │
│  "Proceed to Checkout" ─────────────────────────────►   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  #checkout  (PAYMENT TERMINAL)                   │   │
│  │  Order Summary  |  Card Form                     │   │
│  │  Pay Now → Processing → ✦ Success                │   │
│  │  "Back to Aisle" ──────────────────────────────► │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

All mutable application state is held in a single top-level `State` object in `main.js`. There is no external state library.

```js
const State = {
  cart: [],              // CartItem[]
  currentView: 'home',   // 'home' | 'product' | 'checkout'
  currentProduct: null,  // number (service id) | null
  specConfig: {
    duration: 'standard',
    durationMult: 1,     // multiplier (e.g. 1.35 for express)
    scope: 'core',
    scopeMult: 1,        // multiplier (e.g. 2.2 for full suite)
    addons: []           // { label: string, price: number }[]
  }
};
```

**CartItem shape:**
```js
{
  id: number,          // Date.now() — unique per add action
  serviceId: number,   // index into services[]
  name: string,
  price: number,       // fully computed price at time of add
  specs: string[]      // human-readable config summary lines
}
```

State mutations flow through dedicated functions (`addToCart`, `removeFromCart`, `updateCartBadge`, `renderCartDrawer`) rather than being spread across event listeners — this keeps all side effects (DOM updates, badge re-renders) co-located with the mutation.

---

## SPA Router

The router is implemented as `navigateTo(viewName, productId?)` in `main.js`. It manages three named views (`home`, `product`, `checkout`), handles `window.history.pushState`, and responds to browser `popstate` for back/forward support.

```
navigateTo('product', 2)
  │
  ├─ Cancel & dispose previous view's Three.js RAF loop
  ├─ Remove 'active' class from old view (triggers exit animation)
  ├─ Add 'active' + 'view-entering' class to new view
  ├─ Push state to window.history → URL becomes #product/2
  ├─ Call view-specific init (initSpecView / initCheckoutView)
  └─ rebindCursor() on all new interactive elements
```

**Deep linking:** URLs are fully bookmarkable. On load, `window.location.hash` is parsed and the correct view is initialized directly.

**Memory management:** Each view that owns a Three.js context registers a cleanup function in `viewCleanup[viewName]`. `navigateTo` calls `viewCleanup[prevView]()` before switching — this disposes the `WebGLRenderer` and cancels the `requestAnimationFrame` loop to prevent context accumulation and GPU memory leaks.

---

## Three.js Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a complete breakdown. Summary:

| Scene | Canvas ID | Renderer lifetime | Products |
|---|---|---|---|
| Hero | `#hero-canvas` | Permanent (home view) | 4 products on shelf floor |
| Service Cards | Per-card `<canvas>` | Permanent (created on DOM build) | 1 per card (6 total) |
| About | `#about-canvas` | Permanent (home view) | 4 floating products |
| Spec Page | `#spec-canvas` | Ephemeral — disposed on route change | 1 (matches selected service) |

**Texture pipeline:** Each 3D model's label is a `THREE.CanvasTexture` generated at runtime via the `makeLabel()` and `makeTopLabel()` helpers — no external image files are required. Labels include a procedural barcode, accent band, and bold text.

**Model factories** (`makeCerealBox`, `makeCan`, `makeBottle`, `makeTube`, `makeBag`) all follow the same signature:
```js
makeModelType(scene, { x, y, z, color, accent, name, sub, scale? })
// returns: THREE.Group (for external rotation/position control)
```

---

## Pricing Logic

The final price for a configured service is:

```
finalPrice = round(basePrice × durationMultiplier × scopeMultiplier) + Σ(addon.price)
```

Where multipliers stack multiplicatively (not additively), reflecting the real cost relationship between timeline compression and scope expansion:

| Duration | Multiplier |
|---|---|
| Standard (4 wks) | 1.00× |
| Express (2 wks) | 1.35× |
| Rush (1 wk) | 1.60× |

| Scope | Multiplier |
|---|---|
| Core Package | 1.00× |
| Standard Package | 1.50× |
| Full Suite | 2.20× |

Add-ons are flat INR values summed after the multiplied base. All formatting is handled by `formatINR()`, which uses `Number.toLocaleString('en-IN')` for correct Indian comma grouping (e.g. ₹9,17,700).

Checkout applies 18% GST on top of the cart subtotal, displayed as a separate line item.

---

## Cart System

The cart drawer is a fixed `<aside>` positioned off-screen right and transitioned with `translateX`. It is independent of the router — it can be opened from any view.

**Opening:** `openCart()` adds `.open` to `#cart-drawer` and `#cart-overlay`. The overlay is a full-screen dimming layer that also closes the drawer on click.

**Rendering:** `renderCartDrawer()` is called every time the drawer opens or an item is removed. It rebuilds the item list from `State.cart[]` and recalculates the total. Event listeners on remove buttons are attached fresh each render (guarded by `rebindCursor()`'s `_cursorBound` check to prevent double-registration).

**Cart badge:** Updates on every `addToCart()` / `removeFromCart()` call. The CSS `badgePop` keyframe is re-triggered by clearing and restoring the `animation` property (the browser re-parses it on the next frame).

---

## Styling System

`styles.css` is structured in labelled sections in source order:

```
1. CSS Variables (:root)
2. Reset
3. Custom Cursor
4. Nav
5. Cart Drawer
6. SPA View scaffolding (.view, transitions)
7. Hero
8. Ticker
9. Services / Product Cards
10. Card colour themes (.card-red, .card-blue, …)
11. Shelf marquee
12. About
13. CTA
14. Footer
15. Scroll reveal utility
16. Screen A — Product Spec / Customizer
17. Screen B — Checkout Terminal
18. Responsive overrides (@media)
```

**Adding a new card theme:**
1. Add a CSS rule block following the `.card-*` pattern (tag colour + price colour).
2. Assign the new class name in the `services` array under `cardClass`.

**Dark nav override:** When the checkout view is active, a `MutationObserver` watches `nav[data-view]` and injects inline styles to flip the nav to a dark colour scheme — no extra class required on `<body>`.

---

## Performance Considerations

- **WebGL context limit:** Browsers enforce a hard limit of 8–16 simultaneous WebGL contexts. The six card scenes + hero + about = 8 contexts total, sitting at the safe edge. The spec-page canvas is ephemeral and does not add to this count permanently.
- **Pixel ratio cap:** All renderers clamp `devicePixelRatio` to 2 via `Math.min(window.devicePixelRatio, 2)` — prevents 4× overdraw on high-DPI displays.
- **Canvas resize:** Size is set inside the RAF loop using `getBoundingClientRect()`, which naturally handles viewport changes and CSS transitions without a separate `ResizeObserver`.
- **Texture reuse:** Each card's `CanvasTexture` is created once at card build time and held in the closure — no per-frame texture uploads.
- **IntersectionObserver** is used for scroll reveals instead of `scroll` event listeners, which avoids main-thread jank.
- **Cursor RAF:** The cursor ring uses an exponential smoothing lerp (`rx += (mx - rx) * 0.12`) inside a single persistent RAF loop rather than CSS transitions for precise sub-pixel tracking.

---

## Browser Support

| Browser | Minimum Version | Notes |
|---|---|---|
| Chrome / Edge | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 15+ | Full support; WebGL performance may vary on older iOS |
| Opera | 76+ | Full support |

**Required browser features:** WebGL 1.0, CSS Custom Properties, CSS Grid, `IntersectionObserver`, `history.pushState`, `requestAnimationFrame`, `CanvasRenderingContext2D`.

**Not supported:** Internet Explorer (any version). No polyfills are included.

---

## Roadmap

- [ ] **Backend integration** — Replace payment simulation with a real Stripe / Razorpay checkout session
- [ ] **LocalStorage persistence** — Persist cart across page reloads
- [ ] **Service filtering** — Filter the shelf grid by tag (Strategic, Digital, Media, etc.)
- [ ] **Dark mode** — Full dark theme toggle persisted via `prefers-color-scheme` + manual override
- [ ] **Accessibility pass** — ARIA roles for the cart drawer, focus trapping, keyboard navigation for the SPA router
- [ ] **i18n** — USD pricing variant + English/Hindi toggle
- [ ] **CMS integration** — Drive `services[]` from a headless CMS (Sanity, Contentful) via a simple fetch call
- [ ] **Performance audit** — Lazy-init off-screen Three.js cards with `IntersectionObserver`
- [ ] **E2E tests** — Playwright test suite for the cart → spec → checkout flow

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes. Keep all JS in `main.js` section-commented; keep all CSS in `styles.css` in the established section order.
4. Test in Chrome, Firefox, and Safari.
5. Open a Pull Request with a clear description of what changed and why.

**Code style:**
- Vanilla ES2020, `'use strict'`, no transpilation
- 2-space indentation
- Section headers use the `// ════` double-line comment style
- Function names are camelCase; DOM IDs use kebab-case
- No `var` — use `const` by default, `let` only when reassignment is needed

---

## Changelog

### v2.0.0 — 2026-05-20
- Added SPA router with `history.pushState` and deep-link support (`#product/{id}`, `#checkout`)
- Added Product Specification / Customizer screen (Screen A) with multiplicative pricing engine
- Added Checkout Terminal screen (Screen B) with live card preview and payment simulation
- Added Cart Drawer with slide-out animation, per-item removal, and running total
- Added cart badge with pop animation on the nav CTA
- Added WebGL memory management — spec canvas disposes renderer and cancels RAF on route change
- Added GST (18%) calculation in checkout summary
- Added form validation with CSS shake feedback
- Added success micro-interaction state ("Order Placed on the Shelf")
- Refactored cursor `rebindCursor()` to prevent double event-listener registration

### v1.0.0 — Initial Release
- Hero, Ticker, Services Grid, About, CTA, Footer
- Six per-card Three.js scenes (Box, Bottle, Can, Bag, Tube)
- Hero and About ambient Three.js scenes
- GSAP entrance animations
- IntersectionObserver scroll reveals
- Custom cursor with ring-follow

---

## License

```
MIT License

Copyright (c) 2026 Aisle Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

Made with obsessive attention to detail by **Aisle Studio** · 2026

_"Great packaging catches the eye, communicates instantly, and makes you reach for it."_

</div>
