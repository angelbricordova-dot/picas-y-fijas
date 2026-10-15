import { Domino, DigitRow } from './Tiles';

export function Wordmark({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return (
    <h1 className={`wordmark wordmark--${size}`} aria-label="Picas y Fijas">
      <span className="wm-word wm-word--1">Picas</span>
      <span className="wm-line">
      <span className="wm-y" aria-hidden>
        <svg viewBox="0 0 60 104" width="0.9em" height="1.56em">
          <rect x="2" y="6" width="56" height="96" rx="12" fill="var(--bone-shade)" />
          <rect x="2" y="2" width="56" height="96" rx="12" fill="var(--bone)" />
          <path d="M12 50 H48" stroke="var(--bone-edge)" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="30" cy="50" r="4" fill="var(--pin)" />
          <circle cx="30" cy="26" r="8" fill="var(--fija)" />
          <circle cx="30" cy="74" r="6.6" fill="none" stroke="var(--ink)" strokeWidth="4" />
        </svg>
      </span>
      <span className="wm-word">Fijas</span>
      </span>
    </h1>
  );
}

/** La explicación del juego, con el ejemplo de siempre: 4872 contra 4879. */
export function HowTo() {
  return (
    <div className="howto">
      <p className="howto-lead">
        Cada jugador piensa un <strong>código secreto</strong> de números. Por turnos, los demás tratan de adivinarlo. La
        app compara cada intento con el código y cuenta por ti, sin errores:
      </p>
      <dl className="legend">
        <div className="legend-item">
          <dt>
            <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
              <circle cx="20" cy="20" r="13" fill="var(--fija)" />
              <circle cx="16" cy="15.5" r="4" fill="var(--bone)" opacity=".55" />
            </svg>
            Fija
          </dt>
          <dd>Número correcto en el lugar correcto.</dd>
        </div>
        <div className="legend-item">
          <dt>
            <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
              <circle cx="20" cy="20" r="11" fill="none" stroke="var(--ink)" strokeWidth="5" />
            </svg>
            Pica
          </dt>
          <dd>El número está en el código, pero en otro lugar.</dd>
        </div>
      </dl>
      <div className="example">
        <div className="example-line">
          <span className="example-label">Código</span>
          <DigitRow value="4872" size="sm" />
        </div>
        <div className="example-line">
          <span className="example-label">Intento</span>
          <DigitRow value="4879" size="sm" marks={['fija', 'fija', 'fija', 'nada']} />
          <Domino fijas={3} picas={0} width={74} />
        </div>
        <p className="example-note">4, 8 y 7 están en su lugar: 3 fijas. El 9 no está: ninguna pica.</p>
        <div className="example-line">
          <span className="example-label">Intento</span>
          <DigitRow value="2847" size="sm" marks={['pica', 'fija', 'pica', 'pica']} />
          <Domino fijas={1} picas={3} width={74} />
        </div>
        <p className="example-note">El 8 está en su lugar; 2, 4 y 7 están, pero movidos: 1 fija y 3 picas.</p>
      </div>
      <p className="howto-lead">
        Cada resultado aparece como una <strong>ficha de dominó</strong>: a la izquierda los puntos rojos son fijas, a la
        derecha los aros son picas. Quien consigue todas las fijas, descubre el código.
      </p>
      <ul className="howto-list">
        <li>
          <strong>Rondas justas:</strong> todos juegan cada ronda. Si dos descubren en la misma ronda, empatan.
        </li>
        <li>
          <strong>Libreta:</strong> toca el lápiz del teclado para marcar qué números ya descartaste.
        </li>
        <li>
          <strong>Modo árbitro:</strong> si juegan en persona, cada uno guarda su código en su celular y la app responde
          por ti cuando el otro dice un número.
        </li>
      </ul>
    </div>
  );
}
