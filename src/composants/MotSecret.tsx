import { useEffect, useState } from 'react'
import { vibrer } from '../effets/sons'

interface Props {
  mot: string
  /** Appelé une fois que le mot est resté visible assez longtemps pour être lu. */
  onVu: () => void
}

/** Durée d'appui minimale pour considérer le mot comme lu. */
const DELAI_LECTURE_MS = 500

/**
 * Mot secret : visible uniquement tant qu'on garde le doigt appuyé.
 * Rien ne change selon le mot affiché (ni couleur, ni son, ni vibration).
 */
export function MotSecret({ mot, onVu }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const minuteur = setTimeout(onVu, DELAI_LECTURE_MS)
    return () => clearTimeout(minuteur)
  }, [visible, onVu])

  // Téléphone verrouillé ou app en arrière-plan : on recache le mot.
  useEffect(() => {
    const cacher = () => setVisible(false)
    document.addEventListener('visibilitychange', cacher)
    return () => document.removeEventListener('visibilitychange', cacher)
  }, [])

  function montrer() {
    if (visible) return
    vibrer(10)
    setVisible(true)
  }
  const cacher = () => setVisible(false)

  return (
    <button
      type="button"
      aria-label="Maintiens appuyé pour voir ton mot secret"
      onPointerDown={montrer}
      onPointerUp={cacher}
      onPointerCancel={cacher}
      onPointerLeave={cacher}
      onContextMenu={(evenement) => evenement.preventDefault()}
      onKeyDown={(evenement) => {
        if (evenement.key === ' ' || evenement.key === 'Enter') montrer()
      }}
      onKeyUp={cacher}
      onBlur={cacher}
      className={`grid h-56 w-full touch-none place-items-center rounded-3xl border-2 select-none [-webkit-touch-callout:none] ${
        visible ? 'border-trait bg-nuit-2' : 'border-dashed border-trait bg-surface'
      }`}
    >
      {visible ? (
        <span className="anim-apparition grid gap-2 [animation-duration:var(--duree-eclair)]">
          <span className="text-sm text-texte-doux">Ton mot secret</span>
          <span className="text-3xl font-semibold">{mot}</span>
        </span>
      ) : (
        <span className="grid gap-2">
          <span className="anim-pulsation text-5xl" aria-hidden="true">
            🤫
          </span>
          <span className="text-lg text-texte-doux">Maintiens appuyé</span>
        </span>
      )}
    </button>
  )
}
