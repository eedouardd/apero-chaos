// Tirage d'un gage adapté au ton de la partie et aux joueurs.

import type { Gage } from '../contenu'
import type { Joueur, Reglages, TailleGage, Ton } from '../types'
import type { Alea } from './cartes'

const NIVEAU_TON: Record<Ton, number> = { 'tout-public': 0, pimente: 1, hard: 2 }

/** Gages autorisés : ton respecté, et rien de physique ni de gênant si un joueur n'aime pas ça. */
export function gagesAutorises(
  gages: Gage[],
  joueurs: Joueur[],
  reglages: Reglages,
): Gage[] {
  const physiqueOk = joueurs.every((j) => j.defisPhysiques)
  const genantOk = joueurs.every((j) => j.questionsIntimes)
  return gages.filter(
    (gage) =>
      NIVEAU_TON[gage.ton] <= NIVEAU_TON[reglages.ton] &&
      (physiqueOk || gage.physique !== true) &&
      (genantOk || gage.genant !== true),
  )
}

/**
 * Tire un gage au hasard, différent du précédent si possible.
 * Avec une `taille`, on tire d'abord parmi les gages de cette taille (petit, moyen, gros).
 */
export function tirerGage(
  gages: Gage[],
  precedent: string | null,
  alea: Alea = Math.random,
  taille?: TailleGage,
): string {
  const deLaTaille = gages.filter((gage) => gage.taille === taille)
  const reserve = taille !== undefined && deLaTaille.length > 0 ? deLaTaille : gages
  const candidats = reserve.filter((gage) => gage.texte !== precedent)
  const choix = candidats.length > 0 ? candidats : reserve
  if (choix.length === 0) return 'Fais rire tout le monde en moins de 20 secondes.'
  return choix[Math.floor(alea() * choix.length)].texte
}
