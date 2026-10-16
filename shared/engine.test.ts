import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAction,
  addPlayer,
  codeProblem,
  createRoom,
  marks,
  randomCode,
  score,
  tick,
  viewFor,
  type Room,
} from './engine.ts';

const T = 1_000_000;

function room(mode: Room['mode'], n: number, rules = {}): Room {
  const r = createRoom({ code: 'ABCD', host: { id: 'p0', token: 't0', name: 'Ana', avatar: 'gorra' }, mode, rules, now: T });
  for (let i = 1; i < n; i++) addPlayer(r, { id: `p${i}`, token: `t${i}`, name: `J${i}`, avatar: 'gafas' }, T);
  return r;
}

test('score: ejemplos del usuario', () => {
  assert.deepEqual(score('4872', '4879'), { fijas: 3, picas: 0 });
  assert.deepEqual(score('4892', '4893'), { fijas: 3, picas: 0 });
  assert.deepEqual(score('1234', '4321'), { fijas: 0, picas: 4 });
  assert.deepEqual(score('1234', '1243'), { fijas: 2, picas: 2 });
  assert.deepEqual(score('1123', '3111'), { fijas: 1, picas: 2 });
  assert.deepEqual(score('5678', '1234'), { fijas: 0, picas: 0 });
});

test('marks coincide con score y no cuenta de más', () => {
  assert.deepEqual(marks('4892', '4893'), ['fija', 'fija', 'fija', 'nada']);
  assert.deepEqual(marks('1234', '1243'), ['fija', 'fija', 'pica', 'pica']);
  assert.deepEqual(marks('1123', '3111'), ['pica', 'fija', 'pica', 'nada']);
  for (let i = 0; i < 500; i++) {
    const rules = { length: 3 + (i % 4), repeats: i % 2 === 0, maxRounds: 0, timer: 0, manual: false, check: true };
    const s = randomCode(rules);
    const g = randomCode(rules);
    const m = marks(s, g);
    const sc = score(s, g);
    assert.equal(m.filter((x) => x === 'fija').length, sc.fijas);
    assert.equal(m.filter((x) => x === 'pica').length, sc.picas);
  }
});

test('codeProblem valida largo y repetidos', () => {
  const rules = { length: 4, repeats: false, maxRounds: 0, timer: 0, manual: false, check: true };
  assert.equal(codeProblem('1234', rules), null);
  assert.match(codeProblem('1123', rules)!, /repetir/);
  assert.match(codeProblem('123', rules)!, /4 dígitos/);
  assert.equal(codeProblem('1123', { ...rules, repeats: true }), null);
  for (let i = 0; i < 200; i++) assert.equal(codeProblem(randomCode(rules), rules), null);
});

test('duelo completo: gana quien descubre y la ronda es justa', () => {
  const r = room('duel', 2);
  applyAction(r, 'p0', { type: 'start' }, T);
  assert.equal(r.phase, 'secret');
  applyAction(r, 'p0', { type: 'secret', value: '4872' }, T);
  applyAction(r, 'p1', { type: 'secret', value: '1234' }, T);
  assert.equal(r.phase, 'play');
  applyAction(r, 'p0', { type: 'guess', value: '1234' }, T);
  // p0 ya descubrió, pero la ronda sigue hasta que p1 juegue.
  assert.equal(r.phase, 'play');
  const v = viewFor(r, 'p1', T);
  assert.equal(v.guesses[0].hidden, true, 'el intento ajeno de la ronda en curso está oculto');
  assert.equal(v.sides.find((s) => s.id === 'p0')!.secret, undefined, 'nunca ve el código ajeno');
  applyAction(r, 'p1', { type: 'guess', value: '4879' }, T);
  assert.equal(r.phase, 'over');
  assert.deepEqual(r.outcome, { winners: ['p0'], reason: 'cracked' });
  assert.equal(r.players[0].wins, 1);
});

test('duelo: si ambos descubren en la misma ronda, empate', () => {
  const r = room('duel', 2);
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'secret', value: '4872' }, T);
  applyAction(r, 'p1', { type: 'secret', value: '1234' }, T);
  applyAction(r, 'p0', { type: 'guess', value: '1234' }, T);
  applyAction(r, 'p1', { type: 'guess', value: '4872' }, T);
  assert.equal(r.outcome?.reason, 'draw');
  assert.equal(r.outcome?.winners.length, 2);
});

test('todos contra todos: eliminación y último en pie', () => {
  const r = room('ffa', 3);
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'secret', value: '1234' }, T);
  applyAction(r, 'p1', { type: 'secret', value: '5678' }, T);
  applyAction(r, 'p2', { type: 'secret', value: '9012' }, T);
  applyAction(r, 'p0', { type: 'guess', value: '5678' }, T);
  assert.equal(r.guesses[0].results.length, 2, 'se compara con cada rival');
  applyAction(r, 'p1', { type: 'guess', value: '3456' }, T);
  applyAction(r, 'p2', { type: 'guess', value: '7890' }, T);
  assert.equal(r.sides.find((s) => s.id === 'p1')!.eliminatedRound, 1);
  assert.equal(r.phase, 'play');
  assert.equal(r.round, 2);
  applyAction(r, 'p0', { type: 'guess', value: '9012' }, T);
  assert.throws(() => applyAction(r, 'p1', { type: 'guess', value: '1234' }, T), /fuera/);
  applyAction(r, 'p2', { type: 'guess', value: '4567' }, T);
  assert.deepEqual(r.outcome, { winners: ['p0'], reason: 'last' });
});

test('parejas: código de equipo y el compañero lo ve', () => {
  const r = room('teams', 4);
  assert.deepEqual(r.players.map((p) => p.team), [0, 1, 0, 1]);
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'secret', value: '1234' }, T);
  assert.equal(viewFor(r, 'p2', T).sides.find((s) => s.id === 'A')!.secret, '1234');
  assert.equal(viewFor(r, 'p1', T).sides.find((s) => s.id === 'A')!.secret, undefined);
  applyAction(r, 'p3', { type: 'secret', value: '5678' }, T);
  applyAction(r, 'p2', { type: 'guess', value: '5670' }, T);
  assert.throws(() => applyAction(r, 'p0', { type: 'guess', value: '5671' }, T), /pareja ya envió/);
  applyAction(r, 'p1', { type: 'guess', value: '1230' }, T);
  assert.equal(r.round, 2);
});

test('carrera: la app inventa el código y no se ven los números ajenos', () => {
  const r = room('race', 2, { maxRounds: 8 });
  applyAction(r, 'p0', { type: 'start' }, T);
  assert.equal(r.phase, 'play');
  assert.equal(codeProblem(r.appSecret!, r.rules), null);
  applyAction(r, 'p0', { type: 'guess', value: '0123' }, T);
  applyAction(r, 'p1', { type: 'guess', value: '4567' }, T);
  const v = viewFor(r, 'p1', T);
  const other = v.guesses.find((g) => g.sideId === 'p0')!;
  assert.equal(other.value, undefined);
  assert.ok(other.results);
  assert.equal(v.appSecret, undefined);
  applyAction(r, 'p0', { type: 'guess', value: r.appSecret! }, T);
  applyAction(r, 'p1', { type: 'guess', value: '4567' }, T);
  assert.deepEqual(r.outcome, { winners: ['p0'], reason: 'cracked' });
});

test('reloj: la ronda se cierra sola al vencer el tiempo', () => {
  const r = room('race', 2, { timer: 30, maxRounds: 0 });
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'guess', value: '0123' }, T);
  assert.equal(tick(r, T + 10_000), false);
  assert.equal(tick(r, T + 30_000), true);
  assert.equal(r.round, 2);
});

test('límite de rondas termina en empate entre los que siguen', () => {
  const r = room('duel', 2, { maxRounds: 8 });
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'secret', value: '1234' }, T);
  applyAction(r, 'p1', { type: 'secret', value: '5678' }, T);
  for (let i = 0; i < 8; i++) {
    applyAction(r, 'p0', { type: 'guess', value: '9012' }, T);
    applyAction(r, 'p1', { type: 'guess', value: '9012' }, T);
  }
  assert.equal(r.outcome?.reason, 'limit');
});

test('abandonar en duelo le da la victoria al otro', () => {
  const r = room('duel', 2);
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p1', { type: 'leave' }, T);
  assert.deepEqual(r.outcome, { winners: ['p0'], reason: 'surrender' });
});

test('revancha reinicia con los mismos jugadores', () => {
  const r = room('duel', 2);
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p1', { type: 'leave' }, T);
  assert.equal(r.phase, 'over');
  applyAction(r, 'p0', { type: 'rematch' }, T);
  assert.equal(r.phase, 'lobby', 'sin rival vuelve a la mesa');
  assert.throws(() => applyAction(r, 'p0', { type: 'start' }, T), /Falta 1/);
});

function manualDuel(check: boolean): Room {
  const r = room('duel', 2, { manual: true, check });
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'secret', value: '4872' }, T);
  applyAction(r, 'p1', { type: 'secret', value: '1350' }, T);
  return r;
}

test('a mano: la app no cuenta, responde el dueño del código', () => {
  const r = manualDuel(true);
  applyAction(r, 'p1', { type: 'guess', value: '4879' }, T);
  const g = r.guesses[0];
  assert.deepEqual(g.pending, ['p0']);
  assert.deepEqual(g.results, [], 'sin respuesta automática');
  // Quien adivina no ve la cuenta; el dueño ve el intento para responder.
  assert.deepEqual(viewFor(r, 'p1', T).guesses[0].results, []);
  assert.equal(viewFor(r, 'p1', T).guesses[0].truth, undefined);
  assert.equal(viewFor(r, 'p0', T).guesses[0].value, '4879');
  assert.deepEqual(viewFor(r, 'p0', T).guesses[0].pending, ['p0']);
  // Con revisión, una cuenta equivocada no se acepta.
  assert.throws(() => applyAction(r, 'p0', { type: 'answer', guessId: g.id, fijas: 2, picas: 1 }, T), /Revisa/);
  applyAction(r, 'p0', { type: 'answer', guessId: g.id, fijas: 3, picas: 0 }, T);
  assert.deepEqual(viewFor(r, 'p1', T).guesses[0].results, [{ target: 'p0', fijas: 3, picas: 0 }]);
  // La ronda no cierra hasta que se respondan todos los intentos.
  applyAction(r, 'p0', { type: 'guess', value: '1234' }, T);
  assert.equal(r.round, 1);
  applyAction(r, 'p1', { type: 'answer', guessId: '1-p0', fijas: 1, picas: 1 }, T);
  assert.equal(r.round, 2);
});

test('a mano sin revisión: se acepta lo que respondan y al final se ve la cuenta real', () => {
  const r = manualDuel(false);
  applyAction(r, 'p1', { type: 'guess', value: '4879' }, T);
  applyAction(r, 'p0', { type: 'guess', value: '5678' }, T);
  applyAction(r, 'p0', { type: 'answer', guessId: '1-p1', fijas: 2, picas: 1 }, T);
  applyAction(r, 'p1', { type: 'answer', guessId: '1-p0', fijas: 0, picas: 0 }, T);
  assert.deepEqual(r.guesses[0].results[0], { target: 'p0', fijas: 2, picas: 1 });
  // Adivinar el código exacto lo descubre sin esperar respuesta.
  applyAction(r, 'p1', { type: 'guess', value: '4872' }, T);
  assert.deepEqual(r.guesses[2].pending, []);
  applyAction(r, 'p0', { type: 'guess', value: '0123' }, T);
  applyAction(r, 'p1', { type: 'answer', guessId: '2-p0', fijas: 0, picas: 2 }, T);
  assert.deepEqual(r.outcome, { winners: ['p1'], reason: 'cracked' });
  const over = viewFor(r, 'p0', T).guesses[0];
  assert.deepEqual(over.truth, [{ target: 'p0', fijas: 3, picas: 0 }]);
  assert.deepEqual(over.results, [{ target: 'p0', fijas: 2, picas: 1 }]);
});

test('a mano con reloj: lo que nadie respondió se responde solo al vencer el tiempo', () => {
  const r = room('duel', 2, { manual: true, timer: 30 });
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'secret', value: '4872' }, T);
  applyAction(r, 'p1', { type: 'secret', value: '1350' }, T);
  applyAction(r, 'p1', { type: 'guess', value: '4879' }, T);
  assert.equal(tick(r, T + 30_000), true);
  assert.deepEqual(r.guesses[0].results, [{ target: 'p0', fijas: 3, picas: 0 }]);
  assert.equal(r.round, 2);
});

test('a mano no aplica en la carrera', () => {
  const r = room('race', 1, { manual: true });
  applyAction(r, 'p0', { type: 'start' }, T);
  applyAction(r, 'p0', { type: 'guess', value: '0123' }, T);
  assert.equal(r.guesses[0].results.length, 1);
});
