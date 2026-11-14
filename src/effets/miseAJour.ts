// Mise à jour de l'app installée : le service worker télécharge la nouvelle version
// en arrière-plan, puis on propose au joueur de recharger (jamais tout seul).

import { useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** On redemande au serveur s'il y a du nouveau toutes les heures, et à chaque retour sur l'app. */
const INTERVALLE_VERIFICATION_MS = 60 * 60 * 1000

function surveiller(enregistrement: ServiceWorkerRegistration | undefined): void {
  if (enregistrement === undefined) return
  const verifier = () => {
    if (!navigator.onLine) return
    enregistrement.update().catch((erreur: unknown) => {
      console.warn('Vérification de mise à jour impossible.', erreur)
    })
  }
  setInterval(verifier, INTERVALLE_VERIFICATION_MS)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') verifier()
  })
}

/** Dit si une nouvelle version est prête, et donne la fonction qui l'installe (recharge la page). */
export function useMiseAJour(): { disponible: boolean; installer: () => void } {
  const {
    needRefresh: [disponible],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url, enregistrement) => surveiller(enregistrement),
    onRegisterError: (erreur: unknown) => {
      console.warn('Service worker non enregistré : pas de mode hors ligne.', erreur)
    },
  })
  const installer = useCallback(() => {
    updateServiceWorker(true).catch((erreur: unknown) => {
      console.warn('Mise à jour impossible.', erreur)
    })
  }, [updateServiceWorker])
  return { disponible, installer }
}
