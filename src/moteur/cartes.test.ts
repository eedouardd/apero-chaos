import { describe, expect, test } from 'vitest'
import type { Carte, Joueur, Reglages } from '../types'
import {
  ajusterGorgees,
  carteAutorisee,
  choisirJoueurs,
  construirePaquet,
  filtrerCartes,
  nbJoueursCibles,
  rendreCarte,
} from './cartes'

function joueur(prenom: string, profil: Partial<Joueur> = {}): Joueur {
  return {
    id: prenom,
    prenom,
    defisPhysiques: true,
    questionsIntimes: true,
    boitAlcool: true,
    ...profil,
  }
}

function carte(champs: Partial<Carte> = {}): Carte {
  return {
    id: 'c1',
    texte: '{j1}, {bois:2}.',
    ton: 'tout-public',
    intensite: 'soft',
    tags: [],
    minJoueurs: 2,
    ...champs,
  }
}

const REGLAGES: Reglages = {
  ton: 'hard',
  intensite: 'hard',
  sansAlcool: false,
  gorgeesSeulement: true,
}

const LEA = joueur('Léa')
const TOM = joueur('Tom')
const TEXTE = (c: ReturnType<typeof rendreCarte>) =>
  c.segments.map((s) => s.valeur).join('')

/** Hasard prévisible pour les tests. */
function aleaFixe(valeur = 0.42) {
  return () => valeur
}

describe('nbJoueursCibles', () => {
  test('compte les joueurs nommés par la carte', () => {
    expect(nbJoueursCibles(carte({ texte: 'Tout le monde boit.' }))).toBe(0)
    expect(nbJoueursCibles(carte({ texte: '{j1} défie {j2}, puis {j1} rit.' }))).toBe(2)
  })
})

describe('carteAutorisee', () => {
  test('refuse une carte plus osée que le ton choisi', () => {
    const hard = carte({ ton: 'hard' })
    expect(carteAutorisee(hard, [LEA, TOM], { ...REGLAGES, ton: 'pimente' })).toBe(false)
    expect(carteAutorisee(hard, [LEA, TOM], REGLAGES)).toBe(true)
  })

  test('refuse une carte plus intense que l’intensité choisie', () => {
    const corsee = carte({ intensite: 'hard' })
    expect(carteAutorisee(corsee, [LEA, TOM], { ...REGLAGES, intensite: 'normal' })).toBe(false)
  })

  test('refuse une carte qui demande plus de joueurs', () => {
    expect(carteAutorisee(carte({ minJoueurs: 4 }), [LEA, TOM], REGLAGES)).toBe(false)
  })

  test('retire les cartes « alcool » en mode sans alcool', () => {
    const trinque = carte({ tags: ['alcool'] })
    expect(carteAutorisee(trinque, [LEA, TOM], { ...REGLAGES, sansAlcool: true })).toBe(false)
    expect(carteAutorisee(trinque, [LEA, TOM], REGLAGES)).toBe(true)
  })

  test('garde une carte intime s’il reste assez de joueurs volontaires', () => {
    const intime = carte({ tags: ['intime'] })
    const timide = joueur('Zoé', { questionsIntimes: false })
    expect(carteAutorisee(intime, [LEA, timide], REGLAGES)).toBe(true)
    expect(carteAutorisee(intime, [timide, joueur('Max', { questionsIntimes: false })], REGLAGES)).toBe(false)
  })

  test('retire une carte de groupe refusée par la majorité', () => {
    const groupe = carte({ texte: 'Tous ceux qui… {boivent:1}.', tags: ['intime'] })
    const timides = [
      joueur('A', { questionsIntimes: false }),
      joueur('B', { questionsIntimes: false }),
    ]
    expect(carteAutorisee(groupe, [LEA, ...timides], REGLAGES)).toBe(false)
    expect(carteAutorisee(groupe, [LEA, TOM, timides[0]], REGLAGES)).toBe(true)
  })

  test('filtrerCartes garde seulement les cartes autorisées', () => {
    const cartes = [carte({ id: 'ok' }), carte({ id: 'non', ton: 'hard' })]
    const gardees = filtrerCartes(cartes, [LEA, TOM], { ...REGLAGES, ton: 'tout-public' })
    expect(gardees.map((c) => c.id)).toEqual(['ok'])
  })
})

describe('choisirJoueurs', () => {
  test('ne donne jamais un défi physique à un joueur qui les refuse', () => {
    const physique = carte({ tags: ['physique'] })
    const fragile = joueur('Zoé', { defisPhysiques: false })
    for (const valeur of [0, 0.3, 0.6, 0.99]) {
      const choisis = choisirJoueurs(physique, [fragile, LEA], {}, aleaFixe(valeur))
      expect(choisis).toEqual([LEA])
    }
  })

  test('privilégie le joueur qui a le moins joué', () => {
    const choisis = choisirJoueurs(carte(), [LEA, TOM], { Léa: 3, Tom: 1 }, aleaFixe())
    expect(choisis).toEqual([TOM])
  })

  test('tire deux joueurs différents pour une carte à deux', () => {
    const duo = carte({ texte: '{j1} contre {j2}' })
    const choisis = choisirJoueurs(duo, [LEA, TOM], {}, aleaFixe())
    expect(new Set(choisis.map((j) => j.id)).size).toBe(2)
  })
})

describe('ajusterGorgees', () => {
  test('adapte les gorgées à l’intensité, entre 1 et 5', () => {
    expect(ajusterGorgees(2, 'soft')).toBe(1)
    expect(ajusterGorgees(2, 'normal')).toBe(2)
    expect(ajusterGorgees(2, 'hard')).toBe(3)
    expect(ajusterGorgees(1, 'soft')).toBe(1)
    expect(ajusterGorgees(5, 'hard')).toBe(5)
  })
})

describe('rendreCarte', () => {
  const normal: Reglages = { ...REGLAGES, intensite: 'normal' }

  test('remplace les prénoms et les gorgées', () => {
    const rendue = rendreCarte(carte({ texte: '{j1}, {bois:2}. {j2} rit.' }), [LEA, TOM], normal)
    expect(TEXTE(rendue)).toBe('Léa, bois 2 gorgées. Tom rit.')
    expect(rendue.gorgees).toBe(2)
  })

  test('met une majuscule à la boisson en début de phrase seulement', () => {
    const rendue = rendreCarte(carte({ texte: '{j1}, raté ? {bois:2}. Refus : {bois:2}.' }), [LEA], normal)
    expect(TEXTE(rendue)).toBe('Léa, raté ? Bois 2 gorgées. Refus : bois 2 gorgées.')
  })

  test('accorde « gorgée » au singulier', () => {
    const rendue = rendreCarte(carte({ texte: '{j1}, {bois:1}.' }), [LEA], normal)
    expect(TEXTE(rendue)).toBe('Léa, bois 1 gorgée.')
  })

  test('transforme tout en gages en mode sans alcool', () => {
    const sans: Reglages = { ...normal, sansAlcool: true }
    const rendue = rendreCarte(
      carte({ texte: '{j1}, {bois:2}. Les autres {boivent:1} et prennent {gorgees:3}.' }),
      [LEA],
      sans,
    )
    expect(TEXTE(rendue)).toBe('Léa, fais un gage. Les autres font un gage et prennent un gage.')
  })

  test('donne un gage au joueur qui ne boit pas, même avec alcool', () => {
    const sobre = joueur('Zoé', { boitAlcool: false })
    const rendue = rendreCarte(carte({ texte: '{j1}, {bois:3}.' }), [sobre], normal)
    expect(TEXTE(rendue)).toBe('Zoé, fais un gage.')
  })

  test('ne parle de demi-verre que si « boire = gorgées » est coupé', () => {
    const texte = '{j1}, {bois:4}.'
    expect(TEXTE(rendreCarte(carte({ texte }), [LEA], normal))).toBe('Léa, bois 4 gorgées.')
    const libre: Reglages = { ...normal, gorgeesSeulement: false }
    expect(TEXTE(rendreCarte(carte({ texte }), [LEA], libre))).toBe('Léa, bois un demi-verre.')
  })
})

describe('construirePaquet', () => {
  const cartes = Array.from({ length: 30 }, (_, i) => carte({ id: `c${i}` }))

  test('respecte la taille demandée et ne répète aucune carte', () => {
    const paquet = construirePaquet(cartes, [LEA, TOM], REGLAGES, { taille: 10 })
    expect(paquet).toHaveLength(10)
    expect(new Set(paquet.map((p) => p.carte.id)).size).toBe(10)
  })

  test('répartit les cartes équitablement entre les joueurs', () => {
    const paquet = construirePaquet(cartes, [LEA, TOM, joueur('Max')], REGLAGES, { taille: 30 })
    const compte = (id: string) => paquet.filter((p) => p.joueurs[0].id === id).length
    expect(['Léa', 'Tom', 'Max'].map(compte)).toEqual([10, 10, 10])
  })

  test('sort d’abord les cartes jamais vues', () => {
    const dejaVues = new Set(cartes.slice(0, 25).map((c) => c.id))
    const paquet = construirePaquet(cartes, [LEA, TOM], REGLAGES, { taille: 5, dejaVues })
    expect(paquet.every((p) => !dejaVues.has(p.carte.id))).toBe(true)
  })

  test('ajoute une carte de fin après chaque règle temporaire', () => {
    const regle = carte({ id: 'regle', texte: 'Règle pour {j1}.', texteFin: 'Fin pour {j1}.' })
    const paquet = construirePaquet([regle, ...cartes], [LEA, TOM], REGLAGES, { taille: 31 })
    const debut = paquet.findIndex((p) => p.carte.id === 'regle')
    const fin = paquet.findIndex((p) => p.carte.id === 'regle-fin')
    expect(fin).toBeGreaterThan(debut)
    // La fin de règle parle du même joueur que la règle.
    expect(paquet[fin].joueurs).toEqual(paquet[debut].joueurs)
  })

  test('renvoie un paquet vide si aucune carte ne convient', () => {
    const paquet = construirePaquet([carte({ ton: 'hard' })], [LEA, TOM], { ...REGLAGES, ton: 'tout-public' }, { taille: 5 })
    expect(paquet).toEqual([])
  })
})
