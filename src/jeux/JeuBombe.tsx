import { useEffect, useRef, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { ChoixJoueur } from '../composants/ChoixJoueur'
import { TexteCarte } from '../composants/TexteCarte'
import { cartesDuJeu } from '../contenu'
import { useGardeToucher } from '../effets/garde'
import { jouerSon, vibrer } from '../effets/sons'
import type { PropsPartie } from '../ecrans/Partie'
import { construirePaquet } from '../moteur/cartes'
import { dureeMeche, sanctionPerdant } from '../moteur/manches'
import { calculerStats } from '../moteur/recap'
import type { CarteJouee, Joueur } from '../types'
import { cartesVues, noterCartesVues } from './memoire'

const NB_MANCHES = 8
/** Le tic-tac s'accélère : d'un tic par seconde au début à quatre par seconde à la fin. */
const TIC_LENT_MS = 1000
const TIC_RAPIDE_MS = 250

type Phase = 'pret' | 'meche' | 'explosion' | 'verdict'

/** La Bombe : une catégorie, un minuteur caché, et ça explose dans les mains de quelqu'un. */
export function JeuBombe({ jeu, joueurs, reglages, onQuitter, onFin }: PropsPartie) {
  const [paquet] = useState(() =>
    construirePaquet(cartesDuJeu(jeu.id), joueurs, reglages, {
      taille: NB_MANCHES,
      dejaVues: cartesVues(jeu.id),
    }),
  )
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('pret')
  const [verdicts, setVerdicts] = useState<CarteJouee[]>([])
  const [verdict, setVerdict] = useState<CarteJouee | null>(null)

  const [enPause, setEnPause] = useState(false)
  // Durée totale de la mèche et temps qu'il lui reste (gelé pendant la pause).
  const meche = useRef({ duree: 0, restant: 0 })
  // Le bouton de suite prend la place des prénoms : il ignore un double tap.
  const suiteTropTot = useGardeToucher(phase)

  // Mèche allumée : tic-tac de plus en plus rapide, puis explosion. La pause gèle tout.
  useEffect(() => {
    if (phase !== 'meche' || enPause) return
    const { duree, restant } = meche.current
    const debut = Date.now()
    let prochainTic: ReturnType<typeof setTimeout>

    function tic() {
      jouerSon('tic')
      const ecoule = duree - restant + (Date.now() - debut)
      const avancement = Math.min(1, ecoule / duree)
      const intervalle = TIC_LENT_MS - (TIC_LENT_MS - TIC_RAPIDE_MS) * avancement
      prochainTic = setTimeout(tic, intervalle)
    }
    tic()

    const explosion = setTimeout(() => {
      jouerSon('explosion')
      vibrer([200, 80, 200, 80, 400])
      setPhase('explosion')
    }, restant)

    return () => {
      clearTimeout(prochainTic)
      clearTimeout(explosion)
      meche.current = { duree, restant: Math.max(0, restant - (Date.now() - debut)) }
    }
  }, [phase, enPause])

  const manche = paquet[index]
  if (manche === undefined) return <PartieVide jeu={jeu} onQuitter={onQuitter} />

  function terminer(tous: CarteJouee[]) {
    noterCartesVues(
      jeu.id,
      paquet.slice(0, index + 1).map((jouee) => jouee.carte.id),
    )
    onFin(calculerStats(tous))
  }

  function designerVictime(victime: Joueur) {
    if (suiteTropTot()) return
    setVerdict(sanctionPerdant(manche.carte, victime, [], reglages))
    setPhase('verdict')
  }

  function mancheSuivante() {
    if (verdict === null || suiteTropTot()) return
    const tous = [...verdicts, verdict]
    if (index + 1 >= paquet.length) {
      terminer(tous)
      return
    }
    setVerdicts(tous)
    setVerdict(null)
    setIndex(index + 1)
    setPhase('pret')
  }

  return (
    <CadrePartie
      jeu={jeu}
      joueurs={joueurs}
      reglages={reglages}
      etape={index + 1}
      total={paquet.length}
      onTerminer={() => terminer(verdict ? [...verdicts, verdict] : verdicts)}
      onQuitter={onQuitter}
      onPause={setEnPause}
      sansGage={phase === 'meche'}
    >
      <div
        className={`flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto rounded-[2rem] p-6 text-center transition-colors duration-300 ${
          phase === 'explosion' || phase === 'verdict'
            ? 'bg-neon-rouge/25'
            : 'bg-linear-to-b from-surface-2 to-surface'
        } lueur`}
      >
        <p className="text-sm tracking-wider text-texte-doux uppercase">
          Catégorie
        </p>
        <p className="font-titre text-2xl leading-tight font-black text-accent">
          <TexteCarte segments={manche.segments} />
        </p>

        <div className="my-auto grid place-items-center gap-3" aria-live="assertive">
          {phase === 'pret' ? (
            <>
              <span className="text-8xl" aria-hidden="true">
                💣
              </span>
              <p className="text-texte-doux">
                Une réponse, puis on passe le téléphone à son voisin. Vite.
              </p>
            </>
          ) : null}
          {phase === 'meche' ? (
            <>
              <span className="anim-secousse text-9xl" aria-hidden="true">
                💣
              </span>
              <p className="font-titre anim-pulsation text-xl font-bold uppercase">
                Réponds et passe !
              </p>
            </>
          ) : null}
          {phase === 'explosion' ? (
            <>
              <span className="anim-apparition text-9xl" aria-hidden="true">
                💥
              </span>
              <p className="font-titre text-3xl font-black text-neon-jaune uppercase">
                Boum !
              </p>
            </>
          ) : null}
          {phase === 'verdict' && verdict ? (
            <p className="anim-apparition text-2xl leading-snug font-semibold">
              <TexteCarte segments={verdict.segments} />
            </p>
          ) : null}
        </div>

        <div className="w-full">
          {phase === 'pret' ? (
            <Bouton
              onClick={() => {
                // Même emplacement que « Bombe suivante » : un double tap n'allume pas la mèche.
                if (suiteTropTot()) return
                vibrer(60)
                const duree = dureeMeche()
                meche.current = { duree, restant: duree }
                setPhase('meche')
              }}
            >
              Allumer la mèche
            </Bouton>
          ) : null}
          {phase === 'explosion' ? (
            <div className="grid gap-2">
              <p className="text-sm text-texte-doux">Qui tenait la bombe ?</p>
              <ChoixJoueur joueurs={joueurs} onChoisir={designerVictime} />
            </div>
          ) : null}
          {phase === 'verdict' ? (
            <div className="grid gap-2">
              <Bouton onClick={mancheSuivante}>
                {index + 1 >= paquet.length ? 'Voir le récap' : 'Bombe suivante'}
              </Bouton>
              <Bouton
                variante="discret"
                onClick={() => {
                  setVerdict(null)
                  setPhase('explosion')
                }}
              >
                Pas le bon joueur ? Corriger
              </Bouton>
            </div>
          ) : null}
        </div>
      </div>
    </CadrePartie>
  )
}
