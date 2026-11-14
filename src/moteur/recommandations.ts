// Recommandation des jeux selon le nombre de joueurs et leurs profils.
// Fonctions pures (aucun effet de bord) : faciles à tester.

import type { DefinitionJeu } from '../jeux/catalogue'
import type { Joueur } from '../types'

export interface JeuEvalue {
  jeu: DefinitionJeu
  /** `false` si le nombre de joueurs ne convient pas. */
  jouable: boolean
  /** Explication quand le jeu n'est pas jouable. */
  raison: string | null
  score: number
  recommande: boolean
}

const NB_RECOMMANDATIONS_MAX = 2
const SCORE_MIN_RECOMMANDATION = 2
const BONUS_NOMBRE_IDEAL = 3
const PENALITE_PROFIL = 4

/** Part des joueurs (entre 0 et 1) pour qui `critere` est vrai. */
function proportion(joueurs: Joueur[], critere: (j: Joueur) => boolean): number {
  if (joueurs.length === 0) return 0
  return joueurs.filter(critere).length / joueurs.length
}

export function calculerScore(jeu: DefinitionJeu, joueurs: Joueur[]): number {
  const nb = joueurs.length
  const dansIdeal = nb >= jeu.idealMin && nb <= jeu.idealMax
  const distance = dansIdeal
    ? 0
    : Math.min(Math.abs(nb - jeu.idealMin), Math.abs(nb - jeu.idealMax))
  const scoreNombre = dansIdeal ? BONUS_NOMBRE_IDEAL : Math.max(0, 2 - distance)

  const refusPhysique = proportion(joueurs, (j) => !j.defisPhysiques)
  const refusIntime = proportion(joueurs, (j) => !j.questionsIntimes)
  const penalite =
    (jeu.plutotPhysique ? refusPhysique * PENALITE_PROFIL : 0) +
    (jeu.plutotIntime ? refusIntime * PENALITE_PROFIL : 0)

  return scoreNombre - penalite
}

/** Évalue tous les jeux et marque les mieux adaptés comme « recommandés ». */
export function evaluerJeux(
  catalogue: DefinitionJeu[],
  joueurs: Joueur[],
): JeuEvalue[] {
  const nb = joueurs.length
  const evalues = catalogue.map((jeu) => {
    const tropPeu = nb < jeu.minJoueurs
    const trop = nb > jeu.maxJoueurs
    const raison = tropPeu
      ? `Dès ${jeu.minJoueurs} joueurs (vous êtes ${nb})`
      : trop
        ? `${jeu.maxJoueurs} joueurs maximum (vous êtes ${nb})`
        : null
    return {
      jeu,
      jouable: raison === null,
      raison,
      score: calculerScore(jeu, joueurs),
      recommande: false,
    }
  })

  const idsRecommandes = new Set(
    evalues
      .filter((e) => e.jouable && e.jeu.pret && e.score >= SCORE_MIN_RECOMMANDATION)
      .toSorted((a, b) => b.score - a.score)
      .slice(0, NB_RECOMMANDATIONS_MAX)
      .map((e) => e.jeu.id),
  )

  return evalues
    .map((e) => ({ ...e, recommande: idsRecommandes.has(e.jeu.id) }))
    .toSorted((a, b) => Number(b.recommande) - Number(a.recommande))
}
