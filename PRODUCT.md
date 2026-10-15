# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + Vite + TypeScript as an installable PWA, with Vercel Functions (`/api`) and Upstash Redis (Vercel Marketplace) as the authoritative room store. Chosen because the game is online across phones, must run on Vercel with near-zero setup, and the server must hold secrets so no client can read another player's code.

## Users

Friends, couples and families in Colombia/Latin America who already know "Picas y Fijas" as a paper or spoken game. Each person plays on their own phone, usually in the same room or on a call, in short sessions (5–20 minutes) at home, on trips, at family gatherings. Ages range from kids to grandparents, so it must be readable and obvious without explanation.

## Product Purpose

Let 1–4 people play Picas y Fijas online from their own phones: each player keeps a secret code, others guess it, and the app scores every guess (fija = right digit in the right place, pica = right digit in the wrong place). Success is a group starting a game in under a minute and asking for a rematch.

## Positioning

The spoken family game made physical on the phone: the app is the honest referee (it holds secrets server-side and never miscounts), so the fun is in the deduction and the table talk, not in bookkeeping on paper.

## Operating Context

Played in person or over a call; one player creates a room and shares a 4-letter code or link (WhatsApp is the norm). Added to the home screen as an app. Played one-handed, in portrait, often in bright rooms or at night on the couch.

## Capabilities and Constraints

- Modes: Duelo (2 players), Todos contra todos (3–4, each guess scored against every rival; a cracked player is eliminated; last one standing wins), Parejas 2 contra 2 (team code, teammates alternate guessing), Carrera (1–4 race to crack a code the app invents; others' digits stay hidden, only their scores show).
- Rules per room: code length 3–6 (default 4), repeated digits on/off (default off), optional round limit, optional round timer.
- Rounds are simultaneous: every side submits one guess per round; whoever cracks a code in the same round ties ("ronda justa").
- Server-authoritative scoring; secrets never sent to rivals.
- Upstash free tier limits polling volume; realtime is short polling.
- Undecided: account system (none), chat (none; people talk in person or on WhatsApp).

## Brand Commitments

Name: "Picas y Fijas". Spanish (Latin American, Colombian usage), warm, playful, family-friendly. The user asked for a familiar, eye-catching, dynamic, intuitive interface with custom, unique vector illustration.

## Evidence on Hand

No logo, illustrations, testimonials or stats exist. Do not invent player counts, reviews or app-store claims.

## Product Principles

1. The referee is invisible and trustworthy: scoring is instant, exact and impossible to peek at.
2. Every screen answers "what do I do now?" for a first-time grandparent.
3. The moment of a result (fijas and picas landing) is the emotional core; it deserves the craft.
4. Getting friends into a room beats every other feature.

## Accessibility & Inclusion

Large tap targets for all ages, readable numerals, results never encoded by color alone (fija/pica have distinct shapes and labels), respects reduced motion.
