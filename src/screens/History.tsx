import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Replay } from '../components/Replay';
import { DigitRow } from '../components/Tiles';
import { Button, IconButton, Sheet, TopBar } from '../components/ui';
import { clearHistory, loadHistory, modeLabel, whenLabel, type GameRecord } from '../lib/history';

export function HistoryScreen({ onBack }: { onBack: () => void }) {
  const [list, setList] = useState<GameRecord[]>(loadHistory);
  const [open, setOpen] = useState<GameRecord | null>(null);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="screen">
      <TopBar
        left={
          <IconButton label="Volver" onClick={onBack}>
            <ArrowLeft size={24} strokeWidth={2.4} />
          </IconButton>
        }
        center={<span className="topbar-title">Partidas jugadas</span>}
        right={
          list.length > 0 ? (
            <IconButton label="Borrar historial" onClick={() => setConfirm(true)}>
              <Trash2 size={21} strokeWidth={2.2} />
            </IconButton>
          ) : undefined
        }
      />
      <div className="scroll">
        {list.length ? (
          <ul className="history">
            {list.map((r) => {
              const mine = r.sides.find((s) => s.mine);
              const winner = r.sides.find((s) => s.won);
              return (
                <li key={r.id}>
                  <button type="button" className="history-row" onClick={() => setOpen(r)}>
                    <span className="history-cast" aria-hidden>
                      {r.sides.slice(0, 4).map((s) => (
                        <Avatar key={s.id} id={s.avatar} color={s.color} size={28} mood={s.won ? 'happy' : 'idle'} />
                      ))}
                    </span>
                    <span className="history-text">
                      <span className="history-title">{r.title}</span>
                      <span className="history-sub">
                        {modeLabel(r.mode)} · {whenLabel(r.at)}
                        {winner && !winner.mine && r.mode !== 'referee' ? ` · ganó ${winner.name}` : ''}
                      </span>
                    </span>
                    {mine?.secret ? (
                      <span className="history-code">
                        <DigitRow value={mine.secret} size="xs" />
                      </span>
                    ) : r.appSecret ? (
                      <span className="history-code">
                        <DigitRow value={r.appSecret} size="xs" />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty">
            <p>Cuando terminen una partida, aquí queda guardada para verla otra vez.</p>
          </div>
        )}
        <p className="board-note">Se guardan las últimas 30 partidas, solo en este celular.</p>
      </div>
      <Sheet open={open !== null} onClose={() => setOpen(null)} title={open ? `${open.title}` : ''}>
        {open && <Replay key={open.id} record={open} />}
      </Sheet>
      <Sheet open={confirm} onClose={() => setConfirm(false)} title="¿Borrar el historial?">
        <p className="sheet-text">Se borran todas las partidas guardadas en este celular.</p>
        <div className="sheet-actions">
          <Button
            variant="danger"
            onClick={() => {
              clearHistory();
              setList([]);
              setConfirm(false);
            }}
          >
            Borrar todo
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Cancelar
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
