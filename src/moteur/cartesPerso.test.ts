import { describe, expect, test } from 'vitest'
import { REGLAGES_PAR_DEFAUT, type Joueur } from '../types'
import { construirePaquet } from './cartes'
import {
  NB_CARTES_PERSO_MAX,
  enCartesPerso,
  filtrerCartesPerso,
  verifierCartePerso,
} from './cartesPerso'

describe('verifierCartePerso', () => {
  test('nettoie et accepte une carte correcte', () => {
    expect(verifierCartePerso('  {j1},  imite  {j2}. Raté ? {bois:2}. ', [])).toEqual({
      ok: true,
      texte: '{j1}, imite {j2}. Raté ? {bois:2}.',
    })
  })

  test('refuse une carte trop courte, trop longue ou en double', () => {
    expect(verifierCartePerso('Bois', []).ok).toBe(false)
    expect(verifierCartePerso('a'.repeat(161), []).ok).toBe(false)
    expect(verifierCartePerso('Chante une chanson.', ['Chante une chanson.']).ok).toBe(false)
  })

  test('refuse les accolades inconnues et plus de 5 gorgées', () => {
    expect(verifierCartePerso('{j3} fait le poirier.', []).ok).toBe(false)
    expect(verifierCartePerso('Tout le monde {bois:9}.', []).ok).toBe(false)
    expect(verifierCartePerso('Une accolade { perdue ici.', []).ok).toBe(false)
  })

  test('refuse les formulations interdites', () => {
    expect(verifierCartePerso('{j1} boit son verre cul sec.', []).ok).toBe(false)
    expect(verifierCartePerso('Tournée de shots pour tous.', []).ok).toBe(false)
  })

  test.each([
    'Celui qui conduit ce soir {bois:2}.',
    '{j1} boit un culsec.',
    'Bois ton verre d’une traite.',
    'Mélange bière et vin dans ton verre.',
    '{j1} {bois:5} puis {bois:5}.',
  ])('refuse le contournement : %s', (texte) => {
    expect(verifierCartePerso(texte, []).ok).toBe(false)
  })

  test('refuse au-delà du nombre maximum de cartes', () => {
    const pleines = Array.from({ length: NB_CARTES_PERSO_MAX }, (_, i) => `Carte numéro ${i}`)
    expect(verifierCartePerso('Une carte de plus.', pleines).ok).toBe(false)
  })
})

describe('enCartesPerso', () => {
  const joueurs: Joueur[] = ['Léa', 'Max'].map((prenom) => ({
    id: prenom,
    prenom,
    defisPhysiques: true,
    questionsIntimes: true,
    boitAlcool: true,
  }))

  test('fabrique des cartes jouables par le moteur', () => {
    const cartes = enCartesPerso(['{j1}, imite {j2}.', 'Tout le monde chante.'])
    expect(new Set(cartes.map((c) => c.id)).size).toBe(2)
    expect(enCartesPerso(['Tout le monde chante.'])[0].id).toBe(cartes[1].id)
    const paquet = construirePaquet(cartes, joueurs, REGLAGES_PAR_DEFAUT, { taille: 10 })
    expect(paquet).toHaveLength(2)
  })
})

describe('filtrerCartesPerso', () => {
  test('écarte les cartes invalides, interdites ou en double d’une sauvegarde', () => {
    expect(
      filtrerCartesPerso(['{foo} carte cassée', 'Tournée de shots', 'Chante un refrain.', 'Chante un refrain.']),
    ).toEqual(['Chante un refrain.'])
  })
})
