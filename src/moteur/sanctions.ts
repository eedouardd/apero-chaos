// Sanctions hors cartes (verdict d'une manche, d'un vote…) : même rendu que les cartes,
// donc mêmes règles pour les gorgées, les gages et le mode Sans alcool.

import type { Joueur, Reglages, Segment } from '../types'
import { rendreConsigne } from './cartes'

export interface Sanction {
  segments: Segment[]
  /** Gorgées (ou gages) attribuées au premier joueur nommé. */
  gorgees: number
}

/**
 * Rend une phrase de sanction écrite avec les jetons des cartes, par exemple
 * `{j1} {boit:1}.` ou `Les innocents {boivent:1}.` : chaque jeton prend `gorgees`
 * (borné par l'intensité, et plus bas encore pour une pénalité de groupe).
 */
export function rendreSanction(
  texte: string,
  cibles: Joueur[],
  reglages: Reglages,
  gorgees: number,
): Sanction {
  return rendreConsigne(texte, cibles, reglages, gorgees)
}
