// Récap de fin de partie : transforme les statistiques en petites récompenses.

import type { CarteJouee, Joueur, StatsPartie, Trophee } from '../types'

export type { Trophee }

type Mesure = (stats: { cartes: number; gorgees: number }) => number

/** Joueur qui maximise `mesure` (null si tout le monde est à zéro). */
function meilleur(
  joueurs: Joueur[],
  stats: StatsPartie,
  mesure: Mesure,
): { joueur: Joueur; valeur: number } | null {
  const classes = joueurs
    .map((joueur) => ({
      joueur,
      valeur: mesure(stats.parJoueur[joueur.id] ?? { cartes: 0, gorgees: 0 }),
    }))
    .toSorted((a, b) => b.valeur - a.valeur)
  const premier = classes[0]
  return premier !== undefined && premier.valeur > 0 ? premier : null
}

export function calculerTrophees(
  joueurs: Joueur[],
  stats: StatsPartie,
  sansAlcool: boolean,
): Trophee[] {
  const trophees: Trophee[] = []

  const cible = meilleur(joueurs, stats, (s) => s.cartes)
  if (cible) {
    trophees.push({
      emoji: '🎯',
      titre: 'Cible préférée du chaos',
      prenom: cible.joueur.prenom,
      detail: `${cible.valeur} carte${cible.valeur > 1 ? 's' : ''} pour sa pomme`,
    })
  }

  const assoiffe = meilleur(joueurs, stats, (s) => s.gorgees)
  if (assoiffe) {
    trophees.push({
      emoji: sansAlcool ? '🎪' : '🍻',
      titre: sansAlcool ? 'Roi ou reine des gages' : 'Gosier en pente',
      prenom: assoiffe.joueur.prenom,
      detail: sansAlcool
        ? `${assoiffe.valeur} gage${assoiffe.valeur > 1 ? 's' : ''} au compteur`
        : `Jusqu’à ${assoiffe.valeur} gorgée${assoiffe.valeur > 1 ? 's' : ''} distribuées par le destin`,
    })
  }

  // Le plus épargné : celui qui a reçu le moins de cartes (s'il y a un écart).
  const minCartes = Math.min(
    ...joueurs.map((j) => stats.parJoueur[j.id]?.cartes ?? 0),
  )
  const planque = joueurs.find(
    (j) => (stats.parJoueur[j.id]?.cartes ?? 0) === minCartes,
  )
  if (planque && cible && minCartes < cible.valeur) {
    trophees.push({
      emoji: '🥷',
      titre: 'Planqué de la soirée',
      prenom: planque.prenom,
      detail:
        minCartes === 0
          ? 'Passé entre toutes les gouttes'
          : `Seulement ${minCartes} carte${minCartes > 1 ? 's' : ''}`,
    })
  }

  return trophees
}

/** Additionne les cartes et gorgées reçues par chaque joueur. */
export function calculerStats(cartesJouees: CarteJouee[]): StatsPartie {
  const parJoueur = cartesJouees.reduce<StatsPartie['parJoueur']>(
    (cumul, jouee) =>
      jouee.joueurs.reduce((acc, joueur, rang) => {
        const avant = acc[joueur.id] ?? { cartes: 0, gorgees: 0 }
        return {
          ...acc,
          [joueur.id]: {
            cartes: avant.cartes + 1,
            // Les gorgées d'une carte vont au premier joueur nommé.
            gorgees: avant.gorgees + (rang === 0 ? jouee.gorgees : 0),
          },
        }
      }, cumul),
    {},
  )
  return { cartesJouees: cartesJouees.length, parJoueur }
}
