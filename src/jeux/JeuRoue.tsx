import { useEffect, useMemo, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { TexteCarte } from '../composants/TexteCarte'
import { cartesDuJeu } from '../contenu'
import { jouerSon, vibrer } from '../effets/sons'
import type { PropsPartie } from '../ecrans/Partie'
import { filtrerCartes, rendreCarte } from '../moteur/cartes'
import { angleRoue, tirerAction } from '../moteur/manches'
import { calculerStats } from '../moteur/recap'
import type { CarteJouee } from '../types'

const NB_TOURS = 15
const DUREE_ROTATION_MS = 4200
const INTERVALLE_TIC_MS = 140
const RAYON = 100
/** Couleurs des parts, dans l'ordre. */
const COULEURS = ['#ff3d9a', '#2ef2ff', '#ffe14d', '#5dff9b', '#b57bff', '#ff8a3d']

type Phase = 'attente' | 'rotation' | 'action'

/** Point du cercle à un angle donné (0° = en haut, sens horaire). */
function point(angleDeg: number, rayon: number): string {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return `${(rayon * Math.cos(rad)).toFixed(2)} ${(rayon * Math.sin(rad)).toFixed(2)}`
}

/** La Roue : elle désigne un joueur, puis une action tombe pour lui. */
export function JeuRoue({ jeu, joueurs, reglages, onQuitter, onFin }: PropsPartie) {
  const cartes = useMemo(
    () => filtrerCartes(cartesDuJeu(jeu.id), joueurs, reglages),
    [jeu.id, joueurs, reglages],
  )
  const [phase, setPhase] = useState<Phase>('attente')
  const [angle, setAngle] = useState(0)
  const [historique, setHistorique] = useState<CarteJouee[]>([])
  const [action, setAction] = useState<CarteJouee | null>(null)

  // Pendant la rotation : petit « tic », puis révélation de l'action à l'arrêt.
  useEffect(() => {
    if (phase !== 'rotation') return
    const tic = setInterval(() => jouerSon('tic'), INTERVALLE_TIC_MS)
    const arret = setTimeout(() => {
      jouerSon('victoire')
      vibrer([40, 40, 80])
      setPhase('action')
    }, DUREE_ROTATION_MS)
    return () => {
      clearInterval(tic)
      clearTimeout(arret)
    }
  }, [phase])

  if (cartes.length === 0) return <PartieVide jeu={jeu} onQuitter={onQuitter} />

  const part = 360 / joueurs.length
  const tour = Math.min(NB_TOURS, Math.max(1, historique.length))

  function lancer() {
    if (phase === 'rotation') return
    const dejaTirees = new Set(historique.map((h) => h.carte.id))
    // On tire parmi les joueurs pour qui il reste au moins une action acceptable.
    const tirages = joueurs
      .map((joueur, index) => ({
        joueur,
        index,
        carte: tirerAction(cartes, joueur, dejaTirees),
      }))
      .filter((tirage) => tirage.carte !== null)
    const tirage = tirages[Math.floor(Math.random() * tirages.length)]
    if (tirage === undefined || tirage.carte === null) return
    const jouee = rendreCarte(tirage.carte, [tirage.joueur], reglages)
    setAngle(angleRoue(tirage.index, joueurs.length, angle))
    setAction(jouee)
    setHistorique([...historique, jouee])
    setPhase('rotation')
    vibrer(30)
  }

  function suite() {
    if (historique.length >= NB_TOURS) {
      onFin(calculerStats(historique))
      return
    }
    lancer()
  }

  return (
    <CadrePartie
      jeu={jeu}
      joueurs={joueurs}
      reglages={reglages}
      etape={tour}
      total={NB_TOURS}
      onTerminer={() => onFin(calculerStats(historique))}
      onQuitter={onQuitter}
    >
      <div className="flex flex-1 flex-col items-center gap-4">
        <div className="relative w-full max-w-[19rem]">
          {/* Flèche fixe en haut de la roue */}
          <span
            aria-hidden="true"
            className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 text-3xl drop-shadow-[0_0_8px_var(--accent)]"
          >
            🔻
          </span>
          <button
            type="button"
            onClick={lancer}
            disabled={phase === 'rotation'}
            aria-label="Lancer la roue"
            className="block w-full rounded-full"
          >
            <svg
              viewBox="-106 -106 212 212"
              className="w-full drop-shadow-[0_0_18px_color-mix(in_oklab,var(--accent)_60%,transparent)]"
              style={{
                transform: `rotate(${angle}deg)`,
                transition:
                  phase === 'rotation'
                    ? `transform ${DUREE_ROTATION_MS}ms cubic-bezier(0.12, 0.75, 0.18, 1)`
                    : 'none',
              }}
            >
              {joueurs.map((joueur, index) => {
                const debut = index * part
                const fin = debut + part
                const grandArc = part > 180 ? 1 : 0
                return (
                  <g key={joueur.id}>
                    <path
                      d={`M0 0 L${point(debut, RAYON)} A${RAYON} ${RAYON} 0 ${grandArc} 1 ${point(fin, RAYON)} Z`}
                      fill={COULEURS[index % COULEURS.length]}
                      stroke="#0d0718"
                      strokeWidth="2"
                    />
                    <text
                      transform={`rotate(${debut + part / 2 - 90}) translate(${RAYON * 0.58} 0)`}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={joueurs.length > 8 ? 9 : 12}
                      fontWeight="800"
                      fill="#0d0718"
                    >
                      {joueur.prenom.length > 10
                        ? `${joueur.prenom.slice(0, 9)}…`
                        : joueur.prenom}
                    </text>
                  </g>
                )
              })}
              <circle r="14" fill="#0d0718" stroke="#f7f1ff" strokeWidth="3" />
            </svg>
          </button>
        </div>

        <div className="flex w-full flex-1 flex-col justify-center" aria-live="polite">
          {phase === 'attente' ? (
            <Bouton onClick={lancer}>Lancer la roue</Bouton>
          ) : null}
          {phase === 'rotation' ? (
            <p className="font-titre anim-pulsation text-center text-xl font-bold text-accent uppercase">
              Ça tourne…
            </p>
          ) : null}
          {phase === 'action' && action ? (
            <div className="anim-apparition grid gap-3">
              <p className="rounded-3xl bg-surface p-4 text-xl leading-snug font-semibold">
                <TexteCarte segments={action.segments} />
              </p>
              <Bouton onClick={suite}>
                {historique.length >= NB_TOURS ? 'Voir le récap' : 'Relancer la roue'}
              </Bouton>
            </div>
          ) : null}
        </div>
      </div>
    </CadrePartie>
  )
}
