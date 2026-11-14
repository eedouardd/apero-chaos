// Logique des jeux à manches (La Roue, Duel, La Bombe). Fonctions pures, testées.

import type { Carte, CarteJouee, Joueur, Reglages } from '../types'
import { joueurAccepte, rendreCarte, type Alea } from './cartes'

/** Nombre de tours complets que fait la roue avant de s'arrêter. */
const TOURS_DE_ROUE = 5
/** Durée de la mèche de la bombe, en secondes. */
const MECHE_MIN_S = 12
const MECHE_MAX_S = 35
/** Gorgées de base pour le perdant d'un duel ou d'une bombe. */
const GORGEES_PERDANT = 2

/**
 * Angle final de la roue (en degrés) pour que la part du joueur `index`
 * s'arrête sous la flèche du haut. La roue tourne toujours vers l'avant.
 */
export function angleRoue(
  index: number,
  nbParts: number,
  angleActuel: number,
): number {
  const part = 360 / nbParts
  // Angle (entre 0 et 360) qui amène le centre de la part en haut.
  const cible = (360 - (index * part + part / 2)) % 360
  const base = angleActuel - (angleActuel % 360)
  return base + TOURS_DE_ROUE * 360 + cible
}

/** Tire une action de roue que ce joueur accepte, en évitant celles déjà sorties. */
export function tirerAction(
  cartes: Carte[],
  joueur: Joueur,
  dejaTirees: ReadonlySet<string>,
  alea: Alea = Math.random,
): Carte | null {
  const acceptees = cartes.filter((carte) => joueurAccepte(joueur, carte))
  const nouvelles = acceptees.filter((carte) => !dejaTirees.has(carte.id))
  const choix = nouvelles.length > 0 ? nouvelles : acceptees
  if (choix.length === 0) return null
  return choix[Math.floor(alea() * choix.length)]
}

/** Un joueur déjà passé N fois a `1 / (1 + POIDS_PASSAGE × N)` chances relatives de ressortir. */
const POIDS_PASSAGE = 2
/** Personne n'est désigné plus de deux fois d'affilée (s'il y a quelqu'un d'autre). */
const SUITE_MAX = 2

/**
 * Désigne le prochain joueur de la roue : ceux qui sont peu passés ont plus de chances,
 * et le même joueur ne sort jamais trois fois de suite.
 * `passes` liste les identifiants des joueurs déjà désignés, dans l'ordre.
 */
export function tirerJoueurRoue<T extends { id: string }>(
  candidats: readonly T[],
  passes: readonly string[],
  alea: Alea = Math.random,
): T | null {
  const derniers = passes.slice(-SUITE_MAX)
  const enSerie =
    derniers.length === SUITE_MAX && derniers.every((id) => id === derniers[0])
      ? derniers[0]
      : null
  const autres = candidats.filter((c) => c.id !== enSerie)
  const choix = autres.length > 0 ? autres : candidats
  if (choix.length === 0) return null
  const poids = choix.map(
    (c) => 1 / (1 + POIDS_PASSAGE * passes.filter((id) => id === c.id).length),
  )
  const total = poids.reduce((somme, p) => somme + p, 0)
  let seuil = alea() * total
  for (const [index, candidat] of choix.entries()) {
    seuil -= poids[index]
    if (seuil < 0) return candidat
  }
  return choix[choix.length - 1]
}

/** Durée (en millisecondes) avant l'explosion de la bombe. */
export function dureeMeche(alea: Alea = Math.random): number {
  return Math.round((MECHE_MIN_S + alea() * (MECHE_MAX_S - MECHE_MIN_S)) * 1000)
}

/**
 * Sanction du perdant d'une manche : « Léa boit 2 gorgées » (ou un gage).
 * Le perdant est placé en premier pour que les gorgées lui soient comptées.
 */
export function sanctionPerdant(
  carte: Carte,
  perdant: Joueur,
  autres: Joueur[],
  reglages: Reglages,
): CarteJouee {
  const sanction: Carte = {
    ...carte,
    texte: `{j1} {boit:${GORGEES_PERDANT}}.`,
    categorie: 'Verdict',
  }
  const rendue = rendreCarte(sanction, [perdant], reglages)
  return { ...rendue, carte, joueurs: [perdant, ...autres] }
}
