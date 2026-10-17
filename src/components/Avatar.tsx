// Personajes: fichas de dominó con cara, armadas por capas (pelo, sombrero, lentes,
// audífonos, ojos, boca y detalles). La mitad de abajo muestra los puntos de la silla.
//
// Un personaje viaja como texto corto: un personaje listo ("gorra") o uno armado
// ("~" + un carácter por capa, en base 36).

export const AVATARS = ['gorra', 'sombrero', 'mono', 'gafas', 'corona', 'audifonos', 'bigote', 'rizos'] as const;
export type AvatarId = (typeof AVATARS)[number];

export const AVATAR_NAMES: Record<AvatarId, string> = {
  gorra: 'Gorra',
  sombrero: 'Sombrero',
  mono: 'Moño',
  gafas: 'Gafas',
  corona: 'Corona',
  audifonos: 'Audífonos',
  bigote: 'Bigote',
  rizos: 'Rizos',
};

export type Mood = 'idle' | 'happy' | 'sad' | 'wow' | 'think';

export const SEAT_COLORS = ['var(--p0)', 'var(--p1)', 'var(--p2)', 'var(--p3)'];
export const SEAT_NAMES = ['azul', 'rosado', 'amarillo', 'lila'];

// ——— Catálogo de capas ———

/** Colores para accesorios. El 0 es "el color de tu silla". */
export const ACC_COLORS = [
  { name: 'Color de tu silla', value: 'seat' },
  { name: 'Rojo', value: 'oklch(0.6 0.2 28)' },
  { name: 'Naranja', value: 'oklch(0.72 0.17 55)' },
  { name: 'Amarillo', value: 'oklch(0.86 0.16 92)' },
  { name: 'Verde', value: 'oklch(0.68 0.16 145)' },
  { name: 'Turquesa', value: 'oklch(0.72 0.12 195)' },
  { name: 'Azul', value: 'oklch(0.58 0.16 255)' },
  { name: 'Morado', value: 'oklch(0.56 0.17 300)' },
  { name: 'Rosado', value: 'oklch(0.74 0.15 355)' },
  { name: 'Negro', value: 'oklch(0.25 0.02 60)' },
  { name: 'Blanco', value: 'oklch(0.97 0.01 90)' },
];

export const HAIR_COLORS = [
  { name: 'Negro', value: 'oklch(0.24 0.02 50)' },
  { name: 'Castaño', value: 'oklch(0.42 0.08 55)' },
  { name: 'Rubio', value: 'oklch(0.82 0.12 85)' },
  { name: 'Pelirrojo', value: 'oklch(0.6 0.16 40)' },
  { name: 'Canoso', value: 'oklch(0.86 0.01 90)' },
  { name: 'Azul', value: 'oklch(0.6 0.15 250)' },
  { name: 'Rosado', value: 'oklch(0.74 0.15 355)' },
  { name: 'Verde', value: 'oklch(0.68 0.15 150)' },
];

export const TILES = [
  { name: 'Hueso', face: 'var(--bone)', side: 'var(--bone-shade)', edge: 'var(--bone-edge)', ink: 'var(--ink)', shine: 'var(--bone)' },
  { name: 'Caramelo', face: 'oklch(0.83 0.08 70)', side: 'oklch(0.6 0.08 60)', edge: 'oklch(0.72 0.08 65)', ink: 'var(--ink)', shine: 'oklch(0.95 0.03 80)' },
  { name: 'Rosa', face: 'oklch(0.9 0.05 10)', side: 'oklch(0.7 0.07 10)', edge: 'oklch(0.8 0.06 10)', ink: 'var(--ink)', shine: 'oklch(0.97 0.02 10)' },
  { name: 'Menta', face: 'oklch(0.9 0.06 165)', side: 'oklch(0.68 0.07 165)', edge: 'oklch(0.79 0.06 165)', ink: 'var(--ink)', shine: 'oklch(0.97 0.02 165)' },
  { name: 'Negra', face: 'oklch(0.27 0.02 60)', side: 'oklch(0.14 0.01 60)', edge: 'oklch(0.38 0.02 60)', ink: 'var(--bone)', shine: 'oklch(0.27 0.02 60)' },
];

export const HAIRS = ['Sin pelo', 'Rizos', 'Flequillo', 'Cresta', 'Colitas', 'Moño alto', 'Afro'];
export const HATS = ['Nada', 'Gorra', 'Gorra de lado', 'Sombrero vueltiao', 'Gorro de lana', 'Cintillo', 'Moño', 'Corona', 'Boina', 'Flor'];
export const EYEWEAR = ['Sin lentes', 'Redondos', 'De sol', 'Cuadrados', 'Corazón'];
export const PHONES = ['Sin audífonos', 'Audífonos', 'Con orejas de gato'];
export const FACES = ['Nada', 'Bigote', 'Barba', 'Pecas', 'Lunar'];
export const EYES = ['Normales', 'Grandes', 'Dormilones', 'Pestañas'];
export const MOUTHS = ['Sonrisa', 'Dientes', 'Lengua', 'Gatito'];

/** Capas que no usan color propio. */
export const HAT_NO_COLOR = new Set([0, 3]);

export interface Look {
  tile: number;
  hair: number;
  hairColor: number;
  hat: number;
  hatColor: number;
  eyewear: number;
  eyewearColor: number;
  phones: number;
  phonesColor: number;
  face: number;
  eyes: number;
  mouth: number;
}

const LOOK_KEYS: (keyof Look)[] = ['tile', 'hair', 'hairColor', 'hat', 'hatColor', 'eyewear', 'eyewearColor', 'phones', 'phonesColor', 'face', 'eyes', 'mouth'];
const LOOK_MAX: Record<keyof Look, number> = {
  tile: TILES.length,
  hair: HAIRS.length,
  hairColor: HAIR_COLORS.length,
  hat: HATS.length,
  hatColor: ACC_COLORS.length,
  eyewear: EYEWEAR.length,
  eyewearColor: ACC_COLORS.length,
  phones: PHONES.length,
  phonesColor: ACC_COLORS.length,
  face: FACES.length,
  eyes: EYES.length,
  mouth: MOUTHS.length,
};

export const BLANK_LOOK: Look = { tile: 0, hair: 0, hairColor: 0, hat: 0, hatColor: 0, eyewear: 0, eyewearColor: 9, phones: 0, phonesColor: 0, face: 0, eyes: 0, mouth: 0 };

const PRESET_LOOKS: Record<AvatarId, Partial<Look>> = {
  gorra: { hat: 1 },
  sombrero: { hat: 3 },
  mono: { hat: 6 },
  gafas: { eyewear: 1, eyewearColor: 9 },
  corona: { hat: 7 },
  audifonos: { phones: 1 },
  bigote: { face: 1 },
  rizos: { hair: 1 },
};

export function encodeLook(l: Look): string {
  return '~' + LOOK_KEYS.map((k) => Math.max(0, Math.min(LOOK_MAX[k] - 1, l[k] | 0)).toString(36)).join('');
}

export function decodeLook(id: string | undefined): Look {
  if (id && id.startsWith('~')) {
    const look = { ...BLANK_LOOK };
    LOOK_KEYS.forEach((k, i) => {
      const n = parseInt(id[i + 1] ?? '0', 36);
      look[k] = Number.isFinite(n) ? Math.max(0, Math.min(LOOK_MAX[k] - 1, n)) : 0;
    });
    return look;
  }
  const preset = (AVATARS as readonly string[]).includes(id ?? '') ? (id as AvatarId) : 'gorra';
  return { ...BLANK_LOOK, ...PRESET_LOOKS[preset] };
}

/** Un personaje al azar, con suficientes accesorios para que se vea único. */
export function randomLook(rand: () => number = Math.random): Look {
  const pick = (n: number) => Math.floor(rand() * n);
  const chance = (p: number) => rand() < p;
  return {
    tile: chance(0.6) ? 0 : pick(TILES.length),
    hair: chance(0.65) ? 1 + pick(HAIRS.length - 1) : 0,
    hairColor: pick(HAIR_COLORS.length),
    hat: chance(0.7) ? 1 + pick(HATS.length - 1) : 0,
    hatColor: 1 + pick(ACC_COLORS.length - 1),
    eyewear: chance(0.4) ? 1 + pick(EYEWEAR.length - 1) : 0,
    eyewearColor: 1 + pick(ACC_COLORS.length - 1),
    phones: chance(0.22) ? 1 + pick(PHONES.length - 1) : 0,
    phonesColor: 1 + pick(ACC_COLORS.length - 1),
    face: chance(0.4) ? 1 + pick(FACES.length - 1) : 0,
    eyes: pick(EYES.length),
    mouth: pick(MOUTHS.length),
  };
}

// ——— Dibujo ———

const LOWER_PIPS: [number, number][][] = [
  [[50, 86]],
  [
    [36, 77],
    [64, 95],
  ],
  [
    [34, 76],
    [50, 86],
    [66, 96],
  ],
  [
    [36, 77],
    [64, 77],
    [36, 95],
    [64, 95],
  ],
];

type Tile = (typeof TILES)[number];

function Eyes({ mood, style, t }: { mood: Mood; style: number; t: Tile }) {
  if (mood === 'happy') {
    return (
      <g fill="none" stroke={t.ink} strokeWidth="4.5" strokeLinecap="round">
        <path d="M31 44 Q37 36 43 44" />
        <path d="M57 44 Q63 36 69 44" />
      </g>
    );
  }
  const big = style === 1 || mood === 'wow';
  const r = big ? 7.6 : 6.2;
  const dx = mood === 'think' ? 2 : 0;
  const dy = mood === 'think' ? -2 : 0;
  return (
    <g className="av-eyes">
      <circle cx={37 + dx} cy={42 + dy} r={r} fill={t.ink} />
      <circle cx={63 + dx} cy={42 + dy} r={r} fill={t.ink} />
      <circle cx={35 + dx} cy={40 + dy} r={big ? 2.6 : 2} fill={t.shine === t.face ? 'var(--ink)' : t.shine} />
      <circle cx={61 + dx} cy={40 + dy} r={big ? 2.6 : 2} fill={t.shine === t.face ? 'var(--ink)' : t.shine} />
      {style === 2 && mood !== 'wow' && (
        <g fill={t.face}>
          <rect x="28" y="33" width="18" height="9" />
          <rect x="54" y="33" width="18" height="9" />
          <path d="M30 42 H44 M56 42 H70" stroke={t.ink} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {style === 3 && (
        <g stroke={t.ink} strokeWidth="2.6" strokeLinecap="round">
          <path d="M30 37 L26 34 M33 35 L31 31" />
          <path d="M70 37 L74 34 M67 35 L69 31" />
        </g>
      )}
      {mood === 'sad' && (
        <g stroke={t.ink} strokeWidth="3.5" strokeLinecap="round">
          <path d="M29 32 L42 35" />
          <path d="M71 32 L58 35" />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood, style, t }: { mood: Mood; style: number; t: Tile }) {
  const line = { fill: 'none', stroke: t.ink, strokeWidth: 3.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (mood === 'wow') return <ellipse cx="50" cy="55.5" rx="4.2" ry="4.6" fill={t.ink} />;
  if (mood === 'sad') return <path d="M43 58 Q50 52 57 58" {...line} />;
  if (mood === 'think') return <path d="M45 55 L56 54" {...line} />;
  if (mood === 'happy' || style === 1) {
    return (
      <g>
        <path d="M41 51 Q50 62 59 51 Z" fill={t.ink} stroke={t.ink} strokeWidth="2" strokeLinejoin="round" />
        {style === 1 && <path d="M43.5 52.2 H56.5 L55 54.4 H45 Z" fill="var(--bone)" />}
      </g>
    );
  }
  if (style === 2) {
    return (
      <g>
        <path d="M45 55.5 Q50 62 55 55.5 Z" fill="oklch(0.7 0.16 10)" />
        <path d="M42 52 Q50 58.5 58 52" {...line} />
      </g>
    );
  }
  if (style === 3) return <path d="M42 52 Q46 57 50 52.5 Q54 57 58 52" {...line} />;
  return <path d="M43 52 Q50 58.5 57 52" {...line} />;
}

function HairBack({ look, c }: { look: Look; c: string }) {
  if (look.hair === 6) return <ellipse cx="50" cy="32" rx="45" ry="28" fill={c} />;
  if (look.hair === 4)
    return (
      <g fill={c}>
        <ellipse cx="9" cy="40" rx="9" ry="12" />
        <ellipse cx="91" cy="40" rx="9" ry="12" />
      </g>
    );
  if (look.hair === 5) return <circle cx="50" cy="10" r="11" fill={c} />;
  return null;
}

function HairFront({ look, c }: { look: Look; c: string }) {
  switch (look.hair) {
    case 1:
      return (
        <g fill={c}>
          {[24, 35, 46, 57, 68, 78].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 15 : 19} r="9" />
          ))}
          {[30, 52, 72].map((x) => (
            <circle key={x} cx={x} cy="8" r="7" />
          ))}
        </g>
      );
    case 2:
      return <path d="M14 40 Q13 13 50 11 Q87 13 86 40 Q80 28 68 31 Q60 22 50 31 Q40 22 32 31 Q21 28 14 40 Z" fill={c} />;
    case 3:
      return <path d="M37 24 L41 3 L46.5 18 L51 0 L55.5 18 L60 4 L63 24 Q50 19 37 24 Z" fill={c} />;
    case 4:
    case 5:
    case 6:
      return <path d="M16 33 Q16 14 50 13 Q84 14 84 33 Q50 23 16 33 Z" fill={c} />;
    default:
      return null;
  }
}

function Hat({ look, c }: { look: Look; c: string }) {
  switch (look.hat) {
    case 1:
      return (
        <g>
          <path d="M20 31 Q20 5 50 5 Q80 5 80 31 Z" fill={c} />
          <path d="M52 27 Q84 22 96 31 Q78 37 52 33 Z" fill={c} />
          <path d="M52 33 Q78 37 96 31" fill="none" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2.5" />
          <circle cx="50" cy="6" r="3.5" fill="var(--ink)" />
        </g>
      );
    case 2:
      return (
        <g transform="rotate(-8 50 20)">
          <path d="M20 31 Q20 5 50 5 Q80 5 80 31 Z" fill={c} />
          <path d="M48 27 Q16 22 2 30 Q20 37 48 33 Z" fill={c} />
          <path d="M48 33 Q20 37 2 30" fill="none" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2.5" />
          <circle cx="50" cy="6" r="3.5" fill="var(--ink)" />
        </g>
      );
    case 3:
      return (
        <g>
          <ellipse cx="50" cy="25" rx="46" ry="9.5" fill="var(--bone-2)" stroke="var(--ink)" strokeWidth="2.5" />
          <ellipse cx="50" cy="25" rx="37" ry="6.5" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M31 25 Q31 0 50 0 Q69 0 69 25 Z" fill="var(--bone-2)" stroke="var(--ink)" strokeWidth="2.5" />
          <path d="M33 12 Q50 9 67 12" fill="none" stroke="var(--ink)" strokeWidth="3" />
          <path d="M32 19 Q50 16 68 19" fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="4 3" />
        </g>
      );
    case 4:
      return (
        <g>
          <path d="M19 33 Q19 4 50 4 Q81 4 81 33 Z" fill={c} />
          <path d="M30 10 V30 M40 6 V30 M50 5 V30 M60 6 V30 M70 10 V30" stroke="var(--ink)" strokeOpacity=".14" strokeWidth="3" />
          <rect x="16" y="26" width="68" height="11" rx="5.5" fill={c} />
          <rect x="16" y="26" width="68" height="11" rx="5.5" fill="var(--ink)" opacity=".16" />
          <circle cx="50" cy="3" r="6.5" fill="var(--bone-2)" />
        </g>
      );
    case 5:
      return (
        <g>
          <path d="M15 31 Q50 17 85 31" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" />
          <circle cx="76" cy="24" r="5.5" fill={c} />
          <circle cx="76" cy="24" r="2.4" fill="var(--bone)" opacity=".7" />
        </g>
      );
    case 6:
      return (
        <g transform="rotate(-12 70 18)">
          <path d="M70 18 L52 6 Q47 18 52 30 Z" fill={c} />
          <path d="M70 18 L88 6 Q93 18 88 30 Z" fill={c} />
          <path d="M70 18 L52 6 Q47 18 52 30 Z M70 18 L88 6 Q93 18 88 30 Z" fill="none" stroke="var(--ink)" strokeOpacity=".3" strokeWidth="2" strokeLinejoin="round" />
          <rect x="64.5" y="12" width="11" height="12" rx="4" fill={c} stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2" />
        </g>
      );
    case 7:
      return (
        <g>
          <path d="M27 27 L29 5 L40 16 L50 1 L60 16 L71 5 L73 27 Z" fill="var(--pin)" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="50" cy="19" r="4" fill={c} />
          <circle cx="36" cy="21" r="2.6" fill={c} />
          <circle cx="64" cy="21" r="2.6" fill={c} />
        </g>
      );
    case 8:
      return (
        <g transform="rotate(-10 48 20)">
          <ellipse cx="46" cy="22" rx="36" ry="11" fill={c} />
          <ellipse cx="46" cy="25" rx="30" ry="5" fill="var(--ink)" opacity=".15" />
          <rect x="44" y="7" width="5" height="7" rx="2" fill={c} />
        </g>
      );
    case 9:
      return (
        <g transform="translate(72 23)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-7" rx="5" ry="7" fill={c} transform={`rotate(${a})`} />
          ))}
          <circle r="4.5" fill="oklch(0.86 0.16 92)" />
        </g>
      );
    default:
      return null;
  }
}

function Eyewear({ look, c }: { look: Look; c: string }) {
  switch (look.eyewear) {
    case 1:
      return (
        <g fill="none" stroke={c} strokeWidth="3.5">
          <circle cx="37" cy="42" r="11" fill={c} fillOpacity=".18" />
          <circle cx="63" cy="42" r="11" fill={c} fillOpacity=".18" />
          <path d="M48 41 Q50 38 52 41" />
          <path d="M26 40 L16 36 M74 40 L84 36" strokeLinecap="round" />
        </g>
      );
    case 2:
      return (
        <g>
          <path d="M24 35 H48 V43 Q48 51 38 51 Q26 51 24 43 Z M52 35 H76 V43 Q74 51 62 51 Q52 51 52 43 Z" fill="oklch(0.2 0.02 260)" stroke={c} strokeWidth="3" strokeLinejoin="round" />
          <path d="M48 38 H52 M24 37 L16 34 M76 37 L84 34" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <path d="M29 39 L35 39 M57 39 L63 39" stroke="var(--bone)" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 3:
      return (
        <g fill="none" stroke={c} strokeWidth="3.4" strokeLinejoin="round">
          <rect x="25" y="33" width="24" height="18" rx="4" fill={c} fillOpacity=".14" />
          <rect x="51" y="33" width="24" height="18" rx="4" fill={c} fillOpacity=".14" />
          <path d="M49 39 H51 M25 37 L16 34 M75 37 L84 34" strokeLinecap="round" />
        </g>
      );
    case 4: {
      const heart = (x: number) => `M${x} 49 C${x - 13} 41 ${x - 11} 31 ${x - 4} 33 C${x - 1} 34 ${x} 36 ${x} 37 C${x} 36 ${x + 1} 34 ${x + 4} 33 C${x + 11} 31 ${x + 13} 41 ${x} 49 Z`;
      return (
        <g>
          <path d={`${heart(37)} ${heart(63)}`} fill={c} fillOpacity=".65" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M45 38 Q50 35 55 38 M26 38 L16 35 M74 38 L84 35" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }
    default:
      return null;
  }
}

function Phones({ look, c }: { look: Look; c: string }) {
  if (!look.phones) return null;
  return (
    <g>
      {look.phones === 2 && (
        <g fill={c} stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M22 18 L20 0 L36 10 Z" />
          <path d="M78 18 L80 0 L64 10 Z" />
        </g>
      )}
      <path d="M16 46 Q14 4 50 4 Q86 4 84 46" fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
      <rect x="5" y="34" width="16" height="27" rx="7" fill={c} stroke="var(--ink)" strokeWidth="2.5" />
      <rect x="79" y="34" width="16" height="27" rx="7" fill={c} stroke="var(--ink)" strokeWidth="2.5" />
    </g>
  );
}

function FaceExtra({ look, hair, t }: { look: Look; hair: string; t: Tile }) {
  switch (look.face) {
    case 1:
      return (
        <path
          d="M50 52 Q42 46 34 50 Q28 53 25 49 Q26 59 36 58 Q45 57 50 54 Q55 57 64 58 Q74 59 75 49 Q72 53 66 50 Q58 46 50 52 Z"
          fill={hair}
        />
      );
    case 2:
      return <path d="M18 48 Q19 76 50 77 Q81 76 82 48 Q76 60 66 59 Q58 66 50 64 Q42 66 34 59 Q24 60 18 48 Z" fill={hair} />;
    case 3:
      return (
        <g fill={t.ink} opacity=".42">
          {[
            [25, 50],
            [29, 53.5],
            [23, 55],
            [75, 50],
            [71, 53.5],
            [77, 55],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
          ))}
        </g>
      );
    case 4:
      return <circle cx="67" cy="57" r="2" fill={t.ink} />;
    default:
      return null;
  }
}

export function Avatar({
  id,
  color = 0,
  mood = 'idle',
  size = 56,
  className = '',
  title,
}: {
  id: string;
  color?: number;
  mood?: Mood;
  size?: number;
  className?: string;
  title?: string;
}) {
  const look = decodeLook(id);
  const seat = SEAT_COLORS[color % 4];
  const acc = (i: number) => (ACC_COLORS[i]?.value === 'seat' ? seat : ACC_COLORS[i]?.value ?? seat);
  const hair = HAIR_COLORS[look.hairColor]?.value ?? HAIR_COLORS[0].value;
  const t = TILES[look.tile] ?? TILES[0];
  const covered = look.face === 1;
  return (
    <svg
      className={`avatar ${className}`}
      viewBox="0 0 100 124"
      width={size}
      height={(size * 124) / 100}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="50" cy="118" rx="34" ry="5" fill="var(--shadow)" />
      <HairBack look={look} c={hair} />
      <rect x="14" y="26" width="72" height="90" rx="17" fill={t.side} />
      <rect x="14" y="20" width="72" height="90" rx="17" fill={t.face} />
      <rect x="14" y="20" width="72" height="90" rx="17" fill="none" stroke={t.edge} strokeWidth="1.5" />
      <path d="M24 66 H76" stroke={t.edge} strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="66" r="3.4" fill="var(--pin)" />
      <ellipse cx="27" cy="53" rx="5" ry="3" fill={seat} opacity=".45" />
      <ellipse cx="73" cy="53" rx="5" ry="3" fill={seat} opacity=".45" />
      {LOWER_PIPS[color % 4].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5.6" fill={seat} />
      ))}
      {look.face === 2 && <FaceExtra look={look} hair={hair} t={t} />}
      <Eyes mood={mood} style={look.eyes} t={t} />
      {!covered && <Mouth mood={mood} style={look.mouth} t={t} />}
      {look.face !== 2 && <FaceExtra look={look} hair={hair} t={t} />}
      <HairFront look={look} c={hair} />
      <Eyewear look={look} c={acc(look.eyewearColor)} />
      <Phones look={look} c={acc(look.phonesColor)} />
      <Hat look={look} c={acc(look.hatColor)} />
    </svg>
  );
}
