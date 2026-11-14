// Sanctions hors cartes (verdict d'une manche, d'un vote…) : même rendu que les cartes,
// donc mêmes règles pour les gorgées, les gages et le mode Sans alcool.

import type { Carte, Joueur, Reglages, Segment } from '../types'
import { rendreCarte } from './cartes'

export interface Sanction {
  segments: Segment[]
  /** Gorgées (ou gages) attribuées au premier joueur nommé. */
  gorgees: number
}

/**
 * Rend une phrase de sanction écrite avec les jetons des cartes,
 * par exemple `{j1} {boit:3}.` ou `Les innocents {boivent:1}.`
 */
export function rendreSanction(
  texte: string,
  cibles: Joueur[],
  reglages: Reglages,
): Sanction {
  const carte: Carte = {
    id: 'sanction',
    texte,
    ton: 'tout-public',
    intensite: 'soft',
    tags: [],
    minJoueurs: 1,
  }
  const { segments, gorgees } = rendreCarte(carte, cibles, reglages)
  return { segments, gorgees }
}
