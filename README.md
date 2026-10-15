# Picas y Fijas

El juego de Picas y Fijas para jugar con amigos, pareja y familia, cada uno desde su celular. La app guarda los códigos secretos y cuenta las picas y fijas por ti, sin errores.

- **Fija:** número correcto en el lugar correcto.
- **Pica:** el número está en el código, pero en otro lugar.

Ejemplo: código `4872`, intento `4879` → 3 fijas y ninguna pica.

## Modalidades

| Modo | Jugadores | Cómo funciona |
| --- | --- | --- |
| Duelo | 2 | Cada uno adivina el código del otro. |
| Todos contra todos | 3 o 4 | Cada intento se compara con el código de todos. Si te descubren, quedas fuera; gana el último en pie. |
| Parejas | 2 contra 2 | Cada pareja tiene un código y los compañeros se turnan para adivinar. |
| Carrera | 1 a 4 | La app inventa un código; gana quien lo descubra primero. No ves los números de los demás, solo qué tan cerca van. |
| Práctica | 1 | Carrera contra la app, sin internet. |
| Modo árbitro | en persona | Sin internet. Guardas tu código en tu celular y, cuando el otro dice un número en voz alta, lo escribes y la app te dice qué responder (y te marca qué dígito es fija o pica). |

**Reglas configurables:** de 3 a 6 dígitos, con o sin números repetidos, límite de rondas (8, 10, 15 o sin límite) y tiempo por ronda (30, 60, 90 s o sin reloj).

**Rondas justas:** todos juegan cada ronda; los intentos de los demás se revelan al cerrarla. Si dos descubren en la misma ronda, empatan.

## Publicarla en Vercel

1. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa este repositorio. Vercel detecta Vite solo (`npm run build`, carpeta `dist`).
2. Para las salas online hace falta una base de datos Redis gratuita:
   en el proyecto de Vercel → **Storage** → **Create Database** → **Upstash for Redis** (plan gratis) → conéctala al proyecto.
   Vercel agrega solas las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` (también sirven `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`).
3. Vuelve a desplegar (**Deployments → Redeploy**) para que tome las variables.
4. Abre la página en el celular y elige **Agregar a pantalla de inicio** (en iPhone, desde el botón Compartir de Safari).

Sin la base de datos, la práctica y el modo árbitro funcionan igual; crear o unirse a una sala muestra un aviso explicando qué falta.

> El plan gratis de Upstash da para muchas partidas entre amigos. Cada celular pregunta por la sala más o menos una vez por segundo mientras juega, y deja de preguntar cuando la app no está en pantalla.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173 (las salas se guardan en memoria)
npm test           # pruebas del motor del juego
npm run typecheck
npm run build
```

Para probar con varios celulares en la misma red Wi-Fi, abre la dirección "Network" que muestra `npm run dev`.

## Cómo está hecho

- `shared/engine.ts` — el motor: reglas, puntuación, rondas, modos y la vista de cada jugador (nunca incluye los códigos ajenos).
- `api/room.ts` — función de Vercel: crea salas, recibe jugadas y responde al sondeo. Guarda en Upstash Redis con escritura atómica para que dos jugadas al mismo tiempo no se pisen.
- `src/` — la app (React + Vite), instalable como PWA y con sonidos sintetizados (sin archivos de audio).
- `DESIGN.md` — el sistema visual: la mesa de dominó.
