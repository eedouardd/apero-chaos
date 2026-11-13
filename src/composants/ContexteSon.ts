import { createContext } from 'react'

/** Partage l'état « son coupé » avec tous les écrans. */
export const ContexteSon = createContext<{
  sonCoupe: boolean
  basculerSon: () => void
}>({ sonCoupe: false, basculerSon: () => {} })
