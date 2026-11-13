import { describe, expect, test } from 'vitest'
import { CATALOGUE } from '../jeux/catalogue'
import { lireSauvegarde } from '../stockage/stockage'
import { REGLAGES_PAR_DEFAUT, type CarteJouee, type Joueur } from '../types'
import { ageRequis } from './age'
import { gagesAutorises, tirerGage } from './gages'
import { creerJoueur } from './joueurs'
import { angleRoue, dureeMeche, sanctionPerdant, tirerAction } from './manches'
import { calculerStats, calculerTrophees } from './recap'
import { evaluerJeux } from './recommandations'

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

function groupe(nb: number, profil: Partial<Joueur> = {}): Joueur[] {
  return Array.from({ length: nb }, (_, i) => joueur(`J${i}`, profil))
}

describe('creerJoueur', () => {
  test('nettoie le prénom et applique les valeurs par défaut', () => {
    const resultat = creerJoueur('  Léa  ', [], 'id1')
    expect(resultat).toEqual({
      ok: true,
      joueur: { id: 'id1', prenom: 'Léa', defisPhysiques: true, questionsIntimes: true, boitAlcool: true },
    })
  })

  test('refuse un prénom vide, trop long ou en double', () => {
    expect(creerJoueur('   ', [], 'x').ok).toBe(false)
    expect(creerJoueur('A'.repeat(15), [], 'x').ok).toBe(false)
    expect(creerJoueur('LÉA', [joueur('Léa')], 'x').ok).toBe(false)
  })

  test('refuse un treizième joueur', () => {
    expect(creerJoueur('Nouveau', groupe(12), 'x').ok).toBe(false)
  })
})

describe('ageRequis', () => {
  test('pas d’écran +18 uniquement en Tout public + Sans alcool', () => {
    expect(ageRequis({ ...REGLAGES_PAR_DEFAUT, ton: 'tout-public', sansAlcool: true })).toBe(false)
    expect(ageRequis({ ...REGLAGES_PAR_DEFAUT, ton: 'tout-public', sansAlcool: false })).toBe(true)
    expect(ageRequis({ ...REGLAGES_PAR_DEFAUT, ton: 'hard', sansAlcool: true })).toBe(true)
  })
})

describe('evaluerJeux', () => {
  // On fait comme si tous les jeux étaient prêts pour tester la logique seule.
  const catalogue = CATALOGUE.map((jeu) => ({ ...jeu, pret: true }))

  test('recommande « Tu préfères » à deux joueurs', () => {
    const recommandes = evaluerJeux(catalogue, groupe(2)).filter((e) => e.recommande)
    expect(recommandes.map((e) => e.jeu.id)).toContain('tu-preferes')
    expect(recommandes.length).toBeLessThanOrEqual(2)
  })

  test('signale les jeux qui demandent plus de joueurs', () => {
    const bombe = evaluerJeux(catalogue, groupe(2)).find((e) => e.jeu.id === 'la-bombe')
    expect(bombe?.jouable).toBe(false)
    expect(bombe?.raison).toContain('3')
    expect(bombe?.recommande).toBe(false)
  })

  test('ne recommande pas Duel à un groupe qui refuse les défis physiques', () => {
    const evalues = evaluerJeux(catalogue, groupe(6, { defisPhysiques: false }))
    expect(evalues.find((e) => e.jeu.id === 'duel')?.recommande).toBe(false)
  })

  test('place les jeux recommandés en premier', () => {
    const evalues = evaluerJeux(catalogue, groupe(6))
    const premierNonRecommande = evalues.findIndex((e) => !e.recommande)
    expect(evalues.slice(premierNonRecommande).every((e) => !e.recommande)).toBe(true)
    expect(evalues[0].recommande).toBe(true)
  })
})

describe('gages', () => {
  const gages = [
    { id: 'a', texte: 'Sage', ton: 'tout-public' as const },
    { id: 'b', texte: 'Sportif', ton: 'tout-public' as const, physique: true },
    { id: 'c', texte: 'Osé', ton: 'hard' as const },
  ]

  test('respecte le ton et les joueurs qui refusent le physique', () => {
    const prudents = groupe(2, { defisPhysiques: false })
    const autorises = gagesAutorises(gages, prudents, REGLAGES_PAR_DEFAUT)
    expect(autorises.map((g) => g.id)).toEqual(['a'])
  })

  test('évite de retirer deux fois le même gage', () => {
    expect(tirerGage(gages.slice(0, 2), 'Sage', () => 0)).toBe('Sportif')
  })

  test('propose un gage de secours si la liste est vide', () => {
    expect(tirerGage([], null)).not.toBe('')
  })
})

describe('récap de fin', () => {
  const lea = joueur('Léa')
  const tom = joueur('Tom')
  const jouee = (joueurs: Joueur[], gorgees: number): CarteJouee => ({
    carte: { id: 'x', texte: '', ton: 'tout-public', intensite: 'soft', tags: [], minJoueurs: 2 },
    joueurs,
    segments: [],
    gorgees,
  })

  test('additionne cartes et gorgées par joueur', () => {
    const stats = calculerStats([jouee([lea], 2), jouee([lea, tom], 3), jouee([], 0)])
    expect(stats.cartesJouees).toBe(3)
    expect(stats.parJoueur).toEqual({
      Léa: { cartes: 2, gorgees: 5 },
      Tom: { cartes: 1, gorgees: 0 },
    })
  })

  test('désigne la cible préférée et le planqué', () => {
    const stats = calculerStats([jouee([lea], 2), jouee([lea], 1)])
    const trophees = calculerTrophees([lea, tom], stats, false)
    expect(trophees.map((t) => t.prenom)).toEqual(['Léa', 'Léa', 'Tom'])
  })

  test('ne donne aucun trophée pour une partie vide', () => {
    expect(calculerTrophees([lea, tom], calculerStats([]), false)).toEqual([])
  })
})

describe('lireSauvegarde', () => {
  test('répare une sauvegarde abîmée', () => {
    const lue = lireSauvegarde({
      joueurs: [{ id: 'a', prenom: '  Léa ' }, { prenom: 42 }, null],
      reglages: { ton: 'n’importe quoi', intensite: 'hard' },
      sonCoupe: 'oui',
    })
    expect(lue.joueurs).toHaveLength(1)
    expect(lue.joueurs[0].prenom).toBe('Léa')
    expect(lue.reglages.ton).toBe(REGLAGES_PAR_DEFAUT.ton)
    expect(lue.reglages.intensite).toBe('hard')
    expect(lue.sonCoupe).toBe(false)
  })

  test('renvoie les valeurs par défaut si le contenu n’est pas un objet', () => {
    expect(lireSauvegarde('cassé').joueurs).toEqual([])
  })
})

describe('jeux à manches', () => {
  const carte = (id: string, tags: string[] = []) => ({
    id,
    texte: '{j1}, action.',
    ton: 'tout-public' as const,
    intensite: 'soft' as const,
    tags,
    minJoueurs: 2,
  })

  test('la roue s’arrête avec la part du joueur sous la flèche', () => {
    // 4 joueurs : parts de 90°, le centre de la part 1 est à 135°.
    const angle = angleRoue(1, 4, 0)
    expect(angle % 360).toBe(225)
    expect(angle).toBeGreaterThanOrEqual(5 * 360)
  })

  test('la roue repart toujours vers l’avant', () => {
    const premier = angleRoue(0, 4, 0)
    expect(angleRoue(3, 4, premier)).toBeGreaterThan(premier)
  })

  test('tirerAction respecte le profil et évite les répétitions', () => {
    const prudent = joueur('Zoé', { defisPhysiques: false })
    const cartes = [carte('a', ['physique']), carte('b'), carte('c')]
    expect(tirerAction(cartes, prudent, new Set(['b']), () => 0)?.id).toBe('c')
    expect(tirerAction([carte('a', ['physique'])], prudent, new Set())).toBeNull()
    // Tout a déjà été tiré : on recycle plutôt que de bloquer.
    expect(tirerAction([carte('b')], prudent, new Set(['b']))?.id).toBe('b')
  })

  test('la mèche dure entre 12 et 35 secondes', () => {
    expect(dureeMeche(() => 0)).toBe(12000)
    expect(dureeMeche(() => 1)).toBe(35000)
  })

  test('le perdant boit, ou fait un gage s’il ne boit pas', () => {
    const sobre = joueur('Zoé', { boitAlcool: false })
    const texte = (c: CarteJouee) => c.segments.map((s) => s.valeur).join('')
    const avec = sanctionPerdant(carte('d'), joueur('Tom'), [sobre], REGLAGES_PAR_DEFAUT)
    expect(texte(avec)).toBe('Tom boit 2 gorgées.')
    expect(avec.joueurs.map((j) => j.prenom)).toEqual(['Tom', 'Zoé'])
    expect(avec.gorgees).toBe(2)
    expect(texte(sanctionPerdant(carte('d'), sobre, [], REGLAGES_PAR_DEFAUT))).toBe('Zoé fait un gage.')
  })
})
