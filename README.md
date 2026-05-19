# AISLE — Premium Creative Agency Storefront

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WebGL](https://img.shields.io/badge/WebGL-Three.js%20r128-informational.svg)](https://threejs.org/)
[![Animation](https://img.shields.io/badge/Animation-GSAP%203.12.2-green.svg)](https://gsap.com/)

AISLE is an immersive, high-end conceptual creative agency landing page built on an editorial retail metaphor: **"We package ideas that sell themselves."** The platform reimagines abstract creative services (Brand Identity, Web Design, UX Strategy) as tangible, luxury supermarket consumer goods—complete with interactive 3D packaging, dynamic pricing metrics, and an e-commerce interaction pipeline.

[Explore the Interactive Shelf Preview]

---

## 🎨 Design System & Aesthetic Architecture

The user interface balances premium editorial print media with cutting-edge front-end interactions:

* **Typography:** A calculated triad pairing **Playfair Display** (high-fashion editorial serif), **Bebas Neue** (structural industrial display), and **DM Mono** (technical developer-style monospace).
* **Color Palette:** A warm, high-contrast base layout contrasting an organic cream/ivory backdrop with dense charcoal text, split into product-specific color tokens:
  
  | Color Token | Hex Code | Utility |
  | :--- | :--- | :--- |
  | `--cream` | `#f5f0e8` | Section Backdrops (Warm) |
  | `--ivory` | `#faf8f3` | Core Page Body Background |
  | `--charcoal` | `#1a1a1a` | Primary Structural Typography & Nav |
  | `--red` | `#d42b2b` | Accent Core / Brand Identity Token |
  | `--blue` | `#1b3a6b` | Web Design Component Token |
  | `--green` | `#2d5a3d` | Motion & Media Asset Token |
  | `--purple` | `#4a2060` | Strategic Consulting Token |
  | `--orange` | `#d4561a` | Copywriting & Creative Accent |
  | `--gold` | `#c9973a` | Primary CTA / Full Campaign Package |

---

## 🚀 Key Functional Modules

### 1. Isolated Per-Card WebGL Micro-Engines
Rather than deploying a single global canvas instance across the layout, the architecture generates **separate, isolated Three.js rendering pipelines** mapped directly into structural HTML5 canvas layers inside each product card. 
* Objects instantly pause lifecycle tasks when pushed out of the viewport.
* Interactive mouse hovering overrides standard micro-animations to accelerate orbital rotations ($y$-axis spin).

### 2. Procedural Decal Vector Mapping
To maintain high performance and eliminate asset loading overhead, item text, color bars, metadata, and commercial barcodes are drawn programmatically via an internal HTML5 canvas matrix (`makeLabel`), which is instantly converted to a high-resolution `THREE.CanvasTexture`.

### 3. Kinematic Kinetic Elements
* **Dual-Component Cursor:** A magnetic core dot tracking raw hardware inputs combined with an outer SVG/CSS layout ring operating on an interpolation easing vector delay ($0.12\text{s}$).
* **Seamless Marquees:** CSS Keyframe-driven, dual-instanced structural text wrappers that guarantee flawless, non-breaking horizontal loops irrespective of screen size.

---

## 🛠️ Technical Stack & Architecture

This repository uses a zero-build, monolithic asset extraction model optimized for ultra-fast First Contentful Paint (FCP) and low runtime latency:

* **Core Runtime:** Pure Vanilla JavaScript (ECMAScript 2022+)
* **Styles:** CSS3 Custom Variables featuring modular Flexbox/Grid systems and liquid scaling boundaries (`clamp()`).
* **3D Engine:** Three.js r128 (WebGL Core, Orbit Math, Standard Physical Material profiles, Soft Shadow mapping).
* **Micro-Animations:** GSAP 3.12.2 (Orchestrating initially-mounted sequential text offsets).
* **Intersection Engine:** Native JavaScript `IntersectionObserver` managing viewport-triggered hardware-accelerated animations.

### Repository Layout
```text
├── index.html          # Application structure & semantic markup
├── style.css           # Design tokens, layouts, UI interaction states
├── app.js              # Three.js runtime math, cursor rendering, animations
└── README.md           # Documentation
