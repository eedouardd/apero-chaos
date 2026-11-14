import { useCallback, useEffect, useMemo, useState } from 'react'
import { ContexteSon } from './composants/ContexteSon'
import { Accueil } from './ecrans/Accueil'
import { Age18 } from './ecrans/Age18'
import { ChoixJeu } from './ecrans/ChoixJeu'
import { Fin } from './ecrans/Fin'
import { Joueurs } from './ecrans/Joueurs'
import { MesCartes } from './ecrans/MesCartes'
import { Partie } from './ecrans/Partie'
import { Reglages } from './ecrans/Reglages'
import { ReglesJeu } from './ecrans/ReglesJeu'
import { useMiseAJour } from './effets/miseAJour'
import { useRetourSysteme } from './effets/retour'
import { definirSonCoupe } from './effets/sons'
import { trouverJeu } from './jeux/catalogue'
import { ageRequis } from './moteur/age'
import { enCartesPerso } from './moteur/cartesPerso'
import { reglagesEffectifs } from './moteur/joueurs'
import { charger, sauvegarder } from './stockage/stockage'
import type { IdJeu, Intensite, Reglages as TypeReglages, StatsPartie, Ton } from './types'

/** Les écrans de l'app, dans l'ordre du parcours. */
type Ecran =
  | 'accueil'
  | 'joueurs'
  | 'reglages'
  | 'age'
  | 'jeux'
  | 'mes-cartes'
  | 'regles'
  | 'partie'
  | 'fin'

const STATS_VIDES: StatsPartie = { cartesJouees: 0, parJoueur: {} }
/** La confirmation « 18 ans ou plus » vaut pour une soirée. */
const DUREE_CONFIRMATION_AGE_MS = 12 * 60 * 60 * 1000

/** Écran où mène le retour (bouton de l'app ou du téléphone). */
const ECRAN_PRECEDENT: Record<Exclude<Ecran, 'accueil' | 'partie'>, Ecran> = {
  joueurs: 'accueil',
  reglages: 'joueurs',
  age: 'reglages',
  jeux: 'joueurs',
  'mes-cartes': 'jeux',
  regles: 'jeux',
  fin: 'jeux',
}

const NOMS_TON: Record<Ton, string> = {
  'tout-public': '😇 Tout public',
  pimente: '🌶️ Pimenté',
  hard: '😈 Hard',
}
const NOMS_INTENSITE: Record<Intensite, string> = { soft: 'Soft', normal: 'Normal', hard: 'Hard' }

function resumer(reglages: TypeReglages): string {
  const boisson = reglages.sansAlcool ? 'Sans alcool' : NOMS_INTENSITE[reglages.intensite]
  return `${NOMS_TON[reglages.ton]} · ${boisson}`
}

function ageEncoreValide(confirmeLe: number | null): boolean {
  if (confirmeLe === null) return false
  const ecoule = Date.now() - confirmeLe
  // Une date dans le futur (horloge changée) ne vaut pas confirmation.
  return ecoule >= 0 && ecoule < DUREE_CONFIRMATION_AGE_MS
}

export default function App() {
  // Lu une seule fois au démarrage.
  const [initial] = useState(charger)

  const [ecran, setEcran] = useState<Ecran>('accueil')
  const [joueurs, setJoueurs] = useState(initial.joueurs)
  const [reglages, setReglages] = useState(initial.reglages)
  const [sonCoupe, setSonCoupe] = useState(initial.sonCoupe)
  const [ageConfirmeLe, setAgeConfirmeLe] = useState(() =>
    ageEncoreValide(initial.ageConfirmeLe) ? initial.ageConfirmeLe : null,
  )
  const [reglagesVus, setReglagesVus] = useState(initial.reglagesVus)
  const [reglesVues, setReglesVues] = useState(initial.reglesVues)
  const [cartesPerso, setCartesPerso] = useState(initial.cartesPerso)
  const [idJeu, setIdJeu] = useState<IdJeu>('defis-verites')
  const [stats, setStats] = useState<StatsPartie>(STATS_VIDES)
  // Change à chaque nouvelle partie pour repartir d'un paquet neuf.
  const [numeroPartie, setNumeroPartie] = useState(0)

  // Sauvegarde automatique de tout ce qui doit survivre à la fermeture de l'app.
  useEffect(() => {
    sauvegarder({
      joueurs,
      reglages,
      sonCoupe,
      ageConfirmeLe,
      reglagesVus,
      reglesVues,
      cartesPerso,
    })
    definirSonCoupe(sonCoupe)
  }, [joueurs, reglages, sonCoupe, ageConfirmeLe, reglagesVus, reglesVues, cartesPerso])

  const basculerSon = useCallback(() => setSonCoupe((coupe) => !coupe), [])
  const contexteSon = useMemo(
    () => ({ sonCoupe, basculerSon }),
    [sonCoupe, basculerSon],
  )

  const miseAJour = useMiseAJour()
  const jeu = trouverJeu(idJeu)
  // Si personne ne boit d'alcool, toute la partie se joue comme en mode Sans alcool.
  const reglagesPartie = useMemo(
    () => reglagesEffectifs(reglages, joueurs),
    [reglages, joueurs],
  )
  const cartesPersoJouables = useMemo(() => enCartesPerso(cartesPerso), [cartesPerso])

  const revenir = useCallback(() => {
    setEcran((actuel) =>
      actuel === 'accueil' || actuel === 'partie' ? actuel : ECRAN_PRECEDENT[actuel],
    )
  }, [])
  useRetourSysteme(ecran !== 'accueil', ecran === 'partie', revenir)

  function lancerPartie() {
    setStats(STATS_VIDES)
    setNumeroPartie((numero) => numero + 1)
    setEcran('partie')
  }

  /** Vers la liste des jeux, en passant par l'avertissement +18 s'il le faut. */
  function versJeux() {
    const ageOk = ageEncoreValide(ageConfirmeLe)
    setEcran(ageRequis(reglagesPartie) && !ageOk ? 'age' : 'jeux')
  }

  function afficherEcran() {
    switch (ecran) {
      case 'accueil':
        return (
          <Accueil
            onNouvellePartie={() => setEcran('joueurs')}
            onMettreAJour={miseAJour.disponible ? miseAJour.installer : undefined}
          />
        )
      case 'joueurs':
        return (
          <Joueurs
            joueurs={joueurs}
            onChange={setJoueurs}
            onRetour={revenir}
            // Un groupe qui a déjà réglé sa soirée va droit aux jeux (réglages modifiables de là-bas).
            onSuivant={() => (reglagesVus ? versJeux() : setEcran('reglages'))}
          />
        )
      case 'reglages':
        return (
          <Reglages
            reglages={reglages}
            onChange={setReglages}
            onRetour={revenir}
            onSuivant={() => {
              setReglagesVus(true)
              versJeux()
            }}
          />
        )
      case 'age':
        return (
          <Age18
            sansAlcool={reglagesPartie.sansAlcool}
            onRetour={revenir}
            onConfirmer={() => {
              setAgeConfirmeLe(Date.now())
              setEcran('jeux')
            }}
          />
        )
      case 'jeux':
        return (
          <ChoixJeu
            joueurs={joueurs}
            sansAlcool={reglagesPartie.sansAlcool}
            resumeReglages={resumer(reglagesPartie)}
            nbCartesPerso={cartesPerso.length}
            onRetour={revenir}
            onReglages={() => setEcran('reglages')}
            onMesCartes={() => setEcran('mes-cartes')}
            onChoisir={(id) => {
              setIdJeu(id)
              // Règles déjà lues : on joue tout de suite (elles restent dans la pause).
              if (reglesVues.includes(id)) lancerPartie()
              else setEcran('regles')
            }}
          />
        )
      case 'mes-cartes':
        return (
          <MesCartes
            cartes={cartesPerso}
            onChange={setCartesPerso}
            onRetour={revenir}
            onJouer={() => {
              setIdJeu('mes-cartes')
              if (reglesVues.includes('mes-cartes')) lancerPartie()
              else setEcran('regles')
            }}
          />
        )
      case 'regles':
        return (
          <ReglesJeu
            jeu={jeu}
            sansAlcool={reglagesPartie.sansAlcool}
            onRetour={revenir}
            onCommencer={() => {
              setReglesVues((vues) => (vues.includes(jeu.id) ? vues : [...vues, jeu.id]))
              lancerPartie()
            }}
          />
        )
      case 'partie':
        return (
          <Partie
            key={numeroPartie}
            jeu={jeu}
            joueurs={joueurs}
            reglages={reglagesPartie}
            cartesPerso={cartesPersoJouables}
            onQuitter={() => setEcran('jeux')}
            onFin={(statsFinales) => {
              setStats(statsFinales)
              setEcran('fin')
            }}
          />
        )
      case 'fin':
        return (
          <Fin
            jeu={jeu}
            joueurs={joueurs}
            stats={stats}
            sansAlcool={reglagesPartie.sansAlcool}
            onRejouer={lancerPartie}
            onChangerJeu={() => setEcran('jeux')}
            onAccueil={() => setEcran('accueil')}
          />
        )
    }
  }

  return (
    <ContexteSon.Provider value={contexteSon}>
      {afficherEcran()}
    </ContexteSon.Provider>
  )
}
