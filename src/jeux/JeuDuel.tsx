import { useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { ChoixJoueur } from '../composants/ChoixJoueur'
import { TexteCarte } from '../composants/TexteCarte'
import { cartesDuJeu } from '../contenu'
import { useGardeToucher } from '../effets/garde'
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

  // « Duel suivant » prend la place des prénoms : il ignore un double tap.
  const suiteTropTot = useGardeToucher(verdict)
  // Un duel qui vient d'arriver ne se tranche pas d'un toucher fortuit.
  const choixTropTot = useGardeToucher(index)

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
    if (perdant === undefined || choixTropTot()) return
    jouerSon('victoire')
    vibrer([40, 40, 100])
    setVerdict(sanctionPerdant(duel.carte, perdant, [gagnant], reglages))
  }

  function duelSuivant() {
    if (verdict === null || suiteTropTot()) return
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
        className="anim-retournement lueur flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[2rem] bg-linear-to-b from-surface-2 to-surface p-6"
      >
        {/* Les deux prénoms en entier, l'un au-dessus de l'autre : c'est l'info principale. */}
        <p className="font-titre grid justify-items-center gap-1 text-center text-[clamp(1.4rem,7vw,2rem)] leading-none font-black">
          <span className="texte-neon [overflow-wrap:anywhere]">{premier?.prenom}</span>
          <span aria-hidden="true" className="text-2xl">
            ⚔️
          </span>
          <span className="sr-only">contre</span>
          <span className="texte-neon [overflow-wrap:anywhere]">{second?.prenom}</span>
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
              <ChoixJoueur joueurs={duel.joueurs} onChoisir={designerGagnant} />
            </div>
          ) : (
            <div className="anim-apparition grid gap-3">
              <p className="rounded-2xl bg-nuit/60 p-3 text-center text-xl font-semibold">
                <TexteCarte segments={verdict.segments} />
              </p>
              <Bouton onClick={duelSuivant}>
                {index + 1 >= paquet.length ? 'Voir le récap' : 'Duel suivant'}
              </Bouton>
              <Bouton variante="discret" onClick={() => setVerdict(null)}>
                Pas le bon gagnant ? Corriger
              </Bouton>
            </div>
          )}
        </div>
      </div>
    </CadrePartie>
  )
}
