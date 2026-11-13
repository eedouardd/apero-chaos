import type { DefinitionJeu } from '../jeux/catalogue'
import { JeuCartes } from '../jeux/JeuCartes'
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
  // Les jeux à mécanique spéciale (roue, duel, bombe…) arrivent à l'étape 3.
  return <JeuCartes {...props} />
}
