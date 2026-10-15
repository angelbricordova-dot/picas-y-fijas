// Almacén de salas. En Vercel usa Upstash Redis (REST); en local, memoria.

const TTL_SECONDS = 60 * 60 * 12;

export interface Store {
  get(code: string): Promise<string | null>;
  /** Crea solo si no existe. */
  create(code: string, value: string): Promise<boolean>;
  /** Escribe solo si el valor actual sigue siendo `expected` (evita pisar jugadas simultáneas). */
  swap(code: string, expected: string, next: string): Promise<boolean>;
}

const key = (code: string) => `pyf:room:${code}`;

const SWAP_SCRIPT = `local c = redis.call('GET', KEYS[1])
if c == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
  return 1
end
return 0`;

function upstash(url: string, token: string): Store {
  async function cmd(args: (string | number)[]): Promise<unknown> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args.map(String)),
    });
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
    return data.result;
  }
  return {
    async get(code) {
      return ((await cmd(['GET', key(code)])) as string | null) ?? null;
    },
    async create(code, value) {
      return (await cmd(['SET', key(code), value, 'NX', 'EX', TTL_SECONDS])) === 'OK';
    },
    async swap(code, expected, next) {
      return Number(await cmd(['EVAL', SWAP_SCRIPT, 1, key(code), expected, next, TTL_SECONDS])) === 1;
    },
  };
}

function memory(): Store {
  const g = globalThis as unknown as { __pyfRooms?: Map<string, string> };
  const rooms = (g.__pyfRooms ??= new Map());
  return {
    async get(code) {
      return rooms.get(code) ?? null;
    },
    async create(code, value) {
      if (rooms.has(code)) return false;
      rooms.set(code, value);
      return true;
    },
    async swap(code, expected, next) {
      if (rooms.get(code) !== expected) return false;
      rooms.set(code, next);
      return true;
    },
  };
}

export class StoreMissing extends Error {}

export function getStore(): Store {
  const env = process.env;
  // Vercel puede agregar un prefijo a las variables al conectar la base (p. ej. STORAGE_KV_REST_API_URL).
  const find = (...suffixes: string[]) => {
    for (const s of suffixes) if (env[s]) return env[s];
    const key = Object.keys(env).find((k) => suffixes.some((s) => k.endsWith(`_${s}`)) && env[k]);
    return key ? env[key] : undefined;
  };
  const url = find('UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL');
  const token = find('UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN');
  if (url && token) return upstash(url, token);
  // En Vercel la memoria no se comparte entre funciones: sin Redis no hay salas online.
  if (env.VERCEL) throw new StoreMissing('Falta conectar la base de datos de salas (Upstash Redis) en Vercel.');
  return memory();
}
