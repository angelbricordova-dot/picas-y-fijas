// API de salas: GET para leer el estado (sondeo), POST para cada jugada.
import {
  addPlayer,
  applyAction,
  createRoom,
  GameError,
  tick,
  viewFor,
  type Action,
  type Mode,
  type Room,
  type Rules,
} from '../shared/engine.js';
import { getStore, StoreMissing, type Store } from './_lib/store.js';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomString(chars: string, n: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

const newId = () => randomString('abcdefghijkmnopqrstuvwxyz23456789', 10);
const newToken = () => randomString('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', 24);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const cleanCode = (code: unknown) =>
  String(code ?? '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4);

function authed(room: Room, pid: unknown, token: unknown) {
  const p = room.players.find((x) => x.id === pid && x.token === token && !x.left);
  if (!p) throw new HttpError(403, 'Ya no estás en esta sala.');
  return p;
}

/** Lee, modifica y guarda con reintentos si otro jugador escribió al mismo tiempo. */
async function mutate(store: Store, code: string, fn: (room: Room, now: number) => void): Promise<Room> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const raw = await store.get(code);
    if (!raw) throw new HttpError(404, 'Esa sala no existe o ya expiró.');
    const room = JSON.parse(raw) as Room;
    const now = Date.now();
    tick(room, now);
    fn(room, now);
    if (await store.swap(code, raw, JSON.stringify(room))) return room;
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 40 * (attempt + 1)));
  }
  throw new HttpError(409, 'La mesa está ocupada, intenta otra vez.');
}

async function handle(request: Request): Promise<Response> {
  const store = getStore();

  if (request.method === 'GET') {
    const url = new URL(request.url);
    const code = cleanCode(url.searchParams.get('code'));
    const pid = url.searchParams.get('pid');
    const token = url.searchParams.get('token');
    const since = Number(url.searchParams.get('v') ?? -1);
    const raw = await store.get(code);
    if (!raw) throw new HttpError(404, 'Esa sala no existe o ya expiró.');
    let room = JSON.parse(raw) as Room;
    authed(room, pid, token);
    const now = Date.now();
    if (room.phase === 'play' && room.roundDeadline && now >= room.roundDeadline) {
      room = await mutate(store, code, () => {});
    }
    if (room.version === since) return json({ same: true, serverNow: now });
    return json({ room: viewFor(room, pid!, now) });
  }

  if (request.method !== 'POST') throw new HttpError(405, 'Método no permitido.');
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? '');

  if (action === 'create') {
    const host = { id: newId(), token: newToken(), name: String(body.name ?? ''), avatar: String(body.avatar ?? 'gorra') };
    for (let i = 0; i < 6; i++) {
      const code = randomString(LETTERS, 4);
      const now = Date.now();
      const room = createRoom({ code, host, mode: body.mode as Mode, rules: body.rules as Partial<Rules>, now });
      if (await store.create(code, JSON.stringify(room))) {
        return json({ pid: host.id, token: host.token, room: viewFor(room, host.id, now) });
      }
    }
    throw new HttpError(503, 'No se pudo crear la sala, intenta de nuevo.');
  }

  const code = cleanCode(body.code);
  if (code.length !== 4) throw new HttpError(400, 'El código de sala tiene 4 letras.');

  if (action === 'join') {
    let pid = '';
    let token = '';
    const room = await mutate(store, code, (r, now) => {
      const existing = r.players.find((x) => x.id === body.pid && x.token === body.token && !x.left);
      if (existing) {
        pid = existing.id;
        token = existing.token;
        return;
      }
      pid = newId();
      token = newToken();
      addPlayer(r, { id: pid, token, name: String(body.name ?? ''), avatar: String(body.avatar ?? 'gorra') }, now);
    });
    return json({ pid, token, room: viewFor(room, pid, Date.now()) });
  }

  const room = await mutate(store, code, (r, now) => {
    authed(r, body.pid, body.token);
    applyAction(r, String(body.pid), { ...(body.payload as object), type: action } as Action, now);
  });
  return json({ room: viewFor(room, String(body.pid), Date.now()) });
}

async function safe(request: Request): Promise<Response> {
  try {
    return await handle(request);
  } catch (err) {
    if (err instanceof GameError) return json({ error: err.message }, 400);
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    if (err instanceof StoreMissing) return json({ error: err.message, setup: true }, 503);
    console.error(err);
    return json({ error: 'Algo falló en el servidor. Intenta otra vez.' }, 500);
  }
}

export const GET = safe;
export const POST = safe;
