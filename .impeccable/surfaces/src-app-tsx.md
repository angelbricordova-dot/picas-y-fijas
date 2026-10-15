---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface brief: Picas y Fijas app (all screens)

Scope: the whole PWA (home, create/join, lobby, secret, play, result). Visitor mode: Operate (players complete a turn quickly), with game expression concentrated in the result moment.
Audience/job: friends, couples, families each on their own phone; create or join a room, set a secret, guess each round, read fijas/picas, rematch.
Constraints: portrait, one hand, all ages, online rooms via Vercel Functions + Upstash; secrets server-side.
Fallback agreed with user: if the domino world does not convince them, switch to a standard casual-game look.

## Direction contract

THESIS: The phone is the domino table. Every guess result is a domino tile (top half fijas, bottom half picas, 0–6 pips like the code length). Refuses the category default of a white Wordle grid with green/yellow squares.

OWN-WORLD: Felt-green ground owning the shell, bone/ivory raised tiles with a darker bottom bevel, ink-black numerals in a fat rounded display face, red solid pips for fijas and ink rings for picas, four plastic-chair player colors (red, blue, yellow, purple). Characters are domino tiles with pip eyes and accessories.

STORY: Players understand within seconds whose turn/round it is, what they guessed and how close they are; they trust the referee and want a rematch.

FIRST VIEWPORT: Home: wordmark with a tile character at top third, two big tile-buttons "Crear sala" (primary, bone) and "Unirme" (code input), a quiet "Cómo se juega" link. Play screen: top bar (room code, round, timer), rivals strip of avatar tiles with their status, the history list of guess rows each ending in a domino result tile, and a bottom-anchored keypad with the guess slots above it.

FORM: Candidate 4 of 7 (dominó de la tienda de barrio), seed: none (unavailable). Signature move: the result domino slides onto the felt and its pips pop in one by one (fijas, then picas) with a clack; the win is a domino-chain topple.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
