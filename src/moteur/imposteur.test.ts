import { describe, expect, test } from 'vitest'
import type { Joueur, PaireMots, Reglages } from '../types'
import {
  choisirPaire,
  compterImposteurs,
  designerPourGage,
  motDuJoueur,
  nbImposteurs,
  nbToursDeMots,
  paireAutorisee,
  preparerManche,
  rendreVerdict,
  statsImposteur,
  tirerImposteurs,
  type ResultatManche,
} from './imposteur'

function joueur(id: string, options: Partial<Joueur> = {}): Joueur {
  return {
    id,
    prenom: id.toUpperCase(),
    defisPhysiques: true,
    questionsIntimes: true,
    boitAlcool: true,
    ...options,
  }
}

function groupe(nb: number, options: Partial<Joueur> = {}): Joueur[] {
  return Array.from({ length: nb }, (_, i) => joueur(`j${i}`, options))
}

function paire(id: string, options: Partial<PaireMots> = {}): PaireMots {
  return {
    id,
    mots: [`${id}-a`, `${id}-b`],
    ton: 'tout-public',
    difficulte: 1,
    tags: [],
    theme: id,
    ...options,
  }
}

const REGLAGES: Reglages = {
  ton: 'pimente',
  intensite: 'normal',
  sansAlcool: false,
  gorgeesSeulement: true,
}

/** Hasard prévisible : renvoie les valeurs données, en boucle. */
function aleaFixe(...valeurs: number[]): () => number {
  let rang = 0
  return () => valeurs[rang++ % valeurs.length]
}

function texte(segments: { valeur: string }[]): string {
  return segments.map((s) => s.valeur).join('')
}

describe('L’Imposteur : effectifs', () => {
  test('un imposteur jusqu’à 7 joueurs, deux à partir de 8', () => {
    expect(nbImposteurs(4)).toBe(1)
    expect(nbImposteurs(7)).toBe(1)
    expect(nbImposteurs(8)).toBe(2)
    expect(nbImposteurs(12)).toBe(2)
  })

  test('deux tours de mots en petit groupe, un seul à partir de 7', () => {
    expect(nbToursDeMots(4)).toBe(2)
    expect(nbToursDeMots(6)).toBe(2)
    expect(nbToursDeMots(7)).toBe(1)
  })
})

describe('L’Imposteur : choix des paires', () => {
  test('respecte le ton choisi', () => {
    const hard = paire('h', { ton: 'hard' })
    expect(paireAutorisee(hard, groupe(4), REGLAGES)).toBe(false)
    expect(paireAutorisee(hard, groupe(4), { ...REGLAGES, ton: 'hard' })).toBe(true)
  })

  test('retire les paires intimes si la majorité du groupe les refuse', () => {
    const intime = paire('i', { tags: ['intime'] })
    const prudents = groupe(4, { questionsIntimes: false })
    expect(paireAutorisee(intime, prudents, REGLAGES)).toBe(false)
    expect(paireAutorisee(intime, groupe(4), REGLAGES)).toBe(true)
  })

  test('monte en difficulté : 1, puis 2, 2, puis 3, 3', () => {
    const paires = [1, 2, 3].flatMap((difficulte) =>
      Array.from({ length: 4 }, (_, i) =>
        paire(`d${difficulte}-${i}`, { difficulte: difficulte as 1 | 2 | 3 }),
      ),
    )
    const choisies: PaireMots[] = []
    for (let rang = 0; rang < 5; rang += 1) {
      const suivante = choisirPaire(paires, groupe(4), REGLAGES, { rang, utilisees: choisies })
      if (suivante) choisies.push(suivante)
    }
    expect(choisies.map((p) => p.difficulte)).toEqual([1, 2, 2, 3, 3])
    expect(new Set(choisies.map((p) => p.id)).size).toBe(5)
  })

  test('préfère une paire jamais vue et un thème pas encore sorti', () => {
    const vue = paire('vue')
    const memeTheme = paire('meme-theme', { theme: 'plage' })
    const neuve = paire('neuve')
    const dejaSortie = paire('sortie', { theme: 'plage' })
    const choisie = choisirPaire([vue, memeTheme, neuve], groupe(4), REGLAGES, {
      rang: 0,
      utilisees: [dejaSortie],
      dejaVues: new Set(['vue']),
    })
    expect(choisie?.id).toBe('neuve')
  })

  test('prend la difficulté voisine, puis une paire déjà vue, plutôt que de bloquer', () => {
    const seule = paire('seule', { difficulte: 3 })
    const options = { rang: 0, utilisees: [], dejaVues: new Set(['seule']) }
    expect(choisirPaire([seule], groupe(4), REGLAGES, options)?.id).toBe('seule')
    expect(choisirPaire([], groupe(4), REGLAGES, options)).toBeNull()
    expect(
      choisirPaire([seule], groupe(4), REGLAGES, { ...options, utilisees: [seule] }),
    ).toBeNull()
  })
})

describe('L’Imposteur : distribution', () => {
  test('tire le bon nombre d’imposteurs, tous différents', () => {
    const joueurs = groupe(9)
    const imposteurs = tirerImposteurs(joueurs, 2, {}, aleaFixe(0.1, 0.1))
    expect(imposteurs).toHaveLength(2)
    expect(new Set(imposteurs).size).toBe(2)
  })

  test('ceux qui ont déjà été imposteurs le redeviennent moins souvent, sans être exclus', () => {
    const joueurs = groupe(4)
    const dejaPasse = { j0: 3 }
    let foisJ0 = 0
    for (let i = 0; i < 200; i += 1) {
      const [tire] = tirerImposteurs(joueurs, 1, dejaPasse, aleaFixe((i + 0.5) / 200))
      if (tire === 'j0') foisJ0 += 1
    }
    // Poids 1/7 contre 1 pour les trois autres : environ 4,5 % des tirages.
    expect(foisJ0).toBeGreaterThan(0)
    expect(foisJ0).toBeLessThan(20)
  })

  test('le premier joueur tourne à chaque manche', () => {
    const joueurs = groupe(4)
    const manche = preparerManche(paire('p'), joueurs, 1, {}, aleaFixe(0.3))
    expect(manche.ordre.map((j) => j.id)).toEqual(['j1', 'j2', 'j3', 'j0'])
    const cinquieme = preparerManche(paire('p'), joueurs, 4, {}, aleaFixe(0.3))
    expect(cinquieme.ordre[0].id).toBe('j0')
  })

  test('le mot de l’imposteur est tiré à pile ou face parmi les deux', () => {
    const joueurs = groupe(4)
    const pile = preparerManche(paire('p'), joueurs, 0, {}, aleaFixe(0.1, 0.1))
    const face = preparerManche(paire('p'), joueurs, 0, {}, aleaFixe(0.1, 0.9))
    expect(pile.motImposteurs).not.toBe(face.motImposteurs)
    expect(pile.motInnocents).not.toBe(pile.motImposteurs)
  })

  test('chaque joueur reçoit le mot de son camp', () => {
    const manche = preparerManche(paire('p'), groupe(8), 0, {}, aleaFixe(0.2, 0.6, 0.4))
    expect(manche.imposteurs).toHaveLength(2)
    for (const j of manche.ordre) {
      const attendu = manche.imposteurs.includes(j.id)
        ? manche.motImposteurs
        : manche.motInnocents
      expect(motDuJoueur(manche, j.id)).toBe(attendu)
    }
  })
})

describe('L’Imposteur : verdict', () => {
  const joueurs = groupe(8)
  const manche = {
    paire: paire('p'),
    motInnocents: 'plage',
    motImposteurs: 'piscine',
    imposteurs: ['j2', 'j5'],
    ordre: joueurs,
  }

  test('imposteur démasqué : lui seul boit, 2, 3 ou 4 gorgées selon l’intensité', () => {
    const normal = rendreVerdict(manche, 'j2', joueurs, REGLAGES)
    expect(normal?.demasque).toBe(true)
    expect(normal?.gorgeesParJoueur).toEqual({ j2: 3 })
    expect(texte(normal?.segments ?? [])).toBe('J2 boit 3 gorgées.')
    const soft = rendreVerdict(manche, 'j2', joueurs, { ...REGLAGES, intensite: 'soft' })
    expect(soft?.gorgeesParJoueur).toEqual({ j2: 2 })
    const hard = rendreVerdict(manche, 'j5', joueurs, { ...REGLAGES, intensite: 'hard' })
    expect(hard?.gorgeesParJoueur).toEqual({ j5: 4 })
  })

  test('jamais de « demi-verre », même si « boire = gorgées » est décoché', () => {
    const hard = rendreVerdict(manche, 'j2', joueurs, {
      ...REGLAGES,
      intensite: 'hard',
      gorgeesSeulement: false,
    })
    expect(texte(hard?.segments ?? [])).toBe('J2 boit 4 gorgées.')
  })

  test('groupe trompé : chaque innocent boit, les imposteurs ne boivent pas', () => {
    const rate = rendreVerdict(manche, 'j0', joueurs, REGLAGES)
    expect(rate?.demasque).toBe(false)
    expect(rate?.gageADesigner).toBe(false)
    expect(rate?.gorgeesParJoueur).toEqual({ j0: 1, j1: 1, j3: 1, j4: 1, j6: 1, j7: 1 })
    const hard = rendreVerdict(manche, 'j0', joueurs, { ...REGLAGES, intensite: 'hard' })
    expect(hard?.gorgeesParJoueur.j1).toBe(2)
  })

  test('jamais plus de 4 gorgées par joueur et par manche', () => {
    for (const intensite of ['soft', 'normal', 'hard'] as const) {
      for (const accuse of ['j0', 'j2']) {
        const verdict = rendreVerdict(manche, accuse, joueurs, { ...REGLAGES, intensite })
        for (const nb of Object.values(verdict?.gorgeesParJoueur ?? {})) {
          expect(nb).toBeLessThanOrEqual(4)
        }
      }
    }
  })

  test('un imposteur démasqué qui ne boit pas d’alcool fait un gage', () => {
    const avecSobre = joueurs.map((j) => (j.id === 'j2' ? { ...j, boitAlcool: false } : j))
    const verdict = rendreVerdict(manche, 'j2', avecSobre, REGLAGES)
    expect(texte(verdict?.segments ?? [])).toBe('J2 fait un gage.')
    expect(verdict?.gorgeesParJoueur).toEqual({ j2: 1 })
  })

  test('sans alcool, groupe trompé : un seul gage, pour l’innocent désigné', () => {
    const sansAlcool = { ...REGLAGES, sansAlcool: true }
    const verdict = rendreVerdict(manche, 'j0', joueurs, sansAlcool)
    expect(verdict?.gageADesigner).toBe(true)
    expect(verdict?.gorgeesParJoueur).toEqual({})
    expect(texte(verdict?.segments ?? [])).toMatch(/gage/)
    const designe = verdict ? designerPourGage(verdict, joueurs[4]) : null
    expect(designe?.gorgeesParJoueur).toEqual({ j4: 1 })
    expect(texte(designe?.segments ?? [])).toBe('J4 fait un gage.')
    expect(designe?.gageADesigner).toBe(false)
  })

  test('un groupe où personne ne boit d’alcool est traité comme le mode Sans alcool', () => {
    const sobres = joueurs.map((j) => ({ ...j, boitAlcool: false }))
    expect(rendreVerdict(manche, 'j0', sobres, REGLAGES)?.gageADesigner).toBe(true)
  })

  test('si aucun innocent ne boit d’alcool, pas de gorgées : un innocent fait un gage', () => {
    // Seuls les deux imposteurs boivent de l'alcool.
    const innocentsSobres = joueurs.map((j) => ({
      ...j,
      boitAlcool: manche.imposteurs.includes(j.id),
    }))
    const verdict = rendreVerdict(manche, 'j0', innocentsSobres, REGLAGES)
    expect(verdict?.gageADesigner).toBe(true)
    expect(verdict?.gorgeesParJoueur).toEqual({})
    expect(texte(verdict?.segments ?? [])).not.toMatch(/gorgée/)
  })

  test('un imposteur qui boit de l’alcool boit ses gorgées, même si les innocents sont sobres', () => {
    const innocentsSobres = joueurs.map((j) => ({
      ...j,
      boitAlcool: manche.imposteurs.includes(j.id),
    }))
    const verdict = rendreVerdict(manche, 'j2', innocentsSobres, REGLAGES)
    expect(texte(verdict?.segments ?? [])).toBe('J2 boit 3 gorgées.')
  })

  test('renvoie null si le prénom accusé n’est pas dans la partie', () => {
    expect(rendreVerdict(manche, 'inconnu', joueurs, REGLAGES)).toBeNull()
  })
})

describe('L’Imposteur : récap', () => {
  const joueurs = groupe(4)
  function resultat(imposteur: string, accuse: string): ResultatManche {
    const manche = {
      paire: paire(`${imposteur}-${accuse}`),
      motInnocents: 'a',
      motImposteurs: 'b',
      imposteurs: [imposteur],
      ordre: joueurs,
    }
    const verdict = rendreVerdict(manche, accuse, joueurs, REGLAGES)
    if (verdict === null) throw new Error('verdict attendu')
    return { manche, verdict }
  }

  test('compte les passages comme imposteur', () => {
    const resultats = [resultat('j0', 'j0'), resultat('j0', 'j1'), resultat('j2', 'j1')]
    expect(compterImposteurs(resultats)).toEqual({ j0: 2, j2: 1 })
  })

  test('additionne les gorgées et distribue les titres', () => {
    // j0 démasqué ; j2 passe deux fois entre les gouttes ; j1 accusé à tort deux fois.
    const resultats = [resultat('j0', 'j0'), resultat('j2', 'j1'), resultat('j2', 'j1')]
    const stats = statsImposteur(resultats, joueurs)
    expect(stats.cartesJouees).toBe(3)
    expect(stats.parJoueur.j0).toEqual({ cartes: 1, gorgees: 3 + 1 + 1 })
    // Un imposteur qui passe entre les gouttes ne boit pas.
    expect(stats.parJoueur.j2).toEqual({ cartes: 2, gorgees: 0 })
    expect(stats.parJoueur.j1.gorgees).toBe(2)
    const titres = Object.fromEntries(
      (stats.trophees ?? []).map((t) => [t.titre, t.prenom]),
    )
    expect(titres['Score du groupe']).toBe('1 / 3')
    expect(titres['Le Caméléon']).toBe('J2')
    expect(titres['Le Bouc émissaire']).toBe('J1')
    expect(titres['Le Démasqué']).toBe('J0')
  })

  test('aucun trophée pour une partie sans manche', () => {
    expect(statsImposteur([], joueurs).trophees).toEqual([])
  })
})
