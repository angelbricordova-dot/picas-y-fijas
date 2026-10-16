import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_RULES, type Mode, type RoomView, type Rules } from '../shared/engine';
import { Button } from './components/ui';
import { api, ApiError } from './lib/api';
import { loadHistory } from './lib/history';
import { useLocalRoom, useOnlineRoom, type Controller } from './lib/room';
import { getCreds, getPref, getProfile, lastRoom, saveCreds, saveProfile, setPref, type Creds, type Profile } from './lib/session';
import { OverScreen, PlayScreen, SecretScreen } from './screens/Game';
import { Lobby } from './screens/Lobby';
import { HistoryScreen } from './screens/History';
import { RefereeScreen } from './screens/Referee';
import { CreateScreen, Home, ProfileScreen } from './screens/Setup';

type Route =
  | { name: 'home' }
  | { name: 'profile'; then: 'create' | 'practice' | 'join' | 'home'; code?: string }
  | { name: 'create'; practice: boolean }
  | { name: 'room'; creds: Creds; initial: RoomView | null }
  | { name: 'practice'; rules: Rules }
  | { name: 'referee' }
  | { name: 'history' };

function setUrlRoom(code: string | null) {
  const url = new URL(location.href);
  if (code) url.searchParams.set('sala', code);
  else url.searchParams.delete('sala');
  history.replaceState(null, '', url);
}

function inviteFromUrl(): string | null {
  const code = new URL(location.href).searchParams.get('sala');
  return code && /^[A-Za-z]{4}$/.test(code) ? code.toUpperCase() : null;
}

function initialRoute(): Route {
  const invite = inviteFromUrl();
  if (invite) {
    const creds = getCreds(invite);
    if (creds) return { name: 'room', creds, initial: null };
    return { name: 'profile', then: 'join', code: invite };
  }
  return { name: 'home' };
}

const SETUP_HELP =
  'Las salas online necesitan la base de datos de Upstash Redis conectada en Vercel (Storage → Upstash). Mientras tanto puedes usar el modo árbitro o practicar solo.';

export function App() {
  const [route, setRoute] = useState<Route>(initialRoute);
  const [profile, setProfile] = useState<Profile | null>(getProfile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const go = useCallback((r: Route) => {
    setError(null);
    setRoute(r);
    if (r.name === 'room') setUrlRoom(r.creds.code);
    else if (r.name !== 'profile') setUrlRoom(null);
  }, []);

  const explain = (e: unknown) => {
    const err = e as ApiError;
    return err.setup ? SETUP_HELP : err.message;
  };

  const join = async (code: string, p: Profile) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.join(code, p, getCreds(code));
      const creds = { code, pid: res.pid, token: res.token };
      saveCreds(creds);
      go({ name: 'room', creds, initial: res.room });
    } catch (e) {
      setError(explain(e));
      if (route.name !== 'profile') setRoute({ name: 'home' });
    } finally {
      setBusy(false);
    }
  };

  const create = async (mode: Mode, rules: Rules, p: Profile) => {
    setBusy(true);
    setError(null);
    setPref('rules', rules);
    try {
      const res = await api.create(p, mode, rules);
      const creds = { code: res.room.code, pid: res.pid, token: res.token };
      saveCreds(creds);
      go({ name: 'room', creds, initial: res.room });
    } catch (e) {
      setError(explain(e));
    } finally {
      setBusy(false);
    }
  };

  const needProfile = (then: 'create' | 'practice' | 'join', code?: string) => {
    if (then === 'join' && code && profile) return void join(code, profile);
    if (!profile) return go({ name: 'profile', then, code });
    go({ name: 'create', practice: then === 'practice' });
  };

  let screen: ReactNode;
  let key: string = route.name;
  switch (route.name) {
    case 'home':
      screen = (
        <Home
          onCreate={() => needProfile('create')}
          onJoin={(code) => needProfile('join', code)}
          onPractice={() => needProfile('practice')}
          onReferee={() => go({ name: 'referee' })}
          onHistory={() => go({ name: 'history' })}
          historyCount={loadHistory().length}
          profile={profile}
          onProfile={() => go({ name: 'profile', then: 'home' })}
          resume={lastRoom()}
          onResume={() => {
            const c = lastRoom();
            if (c) go({ name: 'room', creds: c, initial: null });
          }}
          joinError={error}
          joining={busy}
        />
      );
      break;
    case 'profile':
      screen = (
        <ProfileScreen
          initial={profile}
          invite={route.then === 'join' ? route.code : undefined}
          busy={busy}
          error={error}
          onBack={() => go({ name: 'home' })}
          onDone={(p) => {
            saveProfile(p);
            setProfile(p);
            if (route.then === 'join' && route.code) void join(route.code, p);
            else if (route.then === 'home') go({ name: 'home' });
            else go({ name: 'create', practice: route.then === 'practice' });
          }}
        />
      );
      break;
    case 'create':
      key = `create-${route.practice}`;
      screen = (
        <CreateScreen
          practice={route.practice}
          initialRules={getPref('rules', DEFAULT_RULES)}
          busy={busy}
          error={error}
          onBack={() => go({ name: 'home' })}
          onCreate={(mode, rules) => {
            if (route.practice) {
              setPref('rules', rules);
              go({ name: 'practice', rules });
            } else void create(mode, rules, profile!);
          }}
        />
      );
      break;
    case 'room':
      key = `room-${route.creds.code}`;
      screen = <OnlineRoom creds={route.creds} initial={route.initial} onExit={() => go({ name: 'home' })} />;
      break;
    case 'practice':
      screen = <PracticeRoom profile={profile!} rules={route.rules} onExit={() => go({ name: 'home' })} />;
      break;
    case 'history':
      screen = <HistoryScreen onBack={() => go({ name: 'home' })} />;
      break;
    case 'referee':
      screen = <RefereeScreen onBack={() => go({ name: 'home' })} />;
      break;
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={key}
          className="stage"
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(12px)' }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
        >
          {screen}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

function RoomBody({ c, onLeave }: { c: Controller; onLeave: () => void }) {
  const v = c.view;
  const phase = v?.phase;
  if (!v) {
    return (
      <div className="screen screen--center">
        <div className="loading" aria-label="Cargando la sala">
          <span className="loading-tile" />
          <span className="loading-tile" />
          <span className="loading-tile" />
        </div>
      </div>
    );
  }
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${phase}-${v.game}`}
        className="phase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.22 }}
      >
        {phase === 'lobby' && <Lobby c={c} onLeave={onLeave} />}
        {phase === 'secret' && <SecretScreen c={c} onLeave={onLeave} />}
        {phase === 'play' && <PlayScreen c={c} onLeave={onLeave} />}
        {phase === 'over' && <OverScreen c={c} onLeave={onLeave} />}
      </motion.div>
    </AnimatePresence>
  );
}

function OnlineRoom({ creds, initial, onExit }: { creds: Creds; initial: RoomView | null; onExit: () => void }) {
  const c = useOnlineRoom(creds, initial);
  useEffect(() => {
    if (c.view) setUrlRoom(c.view.code);
  }, [c.view?.code]);
  if (c.fatal) {
    return (
      <div className="screen screen--center">
        <div className="fatal">
          <h2 className="screen-title">{c.fatal}</h2>
          <p className="screen-lead">Puedes crear una sala nueva o unirte con otro código.</p>
          <Button onClick={onExit}>Ir al inicio</Button>
        </div>
      </div>
    );
  }
  return (
    <RoomBody
      c={c}
      onLeave={async () => {
        await c.leave();
        onExit();
      }}
    />
  );
}

function PracticeRoom({ profile, rules, onExit }: { profile: Profile; rules: Rules; onExit: () => void }) {
  const c = useLocalRoom(profile, rules);
  return <RoomBody c={c} onLeave={onExit} />;
}
