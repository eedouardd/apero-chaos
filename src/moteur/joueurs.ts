// Création et validation des joueurs (fonctions pures, testables).

import {
  LONGUEUR_PRENOM_MAX,
  NB_JOUEURS_MAX,
  type Joueur,
} from '../types'

export type ResultatAjout =
  | { ok: true; joueur: Joueur }
  | { ok: false; erreur: string }

function normaliser(prenom: string): string {
  return prenom.trim().toLocaleLowerCase('fr')
}

/** Vérifie un prénom et fabrique le joueur, ou explique pourquoi c'est refusé. */
export function creerJoueur(
  prenomSaisi: string,
  existants: Joueur[],
  id: string,
): ResultatAjout {
  const prenom = prenomSaisi.trim().replace(/\s+/g, ' ')
  if (prenom === '') {
    return { ok: false, erreur: 'Écris un prénom d’abord.' }
  }
  if (prenom.length > LONGUEUR_PRENOM_MAX) {
    return {
      ok: false,
      erreur: `${LONGUEUR_PRENOM_MAX} caractères maximum.`,
    }
  }
  if (existants.length >= NB_JOUEURS_MAX) {
    return { ok: false, erreur: `${NB_JOUEURS_MAX} joueurs maximum.` }
  }
  if (existants.some((j) => normaliser(j.prenom) === normaliser(prenom))) {
    return {
      ok: false,
      erreur: `Il y a déjà un(e) ${prenom}. Ajoute une initiale !`,
    }
  }
  return {
    ok: true,
    joueur: {
      id,
      prenom,
      // Valeurs par défaut du mini-questionnaire (il peut être sauté).
      defisPhysiques: true,
      questionsIntimes: true,
      boitAlcool: true,
    },
  }
}

let compteurId = 0

/** Identifiant unique simple (fonctionne aussi hors HTTPS, contrairement à crypto.randomUUID). */
export function nouvelId(): string {
  compteurId += 1
  return `j-${Date.now().toString(36)}-${compteurId}`
}
