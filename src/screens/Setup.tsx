import { ArrowLeft, CircleHelp, Gavel, History, Joystick } from 'lucide-react';
import { useState } from 'react';
import { MODES, type Mode, type Rules } from '../../shared/engine';
import { Avatar, AVATAR_NAMES, AVATARS, type AvatarId } from '../components/Avatar';
import { HowTo, Wordmark } from '../components/Brand';
import { TableDiagram } from '../components/Tiles';
import { Button, IconButton, Segmented, Sheet, Toggle, TopBar } from '../components/ui';
import type { Creds, Profile } from '../lib/session';

export const MODE_ORDER: Mode[] = ['duel', 'ffa', 'teams', 'race'];
export const MODE_PLAYERS: Record<Mode, string> = {
  duel: '2 jugadores',
  ffa: '3 o 4',
  teams: '2 contra 2',
  race: '1 a 4',
};

export function rulesSummary(r: Rules) {
  return [
    `${r.length} dígitos`,
    r.repeats ? 'con repetidos' : 'sin repetir',
    r.maxRounds ? `${r.maxRounds} rondas` : 'sin límite',
    r.timer ? `${r.timer} s por ronda` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function Home({
  onCreate,
  onJoin,
  onPractice,
  onReferee,
  resume,
  onResume,
  joinError,
  joining,
}: {
  onCreate: () => void;
  onJoin: (code: string) => void;
  onPractice: () => void;
  onReferee: () => void;
  resume: Creds | null;
  onResume: () => void;
  joinError: string | null;
  joining: boolean;
}) {
  const [code, setCode] = useState('');
  const [help, setHelp] = useState(false);
  const ready = code.length === 4;
  return (
    <div className="screen screen--home">
      <TopBar
        right={
          <IconButton label="Cómo se juega" onClick={() => setHelp(true)}>
            <CircleHelp size={24} strokeWidth={2.2} />
          </IconButton>
        }
      />
      <section className="home-hero">
        <div className="home-cast" aria-hidden>
          <Avatar id="sombrero" color={2} size={64} mood="think" className="cast cast--l" />
          <Avatar id="gorra" color={0} size={84} mood="happy" className="cast cast--c" />
          <Avatar id="mono" color={1} size={64} mood="wow" className="cast cast--r" />
        </div>
        <Wordmark />
        <p className="home-tagline">Adivina el código de los demás. La app cuenta las picas y fijas por ti.</p>
      </section>

      <section className="home-actions">
        {resume && (
          <button type="button" className="resume" onClick={onResume}>
            <History size={20} strokeWidth={2.4} />
            <span>
              Volver a la sala <strong className="resume-code">{resume.code}</strong>
            </span>
          </button>
        )}
        <Button onClick={onCreate}>Crear sala</Button>
        <form
          className="join"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) onJoin(code);
          }}
        >
          <label className="join-label" htmlFor="join-code">
            ¿Te pasaron un código?
          </label>
          <div className="join-row">
            <input
              id="join-code"
              className="join-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
              placeholder="ABCD"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="go"
              aria-describedby={joinError ? 'join-error' : undefined}
            />
            <Button type="submit" variant="ghost" size="md" disabled={!ready || joining}>
              {joining ? 'Entrando…' : 'Unirme'}
            </Button>
          </div>
          {joinError && (
            <p className="field-error" id="join-error" role="alert">
              {joinError}
            </p>
          )}
        </form>
        <div className="home-alt">
          <button type="button" className="alt" onClick={onPractice}>
            <Joystick size={22} strokeWidth={2.2} />
            <span className="alt-text">
              <span className="alt-title">Practicar solo</span>
              <span className="alt-sub">Contra la app, sin internet</span>
            </span>
          </button>
          <button type="button" className="alt" onClick={onReferee}>
            <Gavel size={22} strokeWidth={2.2} />
            <span className="alt-text">
              <span className="alt-title">Modo árbitro</span>
              <span className="alt-sub">Juegan en persona, la app responde</span>
            </span>
          </button>
        </div>
      </section>
      <Sheet open={help} onClose={() => setHelp(false)} title="Cómo se juega">
        <HowTo />
      </Sheet>
    </div>
  );
}

export function ProfileScreen({
  initial,
  invite,
  onBack,
  onDone,
  busy,
  error,
}: {
  initial: Profile | null;
  invite?: string;
  onBack: () => void;
  onDone: (p: Profile) => void;
  busy?: boolean;
  error?: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState<AvatarId>(initial?.avatar ?? 'gorra');
  const ok = name.trim().length > 0;
  return (
    <div className="screen">
      <TopBar
        left={
          <IconButton label="Volver" onClick={onBack}>
            <ArrowLeft size={24} strokeWidth={2.4} />
          </IconButton>
        }
        center={<span className="topbar-title">{invite ? `Sala ${invite}` : 'Tu ficha'}</span>}
      />
      <form
        className="profile"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onDone({ name: name.trim(), avatar });
        }}
      >
        <div className="profile-preview" aria-hidden>
          <Avatar id={avatar} color={0} size={112} mood={ok ? 'happy' : 'idle'} />
        </div>
        <h2 className="screen-title">{invite ? 'Te invitaron a jugar' : '¿Quién juega?'}</h2>
        <label className="field">
          <span className="field-label">Tu nombre</span>
          <input
            className="text-input"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 14))}
            placeholder="Como te dicen"
            autoComplete="nickname"
            enterKeyHint="done"
            maxLength={14}
          />
        </label>
        <fieldset className="field">
          <legend className="field-label">Elige tu personaje</legend>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className={`avatar-pick ${a === avatar ? 'is-on' : ''}`}
                aria-pressed={a === avatar}
                aria-label={AVATAR_NAMES[a]}
                onClick={() => setAvatar(a)}
              >
                <Avatar id={a} color={0} size={52} mood={a === avatar ? 'happy' : 'idle'} />
              </button>
            ))}
          </div>
        </fieldset>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="dock">
          <Button type="submit" disabled={!ok || busy}>
            {busy ? 'Un momento…' : invite ? 'Entrar a la sala' : 'Listo'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ModeList({ value, onChange, counts }: { value: Mode; onChange: (m: Mode) => void; counts?: number }) {
  return (
    <div className="mode-list" role="radiogroup" aria-label="Modalidad">
      {MODE_ORDER.map((m) => {
        const info = MODES[m];
        const fits = counts === undefined || counts <= info.max;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={value === m}
            className={`mode ${value === m ? 'is-on' : ''}`}
            onClick={() => onChange(m)}
            disabled={!fits}
          >
            <TableDiagram mode={m} size={58} />
            <span className="mode-text">
              <span className="mode-name">
                {info.name}
                <span className="mode-players">{MODE_PLAYERS[m]}</span>
              </span>
              <span className="mode-blurb">{info.blurb}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function RulesForm({
  rules,
  onChange,
  practice = false,
}: {
  rules: Rules;
  onChange: (r: Rules) => void;
  practice?: boolean;
}) {
  return (
    <div className="rules">
      <div className="rule">
        <span className="rule-label">Dígitos del código</span>
        <Segmented
          label="Dígitos del código"
          value={rules.length}
          onChange={(length) => onChange({ ...rules, length })}
          options={[3, 4, 5, 6].map((n) => ({ value: n, label: <span className="seg-num">{n}</span> }))}
        />
      </div>
      <Toggle
        checked={rules.repeats}
        onChange={(repeats) => onChange({ ...rules, repeats })}
        label="Permitir números repetidos"
        hint={rules.repeats ? 'Vale 1124 o 7777' : 'Cada dígito una sola vez, como 4872'}
      />
      <div className="rule">
        <span className="rule-label">Límite de rondas</span>
        <Segmented
          label="Límite de rondas"
          value={rules.maxRounds}
          onChange={(maxRounds) => onChange({ ...rules, maxRounds })}
          options={[
            { value: 0, label: 'Sin límite' },
            { value: 8, label: '8' },
            { value: 10, label: '10' },
            { value: 15, label: '15' },
          ]}
        />
      </div>
      {!practice && (
        <div className="rule">
          <span className="rule-label">Tiempo por ronda</span>
          <Segmented
            label="Tiempo por ronda"
            value={rules.timer}
            onChange={(timer) => onChange({ ...rules, timer })}
            options={[
              { value: 0, label: 'Sin reloj' },
              { value: 30, label: '30 s' },
              { value: 60, label: '60 s' },
              { value: 90, label: '90 s' },
            ]}
          />
        </div>
      )}
    </div>
  );
}

export function CreateScreen({
  practice,
  initialRules,
  onBack,
  onCreate,
  busy,
  error,
}: {
  practice: boolean;
  initialRules: Rules;
  onBack: () => void;
  onCreate: (mode: Mode, rules: Rules) => void;
  busy: boolean;
  error: string | null;
}) {
  const [mode, setMode] = useState<Mode>(practice ? 'race' : 'duel');
  const [rules, setRules] = useState<Rules>(initialRules);
  return (
    <div className="screen">
      <TopBar
        left={
          <IconButton label="Volver" onClick={onBack}>
            <ArrowLeft size={24} strokeWidth={2.4} />
          </IconButton>
        }
        center={<span className="topbar-title">{practice ? 'Práctica' : 'Nueva sala'}</span>}
      />
      <div className="scroll">
        {practice ? (
          <p className="screen-lead">
            La app inventa un código y tú lo descubres. Sirve para practicar, sin internet.
          </p>
        ) : (
          <section className="block">
            <h2 className="block-title">¿Cómo van a jugar?</h2>
            <ModeList value={mode} onChange={setMode} />
          </section>
        )}
        <section className="block">
          <h2 className="block-title">Reglas</h2>
          <RulesForm rules={rules} onChange={setRules} practice={practice} />
        </section>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="dock">
        <Button onClick={() => onCreate(mode, rules)} disabled={busy}>
          {busy ? 'Armando la mesa…' : practice ? 'Empezar' : 'Crear sala'}
        </Button>
      </div>
    </div>
  );
}
