// "Cómo fue la partida": los códigos de todos y cada intento, ronda por ronda.
import { FastForward, Play } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { marks } from '../../shared/engine';
import type { GameRecord, RecordGuess, RecordSide } from '../lib/history';
import { clack, pips } from '../lib/sound';
import { Avatar } from './Avatar';
import { DigitRow, Domino } from './Tiles';
import { Button } from './ui';

const STEP_MS = 950;

function targetSecret(r: GameRecord, target: string) {
  return target === 'app' ? r.appSecret : r.sides.find((s) => s.id === target)?.secret;
}

function GuessLine({ r, g, fresh }: { r: GameRecord; g: RecordGuess; fresh: boolean }) {
  const side = r.sides.find((s) => s.id === g.sideId);
  const len = r.rules.length;
  const single = g.results.length === 1 ? g.results[0] : null;
  const secret = single ? targetSecret(r, single.target) : undefined;
  const cracked = (g.truth ?? g.results).some((x) => x.fijas === len);
  const wrong = (g.truth ?? [])
    .map((t) => ({ t, given: g.results.find((x) => x.target === t.target) }))
    .filter(({ t, given }) => given && (given.fijas !== t.fijas || given.picas !== t.picas));
  return (
    <li className={`replay-row ${fresh ? 'is-new' : ''} ${cracked ? 'is-crack' : ''}`}>
      {side && (
        <span className="replay-who">
          <Avatar id={side.avatar} color={side.color} size={26} />
          <span className="replay-name">
            {side.name}
            {g.by && <span className="replay-by">{g.by}</span>}
          </span>
        </span>
      )}
      <span className="replay-guess">
        <DigitRow value={g.value} size="sm" marks={secret && secret.length === g.value.length ? marks(secret, g.value) : undefined} />
        <span className="row-results">
          {g.results.map((x) => {
            const t = r.sides.find((s) => s.id === x.target);
            return (
              <span key={x.target} className="result">
                {g.results.length > 1 && t && (
                  <span className="result-who">
                    <Avatar id={t.avatar} color={t.color} size={18} />
                  </span>
                )}
                <Domino fijas={x.fijas} picas={x.picas} width={g.results.length > 1 ? 54 : 66} animate={fresh} win={x.fijas === len} />
              </span>
            );
          })}
        </span>
      </span>
      {cracked && <span className="replay-tag">¡Lo descubrió!</span>}
      {wrong.map(({ t }) => (
        <span key={t.target} className="replay-tag replay-tag--wrong">
          {r.sides.find((s) => s.id === t.target)?.name ?? ''} contó mal: eran {t.fijas} {t.fijas === 1 ? 'fija' : 'fijas'} y {t.picas}{' '}
          {t.picas === 1 ? 'pica' : 'picas'}
        </span>
      ))}
    </li>
  );
}

function SecretChip({ s }: { s: RecordSide }) {
  return (
    <li className={`replay-secret ${s.won ? 'is-won' : ''}`}>
      <Avatar id={s.avatar} color={s.color} size={30} mood={s.won ? 'happy' : 'idle'} />
      <span className="replay-name">
        {s.name}
        {s.sub && <span className="replay-by">{s.sub}</span>}
      </span>
      {s.secret ? (
        <DigitRow value={s.secret} size="sm" />
      ) : (
        <span className="replay-unknown">Sin anotar</span>
      )}
    </li>
  );
}

export function Replay({ record, autoplay = true }: { record: GameRecord; autoplay?: boolean }) {
  const total = record.guesses.length;
  const [shown, setShown] = useState(autoplay ? 0 : total);
  const playing = shown < total;
  const endRef = useRef<HTMLDivElement>(null);
  const len = record.rules.length;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 450 : STEP_MS);
    return () => clearTimeout(t);
  }, [shown, playing]);

  // Sonido de cada ficha durante la repetición (solo cuando avanza).
  const guessesRef = useRef(record.guesses);
  guessesRef.current = record.guesses;
  useEffect(() => {
    const g = guessesRef.current[shown - 1];
    if (!g || !autoplay || shown >= guessesRef.current.length + 1) return;
    const best = g.results.reduce((a, b) => (b.fijas > a.fijas ? b : a), g.results[0]);
    clack(0.8);
    if (best) pips(best.fijas, best.picas);
  }, [shown, autoplay]);

  useEffect(() => {
    if (playing) endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [shown, playing]);

  const visible = record.guesses.slice(0, shown);
  const rounds = [...new Set(visible.map((g) => g.round))];

  return (
    <div className="replay">
      <section className="replay-block">
        <h3 className="block-title">{record.mode === 'race' ? 'El código de la app' : 'Los códigos'}</h3>
        {record.mode === 'race' ? (
          <div className="replay-app">{record.appSecret && <DigitRow value={record.appSecret} size="md" />}</div>
        ) : (
          <ul className="replay-secrets">
            {record.sides.map((s) => (
              <SecretChip key={s.id} s={s} />
            ))}
          </ul>
        )}
      </section>

      <section className="replay-block">
        <div className="replay-head">
          <h3 className="block-title">Ronda por ronda</h3>
          {total > 0 &&
            (playing ? (
              <Button variant="ghost" size="sm" onClick={() => setShown(total)}>
                <FastForward size={16} strokeWidth={2.4} />
                Ver todo
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShown(0)}>
                <Play size={16} strokeWidth={2.4} />
                Repetir
              </Button>
            ))}
        </div>
        {total === 0 ? (
          <p className="replay-empty">No hubo intentos en esta partida.</p>
        ) : (
          <ol className="replay-rounds">
            {rounds.map((round) => (
              <Fragment key={round}>
                <li className="replay-round">
                  <span className="replay-round-num">{record.mode === 'referee' ? `Intento ${round}` : `Ronda ${round}`}</span>
                </li>
                {visible
                  .map((g, i) => ({ g, i }))
                  .filter(({ g }) => g.round === round)
                  .map(({ g, i }) => (
                    <GuessLine key={i} r={record} g={g} fresh={autoplay && playing && i === shown - 1} />
                  ))}
              </Fragment>
            ))}
          </ol>
        )}
        <div ref={endRef} />
        {!playing && total > 0 && (
          <p className="replay-summary">
            {record.guesses.filter((g) => g.results.some((x) => x.fijas === len)).length
              ? `Terminó en ${record.mode === 'referee' ? `${total} intentos` : `la ronda ${record.rounds}`}.`
              : 'Nadie descubrió el código.'}{' '}
            Rojo: fija · Aro: pica · Apagado: no está.
          </p>
        )}
      </section>
    </div>
  );
}
