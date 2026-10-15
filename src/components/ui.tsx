import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Minus, Plus, X } from 'lucide-react';
import { useEffect, useId, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

export function Button({
  variant = 'bone',
  size = 'lg',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'bone' | 'ghost' | 'quiet' | 'danger'; size?: 'lg' | 'md' | 'sm' }) {
  return (
    <button type="button" className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      <span className="btn-face">{children}</span>
    </button>
  );
}

export function IconButton({
  label,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" className={`icon-btn ${className}`} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}

export function TopBar({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-side">{left}</div>
      <div className="topbar-center">{center}</div>
      <div className="topbar-side topbar-side--end">{right}</div>
    </header>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
  disabled?: boolean;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={label}
      style={{ '--n': options.length, '--i': idx } as CSSProperties}
    >
      <span className="segmented-thumb" aria-hidden />
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'is-on' : ''}
          disabled={disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label className="toggle-row" htmlFor={id}>
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        {hint && <span className="toggle-hint">{hint}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          onClick={onClose}
        >
          <motion.section
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { transform: 'translateY(100%)' }}
            animate={reduce ? { opacity: 1 } : { transform: 'translateY(0%)' }}
            exit={reduce ? { opacity: 0 } : { transform: 'translateY(100%)', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-head">
              <h2 className="sheet-title">{title}</h2>
              <IconButton label="Cerrar" onClick={onClose} className="icon-btn--ink">
                <X size={22} strokeWidth={2.5} />
              </IconButton>
            </div>
            <div className="sheet-body">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Mensaje pasajero sobre el teclado (errores de acción, avisos). */
export function Flash({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="flash-wrap" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            className="flash"
            role="status"
            initial={{ opacity: 0, transform: 'translateY(10px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(6px) scale(0.98)', transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={onDone}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  disabled,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="Menos">
        <Minus size={20} strokeWidth={2.8} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Más">
        <Plus size={20} strokeWidth={2.8} />
      </button>
    </div>
  );
}
