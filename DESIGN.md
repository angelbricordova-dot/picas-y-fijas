---
name: Picas y Fijas
description: La mesa de dominó en el celular — paño verde, fichas color hueso, resultados como fichas de dominó.
colors:
  felt-hi: "oklch(0.52 0.1 155)"
  felt: "oklch(0.44 0.095 157)"
  felt-lo: "oklch(0.355 0.08 159)"
  felt-deep: "oklch(0.285 0.066 161)"
  felt-line: "oklch(0.6 0.08 155 / 0.45)"
  bone: "oklch(0.965 0.022 88)"
  bone-2: "oklch(0.915 0.032 84)"
  bone-edge: "oklch(0.82 0.042 80)"
  bone-shade: "oklch(0.67 0.05 74)"
  ink: "oklch(0.23 0.02 60)"
  on-felt: "oklch(0.975 0.018 95)"
  on-felt-2: "oklch(0.88 0.04 145)"
  on-felt-3: "oklch(0.78 0.05 150)"
  fija: "oklch(0.6 0.205 29)"
  fija-deep: "oklch(0.47 0.17 29)"
  pin: "oklch(0.8 0.125 82)"
  pin-deep: "oklch(0.62 0.11 75)"
  seat-azul: "oklch(0.66 0.15 245)"
  seat-rosado: "oklch(0.7 0.17 357)"
  seat-amarillo: "oklch(0.85 0.155 92)"
  seat-lila: "oklch(0.66 0.15 302)"
typography:
  display:
    fontFamily: "Bagel Fat One, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  wordmark:
    fontFamily: "Bagel Fat One, system-ui, sans-serif"
    fontSize: "clamp(50px, 16.5vw, 72px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  digit:
    fontFamily: "Bagel Fat One, system-ui, sans-serif"
    fontSize: "56% of tile height"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Onest Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Onest Variable, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  key: "14px"
  button: "16px"
  row: "14px"
  tray: "26px"
  pill: "999px"
spacing:
  gutter: "16px"
  row-gap: "6px"
  block-gap: "24px"
components:
  button-primary:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    height: "58px"
  button-ghost:
    textColor: "{colors.on-felt}"
    rounded: "{rounded.button}"
    height: "50px"
  key-digit:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    height: "54px"
  key-submit:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bone}"
    rounded: "{rounded.key}"
    height: "54px"
  input-well:
    backgroundColor: "{colors.felt-deep}"
    textColor: "{colors.on-felt}"
    rounded: "{rounded.key}"
    height: "56px"
  guess-row:
    backgroundColor: "oklch(0.33 0.072 160 / 0.82)"
    rounded: "{rounded.row}"
    padding: "8px 10px 8px 8px"
---

# Design System: Picas y Fijas

## Overview

The phone is the domino table. The ground is a lamp-lit green felt that owns the whole shell; everything you touch is a raised bone tile with a visible thickness that sinks when pressed. The single signature component is the result domino: every guess is answered with a domino whose left half carries fijas (solid red pips) and whose right half carries picas (ink rings), 0–6 pips, matching the 3–6 digit code length. Players are domino-tile characters with pip eyes, a mouth, a seat-colored blush and a seat-colored pip count on the lower half, plus one accessory.

Single theme: the felt is the scene at any hour; there is no light mode.

## Colors

### Primary
- **Felt** (`felt`, `felt-lo`, `felt-hi`): the ground, drawn as a radial lamp gradient from `felt-hi` at the top to `felt-lo`. Wells, trays and inputs sink into `felt-deep`.
- **Bone** (`bone`, `bone-2`, `bone-edge`, `bone-shade`): every tile, key, primary button and letter tile. `bone-shade` is the tile's side (its thickness), `bone-edge` the engraved divider line.

### Secondary
- **Fija red** (`fija`, `fija-deep`): reserved for fijas, the fija mark on owner digit tiles, destructive actions, and the "they cracked your code" alert. Never a generic accent.
- **Brass pin** (`pin`, `pin-deep`): the domino center pin; also the ready check, host crown, switch "on", win tallies, focus ring and text selection.

### Neutral
- **Ink** (`ink`): pips, numerals on bone, and the submit key ("Probar").
- **On-felt text** (`on-felt`, `on-felt-2`, `on-felt-3`): text on felt is tinted from the felt hue, never gray.

### Named Rules
- **Red means fija.** Red pips and red tiles always mean "right digit, right place". Seat colors avoid red for that reason.
- **Shape before color.** Fija = solid dot, pica = ring, nada = dimmed tile. Results never rely on color alone.
- **Seat colors are identity, not state.** Azul, rosado, amarillo, lila; in Parejas the team color replaces the seat color.

## Typography

- **Bagel Fat One** — display, wordmark, all numerals on tiles and keys, the room-code letters, round number, and big result lines.
- **Onest Variable** — all UI text: labels, body, buttons.

### Hierarchy
- Wordmark: clamp(50px, 16.5vw, 72px), two staggered lines with the "y" drawn as a domino tile.
- Screen title: Bagel 26px. Sheet title: Bagel 24px. Win title: Bagel 44px with the bone extrusion shadow.
- Labels 14–15px / 600–650. Body 16px. Secondary 13–14px in `on-felt-2/3`.

## Layout

Single column, max 480px, centered on wider screens. Safe-area insets on all sides. Game screens are three bands: top bar + players strip + tabs, a scrolling history list in the middle that follows the newest row, and a bottom tray (rounded 26px, `felt-deep`) holding slots and the keypad. Under 760px tall, keys shrink from 54 to 46px and slot tiles from 64 to 54px.

## Elevation & Depth

Depth is physical tile thickness: a hard `0 Npx 0 bone-shade` side directly below the face (no x offset) plus one soft blurred shadow under it. Pressing moves the face down by the thickness and collapses the side. Wells are the inverse: an inset shadow into `felt-deep`. Nothing floats on glass or blur.

## Shapes

Rounded rectangles in the domino's proportions: keys and inputs 14px, buttons 16px, rows 14px, tray and sheets 26px top corners, pills only for small chips. Digit tiles round at 22% of their width.

## Components

### Buttons
Primary = bone tile with ink label and 4px thickness. Ghost = 2px inset `felt-line` outline. Quiet = text only. Danger = fija tile. Disabled primary drops into a flat `felt-deep` well.

### Keypad
3×3 digits + [Libreta | 0 | Borrar] + full-width "Probar" in ink. Libreta mode tints digit keys `bone-2` and marks a digit with an ink strike (no está) or a red ring (sí está). Used digits dim to 35% when repeats are off.

### Digit tiles
Sizes xs/sm/md/lg. Empty slots are felt wells with a blinking bone caret. On the code owner's screen, tiles mark fija (red tile), pica (ink ring) and nada (dimmed).

### Result domino (signature)
SVG, 208×110 viewBox: bone face, bone-shade side, engraved divider, brass pin. New results slide in with a slight overshoot and the pips pop one by one (fijas first) in sync with synthesized clicks; a full crack glows brass.

### Characters
Domino-tile avatars (8 accessories: gorra, sombrero vueltiao, moño, gafas, corona, audífonos, bigote, rizos) with moods idle/happy/sad/wow/think and an occasional blink.

### Navigation
Top bar with 44px icon buttons (Lucide, stroke 2.2–2.4). Bottom sheets slide up from the bottom on the drawer curve; the backdrop closes them.

## Do's and Don'ts

### Do:
- Answer every guess with the domino, never with a bare number.
- Keep bone for things you can touch and felt for the ground.
- Animate the result moment; keep everything else quick (≤300ms, strong ease-out).

### Don't:
- Use red for anything that is not a fija, an alert or a destructive action.
- Add a light theme, glass panels, gradients on text, or grain textures.
- Encode fija/pica by color alone.
