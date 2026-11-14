import { describe, expect, test } from 'vitest'
import type { Carte, Joueur, Reglages } from '../types'
import {
  carteAutorisee,
  choisirJoueurs,
  cartesDuMoment,
  construirePaquet,
  etalerDifficultes,
  rendreConsigne,
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

describe('rendreCarte', () => {
  const normal: Reglages = { ...REGLAGES, intensite: 'normal' }
  /** Hasard neutre : une carte sans difficulté garde le nombre écrit. */
  const neutre = { alea: aleaFixe() }

  test('remplace les prénoms et les gorgées', () => {
    const rendue = rendreCarte(carte({ texte: '{j1}, {bois:2}. {j2} rit.' }), [LEA, TOM], normal, neutre)
    expect(TEXTE(rendue)).toBe('Léa, bois 2 gorgées. Tom rit.')
    expect(rendue.gorgees).toBe(2)
  })

  test('met une majuscule à la boisson en début de phrase seulement', () => {
    const rendue = rendreCarte(carte({ texte: '{j1}, raté ? {bois:2}. Refus : {bois:2}.' }), [LEA], normal, neutre)
    expect(TEXTE(rendue)).toBe('Léa, raté ? Bois 2 gorgées. Refus : bois 2 gorgées.')
  })

  test('accorde « gorgée » au singulier', () => {
    const rendue = rendreCarte(carte({ texte: '{j1}, {bois:1}.' }), [LEA], normal, neutre)
    expect(TEXTE(rendue)).toBe('Léa, bois 1 gorgée.')
  })

  test('transforme tout en gages en mode sans alcool', () => {
    const sans: Reglages = { ...normal, sansAlcool: true }
    const rendue = rendreCarte(
      carte({ texte: '{j1}, {bois:2}. Les autres {boivent:1} et prennent {gorgees:3}.' }),
      [LEA],
      sans,
      neutre,
    )
    expect(TEXTE(rendue)).toBe('Léa, fais un gage. Les autres font un gage et prennent un gage.')
  })

  test('donne un gage au joueur qui ne boit pas, même avec alcool', () => {
    const sobre = joueur('Zoé', { boitAlcool: false })
    const rendue = rendreCarte(carte({ texte: '{j1}, {bois:3}.' }), [sobre], normal, neutre)
    expect(TEXTE(rendue)).toBe('Zoé, fais un gage.')
  })

  test('la difficulté fixe la pénalité : 1, puis 2-3, puis 4-5', () => {
    const texte = '{j1}, {bois:2}.'
    const bas = { alea: () => 0 }
    const haut = { alea: () => 0.99 }
    const rendre = (difficulte: 1 | 2 | 3 | 4, options: { alea: () => number }) =>
      rendreCarte(carte({ texte, difficulte }), [LEA], normal, options).penalite?.gorgees
    expect(rendre(1, haut)).toBe(1)
    expect([rendre(2, bas), rendre(2, haut)]).toEqual([2, 3])
    expect([rendre(3, bas), rendre(3, haut)]).toEqual([4, 5])
    expect(rendre(4, bas)).toBe(5)
    expect(TEXTE(rendreCarte(carte({ texte, difficulte: 3 }), [LEA], normal, haut))).toBe(
      'Léa, bois 5 gorgées.',
    )
  })

  test('en Soft, jamais plus de 3 gorgées, et le difficile coûte plus que le facile', () => {
    const soft: Reglages = { ...normal, intensite: 'soft' }
    const gorgees = ([1, 2, 3, 4] as const).map(
      (difficulte) =>
        rendreCarte(carte({ difficulte }), [LEA], soft, { alea: () => 0.99 }).penalite?.gorgees,
    )
    expect(gorgees).toEqual([1, 2, 3, 3])
  })

  test('sans difficulté : le nombre écrit, à une gorgée près', () => {
    const tirages = [0, 0.5, 0.99].map(
      (valeur) =>
        rendreCarte(carte({ texte: '{j1}, {bois:3}.' }), [LEA], normal, { alea: () => valeur })
          .penalite?.gorgees,
    )
    expect(tirages).toEqual([2, 3, 4])
  })

  test('les autres nombres de la carte suivent la pénalité, sans dépasser 5', () => {
    const duo = carte({ texte: '{j1} : gagné, {distribue:3}. Perdu, {bois:2}.', difficulte: 3 })
    const rendue = rendreCarte(duo, [LEA], normal, { alea: () => 0 })
    expect(TEXTE(rendue)).toBe('Léa : gagné, distribue 5 gorgées. Perdu, bois 4 gorgées.')
    expect(rendue.penalite).toMatchObject({ gorgees: 4, distribue: false, enGage: false })
  })

  test('une pénalité de groupe ne dépasse pas 3 gorgées (2 en Soft)', () => {
    const groupe = carte({ texte: 'Tous les autres {boivent:2}.', difficulte: 3 })
    expect(TEXTE(rendreCarte(groupe, [], normal, { alea: () => 0.99 }))).toBe(
      'Tous les autres boivent 3 gorgées.',
    )
    const soft: Reglages = { ...normal, intensite: 'soft' }
    expect(TEXTE(rendreCarte(groupe, [], soft))).toBe('Tous les autres boivent 2 gorgées.')
  })

  test('une pénalité qui se répète reste hors échelle', () => {
    const regle = carte({
      texte: '{j1}, à chaque oubli tu prends {gorgees:1}.',
      difficulte: 3,
      tags: ['repete'],
    })
    const rendue = rendreCarte(regle, [LEA], REGLAGES, { alea: () => 0.99 })
    expect(TEXTE(rendue)).toBe('Léa, à chaque oubli tu prends 1 gorgée.')
    expect(rendue.penalite).toMatchObject({ gorgees: 1, repete: true, taille: 'petit' })
  })

  test('une carte qui ne fait que distribuer l’annonce dans sa pénalité', () => {
    const cadeau = carte({ texte: '{j1}, {distribue:5}.', difficulte: 4 })
    const rendue = rendreCarte(cadeau, [LEA], normal)
    expect(rendue.penalite).toMatchObject({ gorgees: 5, distribue: true, speciale: false })
    const regle = carte({ texte: 'Jusqu’à la fin, {j1} est le chef.', difficulte: 4 })
    expect(rendreCarte(regle, [LEA], normal).penalite).toMatchObject({ gorgees: 5, speciale: true })
    expect(rendue.gorgees).toBe(0)
  })

  test('sans alcool : la pénalité est un gage, petit, moyen ou gros', () => {
    const sans: Reglages = { ...normal, sansAlcool: true }
    const tailles = ([1, 2, 3, 4] as const).map(
      (difficulte) => rendreCarte(carte({ difficulte }), [LEA], sans).penalite,
    )
    expect(tailles.map((p) => p?.taille)).toEqual(['petit', 'moyen', 'gros', 'gros'])
    expect(tailles.every((p) => p?.enGage)).toBe(true)
  })
})

describe('rendreConsigne', () => {
  const normal: Reglages = { ...REGLAGES, intensite: 'normal' }

  test('la consigne prend la pénalité de la carte, plafonnée pour le groupe', () => {
    const consigne = 'Ceux qui se trompent {boivent:1}. Tous ont trouvé ? {j1} prend {gorgees:1}.'
    const rendue = rendreConsigne(consigne, [LEA], normal, 5)
    expect(rendue.segments.map((s) => s.valeur).join('')).toBe(
      'Ceux qui se trompent boivent 3 gorgées. Tous ont trouvé ? Léa prend 5 gorgées.',
    )
  })

  test('ne dépasse jamais le plafond de l’intensité', () => {
    const soft: Reglages = { ...normal, intensite: 'soft' }
    const rendue = rendreConsigne('{j1} {boit:1}.', [LEA], soft, 5)
    expect(rendue.segments.map((s) => s.valeur).join('')).toBe('Léa boit 3 gorgées.')
    expect(rendue.gorgees).toBe(3)
  })
})

describe('etalerDifficultes', () => {
  const niveaux = (cartes: Carte[]) => cartes.map((c) => c.difficulte)
  const paquet = (...difficultes: (1 | 2 | 3 | 4)[]) =>
    difficultes.map((difficulte, i) => carte({ id: `c${i}`, difficulte }))

  test('pas de carte extrême dans les cinq premières', () => {
    const ordre = etalerDifficultes(paquet(4, 4, 1, 1, 1, 2, 2, 1))
    expect(niveaux(ordre).slice(0, 5)).not.toContain(4)
    const debut = niveaux(etalerDifficultes(paquet(3, 3, 1, 2, 1))).slice(0, 2)
    expect(debut).toEqual([1, 2])
    expect(ordre).toHaveLength(8)
  })

  test('jamais deux cartes difficiles d’affilée quand c’est évitable', () => {
    const ordre = niveaux(etalerDifficultes(paquet(3, 3, 3, 1, 2, 1, 2)))
    for (let i = 1; i < ordre.length; i += 1) {
      expect((ordre[i] ?? 0) >= 3 && (ordre[i - 1] ?? 0) >= 3).toBe(false)
    }
  })

  test('tirage carte par carte (La Roue) : mêmes règles, sans jamais bloquer', () => {
    const cartes = paquet(1, 2, 3, 4)
    expect(niveaux(cartesDuMoment(cartes, 0, undefined))).toEqual([1, 2])
    expect(niveaux(cartesDuMoment(cartes, 3, cartes[0]))).toEqual([1, 2, 3])
    expect(niveaux(cartesDuMoment(cartes, 6, cartes[2]))).toEqual([1, 2])
    expect(niveaux(cartesDuMoment(cartes, 6, cartes[0]))).toEqual([1, 2, 3, 4])
    expect(cartesDuMoment(paquet(4, 4), 0, undefined)).toHaveLength(2)
  })

  test('ne perd aucune carte quand il n’y a que du difficile', () => {
    expect(etalerDifficultes(paquet(4, 3, 4))).toHaveLength(3)
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
