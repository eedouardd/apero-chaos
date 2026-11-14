import { useCallback, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { CarteVue } from '../composants/CarteVue'
import { Decompte } from '../composants/Decompte'
import { cartesDuJeu } from '../contenu'
import { jouerSon, vibrer } from '../effets/sons'
import type { PropsPartie } from '../ecrans/Partie'
import { construirePaquet, plafondGroupe, rendreConsigne } from '../moteur/cartes'
import type { CarteJouee, Reglages, Segment } from '../types'
import type { DefinitionJeu } from './catalogue'
import { calculerStats } from '../moteur/recap'
import { cartesVues, noterCartesVues } from './memoire'

/** Nombre de cartes d'une partie. */
const TAILLE_PAQUET = 25

/**
 * Consigne du jeu sous la carte, avec la pénalité de cette carte. Quand la carte coûte
 * plus que le plafond des pénalités de groupe, on précise ce que prend un joueur seul.
 */
function consigneDeLaCarte(
  jeu: DefinitionJeu,
  jouee: CarteJouee,
  reglages: Reglages,
): Segment[] | undefined {
  if (jeu.consigne === undefined || jouee.penalite === null) return undefined
  const { gorgees, enGage } = jouee.penalite
  const base = rendreConsigne(jeu.consigne, jouee.joueurs, reglages, gorgees).segments
  const seulPaiePlus = !enGage && gorgees > plafondGroupe(reglages.intensite)
  if (jeu.consigneSeul === undefined || !seulPaiePlus) return base
  const seul = rendreConsigne(jeu.consigneSeul, [], reglages, gorgees).segments
  return [...base, { type: 'texte', valeur: ' ' }, ...seul]
}

/**
 * Jeu de cartes générique : « Défis & Vérités », « Je n'ai jamais », « Qui pourrait… »,
 * « Tu préfères… » et « Vrai ou Bluff » : on lit une carte, puis on passe à la suivante.
 */
export function JeuCartes({
  jeu,
  joueurs,
  reglages,
  cartesPerso,
  onQuitter,
  onFin,
}: PropsPartie) {
  // Le paquet est fabriqué une seule fois, au début de la partie.
  const [paquet] = useState(() =>
    construirePaquet(
      jeu.id === 'mes-cartes' ? (cartesPerso ?? []) : cartesDuJeu(jeu.id),
      joueurs,
      reglages,
      {
        taille: TAILLE_PAQUET,
        dejaVues: cartesVues(jeu.id),
      },
    ),
  )
  const [index, setIndex] = useState(0)
  // Carte la plus lointaine atteinte : revenir en arrière ne retire rien au récap.
  const [indexMax, setIndexMax] = useState(0)
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
    setIndexMax(Math.max(indexMax, index + 1))
  }

  const jouee = paquet[index]
  if (jouee === undefined) return <PartieVide jeu={jeu} onQuitter={onQuitter} />

  const derniere = index + 1 >= paquet.length
  // La consigne du jeu passe par le même moteur que les cartes (gorgées ou gages).
  const consigne = consigneDeLaCarte(jeu, jouee, reglages)

  return (
    <CadrePartie
      jeu={jeu}
      joueurs={joueurs}
      reglages={reglages}
      etape={index + 1}
      total={paquet.length}
      onTerminer={() => terminer(indexMax + 1)}
      onQuitter={onQuitter}
      onPrecedent={index === 0 ? null : () => setIndex(index - 1)}
      tailleGage={jouee.penalite?.taille}
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
