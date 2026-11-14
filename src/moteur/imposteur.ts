// Logique de L'Imposteur : choix des paires, distribution des mots, verdict, récap.
// Uniquement des fonctions pures, testées dans imposteur.test.ts.

import type {
  Joueur,
  PaireMots,
  Reglages,
  Segment,
  StatsPartie,
  Trophee,
} from '../types'
import { ajusterGorgees, melanger, NIVEAU_TON, type Alea } from './cartes'
import { rendreSanction } from './sanctions'

/** Nombre de manches d'une partie. */
export const NB_MANCHES = 5
/** Durée du débat avant le vote, en secondes. */
export const DUREE_DEBAT_S = 90

/** À partir de ce nombre de joueurs, il y a deux imposteurs. */
const SEUIL_DEUX_IMPOSTEURS = 8
/** À partir de ce nombre de joueurs, un seul tour de mots (sinon c'est trop long). */
const SEUIL_UN_SEUL_TOUR = 7
/** Difficulté visée à chaque manche : on commence facile, on finit serré. */
const DIFFICULTE_PAR_MANCHE = [1, 2, 2, 3, 3]
/** Gorgées de base (avant réglage d'intensité) : jamais plus de 4 par manche. */
const GORGEES_DEMASQUE = 3
const GORGEES_INNOCENTS = 1

// Poids du choix d'une paire : plus le coût est bas, mieux c'est.
const COUT_DEJA_VUE = 100
const COUT_ECART_DIFFICULTE = 10
const COUT_THEME_REPETE = 5
const COUT_AUTRE_TON = 3

export function nbImposteurs(nbJoueurs: number): number {
  return nbJoueurs >= SEUIL_DEUX_IMPOSTEURS ? 2 : 1
}

export function nbToursDeMots(nbJoueurs: number): number {
  return nbJoueurs >= SEUIL_UN_SEUL_TOUR ? 1 : 2
}

/** La paire peut-elle sortir avec ce ton et ce groupe ? */
export function paireAutorisee(
  paire: PaireMots,
  joueurs: Joueur[],
  reglages: Reglages,
): boolean {
  if (NIVEAU_TON[paire.ton] > NIVEAU_TON[reglages.ton]) return false
  const sensible = paire.tags.includes('intime') || paire.tags.includes('genant')
  if (!sensible) return true
  // Comme pour les cartes de groupe : on la retire si une majorité la refuse.
  const partants = joueurs.filter((j) => j.questionsIntimes).length
  return partants * 2 >= joueurs.length
}

export interface OptionsPaire {
  /** Rang de la manche (0 pour la première). */
  rang: number
  /** Paires déjà sorties dans cette partie : jamais reprises, thèmes évités. */
  utilisees: readonly PaireMots[]
  /** Paires vues lors des parties précédentes : elles sortent en dernier. */
  dejaVues?: ReadonlySet<string>
  alea?: Alea
}

/**
 * Choisit la paire d'une manche : difficulté croissante, de préférence jamais vue,
 * d'un thème pas encore sorti et du ton choisi. Renvoie null s'il n'en reste aucune.
 */
export function choisirPaire(
  paires: readonly PaireMots[],
  joueurs: Joueur[],
  reglages: Reglages,
  { rang, utilisees, dejaVues = new Set(), alea = Math.random }: OptionsPaire,
): PaireMots | null {
  const idsUtilises = new Set(utilisees.map((p) => p.id))
  const themesSortis = new Set(utilisees.map((p) => p.theme))
  const candidates = melanger(
    paires.filter(
      (p) => !idsUtilises.has(p.id) && paireAutorisee(p, joueurs, reglages),
    ),
    alea,
  )
  const cible = DIFFICULTE_PAR_MANCHE[rang % DIFFICULTE_PAR_MANCHE.length]
  // Une manche sur deux vise le ton exact, pour qu'il domine la partie.
  const viseTonExact = rang % 2 === 0
  const cout = (p: PaireMots): number =>
    (dejaVues.has(p.id) ? COUT_DEJA_VUE : 0) +
    Math.abs(p.difficulte - cible) * COUT_ECART_DIFFICULTE +
    (themesSortis.has(p.theme) ? COUT_THEME_REPETE : 0) +
    (viseTonExact && p.ton !== reglages.ton ? COUT_AUTRE_TON : 0)

  return candidates.reduce<PaireMots | null>(
    (meilleure, p) => (meilleure === null || cout(p) < cout(meilleure) ? p : meilleure),
    null,
  )
}

/**
 * Tire les imposteurs au hasard. Ceux qui l'ont déjà été ont moins de chances,
 * mais ne sont jamais exclus : personne ne peut déduire son rôle.
 */
export function tirerImposteurs(
  joueurs: Joueur[],
  nb: number,
  foisImposteur: Readonly<Record<string, number>>,
  alea: Alea = Math.random,
): string[] {
  const poids = (j: Joueur): number => 1 / (1 + 2 * (foisImposteur[j.id] ?? 0))

  function tirer(restants: Joueur[], choisis: string[]): string[] {
    if (choisis.length >= nb || restants.length === 0) return choisis
    const total = restants.reduce((somme, j) => somme + poids(j), 0)
    const seuil = alea() * total
    const cumuls = restants.map((_, i) =>
      restants.slice(0, i + 1).reduce((somme, j) => somme + poids(j), 0),
    )
    const trouve = cumuls.findIndex((cumul) => seuil < cumul)
    const index = trouve === -1 ? restants.length - 1 : trouve
    return tirer(
      restants.filter((_, i) => i !== index),
      [...choisis, restants[index].id],
    )
  }

  return tirer(joueurs, [])
}

export interface Manche {
  paire: PaireMots
  motInnocents: string
  motImposteurs: string
  /** Identifiants des imposteurs. */
  imposteurs: string[]
  /** Ordre de passage du téléphone, puis de prise de parole. */
  ordre: Joueur[]
}

/** Prépare une manche : qui commence, qui est imposteur, quel mot pour chaque camp. */
export function preparerManche(
  paire: PaireMots,
  joueurs: Joueur[],
  rang: number,
  foisImposteur: Readonly<Record<string, number>>,
  alea: Alea = Math.random,
): Manche {
  const depart = rang % joueurs.length
  const ordre = [...joueurs.slice(depart), ...joueurs.slice(0, depart)]
  const imposteurs = tirerImposteurs(
    joueurs,
    nbImposteurs(joueurs.length),
    foisImposteur,
    alea,
  )
  // Pile ou face : aucun des deux mots n'est « le mot de l'imposteur » par nature.
  const inverse = alea() >= 0.5
  const [premier, second] = paire.mots
  return {
    paire,
    motInnocents: inverse ? second : premier,
    motImposteurs: inverse ? premier : second,
    imposteurs,
    ordre,
  }
}

export function motDuJoueur(manche: Manche, idJoueur: string): string {
  return manche.imposteurs.includes(idJoueur)
    ? manche.motImposteurs
    : manche.motInnocents
}

export interface Verdict {
  accuse: Joueur
  /** Le prénom touché était bien un imposteur. */
  demasque: boolean
  /** Phrase de sanction prête à afficher. */
  segments: Segment[]
  /** Gorgées (ou gages) de la manche, par identifiant de joueur. */
  gorgeesParJoueur: Record<string, number>
  /** Sans alcool et groupe trompé : les imposteurs désignent un innocent pour un gage. */
  gageADesigner: boolean
  /** Précision affichée sous la sanction. */
  note: string | null
}

/** Verdict du vote : qui boit, et combien. Null si le prénom accusé est inconnu. */
export function rendreVerdict(
  manche: Manche,
  idAccuse: string,
  joueurs: Joueur[],
  reglages: Reglages,
): Verdict | null {
  const accuse = joueurs.find((j) => j.id === idAccuse)
  if (accuse === undefined) return null

  // Dans ce jeu on compte toujours en gorgées : jamais de « demi-verre ».
  const regles: Reglages = { ...reglages, gorgeesSeulement: true }
  const demasque = manche.imposteurs.includes(idAccuse)
  const innocents = joueurs.filter((j) => !manche.imposteurs.includes(j.id))

  if (demasque) {
    const sanction = rendreSanction(`{j1} {boit:${GORGEES_DEMASQUE}}.`, [accuse], regles)
    return {
      accuse,
      demasque,
      segments: sanction.segments,
      gorgeesParJoueur: { [accuse.id]: sanction.gorgees },
      gageADesigner: false,
      note: null,
    }
  }

  // Sans alcool, ou aucun innocent ne boit d'alcool : un seul gage au lieu des gorgées.
  if (reglages.sansAlcool || innocents.every((j) => !j.boitAlcool)) {
    const qui =
      manche.imposteurs.length > 1 ? 'Les imposteurs désignent' : 'L’imposteur désigne'
    return {
      accuse,
      demasque,
      segments: [
        { type: 'texte', valeur: `${qui} un innocent, qui ` },
        { type: 'boisson', valeur: 'fait un gage' },
        { type: 'texte', valeur: '.' },
      ],
      gorgeesParJoueur: {},
      gageADesigner: true,
      note: null,
    }
  }

  const nb = ajusterGorgees(GORGEES_INNOCENTS, reglages.intensite)
  const sanction = rendreSanction(
    `Les innocents {boivent:${GORGEES_INNOCENTS}}.`,
    [],
    regles,
  )
  return {
    accuse,
    demasque,
    segments: sanction.segments,
    gorgeesParJoueur: Object.fromEntries(innocents.map((j) => [j.id, nb])),
    gageADesigner: false,
    note: innocents.some((j) => !j.boitAlcool)
      ? 'Ceux qui ne boivent pas d’alcool trinquent avec leur verre habituel.'
      : null,
  }
}

/** Enregistre l'innocent choisi par les imposteurs pour faire le gage. */
export function designerPourGage(verdict: Verdict, joueur: Joueur): Verdict {
  return {
    ...verdict,
    segments: [
      { type: 'joueur', valeur: joueur.prenom },
      { type: 'texte', valeur: ' ' },
      { type: 'boisson', valeur: 'fait un gage' },
      { type: 'texte', valeur: '.' },
    ],
    gorgeesParJoueur: { [joueur.id]: 1 },
    gageADesigner: false,
  }
}

export interface ResultatManche {
  manche: Manche
  verdict: Verdict
}

/** Nombre de fois où chaque joueur a été imposteur. */
export function compterImposteurs(
  resultats: readonly ResultatManche[],
): Record<string, number> {
  return resultats
    .flatMap((r) => r.manche.imposteurs)
    .reduce<Record<string, number>>(
      (compteurs, id) => ({ ...compteurs, [id]: (compteurs[id] ?? 0) + 1 }),
      {},
    )
}

function compter(ids: string[]): Record<string, number> {
  return ids.reduce<Record<string, number>>(
    (compteurs, id) => ({ ...compteurs, [id]: (compteurs[id] ?? 0) + 1 }),
    {},
  )
}

/** Joueur au plus grand compteur (null si tout le monde est à zéro). */
function premier(
  joueurs: Joueur[],
  compteurs: Record<string, number>,
): { joueur: Joueur; valeur: number } | null {
  const classes = joueurs
    .map((joueur) => ({ joueur, valeur: compteurs[joueur.id] ?? 0 }))
    .toSorted((a, b) => b.valeur - a.valeur)
  const tete = classes[0]
  return tete !== undefined && tete.valeur > 0 ? tete : null
}

function fois(nb: number): string {
  return `${nb} fois`
}

/** Statistiques et titres de fin de partie. */
export function statsImposteur(
  resultats: readonly ResultatManche[],
  joueurs: Joueur[],
): StatsPartie {
  const foisImposteur = compterImposteurs(resultats)
  const demasques = compter(
    resultats.filter((r) => r.verdict.demasque).map((r) => r.verdict.accuse.id),
  )
  const accusesATort = compter(
    resultats.filter((r) => !r.verdict.demasque).map((r) => r.verdict.accuse.id),
  )
  // Passé entre les gouttes : imposteur sans être le prénom touché.
  const esquives = compter(
    resultats.flatMap((r) =>
      r.manche.imposteurs.filter(
        (id) => !(r.verdict.demasque && r.verdict.accuse.id === id),
      ),
    ),
  )
  const jamaisPris = joueurs.filter((j) => (demasques[j.id] ?? 0) === 0)

  const parJoueur = Object.fromEntries(
    joueurs.map((j) => [
      j.id,
      {
        cartes: foisImposteur[j.id] ?? 0,
        gorgees: resultats.reduce(
          (somme, r) => somme + (r.verdict.gorgeesParJoueur[j.id] ?? 0),
          0,
        ),
      },
    ]),
  )

  const trophees: Trophee[] = []
  if (resultats.length > 0) {
    const nbDemasques = resultats.filter((r) => r.verdict.demasque).length
    trophees.push({
      emoji: '🕵️',
      titre: 'Score du groupe',
      prenom: `${nbDemasques} / ${resultats.length}`,
      detail: nbDemasques > 1 ? 'imposteurs démasqués' : 'imposteur démasqué',
    })
  }
  const cameleon = premier(jamaisPris, esquives)
  if (cameleon) {
    trophees.push({
      emoji: '🦎',
      titre: 'Le Caméléon',
      prenom: cameleon.joueur.prenom,
      detail: `Imposteur ${fois(cameleon.valeur)}, jamais démasqué`,
    })
  }
  const bouc = premier(joueurs, accusesATort)
  if (bouc) {
    trophees.push({
      emoji: '🐐',
      titre: 'Le Bouc émissaire',
      prenom: bouc.joueur.prenom,
      detail: `Accusé à tort ${fois(bouc.valeur)}`,
    })
  }
  const pris = premier(joueurs, demasques)
  if (pris) {
    trophees.push({
      emoji: '🚨',
      titre: 'Le Démasqué',
      prenom: pris.joueur.prenom,
      detail: `Pris la main dans le sac ${fois(pris.valeur)}`,
    })
  }

  return { cartesJouees: resultats.length, parJoueur, trophees }
}
