// Point d'entrée du contenu : charge les fichiers JSON et vérifie leur forme.
// Pour ajouter des cartes, modifie simplement les fichiers .json de ce dossier.

import type { Carte, IdJeu, Ton } from '../types'
import defisVerites from './defis-verites.json'
import gagesBruts from './gages.json'

const TONS: readonly string[] = ['tout-public', 'pimente', 'hard']
const INTENSITES: readonly string[] = ['soft', 'normal', 'hard']

/** Renvoie la liste des problèmes d'une carte (vide si tout va bien). */
export function problemesCarte(brut: unknown): string[] {
  if (typeof brut !== 'object' || brut === null) return ['la carte n’est pas un objet']
  const carte = brut as Record<string, unknown>
  const problemes: string[] = []
  if (typeof carte.id !== 'string' || carte.id === '') problemes.push('id manquant')
  if (typeof carte.texte !== 'string' || carte.texte.trim() === '') {
    problemes.push('texte manquant')
  }
  if (!TONS.includes(carte.ton as string)) problemes.push(`ton inconnu : ${String(carte.ton)}`)
  if (!INTENSITES.includes(carte.intensite as string)) {
    problemes.push(`intensité inconnue : ${String(carte.intensite)}`)
  }
  if (!Array.isArray(carte.tags) || carte.tags.some((t) => typeof t !== 'string')) {
    problemes.push('tags doit être une liste de mots')
  }
  if (typeof carte.minJoueurs !== 'number' || carte.minJoueurs < 1) {
    problemes.push('minJoueurs doit être un nombre')
  }
  return problemes
}

/** Garde les cartes valides et signale les autres dans la console (sans planter l'app). */
function verifier(nomFichier: string, brutes: unknown[]): Carte[] {
  return brutes.filter((brute): brute is Carte => {
    const problemes = problemesCarte(brute)
    if (problemes.length > 0) {
      console.warn(`Carte ignorée dans ${nomFichier} :`, problemes.join(', '), brute)
    }
    return problemes.length === 0
  })
}

/** Les cartes de chaque jeu. Les jeux pas encore écrits ont une liste vide. */
export const CARTES: Record<IdJeu, Carte[]> = {
  'defis-verites': verifier('defis-verites.json', defisVerites),
  'je-nai-jamais': [],
  'qui-pourrait': [],
  'la-roue': [],
  duel: [],
  'tu-preferes': [],
  'la-bombe': [],
  'vrai-ou-bluff': [],
}

export interface Gage {
  id: string
  texte: string
  ton: Ton
  /** Gage qui demande de bouger. */
  physique?: boolean
}

export const GAGES: Gage[] = (gagesBruts as Gage[]).filter(
  (gage) => typeof gage.texte === 'string' && TONS.includes(gage.ton),
)
