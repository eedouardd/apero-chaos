import { useEffect, useState } from 'react'
import { jouerSon, vibrer } from '../effets/sons'

const ETAPES = ['3', '2', '1', 'GO !']
const DUREE_ETAPE_MS = 750

/** Décompte 3-2-1 plein écran, pour que tout le monde vote en même temps. */
export function Decompte({ onFini }: { onFini: () => void }) {
  const [etape, setEtape] = useState(0)

  useEffect(() => {
    const derniere = etape === ETAPES.length - 1
    jouerSon(derniere ? 'victoire' : 'vote')
    vibrer(derniere ? [60, 40, 120] : 40)
    const minuteur = setTimeout(() => {
      if (derniere) onFini()
      else setEtape(etape + 1)
    }, DUREE_ETAPE_MS)
    return () => clearTimeout(minuteur)
  }, [etape, onFini])

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-nuit/90 backdrop-blur-sm"
      role="status"
      aria-live="assertive"
    >
      <p
        key={etape}
        className="font-titre texte-neon anim-apparition text-[7rem] leading-none font-black"
      >
        {ETAPES[etape]}
      </p>
    </div>
  )
}
