import {
  LIBELLES_GAGE,
  niveauGage,
  niveauGorgees,
  type NiveauPenalite,
} from '../moteur/penalites'
import type { Penalite } from '../types'

interface Props {
  penalite: Penalite
  /**
   * La carte porte elle-même son enjeu (Défis & Vérités, La Roue), sans consigne de jeu :
   * pour un gage collectif ou une règle, le bandeau annonce alors le prix du refus.
   */
  carteSeule?: boolean
  className?: string
}

/** Vert pour une carte facile, orange pour une moyenne, rouge pour une difficile. */
const COULEURS: Record<NiveauPenalite, string> = {
  facile: 'bg-neon-vert',
  moyen: 'bg-neon-orange',
  dur: 'bg-neon-rouge',
}

function gorgeesEnLettres(nb: number): string {
  return `${nb} gorgée${nb > 1 ? 's' : ''}`
}

/** Ce que dit le bandeau, et sa version lue par les lecteurs d'écran. */
function textes(penalite: Penalite, refus: boolean): { visible: string; lu: string } {
  if (penalite.enGage) {
    const libelle = LIBELLES_GAGE[penalite.taille]
    if (refus) {
      return { visible: `Refus : ${libelle.toLowerCase()}`, lu: `Refus : ${libelle.toLowerCase()}` }
    }
    if (penalite.repete) {
      return { visible: '🎭 Gage à chaque fois', lu: 'Pénalité : un gage à chaque fois' }
    }
    return { visible: `🎭 ${libelle}`, lu: `Pénalité : ${libelle.toLowerCase()}` }
  }
  const nb = gorgeesEnLettres(penalite.gorgees)
  if (refus) return { visible: `Refus : 🍺 ×${penalite.gorgees}`, lu: `Refus : ${nb}` }
  if (penalite.repete) {
    return { visible: `🍺 ×${penalite.gorgees} à chaque fois`, lu: `Pénalité : ${nb} à chaque fois` }
  }
  if (penalite.distribue) {
    return { visible: `Distribue 🍺 ×${penalite.gorgees}`, lu: `${nb} à distribuer` }
  }
  return { visible: `🍺 ×${penalite.gorgees}`, lu: `Pénalité : ${nb}` }
}

/**
 * Bandeau de pénalité d'une carte : ce que coûte un raté ou un refus.
 * « 🍺 ×3 » avec alcool, « Gage moyen » sans, coloré selon la difficulté.
 */
export function BandeauPenalite({ penalite, carteSeule = false, className = '' }: Props) {
  const niveau = penalite.enGage
    ? niveauGage(penalite.taille)
    : niveauGorgees(penalite.gorgees)
  const { visible, lu } = textes(penalite, carteSeule && penalite.speciale)
  return (
    <span
      role="img"
      aria-label={lu}
      className={`font-titre block rounded-2xl px-4 py-2 text-center text-3xl leading-none font-black text-nuit tabular-nums ${COULEURS[niveau]} ${className}`}
    >
      {visible}
    </span>
  )
}
