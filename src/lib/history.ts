// Historial de partidas terminadas, guardado en este celular.
import type { GuessResult, Mode, OutcomeReason, RoomView, Rules } from '../../shared/engine';
import { colorOf, playerById, sideMembersNames, sideName } from './view';

export interface RecordSide {
  id: string;
  name: string;
  /** Nombres de los miembros (parejas). */
  sub?: string;
  avatar: string;
  color: number;
  secret?: string;
  mine: boolean;
  won: boolean;
  eliminatedRound?: number;
}

export interface RecordGuess {
  round: number;
  sideId: string;
  by?: string;
  value: string;
  results: GuessResult[];
  /** La cuenta correcta (respuesta a mano), para ver quién se equivocó. */
  truth?: GuessResult[];
}

export interface GameRecord {
  id: string;
  at: number;
  mode: Mode | 'referee';
  rules: Rules;
  title: string;
  reason: OutcomeReason | 'referee';
  rounds: number;
  sides: RecordSide[];
  appSecret?: string;
  guesses: RecordGuess[];
}

const KEY = 'pyf:history';
const MAX = 30;

export function loadHistory(): GameRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as GameRecord[];
  } catch {
    return [];
  }
}

export function saveRecord(r: GameRecord) {
  try {
    const list = loadHistory().filter((x) => x.id !== r.id);
    list.unshift(r);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* sin almacenamiento: la partida solo se ve ahora */
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada que borrar */
  }
}

/** El título del final ("¡Ganaste!", "¡Empate!"…) a partir del resultado. */
export function outcomeTitle(v: RoomView) {
  const o = v.outcome!;
  const winners = v.sides.filter((s) => o.winners.includes(s.id));
  const iWon = Boolean(v.mySide && o.winners.includes(v.mySide));
  if (o.reason === 'draw' || (o.reason === 'limit' && o.winners.length > 1)) return '¡Empate!';
  if (!o.winners.length) return v.mode === 'race' ? 'Nadie lo descubrió' : 'Se acabó';
  if (iWon) return v.mode === 'teams' ? '¡Ganaron!' : '¡Ganaste!';
  return v.mode === 'teams'
    ? `Ganó la ${sideName(v, winners[0], { you: false }).toLowerCase()}`
    : `¡Ganó ${sideName(v, winners[0])}!`;
}

/** Convierte una sala terminada en una partida guardable. */
export function recordFromView(v: RoomView): GameRecord {
  const o = v.outcome!;
  return {
    id: `${v.code}-${v.game}-${v.guesses.length}-${v.appSecret ?? v.sides.map((s) => s.secret).join('')}`,
    at: Date.now(),
    mode: v.mode,
    rules: v.rules,
    title: outcomeTitle(v),
    reason: o.reason,
    rounds: v.round,
    appSecret: v.appSecret,
    sides: v.sides.map((s) => {
      const first = playerById(v, s.members[0]);
      return {
        id: s.id,
        name: sideName(v, s),
        sub: v.mode === 'teams' ? sideMembersNames(v, s) : undefined,
        avatar: first?.avatar ?? 'gorra',
        color: colorOf(v, first),
        secret: s.secret,
        mine: s.id === v.mySide,
        won: o.winners.includes(s.id),
        eliminatedRound: s.eliminatedRound,
      };
    }),
    guesses: v.guesses
      .filter((g) => g.value && g.results)
      .map((g) => ({
        round: g.round,
        sideId: g.sideId,
        by: v.mode === 'teams' ? playerById(v, g.by)?.name : undefined,
        value: g.value!,
        results: g.results!,
        truth: v.rules.manual ? g.truth : undefined,
      })),
  };
}

const MODE_LABEL: Record<GameRecord['mode'], string> = {
  duel: 'Duelo',
  ffa: 'Todos contra todos',
  teams: 'Parejas',
  race: 'Carrera',
  referee: 'Modo árbitro',
};

export const modeLabel = (m: GameRecord['mode']) => MODE_LABEL[m];

export function whenLabel(at: number) {
  const d = new Date(at);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Hoy, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Ayer, ${time}`;
  return `${d.toLocaleDateString('es', { day: 'numeric', month: 'short' })}, ${time}`;
}
