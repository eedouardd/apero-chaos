// Garde-fous sur le contenu : ces tests échouent si une carte est mal écrite
// ou si elle enfreint les règles de sécurité de l'app.

import { describe, expect, test } from 'vitest'
import { CATALOGUE } from '../jeux/catalogue'
import { filtrerCartes } from '../moteur/cartes'
import type { Joueur } from '../types'
import gages from './gages.json'
import { CARTES, problemesCarte } from './index'

const TOUTES_LES_CARTES = Object.values(CARTES).flat()

const FICHIERS: Record<string, { texte: string; id: string }[]> = {
  ...CARTES,
  'gages.json': gages,
}

/** Formulations interdites, même en Hard. */
const INTERDITS = [
  /cul[ -]sec/i,
  /\bshots?\b/i,
  /\bshooters?\b/i,
  /verre entier/i,
  /finis ton verre/i,
  /\bconduire\b|\bconduis\b|\bvolant\b/i,
  /mélange.{0,20}(alcool|verre)/i,
]

const NB_CARTES_MIN = 80

describe('contenu des cartes', () => {
  test.each(Object.entries(FICHIERS))('%s : aucune formulation interdite', (_nom, cartes) => {
    for (const carte of cartes) {
      for (const interdit of INTERDITS) {
        expect(carte.texte, `carte ${carte.id}`).not.toMatch(interdit)
      }
    }
  })

  test.each(Object.entries(FICHIERS))('%s : identifiants uniques', (_nom, cartes) => {
    const ids = cartes.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('toutes les cartes sont bien formées', () => {
    expect(TOUTES_LES_CARTES.length).toBeGreaterThanOrEqual(640)
    for (const carte of TOUTES_LES_CARTES) {
      expect(problemesCarte(carte), `carte ${carte.id}`).toEqual([])
    }
  })

  test('seuls les jetons connus sont utilisés entre accolades', () => {
    const jetonValide = /^\{(j[12]|(bois|boit|boivent|buvez|distribue|gorgees):[1-5])\}$/
    for (const carte of TOUTES_LES_CARTES) {
      const textes = [carte.texte, carte.texteFin ?? '']
      for (const jeton of textes.join(' ').match(/\{[^}]*\}/g) ?? []) {
        expect(jeton, `carte ${carte.id}`).toMatch(jetonValide)
      }
    }
  })
})

describe('jeux prêts', () => {
  const prets = CATALOGUE.filter((jeu) => jeu.pret)

  test.each(prets.map((jeu) => [jeu.nom, jeu] as const))(
    '%s : au moins 80 cartes',
    (_nom, jeu) => {
      expect(CARTES[jeu.id].length).toBeGreaterThanOrEqual(NB_CARTES_MIN)
    },
  )

  test.each(prets.map((jeu) => [jeu.nom, jeu] as const))(
    '%s : jouable même en Tout public + Soft + Sans alcool avec un groupe prudent',
    (_nom, jeu) => {
      const prudents: Joueur[] = Array.from({ length: jeu.minJoueurs }, (_, i) => ({
        id: `p${i}`,
        prenom: `P${i}`,
        defisPhysiques: false,
        questionsIntimes: false,
        boitAlcool: false,
      }))
      const cartes = filtrerCartes(CARTES[jeu.id], prudents, {
        ton: 'tout-public',
        intensite: 'soft',
        sansAlcool: true,
        gorgeesSeulement: true,
      })
      expect(cartes.length).toBeGreaterThanOrEqual(12)
    },
  )
})
