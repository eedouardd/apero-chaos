import { useContext, type ReactNode } from 'react'
import { ContexteSon } from './ContexteSon'

interface Props {
  titre?: string
  /** Affiche une flèche retour si fourni. */
  onRetour?: () => void
  /** Texte du bouton retour pour les lecteurs d'écran. */
  libelleRetour?: string
  children: ReactNode
  /** Zone fixe en bas d'écran (bouton principal). */
  pied?: ReactNode
  /** Couleur d'accent de l'écran (celle du jeu en cours). */
  couleur?: string
}

/** Mise en page commune : en-tête, contenu défilant, pied fixe. */
export function Cadre({
  titre,
  onRetour,
  libelleRetour = 'Retour',
  children,
  pied,
  couleur,
}: Props) {
  const { sonCoupe, basculerSon } = useContext(ContexteSon)
  return (
    <div
      className="fond-neon mx-auto flex h-full max-w-xl flex-col"
      style={couleur ? ({ '--accent': couleur } as React.CSSProperties) : undefined}
    >
      <header className="flex items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        {onRetour ? (
          <button
            type="button"
            onClick={onRetour}
            aria-label={libelleRetour}
            className="grid size-12 place-items-center rounded-full bg-surface text-2xl active:scale-90"
          >
            ←
          </button>
        ) : (
          <span className="size-12" aria-hidden="true" />
        )}
        <h1 className="font-titre flex-1 text-center text-sm font-semibold tracking-widest text-texte-doux uppercase">
          {titre}
        </h1>
        <button
          type="button"
          onClick={basculerSon}
          aria-pressed={sonCoupe}
          aria-label={sonCoupe ? 'Réactiver le son' : 'Couper le son'}
          className="grid size-12 place-items-center rounded-full bg-surface text-xl active:scale-90"
        >
          {sonCoupe ? '🔇' : '🔊'}
        </button>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-3">
        {children}
      </main>
      {pied ? (
        <footer className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {pied}
        </footer>
      ) : null}
    </div>
  )
}
