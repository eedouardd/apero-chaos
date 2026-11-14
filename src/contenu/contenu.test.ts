// Garde-fous sur le contenu : ces tests échouent si une carte est mal écrite
// ou si elle enfreint les règles de sécurité de l'app.

import { describe, expect, test } from 'vitest'
import { CATALOGUE } from '../jeux/catalogue'
import { filtrerCartes } from '../moteur/cartes'
import type { Joueur } from '../types'
import gages from './gages.json'
import imposteur from './imposteur.json'
import { INTERDITS } from './interdits'
import { CARTES, PAIRES_IMPOSTEUR, cartesDuJeu, problemesCarte, problemesPaire } from './index'
import { cleMot, paireAutorisee } from '../moteur/imposteur'

const TOUTES_LES_CARTES = Object.values(CARTES).flat()

const FICHIERS: Record<string, { texte: string; id: string }[]> = {
  ...CARTES,
  'gages.json': gages,
  // Les deux mots d'une paire passent les mêmes garde-fous que le texte d'une carte.
  'imposteur.json': imposteur.map((paire) => ({ id: paire.id, texte: paire.mots.join(' / ') })),
}

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
  // Les jeux à format propre (L'Imposteur…) ont leurs tests à part.
  const prets = CATALOGUE.filter((jeu) => jeu.pret && jeu.id in CARTES)

  test.each(prets.map((jeu) => [jeu.nom, jeu] as const))(
    '%s : au moins 80 cartes',
    (_nom, jeu) => {
      expect(cartesDuJeu(jeu.id).length).toBeGreaterThanOrEqual(NB_CARTES_MIN)
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
      const cartes = filtrerCartes(cartesDuJeu(jeu.id), prudents, {
        ton: 'tout-public',
        intensite: 'soft',
        sansAlcool: true,
        gorgeesSeulement: true,
      })
      expect(cartes.length).toBeGreaterThanOrEqual(12)
    },
  )
})

describe('paires de L’Imposteur', () => {
  test('au moins 150 paires, toutes bien formées', () => {
    expect(imposteur.length).toBeGreaterThanOrEqual(150)
    expect(PAIRES_IMPOSTEUR.length).toBe(imposteur.length)
    for (const paire of imposteur) {
      expect(problemesPaire(paire), `paire ${paire.id}`).toEqual([])
    }
  })

  test('un même mot ne sert que dans une seule paire', () => {
    const usages = new Map<string, number>()
    for (const mot of PAIRES_IMPOSTEUR.flatMap((paire) => paire.mots.map(cleMot))) {
      usages.set(mot, (usages.get(mot) ?? 0) + 1)
    }
    const tropVus = [...usages].filter(([, nb]) => nb > 1).map(([mot]) => mot)
    expect(tropVus).toEqual([])
  })

  test('assez de paires de chaque difficulté pour un groupe prudent en Tout public', () => {
    const prudents: Joueur[] = Array.from({ length: 4 }, (_, i) => ({
      id: `p${i}`,
      prenom: `P${i}`,
      defisPhysiques: false,
      questionsIntimes: false,
      boitAlcool: false,
    }))
    const autorisees = PAIRES_IMPOSTEUR.filter((paire) =>
      paireAutorisee(paire, prudents, {
        ton: 'tout-public',
        intensite: 'soft',
        sansAlcool: true,
        gorgeesSeulement: true,
      }),
    )
    for (const difficulte of [1, 2, 3]) {
      const nb = autorisees.filter((paire) => paire.difficulte === difficulte).length
      expect(nb, `difficulté ${difficulte}`).toBeGreaterThanOrEqual(15)
    }
  })
})
