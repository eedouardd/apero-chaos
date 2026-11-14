// Garde-fous sur le contenu : ces tests échouent si une carte est mal écrite
// ou si elle enfreint les règles de sécurité de l'app.

import { describe, expect, test } from 'vitest'
import { CATALOGUE } from '../jeux/catalogue'
import { construirePaquet, filtrerCartes } from '../moteur/cartes'
import { gagesAutorises } from '../moteur/gages'
import type { Carte, Joueur, Reglages } from '../types'
import gages from './gages.json'
import imposteur from './imposteur.json'
import { INTERDITS } from './interdits'
import { CARTES, GAGES, PAIRES_IMPOSTEUR, cartesDuJeu, problemesCarte, problemesPaire } from './index'
import { cleMot, paireAutorisee } from '../moteur/imposteur'

const TOUTES_LES_CARTES = Object.values(CARTES).flat()

const FICHIERS: Record<string, { texte: string; id: string }[]> = {
  ...CARTES,
  'gages.json': gages,
  // Les deux mots d'une paire passent les mêmes garde-fous que le texte d'une carte.
  'imposteur.json': imposteur.map((paire) => ({ id: paire.id, texte: paire.mots.join(' / ') })),
}

const NB_CARTES_MIN = 80
/** Un niveau de difficulté « compte » dans un jeu s'il pèse au moins cette part des cartes. */
const PART_MIN_NIVEAU = 0.1
const NB_NIVEAUX_MIN = 3
/** Les cartes « les plus dures » restent rares. */
const PART_MAX_EXTREME = 0.15

const PRUDENT: Reglages = { ton: 'tout-public', intensite: 'soft', sansAlcool: true }

function groupePrudent(nb: number): Joueur[] {
  return Array.from({ length: nb }, (_, i) => ({
    id: `p${i}`,
    prenom: `P${i}`,
    defisPhysiques: false,
    questionsIntimes: false,
    boitAlcool: false,
  }))
}

function groupeFetard(nb: number): Joueur[] {
  return groupePrudent(nb).map((j) => ({
    ...j,
    defisPhysiques: true,
    questionsIntimes: true,
    boitAlcool: true,
  }))
}

/** Niveaux de difficulté qui pèsent au moins 10 % de ces cartes. */
function niveauxRepresentes(cartes: Carte[]): number[] {
  return [1, 2, 3, 4].filter(
    (niveau) =>
      cartes.filter((c) => c.difficulte === niveau).length >= cartes.length * PART_MIN_NIVEAU,
  )
}

/** Hasard reproductible (générateur congruentiel), pour simuler des parties dans les tests. */
function aleaGraine(graine: number): () => number {
  let etat = graine
  return () => {
    etat = (etat * 1664525 + 1013904223) % 4294967296
    return etat / 4294967296
  }
}

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

  test('chaque carte a une difficulté de 1 à 4', () => {
    for (const carte of TOUTES_LES_CARTES) {
      expect([1, 2, 3, 4], `carte ${carte.id}`).toContain(carte.difficulte)
    }
  })

  test('une pénalité qui se répète est écrite à 1 gorgée', () => {
    for (const carte of TOUTES_LES_CARTES.filter((c) => c.tags.includes('repete'))) {
      const nombres = [...carte.texte.matchAll(/:(\d)\}/g)].map((m) => Number(m[1]))
      expect(Math.max(0, ...nombres), `carte ${carte.id}`).toBeLessThanOrEqual(1)
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
      const cartes = filtrerCartes(cartesDuJeu(jeu.id), groupePrudent(jeu.minJoueurs), PRUDENT)
      expect(cartes.length).toBeGreaterThanOrEqual(12)
    },
  )

  test.each(prets.map((jeu) => [jeu.nom, jeu] as const))(
    '%s : plusieurs niveaux de difficulté, même pour un groupe prudent',
    (_nom, jeu) => {
      const toutes = cartesDuJeu(jeu.id)
      expect(niveauxRepresentes(toutes).length).toBeGreaterThanOrEqual(NB_NIVEAUX_MIN)
      const extremes = toutes.filter((c) => c.difficulte === 4).length
      expect(extremes).toBeLessThanOrEqual(toutes.length * PART_MAX_EXTREME)
      const prudentes = filtrerCartes(toutes, groupePrudent(jeu.minJoueurs), PRUDENT)
      expect(niveauxRepresentes(prudentes).length).toBeGreaterThanOrEqual(NB_NIVEAUX_MIN)
    },
  )

  test.each(prets.map((jeu) => [jeu.nom, jeu] as const))(
    '%s : une partie mélange les pénalités, sans jamais dépasser 5 gorgées (3 en Soft)',
    (_nom, jeu) => {
      const joueurs = groupeFetard(Math.max(4, jeu.minJoueurs))
      for (const intensite of ['soft', 'normal', 'hard'] as const) {
        const reglages: Reglages = { ton: 'hard', intensite, sansAlcool: false }
        for (const graine of [1, 2, 3, 4, 5]) {
          const paquet = construirePaquet(cartesDuJeu(jeu.id), joueurs, reglages, {
            taille: 25,
            alea: aleaGraine(graine),
          })
          const gorgees = paquet.flatMap((c) => (c.penalite ? [c.penalite.gorgees] : []))
          expect(Math.max(...gorgees)).toBeLessThanOrEqual(intensite === 'soft' ? 3 : 5)
          expect(Math.min(...gorgees)).toBeGreaterThanOrEqual(1)
          expect(new Set(gorgees).size, `${intensite}, graine ${graine}`).toBeGreaterThanOrEqual(3)
        }
      }
    },
  )
})

describe('gages', () => {
  test('chaque gage a une taille : petit, moyen ou gros', () => {
    expect(GAGES.length).toBe(gages.length)
    for (const gage of GAGES) {
      expect(['petit', 'moyen', 'gros'], `gage ${gage.id}`).toContain(gage.taille)
    }
  })

  test('assez de gages de chaque taille pour un groupe prudent en Tout public', () => {
    const autorises = gagesAutorises(GAGES, groupePrudent(3), PRUDENT)
    for (const taille of ['petit', 'moyen', 'gros']) {
      const nb = autorises.filter((gage) => gage.taille === taille).length
      expect(nb, `gages ${taille}`).toBeGreaterThanOrEqual(8)
    }
  })
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
    const autorisees = PAIRES_IMPOSTEUR.filter((paire) =>
      paireAutorisee(paire, groupePrudent(4), PRUDENT),
    )
    for (const difficulte of [1, 2, 3]) {
      const nb = autorisees.filter((paire) => paire.difficulte === difficulte).length
      expect(nb, `difficulté ${difficulte}`).toBeGreaterThanOrEqual(15)
    }
  })
})
