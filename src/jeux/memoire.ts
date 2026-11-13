// Mémoire des cartes déjà vues pendant cette session, pour varier d'une partie à l'autre.

import type { IdJeu } from '../types'

let vuesParJeu: Partial<Record<IdJeu, ReadonlySet<string>>> = {}

export function cartesVues(jeu: IdJeu): ReadonlySet<string> {
  return vuesParJeu[jeu] ?? new Set()
}

export function noterCartesVues(jeu: IdJeu, ids: string[]): void {
  vuesParJeu = { ...vuesParJeu, [jeu]: new Set([...cartesVues(jeu), ...ids]) }
}
