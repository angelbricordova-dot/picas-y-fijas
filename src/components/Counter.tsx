import { Minus, Plus } from 'lucide-react';

/** Contador de fijas o picas con botones de menos y más. */
export function Counter({
  label,
  value,
  onChange,
  max,
  kind,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
  kind: 'fija' | 'pica';
}) {
  return (
    <div className={`counter counter--${kind}`} role="group" aria-label={label}>
      <span className="counter-label">{label}</span>
      <div className="stepper">
        <button type="button" disabled={value <= 0} onClick={() => onChange(value - 1)} aria-label={`Menos ${label.toLowerCase()}`}>
          <Minus size={20} strokeWidth={2.8} />
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`Más ${label.toLowerCase()}`}>
          <Plus size={20} strokeWidth={2.8} />
        </button>
      </div>
    </div>
  );
}
