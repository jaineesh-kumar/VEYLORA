# CryptML — Design System

Reference: Kamui landing page (video supplied) — a dusk-to-void gradient world, chunky
display headline, painterly hero scene, mono-type nav, pill CTA, card-flip feature reveal,
scroll-driven parallax. This doc translates that *mood* — not its Japanese-fantasy skin —
into a world that actually belongs to CryptML: encryption that trains itself.

## 0. Concept

Kamui's story is "duel at dusk, mystic and physical." CryptML's story is **noise resolving
into signal** — scrambled ciphertext settling into a trained model. Every section should
feel like watching something encrypted become legible, the same way Kamui's mist and
lantern-light slowly reveal a shrine.

**One-line brief:** a strategic, technical product (like Kamui's card game) — not a soft
consumer app. Confidence over cuteness.

---

## 1. Color

Named tokens, 6 hex values. Same move as Kamui's pink-dusk-to-indigo-night gradient world,
rebuilt around cipher/signal instead of shrine/lantern.

| Token | Hex | Role |
|---|---|---|
| `--void` | `#09090b` | Base background — pure dark void |
| `--dusk` | `#1a1025` | Gradient midpoint — deep dark tint, used behind hero art |
| `--signal-violet` | `#ff007f` | Primary accent — neon pink |
| `--cipher-cyan` | `#00f0ff` | Secondary accent — electric blue |
| `--key-amber` | `#ffea00` | Warm accent — bright yellow |
| `--ink` | `#ffffff` | Primary text on dark |
| `--ink-dim` | `#a1a1aa` | Secondary/body text on dark |

Rule: **violet is structural, cyan is a state, amber is an action.** Cyan only appears where
something has just been "decrypted" (revealed text, a completed step, an active toggle) —
never as decoration. Amber is reserved for the one primary CTA per screen, same discipline
Kamui uses for its single waitlist pill.

Gradient formula used across hero/section backgrounds:
`linear-gradient(180deg, var(--dusk) 0%, var(--void) 70%)` with a soft radial glow of
`--signal-violet` at 8–12% opacity behind the hero art, echoing Kamui's warm radial light
behind the shrine.

---

## 2. Typography

Kamui pairs a bold slab display with a monospace nav — technical label type next to
painterly headline type. CryptML keeps that tension but leans further technical, since the
product is infrastructure, not a game.

| Role | Face | Weight | Notes |
|---|---|---|---|
| Display (h1/h2) | Space Grotesk | 700 | Tight tracking (-0.02em), all-caps for hero headline only |
| Body | Inter | 400 / 500 | Line-height 1.6, `--ink-dim` by default |
| Utility / nav / labels / hashes | JetBrains Mono | 500 | Nav items, eyebrows, badges, version/hash strings — this is CryptML's answer to Kamui's mono nav |

Scale: hero h1 `clamp(2.5rem, 5vw, 4.2rem)`, section h2 `clamp(1.8rem, 3vw, 2.6rem)`,
body `1rem`, mono labels `0.75rem` with `letter-spacing: 0.12em` and uppercase.

Eyebrow labels (small mono line above a headline, like Kamui's "Own Your Cards") should
state a real fact, not filler — e.g. `AES-256 · FEDERATED · ON-DEVICE`.

---

## 3. Signature element — "Cipher Bloom"

The one thing this page is remembered by, standing in for Kamui's drifting cherry-blossom
petals and mist.

A field of small mono-glyph particles (`0 1 { } # ~ λ`) drifts slowly across the dark hero
background. As the user scrolls past the hero into the value section, the glyphs along that
scroll band gradually **morph into thin straight line-segments connecting into a sparse
node graph** — literally cipher noise resolving into a trained network. It's the same
emotional beat as Kamui's mist clearing to reveal the shrine, but it's built out of the
subject's own material (glyphs → graph), not borrowed imagery.

Implementation: two absolutely-positioned canvas/SVG layers, cross-faded by scroll
position; opacity and "settle" progress driven by `IntersectionObserver` or scroll %, not a
fixed animation timeline.

---

## 4. Layout & sections

```
┌─────────────────────────────────────────────┐
│ CRYPTML     PROTOCOL  MODELS  RESEARCH  DOCS │  ← mono nav, transparent, pill CTA right
│                                    [Join ↗]  │
├─────────────────────────────────────────────┤
│  ENCRYPTION THAT LEARNS                      │  ← hero, dusk→void gradient
│  Federated ML on data that never leaves       │     glyph-bloom particles drift behind
│  its cipher.                                  │     type; single amber CTA pill
│        [ Join the waitlist ]                  │
│  AES-256 · FEDERATED · ON-DEVICE              │  ← mono badge row (Kamui's OS-badge slot)
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  eyebrow: HOW IT WORKS                        │  ← split section, glyphs→graph mid-morph
│  A model that never                     [art] │     behind this band (signature moment)
│  sees your plaintext                          │
│  body copy, 2-3 lines max                     │
│  [ Join the waitlist ]                        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  ← Prev   [ ENCRYPTED ]  |  [ TRAINED ]  Next→│  ← feature "card flip", Kamui carousel
│           card                 card           │     analog: before/after state cards
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  eyebrow: OWN YOUR MODELS                     │  ← Kamui "Summon Yokai" analog
│  TRAIN ON PRIVATE DATA               [ art:   │     framed node-graph artwork right,
│  WITHOUT TOUCHING IT                  graph   │     resolved (cipher-cyan) state
│  body copy                            frame ] │
│  [ Join the waitlist ]                        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  CRYPTML   Protocol Models Research Docs Github│  ← mono footer, quiet, void bg
└─────────────────────────────────────────────┘
```

Section rhythm: alternate full-bleed dark sections with slightly different gradient
midpoints (`--dusk`→`--void` vs flat `--void`) so scrolling still feels like movement
through a single world, the way Kamui's page shifts from pink dusk to full night without a
hard cut.

---

## 5. Components

**Nav** — transparent over hero, `JetBrains Mono` 500 links, uppercase, 0.08em tracking.
Becomes a solid `--void` bar with `1px` bottom hairline (`--ink-dim` at 12% opacity) after
20px scroll.

**Primary CTA (pill)** — `border-radius: 999px`, `--key-amber` fill, `--void` text (dark
text on the warm fill, same contrast logic Kamui uses with its white pill on dark bg).
Hover: brightens 8%, no shadow — glow instead, via a soft amber `filter: drop-shadow`.
Exactly one per screen.

**Badge row** (mono facts: `AES-256`, `FEDERATED`, `ON-DEVICE`) — small mono chips, 1px
`--ink-dim` border, transparent fill. This is the direct analog to Kamui's OS/device icon
row — real technical facts standing in for "macOS / Windows / Linux."

**State card** (the "card flip" feature, Kamui's card-back carousel analog) — two cards,
`ENCRYPTED` (cipher-cyan glyph texture, locked icon) and `TRAINED` (violet node-graph
texture, unlocked icon), divider bar between them, prev/next arrows + dot progress below —
structurally identical to Kamui's carousel, recast as "before/after" instead of "card A/B."

**Framed artwork panel** — thin `--signal-violet` border frame around the node-graph
illustration in the "Own your models" section, mirroring Kamui's ornate card-frame around
the Yokai portrait.

---

## 6. Motion

- Hero glyph-bloom: continuous slow drift, ~40s loop, `prefers-reduced-motion` disables
  drift and shows a static settled graph instead.
- Scroll-linked morph: glyphs → graph lines, tied to scroll fraction through the "How it
  works" section — not autoplay, so it reads as *caused by* the user's scroll, same as
  Kamui's parallax mountains.
- Card flip: 400ms, ease-out, 3D rotate on the Y axis.
- CTA hover: 150ms glow-brighten only. No bounce, no scale — this product should feel
  precise, not playful.

---

## 7. Voice

Kamui's copy is short, declarative, slightly mythic ("A Strategic Card Game"). CryptML's
copy should be short and declarative but *precise*, never mythic — the confidence comes
from specificity, not drama.

- Headlines: plain claims a cryptographer would actually make. "Encryption that learns,"
  not "Unleash the power of secure AI."
  - Body copy: one real mechanism per sentence, not marketing abstraction.
- Badges/eyebrows: always a verifiable fact (a standard, a property, a number), never a
  vibe word.

---

## 8. What was deliberately not carried over

- No painterly/fantasy illustration — CryptML's world is built from typographic and
  geometric material (glyphs, graphs, frames), not character art.
- No pink dawn tones — CryptML stays in the violet-to-void register throughout; warmth is
  rationed to the single amber accent instead of a second warm gradient stop.
- No numbered-step markers unless a sequence is real (e.g. an actual protocol handshake
  order) — Kamui doesn't use them either, and CryptML shouldn't invent a fake process.
