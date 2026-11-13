import type { Reglages } from '../types'

/**
 * Faut-il afficher l'écran +18 ?
 * Oui dès qu'il y a de l'alcool ou un ton adulte ; non uniquement en Tout public + Sans alcool.
 */
export function ageRequis(reglages: Reglages): boolean {
  return !(reglages.ton === 'tout-public' && reglages.sansAlcool)
}
