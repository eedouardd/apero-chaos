// Échelle de pénalités : combien coûte une carte selon sa difficulté et l'intensité choisie.
// Uniquement des fonctions pures, testées dans penalites.test.ts.

import type { Difficulte, Intensite, TailleGage } from '../types'

/** Générateur de hasard (entre 0 et 1). Remplaçable dans les tests. */
export type Alea = () => number

/** Jamais plus de 5 gorgées d'un coup. */
export const GORGEES_MAX = 5
/** En intensité Soft, on ne dépasse jamais 3 gorgées. */
const GORGEES_MAX_SOFT = 3
/** Pénalité de départ d'une carte qui n'écrit aucun nombre de gorgées. */
export const GORGEES_PAR_DEFAUT = 2

/** Fourchette de gorgées de chaque difficulté : [minimum, maximum]. */
const FOURCHETTES: Record<Difficulte, readonly [number, number]> = {
  1: [1, 1],
  2: [2, 3],
  3: [4, 5],
  4: [5, 5],
}

const TAILLES: Record<Difficulte, TailleGage> = {
  1: 'petit',
  2: 'moyen',
  3: 'gros',
  4: 'gros',
}

/** Plus grand nombre de gorgées autorisé pour cette intensité. */
export function plafondGorgees(intensite: Intensite): number {
  return intensite === 'soft' ? GORGEES_MAX_SOFT : GORGEES_MAX
}

function borner(nb: number, intensite: Intensite): number {
  return Math.min(plafondGorgees(intensite), Math.max(1, nb))
}

/**
 * Gorgées d'une carte selon sa difficulté.
 * Soft : bas de la fourchette, plafonné à 3. Normal : au hasard dans la fourchette.
 * Hard : haut de la fourchette.
 */
export function gorgeesSelonDifficulte(
  difficulte: Difficulte,
  intensite: Intensite,
  alea: Alea = Math.random,
): number {
  const [min, max] = FOURCHETTES[difficulte]
  if (intensite === 'soft') return borner(min, intensite)
  if (intensite === 'hard') return max
  return min + Math.floor(alea() * (max - min + 1))
}

/** Carte sans difficulté marquée : le nombre écrit, à une gorgée près (−1, 0 ou +1). */
export function gorgeesSansDifficulte(
  base: number,
  intensite: Intensite,
  alea: Alea = Math.random,
): number {
  const ecart = Math.floor(alea() * 3) - 1
  return borner(base + ecart, intensite)
}

/** Décale un nombre de gorgées écrit dans une carte, sans sortir de l'échelle. */
export function decalerGorgees(nb: number, ecart: number, intensite: Intensite): number {
  return borner(nb + ecart, intensite)
}

/** Taille du gage d'une carte : d'après sa difficulté, sinon d'après ses gorgées. */
export function tailleGage(difficulte: Difficulte | undefined, gorgees: number): TailleGage {
  if (difficulte !== undefined) return TAILLES[difficulte]
  if (gorgees <= 1) return 'petit'
  return gorgees <= 3 ? 'moyen' : 'gros'
}

/** Nom affiché de chaque taille de gage. */
export const LIBELLES_GAGE: Record<TailleGage, string> = {
  petit: 'Petit gage',
  moyen: 'Gage moyen',
  gros: 'Gros gage',
}

/** Niveau de couleur du bandeau : vert (1), orange (2-3), rouge (4-5). */
export type NiveauPenalite = 'facile' | 'moyen' | 'dur'

export function niveauGorgees(gorgees: number): NiveauPenalite {
  if (gorgees <= 1) return 'facile'
  return gorgees <= 3 ? 'moyen' : 'dur'
}

export function niveauGage(taille: TailleGage): NiveauPenalite {
  if (taille === 'petit') return 'facile'
  return taille === 'moyen' ? 'moyen' : 'dur'
}
