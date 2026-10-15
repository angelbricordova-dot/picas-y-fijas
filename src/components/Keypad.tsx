import { Delete, PencilLine } from 'lucide-react';
import type { ReactNode } from 'react';
import type { NoteMark } from '../lib/session';
import { buzz, tap } from '../lib/sound';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Teclado numérico de fichas. En modo libreta, tocar un número lo marca
 * (descartado → seguro → nada) en vez de escribirlo.
 */
export function Keypad({
  onDigit,
  onDelete,
  onSubmit,
  canSubmit,
  disabled,
  notes,
  noteMode,
  onNote,
  onToggleNotes,
  submitLabel,
  showNotes = true,
  locked = false,
}: {
  onDigit: (d: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  disabled: Set<string>;
  notes?: Record<string, NoteMark>;
  noteMode?: boolean;
  onNote?: (d: string) => void;
  onToggleNotes?: () => void;
  submitLabel: ReactNode;
  showNotes?: boolean;
  /** Ya no se puede escribir (por ejemplo, esperando la ronda); la libreta sigue activa. */
  locked?: boolean;
}) {
  const press = (d: string) => {
    if (noteMode || locked) {
      onNote?.(d);
      buzz(6);
      return;
    }
    if (disabled.has(d)) {
      buzz([8, 40, 8]);
      return;
    }
    tap();
    buzz(8);
    onDigit(d);
  };

  const key = (d: string) => {
    const mark = notes?.[d];
    const off = !noteMode && !locked && disabled.has(d);
    return (
      <button
        key={d}
        type="button"
        className={`key ${off ? 'is-off' : ''} ${mark ? `has-${mark}` : ''}`}
        onClick={() => press(d)}
        aria-label={`${d}${mark === 'x' ? ', descartado' : mark === 'o' ? ', seguro' : ''}`}
      >
        <span className="key-face">{d}</span>
      </button>
    );
  };

  return (
    <div className={`keypad ${noteMode || locked ? 'is-notes' : ''}`}>
      {KEYS.map(key)}
      {showNotes ? (
        <button
          type="button"
          className={`key key--tool ${noteMode || locked ? 'is-on' : ''}`}
          onClick={() => !locked && onToggleNotes?.()}
          aria-pressed={noteMode || locked}
          aria-label="Libreta: marcar números"
        >
          <PencilLine size={22} strokeWidth={2.4} />
          <span className="key-caption">Libreta</span>
        </button>
      ) : (
        <span />
      )}
      {key('0')}
      {noteMode || locked ? (
        <span className="key-hint">
          <span className="hint-line">
            <span className="hint-mark hint-mark--x" /> no está
          </span>
          <span className="hint-line">
            <span className="hint-mark hint-mark--o" /> sí está
          </span>
        </span>
      ) : (
        <button type="button" className="key key--tool" onClick={onDelete} aria-label="Borrar">
          <Delete size={24} strokeWidth={2.4} />
        </button>
      )}
      {!locked && (
        <button type="button" className="key key--submit" disabled={!canSubmit || noteMode} onClick={onSubmit}>
          {submitLabel}
        </button>
      )}
    </div>
  );
}
