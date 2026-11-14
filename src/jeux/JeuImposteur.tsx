import { useCallback, useEffect, useState } from 'react'
import { Bouton } from '../composants/Bouton'
import { CadrePartie, PartieVide } from '../composants/CadrePartie'
import { ChoixJoueur } from '../composants/ChoixJoueur'
import { Fenetre } from '../composants/Fenetre'
import { MotSecret } from '../composants/MotSecret'
import { PasseTelephone } from '../composants/PasseTelephone'
import { PAIRES_IMPOSTEUR } from '../contenu'
import type { PropsPartie } from '../ecrans/Partie'
import { jouerSon, vibrer } from '../effets/sons'
import {
  DUREE_DEBAT_S,
  NB_MANCHES,
  choisirPaire,
  compterImposteurs,
  designerPourGage,
  motDuJoueur,
  nbToursDeMots,
  preparerManche,
  rendreVerdict,
  statsImposteur,
  type Manche,
  type ResultatManche,
  type Verdict,
} from '../moteur/imposteur'
import type { Joueur, PaireMots } from '../types'
import { cartesVues, noterCartesVues } from './memoire'
import { RevelationImposteur } from './RevelationImposteur'

/** Les écrans d'une manche, dans l'ordre. */
type Phase = 'annonce' | 'passage' | 'mot' | 'parole' | 'vote' | 'revelation'

/** « Revoir mon mot » : fermé, choix du prénom, ou joueur choisi. */
type Revoir = null | 'choix' | Joueur

/** Dernières secondes du débat : le chrono bat et fait tic. */
const SEUIL_URGENCE_S = 10
/** Délai avant de pouvoir confirmer l'accusation, contre le double tap. */
const DELAI_CONFIRMATION_MS = 600

function minutesSecondes(secondes: number): string {
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`
}

/** L'Imposteur : un mot secret chacun, un débat, un vote. */
export function JeuImposteur({ jeu, joueurs, reglages, onQuitter, onFin }: PropsPartie) {
  const nouvelleManche = useCallback(
    (
      rang: number,
      utilisees: readonly PaireMots[],
      passees: readonly ResultatManche[],
    ): Manche | null => {
      const paire = choisirPaire(PAIRES_IMPOSTEUR, joueurs, reglages, {
        rang,
        utilisees,
        dejaVues: cartesVues(jeu.id),
      })
      if (paire === null) return null
      return preparerManche(paire, joueurs, rang, compterImposteurs(passees))
    },
    [jeu.id, joueurs, reglages],
  )

  const [resultats, setResultats] = useState<ResultatManche[]>([])
  // Paires sorties dans cette partie, manches annulées comprises.
  const [utilisees, setUtilisees] = useState<PaireMots[]>([])
  const [manche, setManche] = useState(() => nouvelleManche(0, [], []))
  const [phase, setPhase] = useState<Phase>('annonce')
  // Rang, dans l'ordre de passage, du joueur qui a le téléphone.
  const [rangJoueur, setRangJoueur] = useState(0)
  const [motVu, setMotVu] = useState(false)
  // Secondes de débat restantes (null tant que le débat n'est pas lancé).
  const [resteS, setResteS] = useState<number | null>(null)
  const [revoir, setRevoir] = useState<Revoir>(null)
  // Le joueur choisi a confirmé qu'il tient le téléphone : on peut montrer son mot.
  const [revoirConfirme, setRevoirConfirme] = useState(false)
  const [enPause, setEnPause] = useState(false)
  const [accusationPrete, setAccusationPrete] = useState(false)
  const [suspect, setSuspect] = useState<Joueur | null>(null)
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  const noterVu = useCallback(() => setMotVu(true), [])
  const fermerRevoir = useCallback(() => {
    setRevoir(null)
    setRevoirConfirme(false)
  }, [])
  const fermerSuspect = useCallback(() => setSuspect(null), [])

  const ouvrirVote = useCallback(() => {
    jouerSon('vote')
    vibrer([80, 60, 80])
    fermerRevoir()
    setPhase('vote')
  }, [fermerRevoir])

  // Compte à rebours du débat (gelé pendant la pause).
  useEffect(() => {
    if (phase !== 'parole' || resteS === null || enPause) return
    const minuteur = setTimeout(() => {
      if (resteS <= 1) {
        ouvrirVote()
        return
      }
      if (resteS - 1 <= SEUIL_URGENCE_S) jouerSon('tic')
      setResteS(resteS - 1)
    }, 1000)
    return () => clearTimeout(minuteur)
  }, [phase, resteS, enPause, ouvrirVote])

  // Le bouton « Oui, on accuse » s'active après un court délai.
  useEffect(() => {
    if (suspect === null) return
    const minuteur = setTimeout(() => setAccusationPrete(true), DELAI_CONFIRMATION_MS)
    return () => {
      clearTimeout(minuteur)
      setAccusationPrete(false)
    }
  }, [suspect])

  if (manche === null) return <PartieVide jeu={jeu} onQuitter={onQuitter} />

  const rang = resultats.length
  const joueurCourant = manche.ordre[rangJoueur]

  function demarrer(suivante: Manche | null) {
    setManche(suivante)
    setPhase('annonce')
    setRangJoueur(0)
    setMotVu(false)
    setResteS(null)
    fermerRevoir()
    setSuspect(null)
    setVerdict(null)
  }

  function joueurSuivant() {
    setMotVu(false)
    if (rangJoueur + 1 < manche!.ordre.length) {
      setRangJoueur(rangJoueur + 1)
      setPhase('passage')
      return
    }
    jouerSon('carte')
    setPhase('parole')
  }

  function accuser(accuse: Joueur) {
    const rendu = rendreVerdict(manche!, accuse.id, joueurs, reglages)
    if (rendu === null) return
    setSuspect(null)
    setVerdict(rendu)
    setPhase('revelation')
  }

  function mancheSuivante() {
    if (verdict === null) return
    const tous = [...resultats, { manche: manche!, verdict }]
    const sorties = [...utilisees, manche!.paire]
    noterCartesVues(jeu.id, [manche!.paire.id])
    const suivante =
      tous.length >= NB_MANCHES ? null : nouvelleManche(tous.length, sorties, tous)
    if (suivante === null) {
      onFin(statsImposteur(tous, joueurs))
      return
    }
    setResultats(tous)
    setUtilisees(sorties)
    demarrer(suivante)
  }

  /** « Terminer la partie » : une manche dont le verdict est tombé compte dans le récap. */
  function terminer() {
    if (phase !== 'revelation' || verdict === null) {
      onFin(statsImposteur(resultats, joueurs))
      return
    }
    noterCartesVues(jeu.id, [manche!.paire.id])
    onFin(statsImposteur([...resultats, { manche: manche!, verdict }], joueurs))
  }

  /** Mot crié par erreur : on repart sur une nouvelle paire, sans gorgée ni manche comptée. */
  function annulerManche() {
    const sorties = [...utilisees, manche!.paire]
    const suivante = nouvelleManche(rang, sorties, resultats)
    if (suivante === null) {
      onFin(statsImposteur(resultats, joueurs))
      return
    }
    setUtilisees(sorties)
    demarrer(suivante)
  }

  /** Pied fixe du débat : le chrono et « On vote » restent visibles même à 12 joueurs. */
  function piedDebat() {
    if (phase !== 'parole') return undefined
    if (resteS === null) {
      return (
        <Bouton onClick={() => setResteS(DUREE_DEBAT_S)}>
          Tout le monde a parlé : on débat
        </Bouton>
      )
    }
    return (
      <div className="grid grid-cols-[auto_1fr] items-center gap-3">
        <p
          role="timer"
          className={`font-titre texte-neon text-3xl font-black tabular-nums ${
            resteS <= SEUIL_URGENCE_S ? 'anim-pulsation' : ''
          }`}
        >
          {minutesSecondes(resteS)}
        </p>
        <Bouton onClick={ouvrirVote}>On vote</Bouton>
      </div>
    )
  }

  function contenu() {
    switch (phase) {
      case 'annonce': {
        const nb = manche!.imposteurs.length
        return (
          <div className="anim-apparition m-auto grid w-full gap-5 text-center">
            <p className="font-titre text-sm tracking-widest text-texte-doux uppercase">
              Manche {rang + 1} / {NB_MANCHES}
            </p>
            <p className="anim-pulsation text-7xl" aria-hidden="true">
              🕵️
            </p>
            <p className="font-titre texte-neon text-3xl leading-tight font-black uppercase">
              {nb > 1 ? `${nb} imposteurs` : '1 imposteur'} parmi vous
            </p>
            <p className="text-texte-doux">
              Chacun va voir son mot en secret. Passez-vous le téléphone dans
              l’ordre annoncé, en commençant par{' '}
              <strong className="text-texte">{manche!.ordre[0]?.prenom}</strong>.
            </p>
            <Bouton onClick={() => setPhase('passage')}>Distribuer les mots</Bouton>
          </div>
        )
      }
      case 'passage':
        return (
          <PasseTelephone
            key={joueurCourant?.id}
            prenom={joueurCourant?.prenom ?? ''}
            onPret={() => setPhase('mot')}
          />
        )
      case 'mot':
        return (
          <div className="m-auto grid w-full gap-5 text-center">
            <p className="font-titre texte-neon text-2xl font-black break-words">
              Mot de {joueurCourant?.prenom}
            </p>
            <MotSecret
              mot={motDuJoueur(manche!, joueurCourant?.id ?? '')}
              onVu={noterVu}
            />
            <p className="text-sm text-texte-doux">
              Cache l’écran. Ne dis rien : tu es peut-être l’imposteur.
            </p>
            <Bouton disabled={!motVu} onClick={joueurSuivant}>
              Mot mémorisé, je passe
            </Bouton>
          </div>
        )
      case 'parole': {
        const tours = nbToursDeMots(joueurs.length)
        return (
          <div className="anim-apparition flex flex-1 flex-col gap-4">
            <p className="text-center text-lg">
              Chacun dit <strong>un seul mot</strong> en lien avec le sien.
              <span className="block text-sm text-texte-doux">
                Interdits : ton mot, un mot de la même famille, un mot déjà dit.{' '}
                {tours > 1 ? `${tours} tours de table.` : 'Un seul tour de table.'}
              </span>
            </p>
            <ol className="grid grid-cols-2 gap-2">
              {manche!.ordre.map((joueur, index) => (
                <li
                  key={joueur.id}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
                    index === 0 ? 'lueur bg-surface-2' : 'bg-surface'
                  }`}
                >
                  <span className="font-titre text-xs text-texte-doux tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]">
                    {joueur.prenom}
                  </span>
                </li>
              ))}
            </ol>
            <Bouton
              variante="discret"
              className="mt-auto"
              onClick={() => setRevoir('choix')}
            >
              Revoir mon mot
            </Bouton>
          </div>
        )
      }
      case 'vote':
        return (
          <div className="anim-apparition flex flex-1 flex-col gap-4">
            <p className="font-titre texte-neon text-center text-xl leading-tight font-black uppercase">
              Qui est l’imposteur&nbsp;?
            </p>
            <p className="text-center text-texte-doux">
              Mettez-vous d’accord, touchez un prénom.
            </p>
            <ChoixJoueur joueurs={manche!.ordre} onChoisir={setSuspect} />
          </div>
        )
      case 'revelation':
        return verdict === null ? null : (
          <RevelationImposteur
            manche={manche!}
            verdict={verdict}
            joueurs={joueurs}
            derniere={rang + 1 >= NB_MANCHES}
            onDesigner={(joueur) => setVerdict(designerPourGage(verdict, joueur))}
            onSuite={mancheSuivante}
          />
        )
    }
  }

  return (
    <CadrePartie
      jeu={jeu}
      joueurs={joueurs}
      reglages={reglages}
      etape={rang + 1}
      total={NB_MANCHES}
      sansGage={phase !== 'revelation'}
      actionPied={piedDebat()}
      onPause={setEnPause}
      actionsPause={(demander) =>
        // Plus d'annulation une fois le vote ouvert : ce serait une échappatoire.
        phase === 'vote' || phase === 'revelation' ? null : (
          <Bouton
            variante="contour"
            onClick={() =>
              demander({
                titre: 'Annuler la manche ?',
                detail: 'Nouveaux mots, rien n’est compté.',
                oui: 'Oui, annuler',
                action: annulerManche,
              })
            }
          >
            Annuler la manche
          </Bouton>
        )
      }
      onTerminer={terminer}
      onQuitter={onQuitter}
    >
      {contenu()}

      {revoir === 'choix' ? (
        <Fenetre titre="Qui veut revoir son mot ?" onFermer={fermerRevoir}>
          <ChoixJoueur joueurs={manche.ordre} onChoisir={setRevoir} />
        </Fenetre>
      ) : null}
      {revoir !== null && revoir !== 'choix' && !revoirConfirme ? (
        <Fenetre titre={`Passe le téléphone à ${revoir.prenom}`} onFermer={fermerRevoir}>
          <div className="grid gap-2">
            <Bouton onClick={() => setRevoirConfirme(true)}>C’est moi</Bouton>
            <Bouton variante="discret" onClick={fermerRevoir}>
              Mauvais prénom
            </Bouton>
          </div>
        </Fenetre>
      ) : null}
      {revoir !== null && revoir !== 'choix' && revoirConfirme ? (
        <Fenetre titre={`Mot de ${revoir.prenom}`} onFermer={fermerRevoir}>
          <div className="grid gap-3">
            <p className="text-center text-sm text-texte-doux">
              Cache l’écran avec ta main.
            </p>
            <MotSecret mot={motDuJoueur(manche, revoir.id)} onVu={noterVu} />
            <Bouton onClick={fermerRevoir}>J’ai caché mon mot</Bouton>
          </div>
        </Fenetre>
      ) : null}

      {suspect !== null ? (
        <Fenetre titre={`Accuser ${suspect.prenom} ?`} onFermer={fermerSuspect}>
          <div className="grid gap-2">
            <Bouton disabled={!accusationPrete} onClick={() => accuser(suspect)}>
              Oui, on accuse
            </Bouton>
            <Bouton variante="discret" onClick={fermerSuspect}>
              Annuler
            </Bouton>
          </div>
        </Fenetre>
      ) : null}
    </CadrePartie>
  )
}
