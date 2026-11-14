import { useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { TexteCarte } from '../composants/TexteCarte'
import { cartesDuJeu } from '../contenu'
import { jouerSon, vibrer } from '../effets/sons'
import type { PropsPartie } from '../ecrans/Partie'
import { construirePaquet } from '../moteur/cartes'
import { sanctionPerdant } from '../moteur/manches'
import { calculerStats } from '../moteur/recap'
import type { CarteJouee, Joueur } from '../types'
import { cartesVues, noterCartesVues } from './memoire'

const NB_DUELS = 12

/** Duel : deux joueurs s'affrontent, on touche le prénom du gagnant, le perdant trinque. */
export function JeuDuel({ jeu, joueurs, reglages, onQuitter, onFin }: PropsPartie) {
  const [paquet] = useState(() =>
    construirePaquet(cartesDuJeu(jeu.id), joueurs, reglages, {
      taille: NB_DUELS,
      dejaVues: cartesVues(jeu.id),
    }),
  )
  const [index, setIndex] = useState(0)
  const [verdicts, setVerdicts] = useState<CarteJouee[]>([])
  // Verdict du duel en cours (null tant qu'on n'a pas désigné le gagnant).
  const [verdict, setVerdict] = useState<CarteJouee | null>(null)

  const duel = paquet[index]
  if (duel === undefined) return <PartieVide jeu={jeu} onQuitter={onQuitter} />

  function terminer(tous: CarteJouee[]) {
    noterCartesVues(
      jeu.id,
      paquet.slice(0, index + 1).map((jouee) => jouee.carte.id),
    )
    onFin(calculerStats(tous))
  }

  function designerGagnant(gagnant: Joueur) {
    const perdant = duel.joueurs.find((j) => j.id !== gagnant.id)
    if (perdant === undefined) return
    jouerSon('victoire')
    vibrer([40, 40, 100])
    setVerdict(sanctionPerdant(duel.carte, perdant, [gagnant], reglages))
  }

  function duelSuivant() {
    if (verdict === null) return
    const tous = [...verdicts, verdict]
    if (index + 1 >= paquet.length) {
      terminer(tous)
      return
    }
    jouerSon('carte')
    setVerdicts(tous)
    setVerdict(null)
    setIndex(index + 1)
  }

  const [premier, second] = duel.joueurs

  return (
    <CadrePartie
      jeu={jeu}
      joueurs={joueurs}
      reglages={reglages}
      etape={index + 1}
      total={paquet.length}
      onTerminer={() => terminer(verdict ? [...verdicts, verdict] : verdicts)}
      onQuitter={onQuitter}
    >
      <div
        key={duel.carte.id}
        className="anim-retournement lueur flex min-h-0 flex-1 flex-col rounded-[2rem] bg-linear-to-b from-surface-2 to-surface p-6"
      >
        <p className="font-titre flex items-center justify-center gap-3 text-center text-xl font-black">
          <span className="texte-neon min-w-0 truncate">{premier?.prenom}</span>
          <span aria-hidden="true" className="text-3xl">
            ⚔️
          </span>
          <span className="texte-neon min-w-0 truncate">{second?.prenom}</span>
        </p>
        <p className="my-auto py-4 text-[1.45rem] leading-snug font-semibold">
          <TexteCarte segments={duel.segments} />
        </p>

        <div aria-live="polite">
          {verdict === null ? (
            <div className="grid gap-2">
              <p className="text-center text-sm text-texte-doux">
                Qui a gagné ? Touchez son prénom.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {duel.joueurs.map((joueur) => (
                  <Bouton
                    key={joueur.id}
                    variante="contour"
                    className="truncate normal-case"
                    onClick={() => designerGagnant(joueur)}
                  >
                    🏆 {joueur.prenom}
                  </Bouton>
                ))}
              </div>
            </div>
          ) : (
            <div className="anim-apparition grid gap-3">
              <p className="rounded-2xl bg-nuit/60 p-3 text-center text-xl font-semibold">
                <TexteCarte segments={verdict.segments} />
              </p>
              <Bouton onClick={duelSuivant}>
                {index + 1 >= paquet.length ? 'Voir le récap' : 'Duel suivant'}
              </Bouton>
            </div>
          )}
        </div>
      </div>
    </CadrePartie>
  )
}
