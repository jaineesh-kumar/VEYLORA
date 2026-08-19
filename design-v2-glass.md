# CryptML — Design System v2 (Glassmorphic / Spline)

Supersedes the earlier dark "Cipher Bloom" direction (kept in `design.md` v1 for reference —
that mood doesn't apply here). This version is scoped to the reference photo you sent
("Escape") and is **UI-only**: it changes markup structure, styling, and front-end
interaction. It assumes existing routes, data, auth, and API calls are untouched — every
component below is a visual/interaction layer that sits on top of whatever currently renders
the page's content.

## 0. Read on the reference

The photo isn't glassmorphism by heavy blur alone — it's **restraint**: one full-bleed
atmospheric photo, one glass surface (the search bar), one dark pill button, one italic
serif word for warmth inside an otherwise plain sans headline. The "glass" reads as premium
*because* there's so little else competing with it. That's the rule to hold onto more than
any specific blur value.

CryptML's version needs its own atmosphere, not a mountain — see §2 (Spline layer) for what
replaces it.

---

## 1. Color

Light theme, blue-to-purple register. Named tokens:

| Token | Hex | Role |
|---|---|---|
| `--sky-top` | `#EAF2FC` | Pale sky blue — top-of-page gradient start |
| `--sky-mid` | `#DCE3FA` | Blue-lavender — gradient midpoint behind hero |
| `--haze` | `#E9DFFB` | Soft lilac — gradient tail, where it meets the glass layer |
| `--ink` | `#211C36` | Primary text — near-black with a violet undertone |
| `--ink-dim` | `#6C6684` | Secondary text |
| `--accent-violet` | `#7C5CFF` | Primary accent — italic headline word, focus states, primary links |
| `--accent-blue` | `#4DA6FF` | Secondary accent — icon tints, hover states, small highlights only |
| `--glass-fill` | `rgba(255,255,255,0.55)` | Glass surface fill |
| `--glass-border` | `rgba(255,255,255,0.7)` | Glass surface edge highlight |
| `--pill-dark` | `#241B3D` | Dark pill buttons (nav CTA, search submit) — deep violet-black, not neutral black |

Gradient formula, page background:
`linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 45%, var(--haze) 100%)`

Rule: **violet is the primary accent, blue is a supporting highlight** — not two competing
accents. Violet does the same job `--accent-clay` did before (italic word, focus rings,
primary CTAs); blue only shows up in smaller moments (a badge icon, a hover tint, the glow
behind the Spline scene) so the page doesn't read as two brands arguing with each other.

---

## 2. The Spline layer (replaces the mountain photo)

You supplied a Spline scene: `https://prod.spline.design/PpqhO6v2MXp8veP1/scene.splinecode`.
It sits where the photo sits in the reference — as the atmosphere behind the hero content,
not as a decorative sidebar object. Treat it as CryptML's terrain.

**Placement:** absolutely positioned behind the nav/headline/search-bar stack, full-bleed,
`z-index: 0`. Content sits at `z-index: 1+` on glass surfaces above it, exactly like the
reference's text sitting over the mountain photo.

**Interactivity:** Spline scenes support pointer-driven camera/object movement natively in
the editor — if the scene you built has drag/orbit or mouse-parallax behavior authored in
Spline, it will just work once embedded; no extra JS needed for that part. Where our own JS
does the work is loading discipline (below) and optional scroll-tied camera moves if you
want the "descend through the terrain" feeling as the user scrolls past the hero — that
needs the Spline app's `runtime.js` API (`spline.setVariable`, or a named object's rotation)
wired to scroll position, only if you decide it's worth the complexity.

**Do not** let the 3D layer become the whole page. In the reference, the photo is the hero
section's background only — by the time the trust-logo band appears, the image has darkened
and the type has flipped to light-on-dark. Mirror that: the Spline canvas is scoped to the
hero viewport height, not the full page.

---

## 2.5 The animated background (our own, not a photo)

Instead of a stock photo, the background is a **living gradient field** — three large,
heavily blurred color blobs (violet, blue, lilac) drifting on independent slow loops behind
the glass. This is what makes the page feel alive the moment it loads, before the Spline
scene has even started loading, and it costs nothing in load time since it's pure CSS —
no image request, no decode time, no LCP competition with the Spline payload in §3.

```
hero (position: relative)
 ├─ static gradient (z-index: 0)     — instant, non-negotiable base paint
 ├─ aurora blobs (z-index: 0)        — 3× blurred, animated radial shapes
 ├─ spline canvas (z-index: 0, lazy) — floats above the aurora once it arrives
 └─ nav / headline / command bar (z-index: 1+)
```

```css
.blob{ position:absolute; border-radius:50%; filter: blur(90px); opacity:0.45; }
.blob-a{ width:520px; height:520px; background: var(--accent-violet);
  animation: drift-a 26s ease-in-out infinite; }
/* drift keyframes move via transform only (translate + scale) — GPU-composited,
   never top/left, so this doesn't trigger layout on every frame */
```

Rules:
- **Transform-only animation.** Never animate `top`/`left`/`width` directly — always
  `transform: translate() scale()` so the browser composites on the GPU instead of
  repainting layout every frame. This is the difference between "free" and "janky."
- **Three blobs, three independent durations** (26s/32s/38s here) so the pattern never
  visibly loops or repeats in a way the eye locks onto.
- **`prefers-reduced-motion: reduce`** pauses the animation entirely — the blobs still show
  (color, not motion, is the point), they just hold still.
- **This layer is intentionally cheap.** If you want more visual complexity later, add a
  fourth blob or vary blur radius — don't reach for a canvas/WebGL background here, that
  budget belongs to Spline.

If a photo ever gets added back in later (brand shoot, real screenshots, etc.), it slots in
as an additional layer between the aurora and the Spline canvas — same structure as before,
just not the default anymore.

---

## 3. Performance — this is the part that will break if rushed

Spline scenes are the single heaviest thing you can put on a landing page. The reference
site loads in well under a second because it's one compressed photo. A naive Spline embed
can add multiple megabytes and 2–4s of blocking load. Follow this order or the "don't take
longer to load" requirement fails:

1. **Never render `<spline-viewer>` on initial paint.** Ship a static placeholder first —
   a lightweight CSS gradient (the `--sky-*` tokens above) plus, optionally, one blurred
   still frame exported from the Spline editor as the loading state. First paint should be
   indistinguishable from "finished" to the eye.
2. **Load the Spline runtime script with `defer`**, and only *instantiate* the viewer after
   `window.load` fires (or on `requestIdleCallback`, falling back to a `setTimeout(…, 0)` for
   Safari) — never block the hero text or the glass search bar behind it.
3. **`<link rel="preconnect" href="https://prod.spline.design">`** in the document head so
   that when loading does start, DNS/TLS isn't also on the critical path.
4. **Gate on viewport, not just load event** — if the hero isn't the first thing in the DOM
   on some page, use `IntersectionObserver` and only create the viewer when the hero
   scrolls near view.
5. **Respect `prefers-reduced-motion`** — skip the Spline embed entirely and show the static
   placeholder frame permanently. This also quietly helps low-power devices.
6. **Mobile:** below `768px`, don't load the scene at all — serve the static exported frame.
   Interaction budget on mobile is worse and the payoff is smaller on a small viewport.
7. **One scene per page.** Do not reuse `<spline-viewer>` across multiple pages/sections —
   only the landing page hero gets it, per your original ask.

Rough budget to hold yourself to: hero text and glass search bar interactive within
~800ms; Spline scene allowed to arrive up to ~2–3s later without it counting as "slow,"
because nothing the user needs is waiting on it.

---

## 4. Typography

| Role | Face | Weight | Notes |
|---|---|---|---|
| Headline | Inter or system sans | 500 | Plain, large, `--ink` |
| Headline accent word | Fraunces or Playfair Display, italic | 400 | The one warm serif word per headline — this is CryptML's version of "Inner Peace" |
| Body | Inter | 400 | `--ink-dim`, line-height 1.6 |
| Nav / labels / buttons | Inter | 500 | Small caps not needed — reference nav is plain sentence case, keep it that way |

Scale: hero h1 `clamp(2.2rem, 4.2vw, 3.4rem)`, line-height 1.15. Body `1rem`.

---

## 5. Components (glass system)

**Glass surface — base recipe**, used for nav, search bar, cards, badges:
```
background: var(--glass-fill);
backdrop-filter: blur(20px) saturate(160%);
-webkit-backdrop-filter: blur(20px) saturate(160%);
border: 1px solid var(--glass-border);
box-shadow: 0 8px 32px rgba(33,28,54,0.10);
```
Corner radius: `16px` for cards/bars, `999px` (full pill) for nav and buttons — the
reference uses pill shapes almost everywhere, keep that consistent.

**Nav** — floating glass pill bar, not full-width — matches reference's contained rounded
nav. Logo left, links center, one dark pill CTA right (`--pill-dark` fill, white text).
Sticky on scroll with the same glass recipe, slightly higher opacity (`0.75`) once scrolled.

**Trust badge** (small pill above headline, reference: "Voted best peaceful place in the
world") — CryptML equivalent should be a real, verifiable claim, same rule as v1: e.g.
"Audited zero-knowledge protocol" or "SOC 2 Type II in progress" — whatever is actually
true. Glass pill, icon + mono-weight small text.

**Interactive command bar** (replaces "Search for a location...") — this is CryptML's
highest-value interactive element. Glass pill input, placeholder like `Ask CryptML how it
handles your data model...`, dark pill submit button labeled `Run query` or `Ask`. This can
genuinely be wired to something (a docs search, a live demo query against a sandboxed
model) — flag to your backend team as the one spot where UI and data intentionally meet, if
you want it to do more than route to a docs search page.

**Trust/partner logo band** (reference: Forbes/Bloomberg/etc. over the darkened lower photo)
— CryptML equivalent: wordmark row of real integrations or backers (e.g. framework/cloud
logos you actually support), in muted `--ink-dim` on a slightly darkened glass band at the
bottom of the hero, exactly where the reference places it — this is the section that "grounds"
an abstract 3D hero in something concrete.

**Cards below the fold** — same glass recipe, `16px` radius, laid out in a grid; each card
title in plain Inter 500, no italic (italic is reserved for the one hero accent word only).

---

## 6. Motion

- Glass surfaces: no animation on their own besides the standard `backdrop-filter` — motion
  budget goes to the Spline layer and to interaction feedback, not ambient effects.
- Buttons: 120ms opacity/transform on hover (`translateY(-1px)`), no bounce.
- Nav: opacity/blur-strength transition on scroll, 200ms ease.
- Command bar: focus state gets a `--accent-violet` ring (`box-shadow: 0 0 0 3px rgba(124,92,255,0.25)`),
  nothing else moves.
- Scroll-linked Spline camera move (optional, see §2) should be the only scroll-tied motion
  on the page — don't stack parallax on text as well, or it starts fighting the glass
  clarity the whole system depends on.

---

## 7. What's explicitly out of scope

- No backend, data model, auth, or routing changes — this document is styling, markup
  structure for the new components (nav/hero/command-bar/logo-band/cards), and front-end
  loading behavior only.
- No dark mode in this pass — v1's dark "Cipher Bloom" direction is shelved, not merged;
  don't blend the two token sets in one stylesheet.
- No full-page Spline backgrounds outside the landing hero.
- No new illustration/photography commissioned — the atmosphere is the Spline scene plus
  gradient, not a stock photo replacement.
