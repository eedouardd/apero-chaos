import { useCallback, useEffect, useMemo, useState } from 'react'
import { ContexteSon } from './composants/ContexteSon'
import { Accueil } from './ecrans/Accueil'
import { Age18 } from './ecrans/Age18'
import { ChoixJeu } from './ecrans/ChoixJeu'
import { Fin } from './ecrans/Fin'
import { Joueurs } from './ecrans/Joueurs'
import { Partie } from './ecrans/Partie'
import { Reglages } from './ecrans/Reglages'
import { ReglesJeu } from './ecrans/ReglesJeu'
import { definirSonCoupe } from './effets/sons'
import { trouverJeu } from './jeux/catalogue'
import { ageRequis } from './moteur/age'
import { charger, sauvegarder } from './stockage/stockage'
import type { IdJeu, StatsPartie } from './types'

/** Les écrans de l'app, dans l'ordre du parcours. */
type Ecran =
  | 'accueil'
  | 'joueurs'
  | 'reglages'
  | 'age'
  | 'jeux'
  | 'regles'
  | 'partie'
  | 'fin'

const STATS_VIDES: StatsPartie = { cartesJouees: 0, parJoueur: {} }

export default function App() {
  // Lu une seule fois au démarrage.
  const [initial] = useState(charger)

  const [ecran, setEcran] = useState<Ecran>('accueil')
  const [joueurs, setJoueurs] = useState(initial.joueurs)
  const [reglages, setReglages] = useState(initial.reglages)
  const [sonCoupe, setSonCoupe] = useState(initial.sonCoupe)
  const [ageConfirme, setAgeConfirme] = useState(false)
  const [idJeu, setIdJeu] = useState<IdJeu>('defis-verites')
  const [stats, setStats] = useState<StatsPartie>(STATS_VIDES)
  // Change à chaque nouvelle partie pour repartir d'un paquet neuf.
  const [numeroPartie, setNumeroPartie] = useState(0)

  // Sauvegarde automatique des joueurs, des réglages et du son.
  useEffect(() => {
    sauvegarder({ joueurs, reglages, sonCoupe })
    definirSonCoupe(sonCoupe)
  }, [joueurs, reglages, sonCoupe])

  const basculerSon = useCallback(() => setSonCoupe((coupe) => !coupe), [])
  const contexteSon = useMemo(
    () => ({ sonCoupe, basculerSon }),
    [sonCoupe, basculerSon],
  )

  const jeu = trouverJeu(idJeu)

  function lancerPartie() {
    setStats(STATS_VIDES)
    setNumeroPartie((numero) => numero + 1)
    setEcran('partie')
  }

  function afficherEcran() {
    switch (ecran) {
      case 'accueil':
        return <Accueil onNouvellePartie={() => setEcran('joueurs')} />
      case 'joueurs':
        return (
          <Joueurs
            joueurs={joueurs}
            onChange={setJoueurs}
            onRetour={() => setEcran('accueil')}
            onSuivant={() => setEcran('reglages')}
          />
        )
      case 'reglages':
        return (
          <Reglages
            reglages={reglages}
            onChange={setReglages}
            onRetour={() => setEcran('joueurs')}
            onSuivant={() =>
              setEcran(ageRequis(reglages) && !ageConfirme ? 'age' : 'jeux')
            }
          />
        )
      case 'age':
        return (
          <Age18
            onRetour={() => setEcran('reglages')}
            onConfirmer={() => {
              setAgeConfirme(true)
              setEcran('jeux')
            }}
          />
        )
      case 'jeux':
        return (
          <ChoixJeu
            joueurs={joueurs}
            onRetour={() => setEcran('reglages')}
            onChoisir={(id) => {
              setIdJeu(id)
              setEcran('regles')
            }}
          />
        )
      case 'regles':
        return (
          <ReglesJeu
            jeu={jeu}
            sansAlcool={reglages.sansAlcool}
            onRetour={() => setEcran('jeux')}
            onCommencer={lancerPartie}
          />
        )
      case 'partie':
        return (
          <Partie
            key={numeroPartie}
            jeu={jeu}
            joueurs={joueurs}
            reglages={reglages}
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
            sansAlcool={reglages.sansAlcool}
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
