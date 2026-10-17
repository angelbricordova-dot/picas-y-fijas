// Estudio de personaje: personajes listos, capas para armar el tuyo y dados al azar.
import { Dices } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { buzz, clack } from '../lib/sound';
import {
  ACC_COLORS,
  Avatar,
  AVATAR_NAMES,
  AVATARS,
  decodeLook,
  encodeLook,
  EYES,
  EYEWEAR,
  FACES,
  HAIR_COLORS,
  HAIRS,
  HAT_NO_COLOR,
  HATS,
  MOUTHS,
  PHONES,
  randomLook,
  SEAT_COLORS,
  TILES,
  type Look,
} from './Avatar';

type Cat = 'listos' | 'ficha' | 'pelo' | 'sombrero' | 'lentes' | 'audifonos' | 'cara';

const CATS: { id: Cat; label: string }[] = [
  { id: 'listos', label: 'Listos' },
  { id: 'sombrero', label: 'Sombrero' },
  { id: 'pelo', label: 'Pelo' },
  { id: 'lentes', label: 'Lentes' },
  { id: 'audifonos', label: 'Audífonos' },
  { id: 'cara', label: 'Cara' },
  { id: 'ficha', label: 'Ficha' },
];

function Options({
  title,
  names,
  value,
  onPick,
  preview,
  color,
  big = false,
}: {
  title?: string;
  names: string[];
  value: number;
  onPick: (i: number) => void;
  preview: (i: number) => string;
  color: number;
  big?: boolean;
}) {
  return (
    <div className="studio-group">
      {title && <span className="studio-sub">{title}</span>}
      <div className="studio-options" role="radiogroup" aria-label={title}>
        {names.map((name, i) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={name}
            title={name}
            className={`studio-option ${value === i ? 'is-on' : ''}`}
            onClick={() => onPick(i)}
          >
            <Avatar id={preview(i)} color={color} size={big ? 54 : 44} />
            <span className="studio-option-name">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Swatches({
  title,
  colors,
  value,
  onPick,
  seat,
}: {
  title: string;
  colors: { name: string; value: string }[];
  value: number;
  onPick: (i: number) => void;
  seat?: string;
}) {
  return (
    <div className="studio-group">
      <span className="studio-sub">{title}</span>
      <div className="swatches" role="radiogroup" aria-label={title}>
        {colors.map((c, i) => (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={c.name}
            title={c.name}
            className={`swatch ${value === i ? 'is-on' : ''} ${c.value === 'seat' ? 'swatch--seat' : ''}`}
            style={{ '--c': c.value === 'seat' ? seat : c.value } as CSSProperties}
            onClick={() => onPick(i)}
          />
        ))}
      </div>
    </div>
  );
}

export function AvatarStudio({ value, onChange, color = 0 }: { value: string; onChange: (v: string) => void; color?: number }) {
  const [cat, setCat] = useState<Cat>(value.startsWith('~') ? 'sombrero' : 'listos');
  const [roll, setRoll] = useState(0);
  const look = decodeLook(value);
  const set = (patch: Partial<Look>) => onChange(encodeLook({ ...look, ...patch }));
  const with_ = (patch: Partial<Look>) => encodeLook({ ...look, ...patch });
  const seat = SEAT_COLORS[color % 4];

  const randomize = () => {
    onChange(encodeLook(randomLook()));
    setRoll((r) => r + 1);
    clack(0.9);
    buzz(14);
  };

  return (
    <div className="studio">
      <div className="studio-stage">
        <div key={roll} className={`studio-preview ${roll ? 'is-rolling' : ''}`}>
          <Avatar id={value} color={color} size={104} />
        </div>
        <button type="button" className="studio-dice" onClick={randomize}>
          <Dices size={22} strokeWidth={2.3} />
          <span>Al azar</span>
        </button>
      </div>

      <div className="studio-tabs" role="tablist" aria-label="Qué cambiar">
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            className={`studio-tab ${cat === c.id ? 'is-on' : ''}`}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="studio-panel" role="tabpanel">
        {cat === 'listos' && (
          <div className="studio-options studio-options--presets">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={value === a}
                aria-label={AVATAR_NAMES[a]}
                title={AVATAR_NAMES[a]}
                className={`studio-option ${value === a ? 'is-on' : ''}`}
                onClick={() => onChange(a)}
              >
                <Avatar id={a} color={color} size={48} mood={value === a ? 'happy' : 'idle'} />
                <span className="studio-option-name">{AVATAR_NAMES[a]}</span>
              </button>
            ))}
          </div>
        )}
        {cat === 'sombrero' && (
          <>
            <Options names={HATS} value={look.hat} onPick={(hat) => set({ hat })} preview={(hat) => with_({ hat })} color={color} />
            {!HAT_NO_COLOR.has(look.hat) && (
              <Swatches title="Color" colors={ACC_COLORS} value={look.hatColor} onPick={(hatColor) => set({ hatColor })} seat={seat} />
            )}
          </>
        )}
        {cat === 'pelo' && (
          <>
            <Options names={HAIRS} value={look.hair} onPick={(hair) => set({ hair })} preview={(hair) => with_({ hair, hat: 0 })} color={color} />
            <Swatches title="Color de pelo" colors={HAIR_COLORS} value={look.hairColor} onPick={(hairColor) => set({ hairColor })} />
          </>
        )}
        {cat === 'lentes' && (
          <>
            <Options names={EYEWEAR} value={look.eyewear} onPick={(eyewear) => set({ eyewear })} preview={(eyewear) => with_({ eyewear })} color={color} />
            {look.eyewear > 0 && (
              <Swatches title="Color" colors={ACC_COLORS} value={look.eyewearColor} onPick={(eyewearColor) => set({ eyewearColor })} seat={seat} />
            )}
          </>
        )}
        {cat === 'audifonos' && (
          <>
            <Options names={PHONES} value={look.phones} onPick={(phones) => set({ phones })} preview={(phones) => with_({ phones })} color={color} />
            {look.phones > 0 && (
              <Swatches title="Color" colors={ACC_COLORS} value={look.phonesColor} onPick={(phonesColor) => set({ phonesColor })} seat={seat} />
            )}
          </>
        )}
        {cat === 'cara' && (
          <>
            <Options title="Ojos" big names={EYES} value={look.eyes} onPick={(eyes) => set({ eyes })} preview={(eyes) => with_({ eyes, eyewear: 0 })} color={color} />
            <Options title="Boca" big names={MOUTHS} value={look.mouth} onPick={(mouth) => set({ mouth })} preview={(mouth) => with_({ mouth, face: look.face === 1 ? 0 : look.face })} color={color} />
            <Options title="Detalles" big names={FACES} value={look.face} onPick={(face) => set({ face })} preview={(face) => with_({ face })} color={color} />
          </>
        )}
        {cat === 'ficha' && (
          <Options names={TILES.map((t) => t.name)} value={look.tile} onPick={(tile) => set({ tile })} preview={(tile) => with_({ tile })} color={color} />
        )}
      </div>
    </div>
  );
}
