// Controladores de sala: online (sondeo a /api/room) y local (práctica sin conexión).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyAction,
  createRoom,
  GameError,
  tick,
  viewFor,
  type Action,
  type Room,
  type RoomView,
  type Rules,
} from '../../shared/engine';
import { api, ApiError } from './api';
import { clearCreds, type Creds, type Profile } from './session';

export interface Controller {
  view: RoomView | null;
  /** Error que impide seguir en la sala (expiró, te sacaron). */
  fatal: string | null;
  /** Error pasajero de la última acción. */
  flash: string | null;
  clearFlash: () => void;
  busy: boolean;
  /** Diferencia entre el reloj del servidor y el del celular. */
  offset: number;
  local: boolean;
  send: (type: Action['type'], payload?: object) => Promise<boolean>;
  leave: () => Promise<void>;
}

export function useOnlineRoom(creds: Creds, initial: RoomView | null): Controller {
  const [view, setView] = useState<RoomView | null>(initial);
  const [fatal, setFatal] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0);
  const versionRef = useRef(initial?.version ?? -1);
  const phaseRef = useRef(initial?.phase);

  const accept = useCallback((room: RoomView) => {
    if (room.version < versionRef.current) return;
    versionRef.current = room.version;
    phaseRef.current = room.phase;
    setOffset(room.serverNow - Date.now());
    setView(room);
  }, []);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    let failures = 0;

    const loop = async () => {
      if (!alive) return;
      if (document.visibilityState === 'visible') {
        try {
          const res = await api.poll(creds, versionRef.current);
          failures = 0;
          if (res.room) accept(res.room);
          setFlash((f) => (f === 'Sin conexión. Revisa tu internet.' ? null : f));
        } catch (e) {
          const err = e as ApiError;
          if (err.status === 403 || err.status === 404) {
            clearCreds(creds.code);
            setFatal(err.message);
            return;
          }
          failures++;
          if (failures > 2) setFlash(err.message);
        }
      }
      const fast = phaseRef.current === 'play' || phaseRef.current === 'secret';
      timer = setTimeout(loop, fast ? 1100 : 1800);
    };
    void loop();
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        void loop();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [creds, accept]);

  const send = useCallback(
    async (type: Action['type'], payload: object = {}) => {
      setBusy(true);
      try {
        const res = await api.act(creds, type, payload);
        accept(res.room);
        setFlash(null);
        return true;
      } catch (e) {
        const err = e as ApiError;
        if (err.status === 403 || err.status === 404) {
          clearCreds(creds.code);
          setFatal(err.message);
        } else setFlash(err.message);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [creds, accept],
  );

  const leave = useCallback(async () => {
    try {
      await api.act(creds, 'leave');
    } catch {
      /* si falla, igual salimos */
    }
    clearCreds(creds.code);
  }, [creds]);

  return { view, fatal, flash, clearFlash: () => setFlash(null), busy, offset, local: false, send, leave };
}

/** Práctica sin conexión: el mismo motor corriendo en el celular, contra la app. */
export function useLocalRoom(profile: Profile, rules: Rules): Controller {
  const [room, setRoom] = useState<Room>(() => {
    const r = createRoom({
      code: 'SOLO',
      host: { id: 'me', token: 'local', name: profile.name, avatar: profile.avatar },
      mode: 'race',
      rules,
      now: Date.now(),
    });
    applyAction(r, 'me', { type: 'start' }, Date.now());
    return r;
  });
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!room.rules.timer || room.phase !== 'play') return;
    const id = setInterval(() => {
      setRoom((r) => {
        const copy = structuredClone(r);
        return tick(copy, Date.now()) ? copy : r;
      });
    }, 500);
    return () => clearInterval(id);
  }, [room.rules.timer, room.phase]);

  const send = useCallback(
    async (type: Action['type'], payload: object = {}) => {
      try {
        const copy = structuredClone(room);
        applyAction(copy, 'me', { ...payload, type } as Action, Date.now());
        setRoom(copy);
        setFlash(null);
        return true;
      } catch (e) {
        setFlash(e instanceof GameError ? e.message : 'Algo falló.');
        return false;
      }
    },
    [room],
  );

  const view = useMemo(() => viewFor(room, 'me', Date.now()), [room]);

  return {
    view,
    fatal: null,
    flash,
    clearFlash: () => setFlash(null),
    busy: false,
    offset: 0,
    local: true,
    send,
    leave: async () => {},
  };
}
