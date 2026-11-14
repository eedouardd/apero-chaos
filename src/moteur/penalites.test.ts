import { describe, expect, test } from 'vitest'
import type { Difficulte, Intensite } from '../types'
import {
  GORGEES_MAX,
  gorgeesSansDifficulte,
  gorgeesSelonDifficulte,
  niveauGage,
  niveauGorgees,
  plafondGorgees,
  tailleGage,
} from './penalites'

const DIFFICULTES: Difficulte[] = [1, 2, 3, 4]
const INTENSITES: Intensite[] = ['soft', 'normal', 'hard']
const TIRAGES = [0, 0.2, 0.49, 0.5, 0.8, 0.999]

describe('échelle de pénalités', () => {
  test('facile 1, moyenne 2-3, difficile 4-5, les plus dures 5', () => {
    const fourchette = (difficulte: Difficulte) => [
      gorgeesSelonDifficulte(difficulte, 'normal', () => 0),
      gorgeesSelonDifficulte(difficulte, 'normal', () => 0.999),
    ]
    expect(DIFFICULTES.map(fourchette)).toEqual([
      [1, 1],
      [2, 3],
      [4, 5],
      [5, 5],
    ])
  })

  test('jamais plus de 5 gorgées, jamais plus de 3 en Soft, jamais moins de 1', () => {
    for (const intensite of INTENSITES) {
      for (const valeur of TIRAGES) {
        const tirages = [
          ...DIFFICULTES.map((d) => gorgeesSelonDifficulte(d, intensite, () => valeur)),
          ...[1, 2, 3, 4, 5].map((base) => gorgeesSansDifficulte(base, intensite, () => valeur)),
        ]
        for (const nb of tirages) {
          expect(nb).toBeGreaterThanOrEqual(1)
          expect(nb).toBeLessThanOrEqual(intensite === 'soft' ? 3 : GORGEES_MAX)
        }
      }
    }
    expect(plafondGorgees('soft')).toBe(3)
  })

  test('une carte difficile coûte toujours plus cher qu’une carte facile', () => {
    for (const intensite of INTENSITES) {
      for (const valeur of TIRAGES) {
        const facile = gorgeesSelonDifficulte(1, intensite, () => valeur)
        const moyenne = gorgeesSelonDifficulte(2, intensite, () => valeur)
        const difficile = gorgeesSelonDifficulte(3, intensite, () => valeur)
        expect(moyenne).toBeGreaterThan(facile)
        expect(difficile).toBeGreaterThan(moyenne)
      }
    }
  })

  test('Hard prend le haut de la fourchette, Soft le bas', () => {
    expect(DIFFICULTES.map((d) => gorgeesSelonDifficulte(d, 'hard', () => 0))).toEqual([1, 3, 5, 5])
    expect(DIFFICULTES.map((d) => gorgeesSelonDifficulte(d, 'soft', () => 0.999))).toEqual([
      1, 2, 3, 3,
    ])
  })

  test('sans difficulté : une part de hasard de ±1 gorgée', () => {
    const tirages = [0, 0.34, 0.67].map((valeur) => gorgeesSansDifficulte(3, 'normal', () => valeur))
    expect(tirages).toEqual([2, 3, 4])
  })

  test('couleur du bandeau : vert 1, orange 2-3, rouge 4-5', () => {
    expect([1, 2, 3, 4, 5].map(niveauGorgees)).toEqual(['facile', 'moyen', 'moyen', 'dur', 'dur'])
    expect((['petit', 'moyen', 'gros'] as const).map(niveauGage)).toEqual([
      'facile',
      'moyen',
      'dur',
    ])
  })

  test('taille du gage : selon la difficulté, sinon selon les gorgées', () => {
    expect(DIFFICULTES.map((d) => tailleGage(d, 1))).toEqual(['petit', 'moyen', 'gros', 'gros'])
    expect([1, 2, 3, 4, 5].map((nb) => tailleGage(undefined, nb))).toEqual([
      'petit',
      'moyen',
      'moyen',
      'gros',
      'gros',
    ])
  })
})
