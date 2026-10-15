// Motor de Picas y Fijas: reglas puras, sin red ni almacenamiento.
// Lo usan el servidor (api/room.ts) y la práctica sin conexión del cliente.

export type Mode = 'duel' | 'ffa' | 'teams' | 'race';
export type Phase = 'lobby' | 'secret' | 'play' | 'over';

export interface Rules {
  /** Cantidad de dígitos del código (3–6). */
  length: number;
  /** Si se permiten dígitos repetidos. */
  repeats: boolean;
  /** Límite de rondas; 0 = sin límite. */
  maxRounds: number;
  /** Segundos por ronda; 0 = sin reloj. */
  timer: number;
}

export interface Player {
  id: string;
  token: string;
  name: string;
  avatar: string;
  /** Índice de color de silla (0–3). */
  color: number;
  team: 0 | 1;
  wins: number;
  left?: boolean;
}

export interface Side {
  id: string;
  members: string[];
  secret?: string;
  setBy?: string;
  eliminatedRound?: number;
  crackedBy?: string[];
  surrendered?: boolean;
}

export interface GuessResult {
  /** Id del lado atacado, o 'app' en la carrera. */
  target: string;
  fijas: number;
  picas: number;
}

export interface Guess {
  id: string;
  round: number;
  sideId: string;
  by: string;
  value: string;
  results: GuessResult[];
  at: number;
}

export type OutcomeReason = 'cracked' | 'last' | 'draw' | 'limit' | 'surrender';

export interface Outcome {
  winners: string[];
  reason: OutcomeReason;
}

export interface Room {
  code: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  hostId: string;
  mode: Mode;
  rules: Rules;
  phase: Phase;
  players: Player[];
  sides: Side[];
  appSecret?: string;
  round: number;
  roundDeadline?: number;
  guesses: Guess[];
  outcome?: Outcome;
  /** Cuántas partidas se han jugado en esta sala. */
  game: number;
}

export type Action =
  | { type: 'profile'; name: string; avatar: string }
  | { type: 'team'; team: 0 | 1 }
  | { type: 'configure'; mode?: Mode; rules?: Partial<Rules> }
  | { type: 'kick'; target: string }
  | { type: 'start' }
  | { type: 'secret'; value: string }
  | { type: 'guess'; value: string }
  | { type: 'rematch' }
  | { type: 'lobby' }
  | { type: 'leave' };

export class GameError extends Error {}

export const MAX_PLAYERS = 4;

export const MODES: Record<Mode, { min: number; max: number; name: string; blurb: string }> = {
  duel: { min: 2, max: 2, name: 'Duelo', blurb: 'Tú contra otra persona. Cada uno adivina el código del otro.' },
  ffa: {
    min: 3,
    max: 4,
    name: 'Todos contra todos',
    blurb: 'Cada intento se compara con el código de todos. Si te descubren, quedas fuera.',
  },
  teams: {
    min: 4,
    max: 4,
    name: 'Parejas',
    blurb: 'Dos contra dos. Cada pareja tiene un código y se turnan para adivinar.',
  },
  race: {
    min: 1,
    max: 4,
    name: 'Carrera',
    blurb: 'La app inventa un código. Gana quien lo descubra primero.',
  },
};

export const DEFAULT_RULES: Rules = { length: 4, repeats: false, maxRounds: 0, timer: 0 };
export const ROUND_OPTIONS = [0, 8, 10, 15] as const;
export const TIMER_OPTIONS = [0, 30, 60, 90] as const;

export function normalizeRules(input: Partial<Rules> | undefined, base: Rules = DEFAULT_RULES): Rules {
  const r = { ...base, ...(input ?? {}) };
  const length = Math.min(6, Math.max(3, Math.round(Number(r.length) || 4)));
  const maxRounds = (ROUND_OPTIONS as readonly number[]).includes(Number(r.maxRounds)) ? Number(r.maxRounds) : 0;
  const timer = (TIMER_OPTIONS as readonly number[]).includes(Number(r.timer)) ? Number(r.timer) : 0;
  return { length, repeats: Boolean(r.repeats), maxRounds, timer };
}

/** Fijas: dígito correcto en su lugar. Picas: dígito correcto en otro lugar. */
export function score(secret: string, guess: string): { fijas: number; picas: number } {
  let fijas = 0;
  const s: Record<string, number> = {};
  const g: Record<string, number> = {};
  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) fijas++;
    s[secret[i]] = (s[secret[i]] ?? 0) + 1;
    g[guess[i]] = (g[guess[i]] ?? 0) + 1;
  }
  let common = 0;
  for (const d in g) common += Math.min(g[d], s[d] ?? 0);
  return { fijas, picas: common - fijas };
}

export type Mark = 'fija' | 'pica' | 'nada';

/**
 * Qué es cada dígito del intento frente al código (solo lo ve el dueño del código).
 * Con dígitos repetidos, las picas se reparten de izquierda a derecha sin contar de más.
 */
export function marks(secret: string, guess: string): Mark[] {
  const out: Mark[] = guess.split('').map((d, i) => (secret[i] === d ? 'fija' : 'nada'));
  const left: Record<string, number> = {};
  for (let i = 0; i < secret.length; i++) if (out[i] !== 'fija') left[secret[i]] = (left[secret[i]] ?? 0) + 1;
  for (let i = 0; i < guess.length; i++) {
    if (out[i] === 'fija') continue;
    if (left[guess[i]]) {
      out[i] = 'pica';
      left[guess[i]]--;
    }
  }
  return out;
}

/** Devuelve el problema del código en palabras, o null si es válido. */
export function codeProblem(value: string, rules: Rules): string | null {
  if (!/^\d*$/.test(value)) return 'Solo se permiten números.';
  if (value.length !== rules.length) return `El código debe tener ${rules.length} dígitos.`;
  if (!rules.repeats && new Set(value).size !== value.length) return 'No se pueden repetir dígitos.';
  return null;
}

export function randomCode(rules: Rules, rand: () => number = Math.random): string {
  const pool = '0123456789'.split('');
  let out = '';
  while (out.length < rules.length) {
    const d = pool[Math.floor(rand() * pool.length)];
    if (!rules.repeats) pool.splice(pool.indexOf(d), 1);
    out += d;
  }
  return out;
}

export function sideOf(room: Room, pid: string): Side | undefined {
  return room.sides.find((s) => s.members.includes(pid));
}

export function activeSides(room: Room): Side[] {
  return room.sides.filter((s) => s.eliminatedRound === undefined);
}

/** Quién del equipo debería adivinar en la ronda actual (rota cada ronda). */
export function designatedGuesser(room: Room, side: Side): string | undefined {
  const present = side.members.filter((m) => !room.players.find((p) => p.id === m)?.left);
  if (present.length === 0) return undefined;
  return present[(Math.max(1, room.round) - 1) % present.length];
}

function lobbyProblem(room: Room): string | null {
  const players = room.players.filter((p) => !p.left);
  const info = MODES[room.mode];
  if (players.length < info.min) {
    const missing = info.min - players.length;
    return missing === 1 ? 'Falta 1 jugador.' : `Faltan ${missing} jugadores.`;
  }
  if (players.length > info.max) return `${info.name} es para ${info.max} jugadores como máximo.`;
  if (room.mode === 'teams') {
    const a = players.filter((p) => p.team === 0).length;
    if (a !== 2) return 'Cada pareja debe tener 2 jugadores.';
  }
  return null;
}

export function startProblem(room: Room): string | null {
  return lobbyProblem(room);
}

function touch(room: Room, now: number) {
  room.version++;
  room.updatedAt = now;
}

function startRound(room: Room, round: number, now: number) {
  room.round = round;
  room.roundDeadline = room.rules.timer ? now + room.rules.timer * 1000 : undefined;
}

function beginGame(room: Room, now: number, rand: () => number) {
  const players = room.players.filter((p) => !p.left);
  room.players = players;
  room.guesses = [];
  room.outcome = undefined;
  room.round = 0;
  room.roundDeadline = undefined;
  room.appSecret = undefined;
  room.game++;
  if (room.mode === 'teams') {
    room.sides = [0, 1].map((t) => ({
      id: t === 0 ? 'A' : 'B',
      members: players.filter((p) => p.team === t).map((p) => p.id),
    }));
  } else {
    room.sides = players.map((p) => ({ id: p.id, members: [p.id] }));
  }
  if (room.mode === 'race') {
    room.appSecret = randomCode(room.rules, rand);
    room.phase = 'play';
    startRound(room, 1, now);
  } else {
    room.phase = 'secret';
  }
}

function finish(room: Room, winners: string[], reason: OutcomeReason) {
  room.phase = 'over';
  room.roundDeadline = undefined;
  room.outcome = { winners, reason };
  for (const sid of winners) {
    const side = room.sides.find((s) => s.id === sid);
    side?.members.forEach((m) => {
      const p = room.players.find((x) => x.id === m);
      if (p) p.wins++;
    });
  }
}

function resolveRound(room: Room, now: number) {
  const r = room.round;
  const len = room.rules.length;
  const roundGuesses = room.guesses.filter((g) => g.round === r);

  if (room.mode === 'race') {
    const crackers = roundGuesses.filter((g) => g.results[0]?.fijas === len).map((g) => g.sideId);
    if (crackers.length) return finish(room, [...new Set(crackers)], 'cracked');
    if (room.rules.maxRounds && r >= room.rules.maxRounds) return finish(room, [], 'limit');
    return startRound(room, r + 1, now);
  }

  const before = activeSides(room);
  const fallen: Side[] = [];
  for (const side of before) {
    const by = roundGuesses
      .filter((g) => g.results.some((res) => res.target === side.id && res.fijas === len))
      .map((g) => g.sideId);
    if (by.length) {
      side.eliminatedRound = r;
      side.crackedBy = [...new Set(by)];
      fallen.push(side);
    }
  }
  const alive = activeSides(room);
  if (alive.length === 1) return finish(room, [alive[0].id], room.mode === 'ffa' ? 'last' : 'cracked');
  if (alive.length === 0) return finish(room, fallen.map((s) => s.id), 'draw');
  if (room.rules.maxRounds && r >= room.rules.maxRounds) return finish(room, alive.map((s) => s.id), 'limit');
  startRound(room, r + 1, now);
}

function maybeAdvance(room: Room, now: number) {
  if (room.phase === 'secret') {
    const alive = activeSides(room);
    if (alive.every((s) => s.secret)) {
      room.phase = 'play';
      startRound(room, 1, now);
    }
    return;
  }
  if (room.phase === 'play') {
    const submitted = new Set(room.guesses.filter((g) => g.round === room.round).map((g) => g.sideId));
    if (activeSides(room).every((s) => submitted.has(s.id))) resolveRound(room, now);
  }
}

/** Retiradas: un lado sin miembros presentes queda fuera. */
function settleDepartures(room: Room, now: number) {
  if (room.phase !== 'secret' && room.phase !== 'play') return;
  for (const side of activeSides(room)) {
    const present = side.members.some((m) => !room.players.find((p) => p.id === m)?.left);
    if (!present) {
      side.eliminatedRound = room.round;
      side.surrendered = true;
    }
  }
  const alive = activeSides(room);
  if (room.mode === 'race') {
    if (alive.length === 0) return finish(room, [], 'surrender');
  } else if (alive.length <= 1) {
    return finish(room, alive.map((s) => s.id), 'surrender');
  }
  maybeAdvance(room, now);
}

/** Cierra la ronda si se acabó el tiempo. Devuelve true si cambió algo. */
export function tick(room: Room, now: number): boolean {
  if (room.phase === 'play' && room.roundDeadline && now >= room.roundDeadline) {
    resolveRound(room, now);
    touch(room, now);
    return true;
  }
  return false;
}

export function cleanName(name: unknown): string {
  const n = String(name ?? '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 14);
  if (!n) throw new GameError('Escribe tu nombre.');
  return n;
}

function freeColor(room: Room): number {
  const used = new Set(room.players.filter((p) => !p.left).map((p) => p.color));
  for (let c = 0; c < MAX_PLAYERS; c++) if (!used.has(c)) return c;
  return 0;
}

export function createRoom(opts: {
  code: string;
  host: Omit<Player, 'color' | 'team' | 'wins'>;
  mode: Mode;
  rules?: Partial<Rules>;
  now: number;
}): Room {
  const room: Room = {
    code: opts.code,
    version: 1,
    createdAt: opts.now,
    updatedAt: opts.now,
    hostId: opts.host.id,
    mode: opts.mode in MODES ? opts.mode : 'duel',
    rules: normalizeRules(opts.rules),
    phase: 'lobby',
    players: [],
    sides: [],
    round: 0,
    guesses: [],
    game: 0,
  };
  addPlayer(room, opts.host, opts.now);
  room.version = 1;
  return room;
}

export function addPlayer(room: Room, p: Omit<Player, 'color' | 'team' | 'wins'>, now: number): Player {
  if (room.phase !== 'lobby') throw new GameError('La partida ya empezó. Espera la próxima.');
  const present = room.players.filter((x) => !x.left);
  if (present.length >= MAX_PLAYERS) throw new GameError('La sala está llena (máximo 4).');
  const teamA = present.filter((x) => x.team === 0).length;
  const player: Player = {
    ...p,
    name: cleanName(p.name),
    color: freeColor(room),
    team: teamA <= present.length - teamA ? 0 : 1,
    wins: 0,
  };
  room.players = room.players.filter((x) => !x.left);
  room.players.push(player);
  touch(room, now);
  return player;
}

export function applyAction(room: Room, pid: string, action: Action, now: number, rand: () => number = Math.random) {
  const me = room.players.find((p) => p.id === pid && !p.left);
  if (!me) throw new GameError('Ya no estás en esta sala.');
  const isHost = room.hostId === pid;

  switch (action.type) {
    case 'profile': {
      me.name = cleanName(action.name);
      if (typeof action.avatar === 'string') me.avatar = action.avatar.slice(0, 24);
      break;
    }
    case 'team': {
      if (room.phase !== 'lobby') throw new GameError('Solo puedes cambiar de pareja antes de empezar.');
      me.team = action.team === 1 ? 1 : 0;
      break;
    }
    case 'configure': {
      if (!isHost) throw new GameError('Solo quien creó la sala puede cambiar las reglas.');
      if (room.phase !== 'lobby') throw new GameError('Las reglas se cambian antes de empezar.');
      if (action.mode && action.mode in MODES) room.mode = action.mode;
      if (action.rules) room.rules = normalizeRules(action.rules, room.rules);
      break;
    }
    case 'kick': {
      if (!isHost) throw new GameError('Solo quien creó la sala puede sacar jugadores.');
      if (room.phase !== 'lobby') throw new GameError('Solo se puede sacar jugadores antes de empezar.');
      if (action.target === pid) throw new GameError('No te puedes sacar a ti.');
      room.players = room.players.filter((p) => p.id !== action.target);
      break;
    }
    case 'start': {
      if (!isHost) throw new GameError('Solo quien creó la sala puede empezar.');
      if (room.phase !== 'lobby') throw new GameError('La partida ya empezó.');
      const problem = startProblem(room);
      if (problem) throw new GameError(problem);
      beginGame(room, now, rand);
      break;
    }
    case 'secret': {
      if (room.phase !== 'secret') throw new GameError('Ya no es momento de escribir el código.');
      const side = sideOf(room, pid);
      if (!side || side.eliminatedRound !== undefined) throw new GameError('No tienes un código que escribir.');
      const value = String(action.value ?? '');
      const problem = codeProblem(value, room.rules);
      if (problem) throw new GameError(problem);
      side.secret = value;
      side.setBy = pid;
      maybeAdvance(room, now);
      break;
    }
    case 'guess': {
      if (room.phase !== 'play') throw new GameError('Ahora no se puede adivinar.');
      const side = sideOf(room, pid);
      if (!side || side.eliminatedRound !== undefined) throw new GameError('Ya quedaste fuera de esta partida.');
      if (room.guesses.some((g) => g.round === room.round && g.sideId === side.id)) {
        throw new GameError(side.members.length > 1 ? 'Tu pareja ya envió el intento de esta ronda.' : 'Ya enviaste tu intento de esta ronda.');
      }
      const value = String(action.value ?? '');
      const problem = codeProblem(value, room.rules);
      if (problem) throw new GameError(problem);
      const results: GuessResult[] =
        room.mode === 'race'
          ? [{ target: 'app', ...score(room.appSecret!, value) }]
          : activeSides(room)
              .filter((s) => s.id !== side.id)
              .map((s) => ({ target: s.id, ...score(s.secret!, value) }));
      room.guesses.push({
        id: `${room.round}-${side.id}`,
        round: room.round,
        sideId: side.id,
        by: pid,
        value,
        results,
        at: now,
      });
      maybeAdvance(room, now);
      break;
    }
    case 'rematch': {
      if (!isHost) throw new GameError('Solo quien creó la sala puede pedir la revancha.');
      if (room.phase !== 'over') throw new GameError('La partida aún no termina.');
      room.players = room.players.filter((p) => !p.left);
      if (startProblem(room)) {
        room.phase = 'lobby';
        room.sides = [];
        room.guesses = [];
        room.outcome = undefined;
      } else {
        beginGame(room, now, rand);
      }
      break;
    }
    case 'lobby': {
      if (!isHost) throw new GameError('Solo quien creó la sala puede volver a la mesa.');
      if (room.phase !== 'over') throw new GameError('Termina la partida primero.');
      room.players = room.players.filter((p) => !p.left);
      room.phase = 'lobby';
      room.sides = [];
      room.guesses = [];
      room.outcome = undefined;
      room.round = 0;
      break;
    }
    case 'leave': {
      if (room.phase === 'lobby' || room.phase === 'over') {
        room.players = room.players.filter((p) => p.id !== pid);
      } else {
        me.left = true;
        settleDepartures(room, now);
      }
      if (isHost) {
        const next = room.players.find((p) => !p.left);
        if (next) room.hostId = next.id;
      }
      break;
    }
    default:
      throw new GameError('Acción desconocida.');
  }
  touch(room, now);
}

// ——— Vista para cada jugador: nunca incluye secretos ajenos ———

export interface SideView {
  id: string;
  members: string[];
  ready: boolean;
  eliminatedRound?: number;
  crackedBy?: string[];
  surrendered?: boolean;
  secret?: string;
  setBy?: string;
}

export interface GuessView {
  id: string;
  round: number;
  sideId: string;
  by: string;
  value?: string;
  results?: GuessResult[];
  hidden?: boolean;
}

export interface RoomView {
  code: string;
  version: number;
  serverNow: number;
  hostId: string;
  mode: Mode;
  rules: Rules;
  phase: Phase;
  round: number;
  roundDeadline?: number;
  game: number;
  players: Omit<Player, 'token'>[];
  sides: SideView[];
  guesses: GuessView[];
  outcome?: Outcome;
  appSecret?: string;
  me: string;
  mySide?: string;
}

export function viewFor(room: Room, pid: string, now: number): RoomView {
  const mySide = sideOf(room, pid)?.id;
  const over = room.phase === 'over';
  return {
    code: room.code,
    version: room.version,
    serverNow: now,
    hostId: room.hostId,
    mode: room.mode,
    rules: room.rules,
    phase: room.phase,
    round: room.round,
    roundDeadline: room.roundDeadline,
    game: room.game,
    players: room.players.map(({ token: _t, ...p }) => p),
    sides: room.sides.map((s) => {
      const mine = s.id === mySide;
      return {
        id: s.id,
        members: s.members,
        ready: Boolean(s.secret),
        eliminatedRound: s.eliminatedRound,
        crackedBy: s.crackedBy,
        surrendered: s.surrendered,
        secret: over || mine ? s.secret : undefined,
        setBy: mine ? s.setBy : undefined,
      };
    }),
    guesses: room.guesses.map((g) => {
      const mine = g.sideId === mySide;
      // Los intentos ajenos de la ronda en curso se revelan al cerrar la ronda.
      if (!over && !mine && g.round === room.round && room.phase === 'play') {
        return { id: g.id, round: g.round, sideId: g.sideId, by: g.by, hidden: true };
      }
      // En la carrera nadie ve los números de los demás hasta el final.
      const hideValue = room.mode === 'race' && !mine && !over;
      return { id: g.id, round: g.round, sideId: g.sideId, by: g.by, value: hideValue ? undefined : g.value, results: g.results };
    }),
    outcome: room.outcome,
    appSecret: over ? room.appSecret : undefined,
    me: pid,
    mySide,
  };
}
