# Picas y Fijas — Contexto para el video promocional

Documento para el editor de video. Aquí está todo lo necesario para armar un video corto (Reels, TikTok, Shorts) que muestre cómo es el juego y haga que la gente lo pruebe con sus amigos.

## Qué es

**Picas y Fijas** es el juego de toda la vida de adivinar el número secreto, ahora en el celular.

- Cada jugador escribe un **código secreto** (por defecto 4 dígitos sin repetir).
- Por turnos, los demás dicen números para adivinarlo.
- **Fija** = número correcto en el lugar correcto. **Pica** = el número está, pero en otro lugar.
- Ejemplo: código `4872`, intento `4879` → **3 fijas y 0 picas**.
- **La app cuenta por ti, sin errores.** Esa es la razón de ser del juego: jugando con lápiz y papel la gente se equivoca contando (por ejemplo, responder "2 fijas y 1 pica" cuando eran 3 fijas).

**Dónde se juega:** https://picas-y-fijas-rho.vercel.app. Es una página web que se instala como app: en iPhone, Safari → Compartir → "Agregar a pantalla de inicio"; en Android, Chrome → menú → "Instalar app". No hay que descargarla de ninguna tienda.

## Para quién y con qué tono

- Amigos, parejas y familias (Colombia y Latinoamérica) que ya conocen el juego de papel.
- Tono: alegre, cercano, de mesa familiar. Español latino, tuteando ("tú").
- Mensaje central: **"Juega Picas y Fijas con tus amigos desde el celular. La app cuenta las picas y fijas por ti."**
- Llamado a la acción: **"Entra, crea tu sala y reta a tus amigos."**

## Funciones para mostrar

| Función | Qué mostrar | Archivo sugerido |
| --- | --- | --- |
| Inicio | El logo con los personajes y el botón "Crear sala" | `capturas/01-inicio.png` |
| Cómo se juega | Explicación de fija (punto rojo) y pica (aro) con el ejemplo 4872 / 4879 | `capturas/02-como-se-juega.png` |
| Personaliza tu ficha | Estudio de personaje: sombreros, lentes, pelo, audífonos, colores y dados "Al azar" | `capturas/03-personaliza-tu-ficha.png`, `capturas/04-personaliza-lentes.png`, `clips/02-dados-personaje-al-azar.mp4`, `marca/personajes.png` |
| Salas online | Código de 4 letras para invitar por WhatsApp; la mesa con los jugadores sentados | `capturas/06-crear-sala-mesa.png`, `capturas/07-mesa-con-pareja.png`, `capturas/05-mesa-de-4-todos-contra-todos.png` |
| Código secreto | Escribir el número secreto en fichas color hueso | `capturas/08-escribe-tu-codigo-secreto.png` |
| Fichas de dominó | Cada resultado es una ficha de dominó: puntos rojos = fijas (izquierda), aros = picas (derecha). Caen con animación y suenan | `capturas/09-tus-intentos-fichas-de-domino.png`, `clips/01-fichas-de-domino.mp4` |
| Contra mi código | Lo que el otro intentó contra tu código, con cada dígito marcado: rojo = fija, aro = pica, apagado = no está | `capturas/10-contra-mi-codigo-fijas-y-picas.png` |
| Ganar | "¡Ganaste!", las fichas caen en cadena, se revelan los códigos y el marcador | `capturas/11-ganaste.png`, `capturas/12-gano-el-otro.png`, `clips/03-duelo-hasta-ganar-y-repeticion.mp4` |
| Cómo fue la partida | Repetición ronda por ronda de toda la partida | `capturas/13-como-fue-la-partida.png`, final de `clips/03-…mp4` |
| Partidas jugadas | Historial de partidas en el celular | `capturas/14-partidas-jugadas.png` |
| Todos contra todos | 4 jugadores; cada intento se compara con el código de todos | `capturas/15-todos-contra-todos-jugando.png` |
| Responder a mano | Ajuste opcional: quien tiene el código cuenta las fijas y picas y las marca | `capturas/16-responder-a-mano.png` |
| Modo árbitro | Para jugar en persona sin internet: escribes lo que te dicen y la app te dice qué responder | `capturas/17-modo-arbitro-en-persona.png`, `clips/04-modo-arbitro.mp4` |

**Modalidades:** Duelo (2), Todos contra todos (3–4), Parejas (2 contra 2), Carrera contra la app (1–4), Práctica solo y Modo árbitro.
**Reglas:** de 3 a 6 dígitos, con o sin repetidos, límite de rondas, reloj por ronda y responder a mano.

## Guion y voz en off

Hay dos voces generadas con ElevenLabs (modelo multilingüe v2), con el mismo texto:

- `audio/voz-maria.mp3` — **María**, voz femenina colombiana, clara y segura (recomendada). 40,7 s.
- `audio/voz-david.mp3` — **David**, voz masculina colombiana, cercana. 38,7 s.

Cada voz trae sus tiempos por frase (`audio/tiempos-*.json`) y subtítulos listos (`audio/subtitulos-*.srt`).

### Escenas (tiempos de la voz de María)

| Tiempo | Voz | En pantalla (sugerencia) | Recursos |
| --- | --- | --- | --- |
| 0,0 – 3,4 s | "¿Te acuerdas de Picas y Fijas? ¡Ahora en tu celular!" | Gancho: papel y lápiz tachado → aparece el logo con los personajes saltando | `marca/logo-con-personajes.png`, `capturas/01-inicio.png` |
| 4,0 – 5,9 s | "Cada uno escribe su código secreto." | Dedo escribiendo 4 8 7 2 en las fichas | `capturas/08-escribe-tu-codigo-secreto.png` |
| 6,5 – 13,5 s | "Tú dices un número… y la app responde al instante: fijas, picas, sin trampas y sin errores." | Las fichas de dominó cayendo; texto "3 FIJAS" y la leyenda punto rojo = fija, aro = pica | `clips/01-fichas-de-domino.mp4`, `capturas/02-como-se-juega.png`, `capturas/10-…png` |
| 14,3 – 19,7 s | "Juega en duelo con tu pareja, todos contra todos, en parejas, o en carrera contra la app." | Cortes rápidos de las mesas: 2 jugadores, 4 jugadores, modalidades | `capturas/07-…png`, `capturas/05-…png`, `capturas/15-…png` |
| 20,2 – 26,3 s | "Arma tu ficha: sombrero, gafas, audífonos… o tira los dados y sorpréndete." | El estudio de personaje y los dados cambiando el personaje | `clips/02-dados-personaje-al-azar.mp4`, `marca/personajes.png` |
| 27,1 – 31,0 s | "¿Juegan en persona? El modo árbitro cuenta por ti." | Modo árbitro: "Responde 3 fijas y 0 picas" | `clips/04-modo-arbitro.mp4` |
| 31,6 – 35,1 s | "Comparte el código de la sala por WhatsApp… ¡y a jugar!" | El código de 4 letras y el botón "Invitar por WhatsApp" | `capturas/06-crear-sala-mesa.png` |
| 35,9 – 40,5 s | "Picas y Fijas. Entra, crea tu sala y reta a tus amigos." | Victoria con las fichas cayendo en cadena → logo + URL | `capturas/11-ganaste.png`, `marca/logo.png`, `marca/icono-app.png` |

Cierre en pantalla: **picas-y-fijas-rho.vercel.app** y "Juega gratis con tus amigos".

## Especificaciones

- Formato: vertical **1080 × 1920 (9:16)**, unos 40 segundos.
- Las capturas son de celular a **1170 × 2532** px. Lucen mejor dentro de un marco de teléfono sobre el fondo de paño verde, con leves zooms y paneos.
- Los clips (`clips/*.mp4`) son grabaciones reales de la app a **780 × 1688** px, 30 fps, sin audio, de 12 a 38 segundos cada uno; recórtalos a los momentos que sirvan.
- Logo, personajes e ícono tienen **fondo transparente**.
- Música sugerida: algo alegre y latino, sin derechos de autor (cumbia o tropical suave), bajita debajo de la voz.
- Efectos sugeridos: un "clac" de ficha de dominó cuando cae cada resultado, y un pequeño redoble al ganar.

## Identidad visual

**Concepto:** la mesa de dominó. Fondo de paño verde, fichas color hueso con relieve, resultados como fichas de dominó y personajes que son fichas con cara.

| Color | HEX | Uso |
| --- | --- | --- |
| Paño | `#15623D` | Fondo principal (degradado de `#307A4F` arriba a `#03482C` abajo) |
| Paño profundo | `#00341F` | Bandejas y teclado |
| Hueso | `#FAF3E3` | Fichas, botones, letras del logo |
| Hueso sombra | `#A89173` | El canto (grosor) de las fichas |
| Tinta | `#241B13` | Números y puntos negros |
| Rojo fija | `#E03A2D` | Solo para fijas |
| Bronce | `#E6B557` | Pin del dominó, coronas, detalles de victoria |
| Jugadores | `#2B99E7` azul · `#EE6BA0` rosado · `#F2CA3F` amarillo · `#A479DE` lila | Color de la silla de cada jugador |

**Tipografías** (gratis en Google Fonts):
- **Bagel Fat One**: títulos, logo y números de las fichas.
- **Onest**: textos e interfaz.

## Textos para redes

**Descripción corta:**
> ¿Te acuerdas de Picas y Fijas? Ahora se juega en el celular 📱 Cada uno pone su código secreto y la app cuenta las picas y fijas por ti, sin trampas ni errores. Arma tu ficha, crea una sala y reta a tus amigos 🎲 Juega gratis: picas-y-fijas-rho.vercel.app

**Variantes de gancho:**
- "Si alguna vez contaste mal las fijas… esto es para ti."
- "El juego de toda la vida, pero la app no se equivoca."
- "Reto: descubre el código de tu pareja en menos de 6 intentos."

**Hashtags:** #PicasYFijas #JuegosConAmigos #JuegosEnFamilia #JuegoDeMesa #Colombia #Retos

## Notas para no inventar

- Es **gratis** y funciona en el navegador; se instala desde la página, no desde App Store ni Google Play.
- No hay cifras de usuarios, reseñas ni premios: no los menciones.
- Los nombres de las capturas (Angel, Vale, Abuela, Juanpa) y los códigos de sala son de demostración.

## Inventario de archivos

```
promo/
├── CONTEXTO.md                     este documento
├── audio/
│   ├── voz-maria.mp3               voz en off (recomendada)
│   ├── voz-david.mp3               voz en off alternativa
│   ├── tiempos-maria.json          inicio/fin de cada frase
│   ├── tiempos-david.json
│   ├── subtitulos-maria.srt        subtítulos sincronizados
│   └── subtitulos-david.srt
├── capturas/                       17 pantallas a 1170 × 2532
├── clips/                          4 grabaciones reales de la app (MP4)
└── marca/
    ├── logo.png                    logo "Picas y Fijas" (transparente)
    ├── logo-con-personajes.png     logo con los 3 personajes (transparente)
    ├── personajes.png              8 personajes personalizados en fila (transparente)
    └── icono-app.png               ícono de la app 512 × 512
```
