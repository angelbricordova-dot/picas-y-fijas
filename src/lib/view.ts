import { useEffect, useRef, useState } from 'react';
import type { RoomView, SideView } from '../../shared/engine';

export const TEAM_NAMES = ['azul', 'rosada'];

export type PlayerV = RoomView['players'][number];

export const playerById = (v: RoomView, id: string) => v.players.find((p) => p.id === id);

/** En parejas, el color es el del equipo; en los demás modos, el de la silla. */
export const colorOf = (v: RoomView, p: PlayerV | undefined) => (p ? (v.mode === 'teams' ? p.team : p.color) : 0);

export function sideColor(v: RoomView, s: SideView | undefined) {
  return s ? colorOf(v, playerById(v, s.members[0])) : 0;
}

export function sideName(v: RoomView, s: SideView | undefined, opts: { you?: boolean } = {}) {
  if (!s) return '';
  if (v.mode === 'teams') {
    const team = playerById(v, s.members[0])?.team ?? 0;
    return s.id === v.mySide && opts.you !== false ? 'Tu pareja' : `Pareja ${TEAM_NAMES[team]}`;
  }
  if (s.id === v.mySide && opts.you !== false) return 'Tú';
  return playerById(v, s.members[0])?.name ?? '';
}

export function sideMembersNames(v: RoomView, s: SideView) {
  return s.members.map((m) => playerById(v, m)?.name ?? '').join(' y ');
}

export const activeSidesV = (v: RoomView) => v.sides.filter((s) => s.eliminatedRound === undefined);

export function submittedThisRound(v: RoomView) {
  return new Set(v.guesses.filter((g) => g.round === v.round).map((g) => g.sideId));
}

export function designated(v: RoomView, s: SideView) {
  const present = s.members.filter((m) => !playerById(v, m)?.left);
  return present.length ? present[(Math.max(1, v.round) - 1) % present.length] : undefined;
}

/** Reloj del servidor en vivo, para el tiempo de la ronda. */
export function useNow(active: boolean, offset: number) {
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now() + offset), 250);
    return () => clearInterval(id);
  }, [active, offset]);
  return active ? now : Date.now() + offset;
}

/**
 * Marca qué elementos son nuevos desde que la pantalla se montó, para animar
 * solo esos. Un elemento sigue "nuevo" un rato para que su animación termine
 * aunque la pantalla se vuelva a pintar (por ejemplo, con el reloj).
 */
export function useFresh(keys: string[], windowMs = 1800) {
  const seen = useRef<Map<string, number> | null>(null);
  if (seen.current === null) seen.current = new Map(keys.map((k) => [k, 0]));
  const now = Date.now();
  for (const k of keys) if (!seen.current.has(k)) seen.current.set(k, now);
  return new Set(keys.filter((k) => now - seen.current!.get(k)! < windowMs));
}
