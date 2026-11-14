import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { GAGES } from '../contenu'
import { reglesDuJeu, type DefinitionJeu } from '../jeux/catalogue'
import { useEcranAllume } from '../effets/ecran'
import { useRetourEnPartie } from '../effets/retour'
import { gagesAutorises, tirerGage } from '../moteur/gages'
import type { Joueur, Reglages } from '../types'
import { Bouton } from './Bouton'
import { Cadre } from './Cadre'
import { Fenetre } from './Fenetre'

/** Question posée avant une action qui fait perdre quelque chose. */
export interface Confirmation {
  titre: string
  detail: string
  /** Texte du bouton qui confirme (ex. « Oui, terminer »). */
  oui: string
  action: () => void
}

interface Props {
  jeu: DefinitionJeu
  joueurs: Joueur[]
  reglages: Reglages
  /** Numéro de la manche en cours (à partir de 1) et nombre total. */
  etape: number
  total: number
  children: ReactNode
  /** Bouton supplémentaire affiché à côté de « Gage » (ex. décompte 3-2-1). */
  actionPied?: ReactNode
  /** Boutons propres au jeu dans la fenêtre de pause ; `demander` ouvre une confirmation. */
  actionsPause?: (demander: (confirmation: Confirmation) => void) => ReactNode
  /** Prévenu quand la pause s'ouvre ou se ferme (pour geler un minuteur). */
  onPause?: (enPause: boolean) => void
  /** Revenir à la carte précédente (jeux de cartes) ; `null` quand on est sur la première. */
  onPrecedent?: (() => void) | null
  /** Masque le bouton « Gage » (ex. pendant qu'on se passe le téléphone en secret). */
  sansGage?: boolean
  /** « Terminer la partie » depuis la pause : va au récap. */
  onTerminer: () => void
  /** Quitter sans récap. */
  onQuitter: () => void
}

/**
 * Habillage commun à tous les jeux : barre d'avancement, bouton pause,
 * tirage de gage. Chaque jeu n'a plus qu'à fournir son contenu.
 */
export function CadrePartie({
  jeu,
  joueurs,
  reglages,
  etape,
  total,
  children,
  actionPied,
  actionsPause,
  sansGage = false,
  onPrecedent,
  onPause,
  onTerminer,
  onQuitter,
}: Props) {
  const [enPause, setEnPause] = useState(false)
  const [gage, setGage] = useState<string | null>(null)
  const gages = useMemo(
    () => gagesAutorises(GAGES, joueurs, reglages),
    [joueurs, reglages],
  )
  const [aConfirmer, setAConfirmer] = useState<Confirmation | null>(null)
  const [reglesOuvertes, setReglesOuvertes] = useState(false)
  // Le téléphone reste posé sur la table pendant qu'on discute : l'écran ne doit pas s'éteindre.
  useEcranAllume(true)
  const ouvrirPause = () => {
    setEnPause(true)
    onPause?.(true)
  }
  const fermerPause = useCallback(() => {
    setEnPause(false)
    setAConfirmer(null)
    setReglesOuvertes(false)
    onPause?.(false)
  }, [onPause])
  const fermerGage = useCallback(() => setGage(null), [])
  // Bouton retour du téléphone : ouvre la pause (ou la referme), jamais de sortie brutale.
  useRetourEnPartie(() => {
    if (gage !== null) fermerGage()
    else if (enPause) fermerPause()
    else ouvrirPause()
  })

  const nbActions = (actionPied ? 1 : 0) + (sansGage ? 0 : 1)
  const colonnesPied =
    onPrecedent === undefined
      ? nbActions === 2
        ? 'grid-cols-2'
        : ''
      : nbActions === 2
        ? 'grid-cols-[3.5rem_1fr_1fr]'
        : 'grid-cols-[3.5rem_1fr]'

  return (
    <Cadre
      titre={jeu.nom}
      couleur={jeu.couleur}
      onRetour={ouvrirPause}
      iconeRetour="⏸"
      libelleRetour="Mettre en pause"
      pied={
        sansGage && !actionPied && onPrecedent === undefined ? undefined : (
          <div className={`grid gap-2 ${colonnesPied}`}>
            {onPrecedent === undefined ? null : (
              <Bouton
                variante="contour"
                aria-label="Carte précédente"
                disabled={onPrecedent === null}
                className="px-0!"
                onClick={() => onPrecedent?.()}
              >
                ←
              </Bouton>
            )}
            {actionPied}
            {sansGage ? null : (
              <Bouton
                variante="contour"
                onClick={() => setGage(tirerGage(gages, gage))}
              >
                🎭 Gage
              </Bouton>
            )}
          </div>
        )
      }
    >
      <div
        className="mb-3 flex items-center gap-3"
        role="progressbar"
        aria-label="Avancement de la partie"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={etape}
      >
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full origin-left rounded-full bg-accent transition-transform duration-300"
            style={{ transform: `scaleX(${etape / total})` }}
          />
        </div>
        <span className="text-sm text-texte-doux tabular-nums">
          {etape} / {total}
        </span>
      </div>

      {children}

      {enPause && reglesOuvertes ? (
        <Fenetre titre="Les règles" onFermer={fermerPause}>
          <ol className="grid gap-3 pb-5 text-lg">
            {reglesDuJeu(jeu, reglages.sansAlcool).map((regle, numero) => (
              <li key={regle} className="flex gap-3">
                <span className="font-titre font-bold text-accent">{numero + 1}</span>
                <span>{regle}</span>
              </li>
            ))}
          </ol>
          <Bouton onClick={() => setReglesOuvertes(false)}>Retour à la pause</Bouton>
        </Fenetre>
      ) : null}

      {enPause && !reglesOuvertes && aConfirmer === null ? (
        <Fenetre titre="Pause" onFermer={fermerPause}>
          <div className="grid gap-2">
            <Bouton onClick={fermerPause}>Reprendre</Bouton>
            <Bouton variante="contour" onClick={() => setReglesOuvertes(true)}>
              Revoir les règles
            </Bouton>
          </div>
          {/* Les actions qui font perdre quelque chose sont à l'écart et se confirment. */}
          <div className="mt-4 grid gap-2 border-t border-trait pt-4">
            {actionsPause?.(setAConfirmer)}
            <Bouton
              variante="contour"
              onClick={() =>
                setAConfirmer({
                  titre: 'Terminer la partie ?',
                  detail: 'Vous passez au récap.',
                  oui: 'Oui, terminer',
                  action: onTerminer,
                })
              }
            >
              Terminer la partie
            </Bouton>
            <Bouton
              variante="discret"
              onClick={() =>
                setAConfirmer({
                  titre: 'Quitter sans récap ?',
                  detail: 'La partie en cours sera perdue.',
                  oui: 'Oui, quitter',
                  action: onQuitter,
                })
              }
            >
              Quitter sans récap
            </Bouton>
          </div>
        </Fenetre>
      ) : null}

      {enPause && !reglesOuvertes && aConfirmer !== null ? (
        <Fenetre titre={aConfirmer.titre} onFermer={fermerPause}>
          <p className="pb-5 text-center text-lg text-texte-doux">
            {aConfirmer.detail}
          </p>
          <div className="grid gap-2">
            <Bouton onClick={fermerPause}>Non, reprendre</Bouton>
            <Bouton
              variante="contour"
              onClick={() => {
                fermerPause()
                aConfirmer.action()
              }}
            >
              {aConfirmer.oui}
            </Bouton>
          </div>
        </Fenetre>
      ) : null}

      {gage !== null ? (
        <Fenetre titre="Gage" onFermer={fermerGage}>
          <p className="pb-5 text-center text-2xl leading-snug font-semibold">
            {gage}
          </p>
          <div className="grid gap-2">
            <Bouton onClick={fermerGage}>C’est fait</Bouton>
            <Bouton
              variante="discret"
              onClick={() => setGage(tirerGage(gages, gage))}
            >
              Un autre gage
            </Bouton>
          </div>
        </Fenetre>
      ) : null}
    </Cadre>
  )
}

interface PropsVide {
  jeu: DefinitionJeu
  onQuitter: () => void
}

/** Message affiché quand aucune carte ne passe le filtre des réglages. */
export function PartieVide({ jeu, onQuitter }: PropsVide) {
  useRetourEnPartie(onQuitter)
  return (
    <Cadre titre={jeu.nom} couleur={jeu.couleur} onRetour={onQuitter}>
      <div className="m-auto grid gap-4 text-center">
        <p className="text-5xl" aria-hidden="true">
          🫥
        </p>
        <p className="text-lg text-texte-doux">
          Aucune carte ne correspond à vos réglages et à vos profils. Essayez un
          autre ton ou une autre intensité.
        </p>
        <Bouton variante="contour" onClick={onQuitter}>
          Changer de jeu
        </Bouton>
      </div>
    </Cadre>
  )
}
