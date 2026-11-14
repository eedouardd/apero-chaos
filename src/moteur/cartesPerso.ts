// « Mes cartes » : les cartes écrites par les joueurs, gardées sur le téléphone.
// Fonctions pures : vérification d'un texte et transformation en cartes jouables.

import { INTERDITS } from '../contenu/interdits'
import type { Carte } from '../types'
import { nbJoueursCibles } from './cartes'

/** Il faut au moins ce nombre de cartes pour lancer une partie. */
export const NB_CARTES_PERSO_MIN = 5
export const NB_CARTES_PERSO_MAX = 60
export const LONGUEUR_CARTE_PERSO_MIN = 8
export const LONGUEUR_CARTE_PERSO_MAX = 160
/** Une carte ne fait jamais boire plus que ça au total, tous jetons confondus. */
const GORGEES_PAR_CARTE_MAX = 5

const JETON_VALIDE = /^\{(j[12]|(bois|boit|boivent|buvez|distribue|gorgees):[1-5])\}$/

export type ResultatCartePerso =
  | { ok: true; texte: string }
  | { ok: false; erreur: string }

/** Vérifie une carte écrite par un joueur, ou explique pourquoi elle est refusée. */
export function verifierCartePerso(
  saisie: string,
  existantes: readonly string[],
): ResultatCartePerso {
  const texte = saisie.trim().replace(/\s+/g, ' ')
  if (texte.length < LONGUEUR_CARTE_PERSO_MIN) {
    return { ok: false, erreur: 'Un peu court : écris une vraie phrase.' }
  }
  if (texte.length > LONGUEUR_CARTE_PERSO_MAX) {
    return { ok: false, erreur: `${LONGUEUR_CARTE_PERSO_MAX} caractères maximum.` }
  }
  if (existantes.length >= NB_CARTES_PERSO_MAX) {
    return { ok: false, erreur: `${NB_CARTES_PERSO_MAX} cartes maximum.` }
  }
  if (existantes.includes(texte)) {
    return { ok: false, erreur: 'Cette carte existe déjà.' }
  }
  const jetons = texte.match(/\{[^}]*\}/g) ?? []
  if (jetons.some((jeton) => !JETON_VALIDE.test(jeton)) || /[{}]/.test(texte.replace(/\{[^}]*\}/g, ''))) {
    return {
      ok: false,
      erreur: 'Accolades non reconnues : utilise les boutons « Un joueur » et « Gorgées ».',
    }
  }
  const totalGorgees = jetons
    .map((jeton) => Number(/:(\d)\}$/.exec(jeton)?.[1] ?? 0))
    .reduce((somme, nb) => somme + nb, 0)
  if (totalGorgees > GORGEES_PAR_CARTE_MAX) {
    return { ok: false, erreur: `${GORGEES_PAR_CARTE_MAX} gorgées maximum par carte, en tout.` }
  }
  if (INTERDITS.some((interdit) => interdit.test(texte))) {
    return {
      ok: false,
      erreur: 'Pas de cul sec, de shots, de mélanges ni de conduite : ici on compte en gorgées.',
    }
  }
  return { ok: true, texte }
}

/** Empreinte courte et stable d'un texte (suffisante pour distinguer 60 cartes). */
function empreinte(texte: string): string {
  let hache = 5381
  for (const lettre of texte) hache = (hache * 33 + (lettre.codePointAt(0) ?? 0)) >>> 0
  return hache.toString(36)
}

/** Garde uniquement les cartes valides (relecture d'une sauvegarde). */
export function filtrerCartesPerso(textes: readonly string[]): string[] {
  return textes.reduce<string[]>((gardees, texte) => {
    const resultat = verifierCartePerso(texte, gardees)
    return resultat.ok ? [...gardees, resultat.texte] : gardees
  }, [])
}

/** Transforme les textes sauvegardés en cartes jouables par le moteur. */
export function enCartesPerso(textes: readonly string[]): Carte[] {
  return textes.map((texte) => {
    const carte: Carte = {
      // Identifiant tiré du texte : supprimer une carte ne décale pas les autres.
      id: `perso-${empreinte(texte)}`,
      texte,
      ton: 'tout-public',
      intensite: 'soft',
      tags: [],
      minJoueurs: 2,
    }
    return { ...carte, minJoueurs: Math.max(2, nbJoueursCibles(carte)) }
  })
}
