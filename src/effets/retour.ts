// Bouton « retour » du téléphone (Android) et geste de retour : au lieu de fermer l'app,
// ils reviennent à l'écran précédent, ou ouvrent la pause pendant une partie.

import { useEffect, useRef } from 'react'

const EVENEMENT_RETOUR_PARTIE = 'apero:retour-partie'
const MARQUE = { aperoChaos: true }

function marquePosee(): boolean {
  const etat: unknown = history.state
  return typeof etat === 'object' && etat !== null && 'aperoChaos' in etat
}

/**
 * Branche le retour système sur `onRetour`. Quand `actif` est faux (accueil),
 * le retour garde son rôle habituel : quitter l'app.
 * Si `enPartie` est vrai, c'est l'écran de jeu qui décide (voir `useRetourEnPartie`).
 */
export function useRetourSysteme(actif: boolean, enPartie: boolean, onRetour: () => void): void {
  const courant = useRef({ actif, enPartie, onRetour })
  useEffect(() => {
    courant.current = { actif, enPartie, onRetour }
    // Une entrée d'historique « tampon » absorbe le prochain retour.
    if (actif && !marquePosee()) history.pushState(MARQUE, '')
    // De retour à l'accueil : on retire le tampon, sinon le premier retour ne ferait rien.
    if (!actif && marquePosee()) history.back()
  })

  useEffect(() => {
    const auRetour = () => {
      const { actif: estActif, enPartie: joue, onRetour: revenir } = courant.current
      if (!estActif) return
      if (joue) {
        history.pushState(MARQUE, '')
        window.dispatchEvent(new Event(EVENEMENT_RETOUR_PARTIE))
        return
      }
      revenir()
    }
    window.addEventListener('popstate', auRetour)
    return () => window.removeEventListener('popstate', auRetour)
  }, [])
}

/** Dans un écran de jeu : appelé quand le joueur fait « retour » sur son téléphone. */
export function useRetourEnPartie(onRetour: () => void): void {
  const courant = useRef(onRetour)
  useEffect(() => {
    courant.current = onRetour
  })
  useEffect(() => {
    const auRetour = () => courant.current()
    window.addEventListener(EVENEMENT_RETOUR_PARTIE, auRetour)
    return () => window.removeEventListener(EVENEMENT_RETOUR_PARTIE, auRetour)
  }, [])
}
