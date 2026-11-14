import { useCallback, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { CarteVue } from '../composants/CarteVue'
import { Decompte } from '../composants/Decompte'
import { cartesDuJeu } from '../contenu'
import { jouerSon, vibrer } from '../effets/sons'
import type { PropsPartie } from '../ecrans/Partie'
import { construirePaquet, rendreCarte } from '../moteur/cartes'
import { calculerStats } from '../moteur/recap'
import { cartesVues, noterCartesVues } from './memoire'

/** Nombre de cartes d'une partie. */
const TAILLE_PAQUET = 25

/**
 * Jeu de cartes générique : « Défis & Vérités », « Je n'ai jamais », « Qui pourrait… »,
 * « Tu préfères… » et « Vrai ou Bluff » : on lit une carte, puis on passe à la suivante.
 */
export function JeuCartes({ jeu, joueurs, reglages, onQuitter, onFin }: PropsPartie) {
  // Le paquet est fabriqué une seule fois, au début de la partie.
  const [paquet] = useState(() =>
    construirePaquet(cartesDuJeu(jeu.id), joueurs, reglages, {
      taille: TAILLE_PAQUET,
      dejaVues: cartesVues(jeu.id),
    }),
  )
  const [index, setIndex] = useState(0)
  const [decompte, setDecompte] = useState(false)
  const fermerDecompte = useCallback(() => setDecompte(false), [])

  function terminer(nbCartesVues: number) {
    const vues = paquet.slice(0, nbCartesVues)
    noterCartesVues(
      jeu.id,
      vues.map((jouee) => jouee.carte.id),
    )
    onFin(calculerStats(vues))
  }

  function carteSuivante() {
    jouerSon('carte')
    vibrer(20)
    if (index + 1 >= paquet.length) {
      terminer(paquet.length)
      return
    }
    setIndex(index + 1)
  }

  const jouee = paquet[index]
  if (jouee === undefined) return <PartieVide jeu={jeu} onQuitter={onQuitter} />

  const derniere = index + 1 >= paquet.length
  // La consigne du jeu passe par le même moteur que les cartes (gorgées ou gages).
  const consigne =
    jeu.consigne === undefined
      ? undefined
      : rendreCarte({ ...jouee.carte, texte: jeu.consigne }, jouee.joueurs, reglages)
          .segments

  return (
    <CadrePartie
      jeu={jeu}
      joueurs={joueurs}
      reglages={reglages}
      etape={index + 1}
      total={paquet.length}
      onTerminer={() => terminer(index + 1)}
      onQuitter={onQuitter}
      actionPied={
        jeu.decompte ? (
          <Bouton onClick={() => setDecompte(true)}>3-2-1 !</Bouton>
        ) : undefined
      }
    >
      <CarteVue
        key={jouee.carte.id}
        jouee={jouee}
        consigne={consigne}
        indice={derniere ? 'Touche pour voir le récap' : 'Touche la carte pour continuer'}
        onSuivante={carteSuivante}
      />
      {decompte ? <Decompte onFini={fermerDecompte} /> : null}
    </CadrePartie>
  )
}
