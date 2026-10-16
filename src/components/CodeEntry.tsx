import { Dices, Eye, EyeOff, History } from 'lucide-react';
import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react';
import { randomCode, type Rules } from '../../shared/engine';
import { getNotes, getPref, saveNotes, setPref, type NoteMark } from '../lib/session';
import { buzz } from '../lib/sound';
import { Keypad } from './Keypad';
import { Digit } from './Tiles';

const toSlots = (value: string, length: number) => Array.from({ length }, (_, i) => value[i] ?? '');

function nextEmpty(slots: string[], from: number) {
  for (let k = 1; k <= slots.length; k++) {
    const i = (from + k) % slots.length;
    if (!slots[i]) return i;
  }
  return Math.min(from + 1, slots.length - 1);
}

interface SlotState {
  slots: string[];
  cursor: number;
}

type SlotAction =
  | { type: 'digit'; d: string; repeats: boolean }
  | { type: 'delete' }
  | { type: 'pick'; i: number }
  | { type: 'move'; by: number }
  | { type: 'fill'; value: string; length: number };

function slotReducer(st: SlotState, a: SlotAction): SlotState {
  const { slots, cursor } = st;
  switch (a.type) {
    case 'digit': {
      if (!a.repeats && slots.some((x, i) => x === a.d && i !== cursor)) return st;
      const next = [...slots];
      next[cursor] = a.d;
      return { slots: next, cursor: nextEmpty(next, cursor) };
    }
    case 'delete': {
      const next = [...slots];
      if (next[cursor]) {
        next[cursor] = '';
        return { slots: next, cursor };
      }
      const prev = Math.max(0, cursor - 1);
      next[prev] = '';
      return { slots: next, cursor: prev };
    }
    case 'pick':
      return { slots, cursor: a.i };
    case 'move':
      return { slots, cursor: Math.min(slots.length - 1, Math.max(0, cursor + a.by)) };
    case 'fill':
      return { slots: toSlots(a.value, a.length), cursor: Math.min(a.value.length, a.length - 1) % a.length };
  }
}

/**
 * Casillas + teclado + libreta. Sirve para el código secreto y para cada intento.
 * Se puede tocar cualquier casilla y poner el número en esa posición.
 */
export function CodeEntry({
  rules,
  onSubmit,
  submitLabel,
  notesScope,
  locked = false,
  lockedNote,
  allowMask = false,
  allowRandom = false,
  lastValue,
  busy = false,
  initial = '',
}: {
  rules: Rules;
  onSubmit: (value: string) => Promise<boolean> | boolean;
  submitLabel: ReactNode;
  notesScope?: string;
  locked?: boolean;
  lockedNote?: ReactNode;
  allowMask?: boolean;
  allowRandom?: boolean;
  /** Último intento propio: se puede traer a las casillas para cambiar solo algunas posiciones. */
  lastValue?: string;
  busy?: boolean;
  initial?: string;
}) {
  const len = rules.length;
  const [{ slots, cursor }, dispatch] = useReducer(slotReducer, undefined, () => ({
    slots: toSlots(initial, len),
    cursor: Math.min(initial.length, len - 1),
  }));
  const [masked, setMasked] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, NoteMark>>(() => (notesScope ? getNotes(notesScope) : {}));
  const [shake, setShake] = useState(0);
  const [hint, setHint] = useState(() => !getPref('pos-hint-seen', false));

  useEffect(() => {
    if (notesScope) setNotes(getNotes(notesScope));
  }, [notesScope]);

  useEffect(() => {
    if (slots.length !== len) dispatch({ type: 'fill', value: slots.join(''), length: len });
  }, [len, slots]);

  const value = slots.join('');
  const full = slots.every(Boolean);
  // Sin repetidos: no se puede usar un número que ya está en otra casilla (sí reemplazar el de la casilla elegida).
  const used = new Set(rules.repeats ? [] : slots.filter((d, i) => d && i !== cursor));

  const add = useCallback(
    (d: string) => {
      if (!rules.repeats && slots.some((x, i) => x === d && i !== cursor)) buzz([8, 40, 8]);
      dispatch({ type: 'digit', d, repeats: rules.repeats });
    },
    [rules.repeats, slots, cursor],
  );

  const del = useCallback(() => dispatch({ type: 'delete' }), []);

  const pick = (i: number) => {
    dispatch({ type: 'pick', i });
    buzz(6);
    if (hint) {
      setHint(false);
      setPref('pos-hint-seen', true);
    }
  };

  const fill = (v: string) => dispatch({ type: 'fill', value: v, length: len });

  const submit = useCallback(async () => {
    if (!full || busy) {
      setShake((s) => s + 1);
      buzz([10, 50, 10]);
      const firstEmpty = slots.findIndex((d) => !d);
      if (firstEmpty >= 0) dispatch({ type: 'pick', i: firstEmpty });
      return;
    }
    const ok = await onSubmit(value);
    if (ok) dispatch({ type: 'fill', value: '', length: len });
    else setShake((s) => s + 1);
  }, [full, busy, slots, value, len, onSubmit]);

  const note = (d: string) => {
    setNotes((n) => {
      const next = { ...n };
      if (!next[d]) next[d] = 'x';
      else if (next[d] === 'x') next[d] = 'o';
      else delete next[d];
      if (notesScope) saveNotes(notesScope, next);
      return next;
    });
  };

  // Teclado físico: números, borrar, flechas para cambiar de casilla y Enter.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (locked) return;
      if (/^\d$/.test(e.key)) add(e.key);
      else if (e.key === 'Backspace') del();
      else if (e.key === 'ArrowLeft') dispatch({ type: 'move', by: -1 });
      else if (e.key === 'ArrowRight') dispatch({ type: 'move', by: 1 });
      else if (e.key === 'Enter') void submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [add, del, submit, locked]);

  const size = len > 4 ? 'md' : 'lg';
  const canReuse = Boolean(lastValue && lastValue.length === len && lastValue !== value);

  return (
    <div className="entry">
      <div className="entry-slots">
        {allowRandom && !locked ? (
          <button type="button" className="slot-tool" onClick={() => fill(randomCode(rules))} aria-label="Inventar un código al azar" title="Al azar">
            <Dices size={22} strokeWidth={2.2} />
          </button>
        ) : canReuse && !locked ? (
          <button
            type="button"
            className="slot-tool"
            onClick={() => fill(lastValue!)}
            aria-label={`Usar mi último intento, ${lastValue!.split('').join(' ')}`}
            title="Usar mi último intento"
          >
            <History size={22} strokeWidth={2.2} />
          </button>
        ) : (
          <span className="slot-tool-space" />
        )}
        {locked ? (
          <div className="entry-locked">{lockedNote}</div>
        ) : (
          <div key={shake} className={`entry-row ${shake ? 'is-shaking' : ''}`}>
            <div className={`slots digit-row digit-row--${size}`} role="group" aria-label="Casillas del número">
              {slots.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  className="slot"
                  onClick={() => pick(i)}
                  aria-pressed={i === cursor}
                  aria-label={`Posición ${i + 1}${d ? (masked ? ', ocupada' : `: ${d}`) : ', vacía'}`}
                >
                  <Digit value={d} size={size} empty={!d} active={i === cursor} masked={masked && Boolean(d)} />
                </button>
              ))}
            </div>
          </div>
        )}
        {allowMask && !locked ? (
          <button
            type="button"
            className="slot-tool"
            onClick={() => setMasked((m) => !m)}
            aria-label={masked ? 'Mostrar el código' : 'Ocultar el código'}
            aria-pressed={masked}
          >
            {masked ? <EyeOff size={22} strokeWidth={2.2} /> : <Eye size={22} strokeWidth={2.2} />}
          </button>
        ) : (
          <span className="slot-tool-space" />
        )}
      </div>
      {!locked && hint && <p className="entry-hint">Toca una casilla para poner el número en esa posición</p>}
      {(!locked || notesScope) && (
        <Keypad
          onDigit={add}
          onDelete={del}
          onSubmit={submit}
          canSubmit={full && !busy}
          disabled={used}
          notes={notesScope ? notes : undefined}
          noteMode={noteMode}
          onNote={note}
          onToggleNotes={() => setNoteMode((m) => !m)}
          showNotes={Boolean(notesScope)}
          submitLabel={submitLabel}
          locked={locked}
        />
      )}
    </div>
  );
}
