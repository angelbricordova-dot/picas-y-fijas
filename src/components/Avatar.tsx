// Personajes: fichas de dominó con cara. Los ojos son puntos; la mitad de abajo
// muestra los puntos de la silla del jugador en su color.

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

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'happy') {
    return (
      <g fill="none" stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="round">
        <path d="M31 44 Q37 36 43 44" />
        <path d="M57 44 Q63 36 69 44" />
      </g>
    );
  }
  const r = mood === 'wow' ? 7.5 : 6.2;
  const dx = mood === 'think' ? 2 : 0;
  const dy = mood === 'think' ? -2 : 0;
  return (
    <g className="av-eyes">
      <circle cx={37 + dx} cy={42 + dy} r={r} fill="var(--ink)" />
      <circle cx={63 + dx} cy={42 + dy} r={r} fill="var(--ink)" />
      <circle cx={35 + dx} cy={40 + dy} r="2" fill="var(--bone)" />
      <circle cx={61 + dx} cy={40 + dy} r="2" fill="var(--bone)" />
      {mood === 'sad' && (
        <g stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round">
          <path d="M29 32 L42 35" />
          <path d="M71 32 L58 35" />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  const common = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 3.6, strokeLinecap: 'round' as const };
  if (mood === 'wow') return <ellipse cx="50" cy="55.5" rx="4.2" ry="4.6" fill="var(--ink)" />;
  if (mood === 'sad') return <path d="M43 58 Q50 52 57 58" {...common} />;
  if (mood === 'think') return <path d="M45 55 L56 54" {...common} />;
  if (mood === 'happy') return <path d="M41 51 Q50 62 59 51 Z" fill="var(--ink)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />;
  return <path d="M43 52 Q50 58.5 57 52" {...common} />;
}

function Accessory({ id, c }: { id: AvatarId; c: string }) {
  switch (id) {
    case 'gorra':
      return (
        <g>
          <path d="M20 31 Q20 5 50 5 Q80 5 80 31 Z" fill={c} />
          <path d="M20 31 Q20 5 50 5 Q80 5 80 31" fill="none" stroke="var(--ink)" strokeOpacity=".22" strokeWidth="2" />
          <path d="M52 27 Q84 22 96 31 Q78 37 52 33 Z" fill={c} />
          <path d="M52 33 Q78 37 96 31" fill="none" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2.5" />
          <circle cx="50" cy="6" r="3.5" fill="var(--ink)" />
        </g>
      );
    case 'sombrero':
      // Inspirado en el sombrero vueltiao: copa y ala trenzadas en crema y negro.
      return (
        <g>
          <ellipse cx="50" cy="25" rx="46" ry="9.5" fill="var(--bone-2)" stroke="var(--ink)" strokeWidth="2.5" />
          <ellipse cx="50" cy="25" rx="37" ry="6.5" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M31 25 Q31 0 50 0 Q69 0 69 25 Z" fill="var(--bone-2)" stroke="var(--ink)" strokeWidth="2.5" />
          <path d="M33 12 Q50 9 67 12" fill="none" stroke="var(--ink)" strokeWidth="3" />
          <path d="M32 19 Q50 16 68 19" fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="4 3" />
        </g>
      );
    case 'mono':
      return (
        <g transform="rotate(-12 70 18)">
          <path d="M70 18 L52 6 Q47 18 52 30 Z" fill={c} />
          <path d="M70 18 L88 6 Q93 18 88 30 Z" fill={c} />
          <path d="M70 18 L52 6 Q47 18 52 30 Z M70 18 L88 6 Q93 18 88 30 Z" fill="none" stroke="var(--ink)" strokeOpacity=".3" strokeWidth="2" strokeLinejoin="round" />
          <rect x="64.5" y="12" width="11" height="12" rx="4" fill={c} stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2" />
        </g>
      );
    case 'gafas':
      return (
        <g fill="none" stroke="var(--ink)" strokeWidth="3.5">
          <circle cx="37" cy="42" r="11" fill={c} fillOpacity=".28" />
          <circle cx="63" cy="42" r="11" fill={c} fillOpacity=".28" />
          <path d="M48 41 Q50 38 52 41" />
          <path d="M26 40 L16 36" strokeLinecap="round" />
          <path d="M74 40 L84 36" strokeLinecap="round" />
        </g>
      );
    case 'corona':
      return (
        <g>
          <path d="M27 27 L29 5 L40 16 L50 1 L60 16 L71 5 L73 27 Z" fill="var(--pin)" stroke="var(--ink)" strokeOpacity=".35" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="50" cy="19" r="4" fill={c} />
          <circle cx="36" cy="21" r="2.6" fill={c} />
          <circle cx="64" cy="21" r="2.6" fill={c} />
        </g>
      );
    case 'audifonos':
      return (
        <g>
          <path d="M16 46 Q14 4 50 4 Q86 4 84 46" fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
          <rect x="5" y="34" width="16" height="27" rx="7" fill={c} stroke="var(--ink)" strokeWidth="2.5" />
          <rect x="79" y="34" width="16" height="27" rx="7" fill={c} stroke="var(--ink)" strokeWidth="2.5" />
        </g>
      );
    case 'bigote':
      return (
        <path
          d="M50 52 Q42 46 34 50 Q28 53 25 49 Q26 59 36 58 Q45 57 50 54 Q55 57 64 58 Q74 59 75 49 Q72 53 66 50 Q58 46 50 52 Z"
          fill="var(--ink)"
        />
      );
    case 'rizos':
      return (
        <g fill="var(--ink)">
          {[24, 35, 46, 57, 68, 78].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 15 : 19} r="9" />
          ))}
          {[30, 52, 72].map((x) => (
            <circle key={x} cx={x} cy="8" r="7" />
          ))}
        </g>
      );
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
  id: AvatarId | string;
  color?: number;
  mood?: Mood;
  size?: number;
  className?: string;
  title?: string;
}) {
  const avatar = (AVATARS as readonly string[]).includes(id) ? (id as AvatarId) : 'gorra';
  const c = SEAT_COLORS[color % 4];
  const covered = avatar === 'bigote';
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
      <rect x="14" y="26" width="72" height="90" rx="17" fill="var(--bone-shade)" />
      <rect x="14" y="20" width="72" height="90" rx="17" fill="var(--bone)" />
      <rect x="14" y="20" width="72" height="90" rx="17" fill="none" stroke="var(--bone-edge)" strokeWidth="1.5" />
      <path d="M24 66 H76" stroke="var(--bone-edge)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="66" r="3.4" fill="var(--pin)" />
      <ellipse cx="27" cy="53" rx="5" ry="3" fill={c} opacity=".45" />
      <ellipse cx="73" cy="53" rx="5" ry="3" fill={c} opacity=".45" />
      {LOWER_PIPS[color % 4].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5.6" fill={c} />
      ))}
      <Eyes mood={mood} />
      {!covered && <Mouth mood={mood} />}
      <Accessory id={avatar} c={c} />
    </svg>
  );
}
