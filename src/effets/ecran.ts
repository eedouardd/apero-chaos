// Garde l'écran allumé pendant qu'un téléphone est posé au milieu de la table.

import { useEffect } from 'react'

/** Empêche la mise en veille tant que `actif` est vrai (ignoré si le téléphone ne sait pas faire). */
export function useEcranAllume(actif: boolean): void {
  useEffect(() => {
    if (!actif || !('wakeLock' in navigator)) return
    let verrou: WakeLockSentinel | null = null
    let annule = false

    const relacher = (sentinelle: WakeLockSentinel) => {
      // Déjà relâché par le système (onglet masqué) : rien à faire de plus.
      sentinelle.release().catch(() => undefined)
    }
    const demander = () => {
      navigator.wakeLock
        .request('screen')
        .then((sentinelle) => {
          if (annule) relacher(sentinelle)
          else verrou = sentinelle
        })
        .catch((erreur: unknown) => {
          // Refusé (batterie faible, onglet en arrière-plan) : le jeu marche sans.
          console.warn('Impossible de garder l’écran allumé.', erreur)
        })
    }
    // Le système relâche le verrou quand l'app passe en arrière-plan : on le redemande au retour.
    const auRetour = () => {
      if (document.visibilityState === 'visible') demander()
    }

    demander()
    document.addEventListener('visibilitychange', auRetour)
    return () => {
      annule = true
      document.removeEventListener('visibilitychange', auRetour)
      if (verrou !== null) relacher(verrou)
    }
  }, [actif])
}
