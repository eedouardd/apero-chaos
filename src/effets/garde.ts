// Garde contre les touchers fortuits : un bouton qui vient d'apparaître sous le doigt
// (carte suivante, « Duel suivant ») ne réagit pas tout de suite.

import { useCallback, useEffect, useRef } from 'react'

/** Délai pendant lequel un élément tout juste apparu ignore les touchers. */
export const DELAI_GARDE_MS = 500

/**
 * Renvoie une fonction qui dit si un toucher arrive trop tôt après le dernier
 * changement de `cle` (nouvelle carte, nouveau verdict…).
 */
export function useGardeToucher(cle: unknown, delaiMs = DELAI_GARDE_MS): () => boolean {
  const apparuLe = useRef(0)
  useEffect(() => {
    apparuLe.current = Date.now()
  }, [cle])
  return useCallback(() => Date.now() - apparuLe.current < delaiMs, [delaiMs])
}
