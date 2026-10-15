import { Dices, Eye, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { randomCode, type Rules } from '../../shared/engine';
import { getNotes, saveNotes, type NoteMark } from '../lib/session';
import { buzz } from '../lib/sound';
import { Keypad } from './Keypad';
import { DigitRow } from './Tiles';

/** Casillas + teclado + libreta. Sirve para el código secreto y para cada intento. */
export function CodeEntry({
  rules,
  onSubmit,
  submitLabel,
  notesScope,
  locked = false,
  lockedNote,
  allowMask = false,
  allowRandom = false,
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
  busy?: boolean;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  const [masked, setMasked] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, NoteMark>>(() => (notesScope ? getNotes(notesScope) : {}));
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (notesScope) setNotes(getNotes(notesScope));
  }, [notesScope]);

  const used = new Set(rules.repeats ? [] : value.split(''));
  const full = value.length === rules.length;

  const add = useCallback(
    (d: string) => setValue((v) => (v.length >= rules.length || (!rules.repeats && v.includes(d)) ? v : v + d)),
    [rules.length, rules.repeats],
  );
  const del = useCallback(() => setValue((v) => v.slice(0, -1)), []);

  const submit = useCallback(async () => {
    if (value.length !== rules.length || busy) {
      setShake((s) => s + 1);
      buzz([10, 50, 10]);
      return;
    }
    const ok = await onSubmit(value);
    if (ok) setValue('');
    else setShake((s) => s + 1);
  }, [value, rules.length, busy, onSubmit]);

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

  // Teclado físico: sin animaciones extra, solo escribe.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (locked) return;
      if (/^\d$/.test(e.key)) add(e.key);
      else if (e.key === 'Backspace') del();
      else if (e.key === 'Enter') void submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [add, del, submit, locked]);

  return (
    <div className="entry">
      <div className="entry-slots">
        {allowRandom && !locked ? (
          <button
            type="button"
            className="slot-tool"
            onClick={() => setValue(randomCode(rules))}
            aria-label="Inventar un código al azar"
            title="Al azar"
          >
            <Dices size={22} strokeWidth={2.2} />
          </button>
        ) : (
          <span className="slot-tool-space" />
        )}
        {locked ? (
          <div className="entry-locked">{lockedNote}</div>
        ) : (
          <div key={shake} className={`entry-row ${shake ? 'is-shaking' : ''}`}>
            <DigitRow value={value} length={rules.length} size={rules.length > 4 ? 'md' : 'lg'} masked={masked} cursor />
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
