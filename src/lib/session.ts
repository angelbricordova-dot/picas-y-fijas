// Datos que se guardan en este celular: perfil, credenciales de sala y preferencias.
import type { AvatarId } from '../components/Avatar';

export interface Profile {
  name: string;
  avatar: AvatarId;
}

export interface Creds {
  code: string;
  pid: string;
  token: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento bloqueado: seguimos sin recordar */
  }
}

export const getProfile = () => read<Profile | null>('pyf:profile', null);
export const saveProfile = (p: Profile) => write('pyf:profile', p);

export const getCreds = (code: string) => read<Creds | null>(`pyf:room:${code}`, null);
export const lastRoom = () => read<Creds | null>('pyf:last', null);

export function saveCreds(c: Creds) {
  write(`pyf:room:${c.code}`, c);
  write('pyf:last', c);
}

export function clearCreds(code: string) {
  write(`pyf:room:${code}`, null);
  if (lastRoom()?.code === code) write('pyf:last', null);
}

export const getPref = <T,>(key: string, fallback: T) => read<T>(`pyf:pref:${key}`, fallback);
export const setPref = (key: string, value: unknown) => write(`pyf:pref:${key}`, value);

/** Apuntes de la libreta (dígitos descartados o seguros), por sala y partida. */
export type NoteMark = 'x' | 'o';
export const getNotes = (scope: string) => read<Record<string, NoteMark>>(`pyf:notes:${scope}`, {});
export const saveNotes = (scope: string, notes: Record<string, NoteMark>) => write(`pyf:notes:${scope}`, notes);
