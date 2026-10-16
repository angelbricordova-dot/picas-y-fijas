import { Check, CircleHelp, Eye, EyeOff, History, LogOut, Timer, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { marks, MODES, type GuessView, type RoomView, type SideView } from '../../shared/engine';
import { Avatar, type Mood } from '../components/Avatar';
import { HowTo } from '../components/Brand';
import { CodeEntry } from '../components/CodeEntry';
import { Replay } from '../components/Replay';
import { DigitRow, Domino } from '../components/Tiles';
import { Button, Flash, IconButton, Segmented, Sheet, TopBar } from '../components/ui';
import { outcomeTitle, recordFromView, saveRecord } from '../lib/history';
import type { Controller } from '../lib/room';
import { buzz, clack, fanfare, pips, sadTrombone, setSound, soundOn } from '../lib/sound';
import {
  activeSidesV,
  colorOf,
  designated,
  playerById,
  sideColor,
  sideName,
  submittedThisRound,
  useFresh,
  useNow,
} from '../lib/view';

function SoundButton() {
  const [on, setOn] = useState(soundOn());
  return (
    <IconButton
      label={on ? 'Silenciar' : 'Activar sonido'}
      onClick={() => {
        setSound(!on);
        setOn(!on);
      }}
    >
      {on ? <Volume2 size={22} strokeWidth={2.2} /> : <VolumeX size={22} strokeWidth={2.2} />}
    </IconButton>
  );
}

function GameBar({ v, c, onLeave, title }: { v: RoomView; c: Controller; onLeave: () => void; title: ReactNode }) {
  const [help, setHelp] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <TopBar
        left={
          <IconButton label={c.local ? 'Terminar práctica' : 'Abandonar partida'} onClick={() => (c.local ? onLeave() : setConfirm(true))}>
            <LogOut size={22} strokeWidth={2.3} />
          </IconButton>
        }
        center={title}
        right={
          <>
            <SoundButton />
            <IconButton label="Cómo se juega" onClick={() => setHelp(true)}>
              <CircleHelp size={22} strokeWidth={2.2} />
            </IconButton>
          </>
        }
      />
      <Sheet open={help} onClose={() => setHelp(false)} title="Cómo se juega">
        <HowTo />
      </Sheet>
      <Sheet open={confirm} onClose={() => setConfirm(false)} title="¿Abandonar la partida?">
        <p className="sheet-text">
          {v.mode === 'teams'
            ? 'Tu pareja sigue jugando sin ti. Si los dos se van, pierden.'
            : 'Si te vas, pierdes esta partida y los demás siguen.'}
        </p>
        <div className="sheet-actions">
          <Button variant="danger" onClick={onLeave}>
            Abandonar
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Seguir jugando
          </Button>
        </div>
      </Sheet>
    </>
  );
}

function MiniAvatar({ v, side, mood, size = 30 }: { v: RoomView; side: SideView; mood?: Mood; size?: number }) {
  const p = playerById(v, side.members[0]);
  return <Avatar id={p?.avatar ?? 'gorra'} color={sideColor(v, side)} size={size} mood={mood} />;
}

/** El código propio, oculto hasta que lo tocas. */
function MyCode({ value, label = 'Tu código' }: { value?: string; label?: string }) {
  const [show, setShow] = useState(false);
  if (!value) return null;
  return (
    <button type="button" className="mycode" onClick={() => setShow((s) => !s)} aria-pressed={show}>
      <span className="mycode-label">{label}</span>
      <DigitRow value={value} size="xs" masked={!show} />
      {show ? <EyeOff size={18} strokeWidth={2.3} /> : <Eye size={18} strokeWidth={2.3} />}
    </button>
  );
}

// ——— Código secreto ———

export function SecretScreen({ c, onLeave }: { c: Controller; onLeave: () => void }) {
  const v = c.view!;
  const mine = v.sides.find((s) => s.id === v.mySide);
  const [editing, setEditing] = useState(!mine?.ready);
  const pending = activeSidesV(v).filter((s) => !s.ready);
  const teammateSet = mine?.setBy && mine.setBy !== v.me ? playerById(v, mine.setBy)?.name : null;

  // Si tu pareja guarda el código, tu pantalla lo muestra en vez del teclado.
  useEffect(() => {
    setEditing(!mine?.ready);
  }, [mine?.ready, mine?.setBy]);

  return (
    <div className="screen screen--game">
      <GameBar v={v} c={c} onLeave={onLeave} title={<span className="topbar-title">Códigos secretos</span>} />
      <div className="secret-head">
        <div className="side-strip">
          {v.sides.map((s) => (
            <div key={s.id} className={`side-chip ${s.ready ? 'is-ready' : ''}`}>
              <MiniAvatar v={v} side={s} mood={s.ready ? 'happy' : 'think'} size={34} />
              <span className="side-chip-name">{sideName(v, s)}</span>
              <span className="side-chip-state">{s.ready ? <Check size={14} strokeWidth={3} /> : s.id === v.mySide ? 'te toca' : 'pensando'}</span>
            </div>
          ))}
        </div>
        {editing ? (
          <>
            <h2 className="screen-title">{v.mode === 'teams' ? 'Escriban el código de la pareja' : 'Escribe tu código secreto'}</h2>
            <p className="screen-lead screen-lead--tight">
              {v.rules.length} dígitos, {v.rules.repeats ? 'puedes repetir números' : 'sin repetir números'}. Nadie más lo
              verá{v.mode === 'teams' ? ', solo tu pareja' : ''}.
            </p>
          </>
        ) : (
          <div className="secret-done">
            <h2 className="screen-title">{teammateSet ? `${teammateSet} escribió el código` : 'Código guardado'}</h2>
            <MyCode value={mine?.secret} label={v.mode === 'teams' ? 'El de la pareja' : 'Tu código'} />
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Cambiarlo
            </Button>
            <p className="screen-lead screen-lead--tight">
              {pending.length
                ? `Esperando a ${pending.map((s) => sideName(v, s, { you: false })).join(', ')}…`
                : 'Todo listo, ¡a jugar!'}
            </p>
          </div>
        )}
      </div>
      <Flash message={c.flash} onDone={c.clearFlash} />
      <div className="tray">
        <CodeEntry
          key={editing ? 'edit' : 'done'}
          rules={v.rules}
          allowMask
          allowRandom
          busy={c.busy}
          locked={!editing}
          lockedNote={<span className="entry-locked-text">Tu código está guardado</span>}
          submitLabel="Guardar código"
          onSubmit={async (value) => {
            const ok = await c.send('secret', { value });
            if (ok) {
              clack();
              buzz(15);
              setEditing(false);
            }
            return ok;
          }}
        />
      </div>
    </div>
  );
}

// ——— Juego ———

function FaceDown({ width = 64 }: { width?: number }) {
  return (
    <svg className="domino domino--back" viewBox="0 0 208 110" width={width} height={(width * 110) / 208} aria-label="Ya jugó, se revela al cerrar la ronda" role="img">
      <rect x="1" y="7" width="206" height="102" rx="20" fill="var(--bone-shade)" />
      <rect x="1" y="1" width="206" height="102" rx="20" fill="var(--bone-2)" />
      <rect x="14" y="14" width="180" height="76" rx="12" fill="none" stroke="var(--bone-edge)" strokeWidth="4" strokeDasharray="10 8" />
    </svg>
  );
}

function MyRow({ v, g, fresh }: { v: RoomView; g: GuessView; fresh: boolean }) {
  const len = v.rules.length;
  const multi = (g.results?.length ?? 0) > 1;
  return (
    <li className={`row ${fresh ? 'is-new' : ''}`}>
      <span className="row-round">{g.round}</span>
      <DigitRow value={g.value ?? ''} size="sm" />
      <span className="row-results">
        {g.results?.map((r) => {
          const target = v.sides.find((s) => s.id === r.target);
          return (
            <span key={r.target} className="result">
              {multi && target && (
                <span className="result-who">
                  <MiniAvatar v={v} side={target} size={18} />
                </span>
              )}
              <Domino
                fijas={r.fijas}
                picas={r.picas}
                width={multi ? 54 : 72}
                animate={fresh}
                win={r.fijas === len}
              />
            </span>
          );
        })}
      </span>
    </li>
  );
}

function TheirRow({ v, g, fresh, secret }: { v: RoomView; g: GuessView; fresh: boolean; secret?: string }) {
  const side = v.sides.find((s) => s.id === g.sideId);
  const res = g.results?.find((r) => r.target === v.mySide);
  return (
    <li className={`row row--theirs ${fresh ? 'is-new' : ''}`}>
      <span className="row-round">{g.round}</span>
      {side && (
        <span className="row-who">
          <MiniAvatar v={v} side={side} size={26} />
        </span>
      )}
      {g.hidden ? (
        <>
          <span className="row-wait">{playerById(v, g.by)?.name} ya jugó</span>
          <span className="row-results">
            <FaceDown width={62} />
          </span>
        </>
      ) : (
        <>
          <DigitRow value={g.value ?? ''} size="sm" marks={secret && g.value ? marks(secret, g.value) : undefined} />
          <span className="row-results">
            {res && <Domino fijas={res.fijas} picas={res.picas} width={62} animate={fresh} win={res.fijas === v.rules.length} />}
          </span>
        </>
      )}
    </li>
  );
}

function RaceBoard({ v }: { v: RoomView }) {
  const rows = v.sides
    .map((s) => {
      const gs = v.guesses.filter((g) => g.sideId === s.id && g.results);
      const best = gs.reduce<{ fijas: number; picas: number } | null>((b, g) => {
        const r = g.results![0];
        if (!b || r.fijas > b.fijas || (r.fijas === b.fijas && r.picas > b.picas)) return r;
        return b;
      }, null);
      return { s, count: gs.length, best };
    })
    .sort((a, b) => (b.best?.fijas ?? -1) - (a.best?.fijas ?? -1));
  return (
    <ul className="board">
      {rows.map(({ s, count, best }) => (
        <li key={s.id} className="board-row">
          <MiniAvatar v={v} side={s} size={34} />
          <span className="board-name">
            {sideName(v, s)}
            <span className="board-sub">{count === 1 ? '1 intento' : `${count} intentos`}</span>
          </span>
          {best ? (
            <span className="board-best">
              <span className="board-best-label">Su mejor</span>
              <Domino fijas={best.fijas} picas={best.picas} width={62} />
            </span>
          ) : (
            <span className="board-sub">Sin intentos aún</span>
          )}
        </li>
      ))}
      <li className="board-note">En la carrera no ves los números de los demás, solo qué tan cerca van.</li>
    </ul>
  );
}

function RoundClock({ v, offset }: { v: RoomView; offset: number }) {
  const now = useNow(Boolean(v.roundDeadline), offset);
  if (!v.roundDeadline) return null;
  const total = v.rules.timer * 1000;
  const left = Math.max(0, v.roundDeadline - now);
  const secs = Math.ceil(left / 1000);
  return (
    <div className={`clock ${secs <= 10 ? 'is-hurry' : ''}`} role="timer" aria-label={`${secs} segundos`}>
      <Timer size={16} strokeWidth={2.6} />
      <span className="clock-num">{secs}</span>
      <span className="clock-bar">
        <span className="clock-fill" style={{ transform: `scaleX(${left / total})` }} />
      </span>
    </div>
  );
}

export function PlayScreen({ c, onLeave }: { c: Controller; onLeave: () => void }) {
  const v = c.view!;
  const race = v.mode === 'race';
  const mine = v.sides.find((s) => s.id === v.mySide);
  const out = mine?.eliminatedRound !== undefined;
  const submitted = submittedThisRound(v);
  const iPlayed = mine ? submitted.has(mine.id) : true;
  const waiting = activeSidesV(v).filter((s) => !submitted.has(s.id) && s.id !== v.mySide);
  const [tab, setTab] = useState<'mine' | 'theirs'>('mine');
  const listRef = useRef<HTMLDivElement>(null);

  const myGuesses = v.guesses.filter((g) => g.sideId === v.mySide);
  const theirGuesses = v.guesses.filter(
    (g) => g.sideId !== v.mySide && (g.hidden || g.results?.some((r) => r.target === v.mySide)),
  );
  const keyOf = (g: GuessView) => `${g.id}:${g.hidden ? 'h' : 'v'}`;
  const fresh = useFresh(v.guesses.map(keyOf));

  // Sonido y vibración cuando llega un resultado nuevo.
  const heard = useRef<Set<string> | null>(null);
  useEffect(() => {
    const keys = v.guesses.filter((g) => !g.hidden).map(keyOf);
    if (heard.current === null) {
      heard.current = new Set(keys);
      return;
    }
    const news = v.guesses.filter((g) => !g.hidden && !heard.current!.has(keyOf(g)));
    news.forEach((g) => heard.current!.add(keyOf(g)));
    const own = news.find((g) => g.sideId === v.mySide);
    if (own?.results?.[0]) {
      const best = own.results.reduce((a, b) => (b.fijas > a.fijas ? b : a));
      clack();
      pips(best.fijas, best.picas);
      buzz(best.fijas ? [12, 60, 12] : 12);
    } else if (news.length) {
      clack(0.7);
    }
  }, [v.guesses, v.mySide]);

  // La lista sigue al intento más reciente, como una conversación.
  const shown = tab === 'mine' ? myGuesses.length : theirGuesses.length;
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [shown, tab]);

  const team = v.mode === 'teams' && mine ? designated(v, mine) : undefined;
  const turnName = team && team !== v.me ? playerById(v, team)?.name : null;

  let lockedNote: ReactNode = null;
  if (out) {
    lockedNote = (
      <span className="entry-locked-text">
        {mine?.surrendered ? 'Abandonaste esta partida' : 'Te descubrieron. Mira cómo termina.'}
      </span>
    );
  } else if (iPlayed) {
    lockedNote = waiting.length ? (
      <span className="entry-locked-text">
        <span className="waiting-faces" aria-hidden>
          {waiting.map((s) => (
            <MiniAvatar key={s.id} v={v} side={s} mood="think" size={24} />
          ))}
        </span>
        Esperando a {waiting.map((s) => sideName(v, s, { you: false })).join(' y ')}
        <span className="dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </span>
    ) : (
      <span className="entry-locked-text">Cerrando la ronda…</span>
    );
  }

  const crackedMe = !race && mine?.eliminatedRound === undefined
    ? v.guesses.some((g) => g.round === v.round && g.results?.some((r) => r.target === v.mySide && r.fijas === v.rules.length))
    : false;

  return (
    <div className="screen screen--game">
      <GameBar
        v={v}
        c={c}
        onLeave={onLeave}
        title={
          <span className="round-title">
            <span className="round-label">Ronda</span>
            <span className="round-num">{v.round}</span>
            {v.rules.maxRounds > 0 && <span className="round-of">de {v.rules.maxRounds}</span>}
          </span>
        }
      />
      <RoundClock v={v} offset={c.offset} />
      <div className="play-head">
        <div className={`side-strip side-strip--play ${v.sides.length > 2 ? 'side-strip--many' : ''}`}>
          {v.sides.map((s) => {
            const gone = s.eliminatedRound !== undefined;
            const played = submitted.has(s.id);
            return (
              <div key={s.id} className={`side-chip ${gone ? 'is-out' : played ? 'is-ready' : ''} ${s.id === v.mySide ? 'is-me' : ''}`}>
                <MiniAvatar v={v} side={s} mood={gone ? 'sad' : played ? 'happy' : 'think'} size={32} />
                <span className="side-chip-name">{sideName(v, s)}</span>
                <span className="side-chip-state">
                  {gone ? (
                    s.surrendered ? 'se fue' : 'fuera'
                  ) : played ? (
                    <Check size={14} strokeWidth={3} />
                  ) : v.sides.length > 2 ? (
                    <span className="dots" aria-label="pensando">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : s.id === v.mySide ? (
                    'te toca'
                  ) : (
                    'pensando'
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {!race && <MyCode value={mine?.secret} label={v.mode === 'teams' ? 'Código de la pareja' : 'Tu código'} />}
        <Segmented
          label="Qué ver"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'mine', label: v.mode === 'teams' ? 'Nuestros intentos' : 'Mis intentos' },
            { value: 'theirs', label: race ? 'Rivales' : v.mode === 'teams' ? 'Contra nuestro código' : 'Contra mi código' },
          ]}
        />
      </div>

      <div className="list" ref={listRef}>
        {tab === 'mine' ? (
          myGuesses.length ? (
            <ul className="rows">
              {myGuesses.map((g) => (
                <MyRow key={keyOf(g)} v={v} g={g} fresh={fresh.has(keyOf(g))} />
              ))}
            </ul>
          ) : (
            <div className="empty">
              <Domino fijas={0} picas={0} width={92} />
              <p>
                {race
                  ? 'Escribe un número para empezar a descubrir el código de la app.'
                  : `Escribe un número de ${v.rules.length} dígitos para tratar de descubrir el código ${
                      activeSidesV(v).length > 2 ? 'de los demás' : `de ${sideName(v, activeSidesV(v).find((s) => s.id !== v.mySide), { you: false })}`
                    }.`}
              </p>
            </div>
          )
        ) : race ? (
          <RaceBoard v={v} />
        ) : theirGuesses.length ? (
          <ul className="rows">
            {theirGuesses.map((g) => (
              <TheirRow key={keyOf(g)} v={v} g={g} fresh={fresh.has(keyOf(g))} secret={mine?.secret} />
            ))}
            <li className="board-note">Solo tú ves qué números de tu código son fijas o picas.</li>
          </ul>
        ) : (
          <div className="empty">
            <p>Aquí verás lo que intentan los demás contra tu código, y la app les responde por ti.</p>
          </div>
        )}
      </div>

      {crackedMe && <p className="alert">¡Descubrieron tu código! Esta es tu última oportunidad para empatar.</p>}
      {turnName && !iPlayed && <p className="turn-note">Le toca a {turnName}, pero también puedes enviar tú.</p>}
      <Flash message={c.flash} onDone={c.clearFlash} />
      <div className="tray">
        <CodeEntry
          rules={v.rules}
          busy={c.busy}
          locked={out || iPlayed}
          lockedNote={lockedNote}
          notesScope={`${v.code}:${v.game}:${v.me}`}
          submitLabel="Probar"
          onSubmit={(value) => c.send('guess', { value })}
        />
      </div>
    </div>
  );
}

// ——— Final ———

function Topple() {
  // Fichas de dominó cayendo en cadena: la celebración.
  return (
    <div className="topple" aria-hidden>
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} className="topple-tile" style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  );
}

export function OverScreen({ c, onLeave }: { c: Controller; onLeave: () => void }) {
  const v = c.view!;
  const o = v.outcome!;
  const isHost = v.hostId === v.me;
  const iWon = Boolean(v.mySide && o.winners.includes(v.mySide));
  const winners = v.sides.filter((s) => o.winners.includes(s.id));
  const rounds = v.round;
  const played = useRef(false);
  const [record] = useState(() => recordFromView(v));
  const [replay, setReplay] = useState(false);

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    saveRecord(record);
    if (iWon) {
      fanfare();
      buzz([20, 60, 20, 60, 40]);
    } else if (o.winners.length) sadTrombone();
  }, [iWon, o.winners.length, record]);

  const title = outcomeTitle(v);

  const reason: Record<string, string> = {
    cracked: `Descubierto en la ronda ${rounds}.`,
    last: `Quedó en pie hasta la ronda ${rounds}.`,
    draw: `Se descubrieron en la misma ronda (${rounds}).`,
    limit: `Se acabaron las ${v.rules.maxRounds} rondas.`,
    surrender: 'Los demás se fueron de la mesa.',
  };

  const secrets = v.mode === 'race' ? [] : v.sides.filter((s) => s.secret);
  const scoreboard = [...v.players].sort((a, b) => b.wins - a.wins);

  return (
    <div className={`screen screen--over ${iWon ? 'is-win' : ''}`}>
      <TopBar
        left={
          <IconButton label="Salir" onClick={onLeave}>
            <LogOut size={22} strokeWidth={2.3} />
          </IconButton>
        }
        center={<span className="topbar-title">{MODES[v.mode].name}</span>}
        right={<SoundButton />}
      />
      <div className="scroll scroll--center">
        {(iWon || o.reason === 'draw') && <Topple />}
        <div className="over-hero">
          <div className="over-cast">
            {(winners.length ? winners : v.sides).slice(0, 4).map((s) =>
              s.members.map((m) => {
                const p = playerById(v, m);
                return p ? (
                  <Avatar key={m} id={p.avatar} color={colorOf(v, p)} size={winners.length > 1 ? 72 : 96} mood={winners.length ? 'happy' : 'sad'} />
                ) : null;
              }),
            )}
          </div>
          <h2 className="over-title">{title}</h2>
          <p className="over-reason">{reason[o.reason]}</p>
          {record.guesses.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setReplay(true)}>
              <History size={18} strokeWidth={2.4} />
              Ver cómo fue la partida
            </Button>
          )}
        </div>

        {v.mode === 'race' && v.appSecret && (
          <div className="reveal">
            <span className="reveal-label">El código era</span>
            <DigitRow value={v.appSecret} size="md" />
          </div>
        )}
        {secrets.length > 0 && (
          <ul className="reveal-list">
            {secrets.map((s) => (
              <li key={s.id} className="reveal-row">
                <MiniAvatar v={v} side={s} size={30} mood={o.winners.includes(s.id) ? 'happy' : 'idle'} />
                <span className="reveal-name">{sideName(v, s)}</span>
                <DigitRow value={s.secret!} size="sm" />
              </li>
            ))}
          </ul>
        )}

        {!c.local && v.players.length > 1 && (
          <section className="tally" aria-label="Marcador de la sala">
            <h3 className="block-title">Marcador</h3>
            <ul>
              {scoreboard.map((p) => (
                <li key={p.id} className="tally-row">
                  <Avatar id={p.avatar} color={colorOf(v, p)} size={26} />
                  <span className="tally-name">{p.id === v.me ? 'Tú' : p.name}</span>
                  <span className="tally-wins" aria-label={`${p.wins} partidas ganadas`}>
                    {p.wins}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <Sheet open={replay} onClose={() => setReplay(false)} title="Cómo fue la partida">
        <Replay record={record} />
      </Sheet>
      <Flash message={c.flash} onDone={c.clearFlash} />
      <div className="dock">
        {isHost ? (
          <>
            <Button onClick={() => c.send('rematch')} disabled={c.busy}>
              {c.local ? 'Otra vez' : '¡Revancha!'}
            </Button>
            {!c.local && (
              <Button variant="quiet" size="md" onClick={() => c.send('lobby')} disabled={c.busy}>
                Cambiar modalidad o reglas
              </Button>
            )}
          </>
        ) : (
          <p className="dock-note">
            Esperando a que <strong>{playerById(v, v.hostId)?.name}</strong> pida la revancha
            <span className="dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
