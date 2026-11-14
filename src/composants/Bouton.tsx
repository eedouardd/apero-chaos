import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { jouerSon, vibrer } from '../effets/sons'

type Variante = 'plein' | 'contour' | 'discret'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  children: ReactNode
}

const STYLES: Record<Variante, string> = {
  plein:
    'bg-accent text-nuit font-titre font-bold uppercase tracking-wide shadow-[0_0_26px_color-mix(in_oklab,var(--accent)_60%,transparent)] active:shadow-none',
  contour:
    'border-2 border-accent text-accent font-titre font-semibold uppercase tracking-wide bg-accent/5',
  discret: 'text-texte-doux font-medium underline underline-offset-4',
}

/** Gros bouton tactile, avec petit son et vibration au toucher. */
export function Bouton({
  variante = 'plein',
  className = '',
  onClick,
  children,
  ...reste
}: Props) {
  return (
    <button
      type="button"
      {...reste}
      onClick={(evenement) => {
        jouerSon('tap')
        vibrer()
        onClick?.(evenement)
      }}
      className={`min-h-14 w-full rounded-2xl px-6 py-3 text-base transition-transform duration-150 ease-[var(--ease-rebond)] active:scale-95 disabled:pointer-events-none disabled:border-trait disabled:bg-surface-2 disabled:text-texte-doux disabled:shadow-none ${STYLES[variante]} ${className}`}
    >
      {children}
    </button>
  )
}
