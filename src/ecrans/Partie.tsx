import type { DefinitionJeu } from '../jeux/catalogue'
import { JeuBombe } from '../jeux/JeuBombe'
import { JeuCartes } from '../jeux/JeuCartes'
import { JeuDuel } from '../jeux/JeuDuel'
import { JeuRoue } from '../jeux/JeuRoue'
import type { Joueur, Reglages, StatsPartie } from '../types'

export interface PropsPartie {
  jeu: DefinitionJeu
  joueurs: Joueur[]
  reglages: Reglages
  /** Retour au choix du jeu, sans récap. */
  onQuitter: () => void
  /** Fin de partie, avec les statistiques pour le récap. */
  onFin: (stats: StatsPartie) => void
}

/** Aiguillage : affiche le bon composant selon le jeu choisi. */
export function Partie(props: PropsPartie) {
  switch (props.jeu.id) {
    case 'la-roue':
      return <JeuRoue {...props} />
    case 'duel':
      return <JeuDuel {...props} />
    case 'la-bombe':
      return <JeuBombe {...props} />
    default:
      // Tous les autres jeux se jouent carte après carte.
      return <JeuCartes {...props} />
  }
}
