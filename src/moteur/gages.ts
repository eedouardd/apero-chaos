// Tirage d'un gage adapté au ton de la partie et aux joueurs.

import type { Gage } from '../contenu'
import type { Joueur, Reglages, Ton } from '../types'
import type { Alea } from './cartes'

const NIVEAU_TON: Record<Ton, number> = { 'tout-public': 0, pimente: 1, hard: 2 }

/** Gages autorisés : ton respecté, et rien de physique si un joueur n'aime pas ça. */
export function gagesAutorises(
  gages: Gage[],
  joueurs: Joueur[],
  reglages: Reglages,
): Gage[] {
  const physiqueOk = joueurs.every((j) => j.defisPhysiques)
  return gages.filter(
    (gage) =>
      NIVEAU_TON[gage.ton] <= NIVEAU_TON[reglages.ton] &&
      (physiqueOk || gage.physique !== true),
  )
}

/** Tire un gage au hasard, différent du précédent si possible. */
export function tirerGage(
  gages: Gage[],
  precedent: string | null,
  alea: Alea = Math.random,
): string {
  const candidats = gages.filter((gage) => gage.texte !== precedent)
  const choix = candidats.length > 0 ? candidats : gages
  if (choix.length === 0) return 'Fais rire tout le monde en moins de 20 secondes.'
  return choix[Math.floor(alea() * choix.length)].texte
}
