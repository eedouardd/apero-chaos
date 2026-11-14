// Point d'entrée du contenu : charge les fichiers JSON et vérifie leur forme.
// Pour ajouter des cartes, modifie simplement les fichiers .json de ce dossier.

import type { Carte, IdJeu, IdJeuCartes, PaireMots, Ton } from '../types'
import defisVerites from './defis-verites.json'
import duel from './duel.json'
import jeNaiJamais from './je-nai-jamais.json'
import laBombe from './la-bombe.json'
import laRoue from './la-roue.json'
import quiPourrait from './qui-pourrait.json'
import tuPreferes from './tu-preferes.json'
import vraiOuBluff from './vrai-ou-bluff.json'
import gagesBruts from './gages.json'
import imposteurBrut from './imposteur.json'

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

/** Les cartes de chaque jeu, une fois vérifiées. */
export const CARTES: Record<IdJeuCartes, Carte[]> = {
  'defis-verites': verifier('defis-verites.json', defisVerites),
  'je-nai-jamais': verifier('je-nai-jamais.json', jeNaiJamais),
  'qui-pourrait': verifier('qui-pourrait.json', quiPourrait),
  'la-roue': verifier('la-roue.json', laRoue),
  duel: verifier('duel.json', duel),
  'tu-preferes': verifier('tu-preferes.json', tuPreferes),
  'la-bombe': verifier('la-bombe.json', laBombe),
  'vrai-ou-bluff': verifier('vrai-ou-bluff.json', vraiOuBluff),
}

/** Cartes d'un jeu (liste vide pour les jeux qui ont leur propre format de contenu). */
export function cartesDuJeu(id: IdJeu): Carte[] {
  const parJeu: Partial<Record<IdJeu, Carte[]>> = CARTES
  return parJeu[id] ?? []
}

export interface Gage {
  id: string
  texte: string
  ton: Ton
  /** Gage qui demande de bouger. */
  physique?: boolean
  /** Gage gênant ou intime : écarté si un joueur refuse les questions gênantes. */
  genant?: boolean
}

export const GAGES: Gage[] = (gagesBruts as Gage[]).filter(
  (gage) => typeof gage.texte === 'string' && TONS.includes(gage.ton),
)

const DIFFICULTES: readonly unknown[] = [1, 2, 3]
/** Un mot secret doit tenir sur une ligne, même sur un petit écran. */
export const LONGUEUR_MOT_MAX = 16

/** Renvoie la liste des problèmes d'une paire de L'Imposteur (vide si tout va bien). */
export function problemesPaire(brut: unknown): string[] {
  if (typeof brut !== 'object' || brut === null) return ['la paire n’est pas un objet']
  const paire = brut as Record<string, unknown>
  const problemes: string[] = []
  if (typeof paire.id !== 'string' || paire.id === '') problemes.push('id manquant')
  const mots = paire.mots
  const motsValides =
    Array.isArray(mots) &&
    mots.length === 2 &&
    mots.every(
      (mot) =>
        typeof mot === 'string' &&
        mot.trim() !== '' &&
        mot.length <= LONGUEUR_MOT_MAX,
    ) &&
    mots[0] !== mots[1]
  if (!motsValides) {
    problemes.push(`mots doit contenir 2 mots distincts de ${LONGUEUR_MOT_MAX} lettres au plus`)
  }
  if (!TONS.includes(paire.ton as string)) problemes.push(`ton inconnu : ${String(paire.ton)}`)
  if (!DIFFICULTES.includes(paire.difficulte)) problemes.push('difficulte doit valoir 1, 2 ou 3')
  if (!Array.isArray(paire.tags) || paire.tags.some((t) => typeof t !== 'string')) {
    problemes.push('tags doit être une liste de mots')
  }
  if (typeof paire.theme !== 'string' || paire.theme === '') problemes.push('theme manquant')
  return problemes
}

/** Les paires de mots de L'Imposteur, une fois vérifiées. */
export const PAIRES_IMPOSTEUR: PaireMots[] = (imposteurBrut as unknown[]).filter(
  (brute): brute is PaireMots => {
    const problemes = problemesPaire(brute)
    if (problemes.length > 0) {
      console.warn('Paire ignorée dans imposteur.json :', problemes.join(', '), brute)
    }
    return problemes.length === 0
  },
)
