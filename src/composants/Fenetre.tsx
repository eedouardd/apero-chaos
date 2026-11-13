import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  titre: string
  children: ReactNode
  /** Appelé quand on touche le fond ou qu'on appuie sur Échap. */
  onFermer: () => void
}

/** Fenêtre par-dessus l'écran (pause, gage…). */
export function Fenetre({ titre, children, onFermer }: Props) {
  const boite = useRef<HTMLDivElement>(null)

  useEffect(() => {
    boite.current?.focus()
    function surTouche(evenement: KeyboardEvent) {
      if (evenement.key === 'Escape') onFermer()
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [onFermer])

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-nuit/85 p-5 backdrop-blur-sm"
      onClick={onFermer}
    >
      <div
        ref={boite}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        tabIndex={-1}
        onClick={(evenement) => evenement.stopPropagation()}
        className="anim-apparition lueur w-full max-w-md rounded-3xl bg-surface p-6 focus:outline-none"
      >
        <h2 className="font-titre pb-4 text-center text-xl font-bold text-accent uppercase">
          {titre}
        </h2>
        {children}
      </div>
    </div>
  )
}
