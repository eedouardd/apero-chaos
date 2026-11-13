import { Bouton } from '../composants/Bouton'
import { Cadre } from '../composants/Cadre'
import type { DefinitionJeu } from '../jeux/catalogue'
import type { Joueur, Reglages, StatsPartie } from '../types'

export interface PropsPartie {
  jeu: DefinitionJeu
  joueurs: Joueur[]
  reglages: Reglages
  onQuitter: () => void
  onFin: (stats: StatsPartie) => void
}

/** Écran de partie (provisoire à l'étape 1 : le moteur de cartes arrive à l'étape 2). */
export function Partie({ jeu, onQuitter, onFin }: PropsPartie) {
  return (
    <Cadre
      titre={jeu.nom}
      couleur={jeu.couleur}
      onRetour={onQuitter}
      libelleRetour="Quitter la partie"
      pied={
        <Bouton onClick={() => onFin({ cartesJouees: 0, parJoueur: {} })}>
          Terminer
        </Bouton>
      }
    >
      <p className="m-auto text-center text-texte-doux">
        Les cartes arrivent à l’étape suivante.
      </p>
    </Cadre>
  )
}
