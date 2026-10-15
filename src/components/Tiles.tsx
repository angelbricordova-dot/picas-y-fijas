import type { CSSProperties } from 'react';
import type { Mark } from '../../shared/engine';

// Posiciones de los puntos de dominó (0–6) dentro de una mitad cuadrada de 104.
const P = { a: 27, b: 52, c: 77 };
const PIP_LAYOUT: [number, number][][] = [
  [],
  [[P.b, P.b]],
  [
    [P.a, P.a],
    [P.c, P.c],
  ],
  [
    [P.a, P.a],
    [P.b, P.b],
    [P.c, P.c],
  ],
  [
    [P.a, P.a],
    [P.c, P.a],
    [P.a, P.c],
    [P.c, P.c],
  ],
  [
    [P.a, P.a],
    [P.c, P.a],
    [P.b, P.b],
    [P.a, P.c],
    [P.c, P.c],
  ],
  [
    [P.a, P.a],
    [P.a, P.b],
    [P.a, P.c],
    [P.c, P.a],
    [P.c, P.b],
    [P.c, P.c],
  ],
];

export function resultLabel(fijas: number, picas: number) {
  const f = fijas === 1 ? '1 fija' : `${fijas} fijas`;
  const p = picas === 1 ? '1 pica' : `${picas} picas`;
  return `${f} y ${p}`;
}

/**
 * El resultado de un intento es una ficha de dominó:
 * izquierda = fijas (puntos rojos rellenos), derecha = picas (aros).
 */
export function Domino({
  fijas,
  picas,
  width = 76,
  animate = false,
  win = false,
  className = '',
}: {
  fijas: number;
  picas: number;
  width?: number;
  animate?: boolean;
  win?: boolean;
  className?: string;
}) {
  let i = 0;
  return (
    <svg
      className={`domino ${animate ? 'is-new' : ''} ${win ? 'is-win' : ''} ${className}`}
      viewBox="0 0 208 110"
      width={width}
      height={(width * 110) / 208}
      role="img"
      aria-label={resultLabel(fijas, picas)}
    >
      <rect x="1" y="7" width="206" height="102" rx="20" fill="var(--bone-shade)" />
      <rect x="1" y="1" width="206" height="102" rx="20" fill="var(--bone)" />
      <rect x="1" y="1" width="206" height="102" rx="20" fill="none" stroke="var(--bone-edge)" strokeWidth="2" />
      <path d="M104 16 V88" stroke="var(--bone-edge)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="104" cy="52" r="5.5" fill="var(--pin)" />
      {PIP_LAYOUT[Math.min(6, fijas)].map(([x, y]) => (
        <g key={`f${x}${y}`} className="pip" style={{ '--i': i++ } as CSSProperties}>
          <circle cx={x} cy={y} r="10.5" fill="var(--fija)" />
          <circle cx={x - 3} cy={y - 3.5} r="3.2" fill="var(--bone)" opacity=".55" />
        </g>
      ))}
      {PIP_LAYOUT[Math.min(6, picas)].map(([x, y]) => (
        <g key={`p${x}${y}`} className="pip" style={{ '--i': i++ } as CSSProperties}>
          <circle cx={x + 104} cy={y} r="8.6" fill="none" stroke="var(--ink)" strokeWidth="4.6" />
        </g>
      ))}
    </svg>
  );
}

/** Un dígito en ficha color hueso. */
export function Digit({
  value,
  size = 'md',
  mark,
  masked = false,
  empty = false,
  active = false,
  style,
}: {
  value?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  mark?: Mark;
  masked?: boolean;
  empty?: boolean;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`digit digit--${size} ${empty ? 'is-empty' : ''} ${active ? 'is-active' : ''} ${mark ? `is-${mark}` : ''}`}
      style={style}
    >
      {empty ? '' : masked ? <span className="digit-dot" aria-label="oculto" /> : value}
    </span>
  );
}

export function DigitRow({
  value,
  length,
  size = 'md',
  marks,
  masked = false,
  cursor = false,
}: {
  value: string;
  length?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  marks?: Mark[];
  masked?: boolean;
  cursor?: boolean;
}) {
  const n = length ?? value.length;
  return (
    <span className={`digit-row digit-row--${size}`} aria-label={masked ? 'código oculto' : value.split('').join(' ')}>
      {Array.from({ length: n }, (_, i) => (
        <Digit
          key={i}
          value={value[i]}
          size={size}
          empty={value[i] === undefined}
          active={cursor && i === value.length}
          mark={marks?.[i]}
          masked={masked && value[i] !== undefined}
        />
      ))}
    </span>
  );
}

/** Vista desde arriba de la mesa para cada modalidad. */
export function TableDiagram({ mode, size = 64 }: { mode: 'duel' | 'ffa' | 'teams' | 'race'; size?: number }) {
  const seats: Record<string, [number, number, string][]> = {
    duel: [
      [50, 88, 'var(--p0)'],
      [50, 12, 'var(--p1)'],
    ],
    ffa: [
      [50, 88, 'var(--p0)'],
      [88, 50, 'var(--p1)'],
      [50, 12, 'var(--p2)'],
      [12, 50, 'var(--p3)'],
    ],
    teams: [
      [50, 88, 'var(--p0)'],
      [50, 12, 'var(--p0)'],
      [88, 50, 'var(--p1)'],
      [12, 50, 'var(--p1)'],
    ],
    race: [
      [50, 88, 'var(--p0)'],
      [88, 50, 'var(--p1)'],
      [50, 12, 'var(--p2)'],
      [12, 50, 'var(--p3)'],
    ],
  };
  return (
    <svg className="table-diagram" viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <rect x="18" y="18" width="64" height="64" rx="16" fill="var(--felt-deep)" />
      <rect x="18" y="18" width="64" height="64" rx="16" fill="none" stroke="var(--felt-line)" strokeWidth="2" />
      {mode === 'race' ? (
        <g>
          <rect x="38" y="33" width="24" height="34" rx="5" fill="var(--bone)" />
          <path d="M42 50 H58" stroke="var(--bone-edge)" strokeWidth="2" />
          <circle cx="50" cy="41.5" r="3" fill="var(--fija)" />
          <circle cx="50" cy="58.5" r="2.6" fill="none" stroke="var(--ink)" strokeWidth="2" />
        </g>
      ) : mode === 'teams' ? (
        <g strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round">
          <path d="M50 30 V70" stroke="var(--p0)" />
          <path d="M30 50 H70" stroke="var(--p1)" />
        </g>
      ) : (
        <g>
          <rect x="41" y="38" width="18" height="24" rx="4" fill="var(--bone)" opacity=".9" />
          <path d="M44 50 H56" stroke="var(--bone-edge)" strokeWidth="2" />
        </g>
      )}
      {seats[mode].map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="9.5" fill={c} stroke="var(--felt-lo)" strokeWidth="3" />
      ))}
    </svg>
  );
}
