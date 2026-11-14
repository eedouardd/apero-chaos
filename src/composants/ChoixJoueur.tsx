import type { Joueur } from '../types'
import { Bouton } from './Bouton'

interface Props {
  joueurs: Joueur[]
  onChoisir: (joueur: Joueur) => void
}

/** Au-delà de ce nombre de prénoms, les boutons sont un peu moins hauts pour tenir à l'écran. */
const SEUIL_GRILLE_DENSE = 8

/** Grille de prénoms à toucher (vote, désignation). */
export function ChoixJoueur({ joueurs, onChoisir }: Props) {
  const hauteur = joueurs.length > SEUIL_GRILLE_DENSE ? 'min-h-12!' : ''
  return (
    <ul className="grid grid-cols-2 gap-2">
      {joueurs.map((joueur) => (
        <li key={joueur.id}>
          {/* Police de texte, plus étroite : un long prénom tient sur deux lignes sans être coupé. */}
          <Bouton
            variante="contour"
            className={`font-texte! px-2 leading-tight font-bold tracking-normal! normal-case! [overflow-wrap:anywhere] ${hauteur}`}
            onClick={() => onChoisir(joueur)}
          >
            {joueur.prenom}
          </Bouton>
        </li>
      ))}
    </ul>
  )
}
