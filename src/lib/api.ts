import type { Action, Mode, RoomView, Rules } from '../../shared/engine';
import type { Creds, Profile } from './session';

export class ApiError extends Error {
  constructor(message: string, public status: number, public setup = false) {
    super(message);
  }
}

async function call<T>(init: { method: 'GET'; query: Record<string, string | number> } | { method: 'POST'; body: object }): Promise<T> {
  let res: Response;
  try {
    if (init.method === 'GET') {
      const q = new URLSearchParams(Object.entries(init.query).map(([k, v]) => [k, String(v)]));
      res = await fetch(`/api/room?${q}`, { cache: 'no-store' });
    } else {
      res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(init.body),
      });
    }
  } catch {
    throw new ApiError('Sin conexión. Revisa tu internet.', 0);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; setup?: boolean };
  if (!res.ok) throw new ApiError(data.error ?? 'Algo falló. Intenta otra vez.', res.status, Boolean(data.setup));
  return data as T;
}

type Joined = { pid: string; token: string; room: RoomView };

export const api = {
  create: (p: Profile, mode: Mode, rules: Rules) =>
    call<Joined>({ method: 'POST', body: { action: 'create', name: p.name, avatar: p.avatar, mode, rules } }),
  join: (code: string, p: Profile, creds?: Creds | null) =>
    call<Joined>({
      method: 'POST',
      body: { action: 'join', code, name: p.name, avatar: p.avatar, pid: creds?.pid, token: creds?.token },
    }),
  act: (c: Creds, type: Action['type'], payload: object = {}) =>
    call<{ room: RoomView }>({ method: 'POST', body: { action: type, code: c.code, pid: c.pid, token: c.token, payload } }),
  poll: (c: Creds, v: number) =>
    call<{ room?: RoomView; same?: boolean; serverNow: number }>({
      method: 'GET',
      query: { code: c.code, pid: c.pid, token: c.token, v },
    }),
};
