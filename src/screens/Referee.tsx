// Modo árbitro: para jugar en persona. Guardas tu código en tu celular y, cuando el
// otro dice un número en voz alta, lo escribes y la app te dice qué responder.
import { ArrowLeft, Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { codeProblem, DEFAULT_RULES, marks, score, type Rules } from '../../shared/engine';
import { Avatar } from '../components/Avatar';
import { CodeEntry } from '../components/CodeEntry';
import { DigitRow, Domino, resultLabel } from '../components/Tiles';
import { Button, Flash, IconButton, Segmented, Sheet, TopBar } from '../components/ui';
import { getPref, setPref } from '../lib/session';
import { buzz, clack, pips } from '../lib/sound';
import { useFresh } from '../lib/view';
import { RulesForm } from './Setup';

interface Entry {
  value: string;
  fijas: number;
  picas: number;
}

interface RefState {
  step: 'rules' | 'secret' | 'play';
  rules: Rules;
  secret: string;
  heard: Entry[];
  mine: Entry[];
  game: number;
}

const fresh0: RefState = { step: 'rules', rules: DEFAULT_RULES, secret: '', heard: [], mine: [], game: 1 };

export function RefereeScreen({ onBack }: { onBack: () => void }) {
  const [s, setS] = useState<RefState>(() => getPref<RefState>('referee', fresh0));
  const [tab, setTab] = useState<'heard' | 'mine'>('heard');
  const [flash, setFlash] = useState<string | null>(null);
  const [pendingMine, setPendingMine] = useState<string | null>(null);
  const [f, setF] = useState(0);
  const [p, setP] = useState(0);
  const [restart, setRestart] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPref('referee', s), [s]);

  const len = s.rules.length;
  const cracked = s.heard.some((e) => e.fijas === len);
  const last = s.heard[s.heard.length - 1];
  const freshKeys = useFresh([...s.heard.map((_, i) => `h${s.game}-${i}`), ...s.mine.map((_, i) => `m${s.game}-${i}`)]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [s.heard.length, s.mine.length, tab]);

  if (s.step === 'rules') {
    return (
      <div className="screen">
        <TopBar
          left={
            <IconButton label="Volver" onClick={onBack}>
              <ArrowLeft size={24} strokeWidth={2.4} />
            </IconButton>
          }
          center={<span className="topbar-title">Modo árbitro</span>}
        />
        <div className="scroll">
          <div className="ref-intro">
            <div className="ref-intro-cast" aria-hidden>
              <Avatar id="gafas" color={0} size={60} mood="think" />
              <Avatar id="bigote" color={2} size={60} mood="happy" />
            </div>
            <p className="screen-lead">
              Para jugar en persona, sin internet. Cada uno guarda su código en su celular. Cuando el otro diga un número,
              lo escribes y la app te dice cuántas fijas y picas responder, sin equivocarte.
            </p>
          </div>
          <section className="block">
            <h2 className="block-title">Reglas que acordaron</h2>
            <RulesForm rules={s.rules} onChange={(rules) => setS({ ...s, rules })} practice />
          </section>
        </div>
        <div className="dock">
          <Button onClick={() => setS({ ...s, step: 'secret' })}>Siguiente: mi código</Button>
        </div>
      </div>
    );
  }

  if (s.step === 'secret') {
    return (
      <div className="screen screen--game">
        <TopBar
          left={
            <IconButton label="Volver" onClick={() => setS({ ...s, step: 'rules' })}>
              <ArrowLeft size={24} strokeWidth={2.4} />
            </IconButton>
          }
          center={<span className="topbar-title">Tu código</span>}
        />
        <div className="secret-head">
          <h2 className="screen-title">Escribe tu código secreto</h2>
          <p className="screen-lead screen-lead--tight">
            {len} dígitos, {s.rules.repeats ? 'puedes repetir números' : 'sin repetir números'}. Que nadie vea tu pantalla.
          </p>
        </div>
        <Flash message={flash} onDone={() => setFlash(null)} />
        <div className="tray">
          <CodeEntry
            rules={s.rules}
            allowMask
            allowRandom
            submitLabel="Guardar y jugar"
            onSubmit={(value) => {
              const problem = codeProblem(value, s.rules);
              if (problem) {
                setFlash(problem);
                return false;
              }
              clack();
              setS({ ...s, secret: value, step: 'play', heard: [], mine: [] });
              return true;
            }}
          />
        </div>
      </div>
    );
  }

  const answer = (value: string) => {
    const problem = codeProblem(value, s.rules);
    if (problem) {
      setFlash(problem);
      return false;
    }
    const r = score(s.secret, value);
    clack();
    pips(r.fijas, r.picas);
    buzz(r.fijas === len ? [20, 60, 20, 60, 40] : 14);
    setS({ ...s, heard: [...s.heard, { value, ...r }] });
    return true;
  };

  const startMine = (value: string) => {
    const problem = codeProblem(value, s.rules);
    if (problem) {
      setFlash(problem);
      return false;
    }
    setPendingMine(value);
    setF(0);
    setP(0);
    return true;
  };

  const saveMine = () => {
    if (!pendingMine) return;
    if (f + p > len) {
      setFlash(`Fijas y picas suman máximo ${len}.`);
      return;
    }
    clack();
    pips(f, p, 0.085, 0.2);
    setS({ ...s, mine: [...s.mine, { value: pendingMine, fijas: f, picas: p }] });
    setPendingMine(null);
  };

  return (
    <div className="screen screen--game">
      <TopBar
        left={
          <IconButton label="Volver al inicio" onClick={onBack}>
            <ArrowLeft size={24} strokeWidth={2.4} />
          </IconButton>
        }
        center={<span className="topbar-title">Modo árbitro</span>}
        right={
          <IconButton label="Nueva partida" onClick={() => setRestart(true)}>
            <RotateCcw size={22} strokeWidth={2.3} />
          </IconButton>
        }
      />
      <div className="play-head">
        <button type="button" className="mycode" onClick={() => setShowSecret((x) => !x)} aria-pressed={showSecret}>
          <span className="mycode-label">Tu código</span>
          <DigitRow value={s.secret} size="xs" masked={!showSecret} />
        </button>
        <Segmented
          label="Qué ver"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'heard', label: 'Me dicen' },
            { value: 'mine', label: 'Mis apuntes' },
          ]}
        />
      </div>

      {tab === 'heard' && last && !cracked && (
        <div className="say" aria-live="polite">
          <span className="say-label">Responde</span>
          <Domino key={s.heard.length} fijas={last.fijas} picas={last.picas} width={92} animate />
          <span className="say-text">{resultLabel(last.fijas, last.picas)}</span>
        </div>
      )}
      {tab === 'heard' && cracked && (
        <div className="say say--win" aria-live="polite">
          <Avatar id="corona" color={1} size={54} mood="wow" />
          <span className="say-text">
            ¡Te descubrieron en {s.heard.length} {s.heard.length === 1 ? 'intento' : 'intentos'}!
          </span>
        </div>
      )}

      <div className="list" ref={listRef}>
        {tab === 'heard' ? (
          s.heard.length ? (
            <ul className="rows">
              {s.heard.map((e, i) => {
                const k = `h${s.game}-${i}`;
                return (
                  <li key={k} className={`row row--theirs ${freshKeys.has(k) ? 'is-new' : ''}`}>
                    <span className="row-round">{i + 1}</span>
                    <DigitRow value={e.value} size="sm" marks={marks(s.secret, e.value)} />
                    <span className="row-results">
                      <Domino fijas={e.fijas} picas={e.picas} width={62} animate={freshKeys.has(k)} win={e.fijas === len} />
                    </span>
                  </li>
                );
              })}
              <li className="board-note">Rojo: fija · Aro: pica · Apagado: no está. Solo tú lo ves.</li>
            </ul>
          ) : (
            <div className="empty">
              <p>Cuando el otro diga un número, escríbelo abajo. La app te dice qué responder.</p>
            </div>
          )
        ) : s.mine.length ? (
          <ul className="rows">
            {s.mine.map((e, i) => {
              const k = `m${s.game}-${i}`;
              return (
                <li key={k} className={`row ${freshKeys.has(k) ? 'is-new' : ''}`}>
                  <span className="row-round">{i + 1}</span>
                  <DigitRow value={e.value} size="sm" />
                  <span className="row-results">
                    <Domino fijas={e.fijas} picas={e.picas} width={62} animate={freshKeys.has(k)} win={e.fijas === len} />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty">
            <p>Anota aquí los números que tú dices y lo que te responden, para no perder la cuenta.</p>
          </div>
        )}
      </div>

      <Flash message={flash} onDone={() => setFlash(null)} />
      <div className="tray">
        {tab === 'mine' && pendingMine ? (
          <div className="tally-entry">
            <p className="tally-entry-title">
              ¿Qué te respondieron por <DigitRow value={pendingMine} size="xs" />?
            </p>
            <div className="tally-steppers">
              <Counter label="Fijas" value={f} onChange={setF} max={len} kind="fija" />
              <Counter label="Picas" value={p} onChange={setP} max={len} kind="pica" />
            </div>
            <Domino fijas={f} picas={p} width={84} />
            <div className="tally-actions">
              <Button variant="ghost" size="md" onClick={() => setPendingMine(null)}>
                Cancelar
              </Button>
              <Button size="md" onClick={saveMine}>
                Anotar
              </Button>
            </div>
          </div>
        ) : (
          <CodeEntry
            key={tab}
            rules={s.rules}
            locked={tab === 'heard' && cracked}
            lockedNote={<span className="entry-locked-text">Partida terminada</span>}
            notesScope={tab === 'mine' ? `ref:${s.game}` : undefined}
            submitLabel={tab === 'heard' ? 'Ver respuesta' : 'Siguiente'}
            onSubmit={tab === 'heard' ? answer : startMine}
          />
        )}
      </div>

      <Sheet open={restart} onClose={() => setRestart(false)} title="¿Nueva partida?">
        <p className="sheet-text">Se borra lo anotado y escribes un código nuevo.</p>
        <div className="sheet-actions">
          <Button
            onClick={() => {
              setS({ ...s, step: 'secret', secret: '', heard: [], mine: [], game: s.game + 1 });
              setRestart(false);
            }}
          >
            Sí, nueva partida
          </Button>
          <Button variant="ghost" onClick={() => setRestart(false)}>
            Seguir con esta
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Counter({
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
