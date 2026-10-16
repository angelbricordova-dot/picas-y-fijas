import { ArrowLeftRight, Check, Copy, Crown, LogOut, Pencil, Settings2, Share2, X } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { MODES, startProblem, type Room, type RoomView } from '../../shared/engine';
import { Avatar, type AvatarId } from '../components/Avatar';
import { Button, IconButton, Sheet, TopBar } from '../components/ui';
import type { Controller } from '../lib/room';
import { saveProfile } from '../lib/session';
import { colorOf, playerById, TEAM_NAMES, type PlayerV } from '../lib/view';
import { ModeList, ProfileFields, rulesSummary, RulesForm } from './Setup';

type SeatPos = 'b' | 'r' | 't' | 'l';

/** Quién se sienta dónde. Tú siempre abajo; en parejas, tu compañero al frente. */
function seating(v: RoomView): { pos: SeatPos; player?: PlayerV; team?: number }[] {
  const me = playerById(v, v.me)!;
  const others = v.players.filter((p) => p.id !== v.me);
  if (v.mode === 'teams') {
    const mine = others.filter((p) => p.team === me.team);
    const rivals = others.filter((p) => p.team !== me.team);
    const rivalTeam = me.team === 0 ? 1 : 0;
    return [
      { pos: 'b', player: me, team: me.team },
      { pos: 't', player: mine[0], team: me.team },
      { pos: 'r', player: rivals[0], team: rivalTeam },
      { pos: 'l', player: rivals[1], team: rivalTeam },
    ];
  }
  const max = MODES[v.mode].max;
  const order: SeatPos[] = max === 2 ? ['b', 't'] : ['b', 'r', 't', 'l'];
  const people = [me, ...others];
  return order.map((pos, i) => ({ pos, player: people[i] }));
}

export function Lobby({ c, onLeave }: { c: Controller; onLeave: () => void }) {
  const v = c.view!;
  const isHost = v.hostId === v.me;
  const me = playerById(v, v.me)!;
  const [settings, setSettings] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(me.name);
  const [avatar, setAvatar] = useState<AvatarId>(me.avatar as AvatarId);
  const openEditor = () => {
    setName(me.name);
    setAvatar(me.avatar as AvatarId);
    setEditing(true);
  };
  const saveMe = async () => {
    const ok = await c.send('profile', { name: name.trim(), avatar });
    if (ok) {
      saveProfile({ name: name.trim(), avatar });
      setEditing(false);
    }
  };
  const [copied, setCopied] = useState(false);
  const problem = startProblem({ ...v, players: v.players.map((p) => ({ ...p, token: '' })) } as unknown as Room);
  const link = `${location.origin}/?sala=${v.code}`;
  const canShare = typeof navigator.share === 'function';

  const share = async () => {
    const text = `¡Juguemos Picas y Fijas! Entra a la sala ${v.code}`;
    if (canShare) {
      try {
        await navigator.share({ title: 'Picas y Fijas', text, url: link });
        return;
      } catch {
        /* cancelado: probamos copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}: ${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sin portapapeles */
    }
  };

  return (
    <div className="screen screen--lobby">
      <TopBar
        left={
          <IconButton label="Salir de la sala" onClick={onLeave}>
            <LogOut size={22} strokeWidth={2.3} />
          </IconButton>
        }
        center={<span className="topbar-title">La mesa</span>}
        right={
          isHost ? (
            <IconButton label="Modalidad y reglas" onClick={() => setSettings(true)}>
              <Settings2 size={23} strokeWidth={2.2} />
            </IconButton>
          ) : undefined
        }
      />
      <div className="scroll scroll--center">
        <section className="room-code" aria-label={`Código de la sala: ${v.code.split('').join(' ')}`}>
          <span className="room-code-label">Código de la sala</span>
          <div className="room-code-tiles" aria-hidden>
            {v.code.split('').map((ch, i) => (
              <span key={i} className="letter-tile" style={{ '--i': i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={share}>
            {copied ? <Check size={18} strokeWidth={2.6} /> : canShare ? <Share2 size={18} strokeWidth={2.4} /> : <Copy size={18} strokeWidth={2.4} />}
            {copied ? 'Enlace copiado' : 'Invitar por WhatsApp o enlace'}
          </Button>
        </section>

        <section className={`table table--${v.mode}`} aria-label="Jugadores en la mesa">
          <div className="table-felt">
            <svg className="boneyard" viewBox="0 0 120 70" aria-hidden>
              <g transform="rotate(-14 38 36)">
                <rect x="20" y="22" width="36" height="22" rx="5" fill="var(--bone-shade)" />
                <rect x="20" y="19" width="36" height="22" rx="5" fill="var(--bone)" />
              </g>
              <g transform="rotate(9 74 30)">
                <rect x="56" y="16" width="36" height="22" rx="5" fill="var(--bone-shade)" />
                <rect x="56" y="13" width="36" height="22" rx="5" fill="var(--bone)" />
              </g>
              <g transform="rotate(-4 66 50)">
                <rect x="44" y="41" width="40" height="22" rx="5" fill="var(--bone-shade)" />
                <rect x="44" y="38" width="40" height="22" rx="5" fill="var(--bone)" />
                <path d="M64 41 V57" stroke="var(--bone-edge)" strokeWidth="2" />
                <circle cx="54" cy="49" r="3" fill="var(--fija)" />
                <circle cx="74" cy="49" r="2.6" fill="none" stroke="var(--ink)" strokeWidth="2" />
              </g>
            </svg>
            <span className="table-mode">{MODES[v.mode].name}</span>
          </div>
          {seating(v).map(({ pos, player, team }) => (
            <div key={pos} className={`seat seat--${pos} ${player ? '' : 'is-empty'}`}>
              {player ? (
                <>
                  <span className="seat-avatar">
                    {player.id === v.me ? (
                      <button type="button" className="seat-me" onClick={openEditor} aria-label="Cambiar tu nombre o personaje">
                        <Avatar id={player.avatar} color={colorOf(v, player)} size={58} mood="happy" />
                        <span className="seat-edit" aria-hidden>
                          <Pencil size={12} strokeWidth={2.8} />
                        </span>
                      </button>
                    ) : (
                      <Avatar id={player.avatar} color={colorOf(v, player)} size={58} mood="idle" />
                    )}
                    {player.id === v.hostId && (
                      <span className="seat-crown" title="Creó la sala">
                        <Crown size={14} strokeWidth={2.6} />
                      </span>
                    )}
                    {isHost && player.id !== v.me && (
                      <button
                        type="button"
                        className="seat-kick"
                        aria-label={`Sacar a ${player.name}`}
                        onClick={() => c.send('kick', { target: player.id })}
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}
                  </span>
                  <span className="seat-name">
                    {player.id === v.me ? 'Tú' : player.name}
                    {player.wins > 0 && <span className="seat-wins">{player.wins}</span>}
                  </span>
                </>
              ) : (
                <>
                  <span className={`seat-empty ${team !== undefined ? `seat-empty--t${team}` : ''}`} />
                  <span className="seat-name seat-name--empty">
                    {team !== undefined ? `Pareja ${TEAM_NAMES[team]}` : 'Libre'}
                  </span>
                </>
              )}
            </div>
          ))}
        </section>

        <p className="lobby-rules">{rulesSummary(v.rules)}</p>

        <Button variant="quiet" size="sm" onClick={openEditor}>
          <Pencil size={16} strokeWidth={2.4} />
          Cambiar mi nombre o personaje
        </Button>

        {v.mode === 'teams' && (
          <Button variant="ghost" size="sm" onClick={() => c.send('team', { team: me.team === 0 ? 1 : 0 })} disabled={c.busy}>
            <ArrowLeftRight size={18} strokeWidth={2.4} />
            Pasarme a la pareja {TEAM_NAMES[me.team === 0 ? 1 : 0]}
          </Button>
        )}
      </div>

      <div className="dock">
        {isHost ? (
          <>
            <Button onClick={() => c.send('start')} disabled={Boolean(problem) || c.busy}>
              {problem ?? 'Empezar partida'}
            </Button>
          </>
        ) : (
          <p className="dock-note">
            Esperando a que <strong>{playerById(v, v.hostId)?.name}</strong> empiece la partida
            <span className="dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Tu ficha">
        <form
          className="profile profile--sheet"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) void saveMe();
          }}
        >
          <div className="profile-preview" aria-hidden>
            <Avatar id={avatar} color={colorOf(v, me)} size={92} mood="happy" />
          </div>
          <ProfileFields name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} color={colorOf(v, me)} />
          <Button type="submit" disabled={!name.trim() || c.busy}>
            Guardar
          </Button>
        </form>
      </Sheet>

      <Sheet open={settings} onClose={() => setSettings(false)} title="Modalidad y reglas">
        <ModeList
          value={v.mode}
          onChange={(mode) => c.send('configure', { mode })}
          counts={v.players.length}
        />
        <h3 className="block-title block-title--sheet">Reglas</h3>
        <RulesForm rules={v.rules} onChange={(rules) => c.send('configure', { rules })} mode={v.mode} />
      </Sheet>
    </div>
  );
}
