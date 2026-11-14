// Moteur de cartes : filtrage selon les réglages et les profils, tirage des joueurs,
// fabrication du texte final. Uniquement des fonctions pures, testées dans cartes.test.ts.

import type {
  Carte,
  CarteJouee,
  Intensite,
  Joueur,
  Penalite,
  Reglages,
  Segment,
  Ton,
} from '../types'
import {
  GORGEES_PAR_DEFAUT,
  decalerGorgees,
  gorgeesSansDifficulte,
  gorgeesSelonDifficulte,
  plafondGorgees,
  tailleGage,
  type Alea,
} from './penalites'

export type { Alea } from './penalites'

export const NIVEAU_TON: Record<Ton, number> = { 'tout-public': 0, pimente: 1, hard: 2 }
const NIVEAU_INTENSITE: Record<Intensite, number> = { soft: 0, normal: 1, hard: 2 }

/** Une pénalité de groupe (« ceux qui… boivent ») ne dépasse jamais 3 gorgées, 2 en Soft. */
const GORGEES_GROUPE_MAX = 3
const GORGEES_GROUPE_MAX_SOFT = 2
/** Carte dont la pénalité se répète (« à chaque oubli… ») : ses nombres restent tels quels. */
export const TAG_REPETE = 'repete'
/** Pas de carte « les plus dures » dans les premières cartes d'une partie. */
const DEBUT_SANS_EXTREME = 5
/** Une partie s'ouvre toujours sur des cartes faciles ou moyennes. */
const DEBUT_SANS_DIFFICILE = 2
/** Difficulté des cartes « les plus dures » : distribution, gage collectif ou règle. */
const DIFFICULTE_EXTREME = 4
/** Difficulté à partir de laquelle deux cartes ne se suivent pas. */
const DIFFICULTE_FORTE = 3
/** Une règle temporaire prend fin entre 4 et 6 cartes plus tard. */
const DUREE_REGLE_MIN = 4
const DUREE_REGLE_VARIATION = 3

const MOTIF_JOUEUR = /\{j(\d)\}/g
const MOTIF_JETON = /\{(j\d|(?:bois|boit|boivent|buvez|distribue|gorgees):\d+)\}/g

/** Nombre de joueurs différents nommés par la carte ({j1}, {j2}…). */
export function nbJoueursCibles(carte: Carte): number {
  const numeros = [...carte.texte.matchAll(MOTIF_JOUEUR)].map((m) => Number(m[1]))
  return numeros.length === 0 ? 0 : Math.max(...numeros)
}

/** Un joueur accepte-t-il ce type de carte, d'après son mini-questionnaire ? */
export function joueurAccepte(joueur: Joueur, carte: Carte): boolean {
  if (carte.tags.includes('physique') && !joueur.defisPhysiques) return false
  const estIntime = carte.tags.includes('intime') || carte.tags.includes('genant')
  if (estIntime && !joueur.questionsIntimes) return false
  return true
}

/** La carte peut-elle sortir dans cette partie ? */
export function carteAutorisee(
  carte: Carte,
  joueurs: Joueur[],
  reglages: Reglages,
): boolean {
  if (NIVEAU_TON[carte.ton] > NIVEAU_TON[reglages.ton]) return false
  if (NIVEAU_INTENSITE[carte.intensite] > NIVEAU_INTENSITE[reglages.intensite]) {
    return false
  }
  if (carte.minJoueurs > joueurs.length) return false

  const personneNeBoit = joueurs.every((j) => !j.boitAlcool)
  if (carte.tags.includes('alcool') && (reglages.sansAlcool || personneNeBoit)) {
    return false
  }

  const volontaires = joueurs.filter((j) => joueurAccepte(j, carte))
  const cibles = nbJoueursCibles(carte)
  if (cibles > 0) {
    // Carte nominative : il faut assez de joueurs d'accord pour la recevoir.
    return volontaires.length >= cibles
  }
  // Carte de groupe : on la retire si une majorité de joueurs la refuse.
  return volontaires.length * 2 >= joueurs.length
}

export function filtrerCartes(
  cartes: Carte[],
  joueurs: Joueur[],
  reglages: Reglages,
): Carte[] {
  return cartes.filter((carte) => carteAutorisee(carte, joueurs, reglages))
}

/** Mélange une copie de la liste (Fisher-Yates), sans toucher à l'originale. */
export function melanger<T>(elements: readonly T[], alea: Alea = Math.random): T[] {
  const copie = [...elements]
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(alea() * (i + 1))
    const temporaire = copie[i]
    copie[i] = copie[j]
    copie[j] = temporaire
  }
  return copie
}

/**
 * Tire les joueurs d'une carte en privilégiant ceux qui ont le moins joué,
 * pour que tout le monde y passe à peu près autant.
 */
export function choisirJoueurs(
  carte: Carte,
  joueurs: Joueur[],
  compteurs: Readonly<Record<string, number>>,
  alea: Alea = Math.random,
): Joueur[] {
  const cibles = nbJoueursCibles(carte)
  if (cibles === 0) return []
  const candidats = melanger(
    joueurs.filter((j) => joueurAccepte(j, carte)),
    alea,
  ).toSorted((a, b) => (compteurs[a.id] ?? 0) - (compteurs[b.id] ?? 0))
  return candidats.slice(0, cibles)
}

const VERBES_GROUPE: readonly string[] = ['boivent', 'buvez']
const VERBES_POUR_SOI: readonly string[] = ['bois', 'boit', 'boivent', 'buvez']
const MOTIF_BOISSON = /^(bois|boit|boivent|buvez|distribue|gorgees):(\d+)$/

interface Jeton {
  verbe: string
  nb: number
}

function lireJetons(texte: string): Jeton[] {
  return texte
    .split(MOTIF_JETON)
    .map((morceau) => MOTIF_BOISSON.exec(morceau))
    .filter((trouve) => trouve !== null)
    .map((trouve) => ({ verbe: trouve[1], nb: Number(trouve[2]) }))
}

/** Plafond d'une pénalité qui touche plusieurs joueurs à la fois. */
export function plafondGroupe(intensite: Intensite): number {
  return intensite === 'soft' ? GORGEES_GROUPE_MAX_SOFT : GORGEES_GROUPE_MAX
}

function borneGroupe(verbe: string, nb: number, intensite: Intensite): number {
  return VERBES_GROUPE.includes(verbe) ? Math.min(nb, plafondGroupe(intensite)) : nb
}

function quantite(nb: number): string {
  return `${nb} gorgée${nb > 1 ? 's' : ''}`
}

/** Texte d'une action de boisson, ou du gage qui la remplace. */
function texteBoisson(verbe: string, nb: number, enGage: boolean): string {
  if (enGage) {
    switch (verbe) {
      case 'bois':
        return 'fais un gage'
      case 'boit':
        return 'fait un gage'
      case 'boivent':
        return 'font un gage'
      case 'buvez':
        return 'faites un gage'
      case 'distribue':
        return 'donne un gage à qui tu veux'
      default:
        return 'un gage'
    }
  }
  return verbe === 'gorgees' ? quantite(nb) : `${verbe} ${quantite(nb)}`
}

/**
 * Transforme un texte à jetons en morceaux prêts à afficher. `gorgeesPour` donne
 * le nombre final de chaque jeton de boisson.
 */
function rendreTexte(
  texte: string,
  joueursChoisis: Joueur[],
  reglages: Reglages,
  gorgeesPour: (jeton: Jeton) => number,
): { segments: Segment[]; gorgees: number } {
  const premier = joueursChoisis[0]
  // « bois » et « boit » s'adressent au premier joueur : s'il ne boit pas, c'est un gage.
  const premierSansAlcool = premier !== undefined && !premier.boitAlcool
  let gorgees = 0

  const segments: Segment[] = texte
    .split(MOTIF_JETON)
    .filter((morceau) => morceau !== '')
    .map((morceau): Segment => {
      const joueur = /^j(\d)$/.exec(morceau)
      if (joueur) {
        const choisi = joueursChoisis[Number(joueur[1]) - 1]
        return { type: 'joueur', valeur: choisi?.prenom ?? 'Quelqu’un' }
      }
      const boisson = MOTIF_BOISSON.exec(morceau)
      if (boisson) {
        const verbe = boisson[1]
        const nb = gorgeesPour({ verbe, nb: Number(boisson[2]) })
        const pourLePremier = verbe === 'bois' || verbe === 'boit'
        const enGage = reglages.sansAlcool || (pourLePremier && premierSansAlcool)
        if (pourLePremier && premier !== undefined) gorgees += enGage ? 1 : nb
        return { type: 'boisson', valeur: texteBoisson(verbe, nb, enGage) }
      }
      return { type: 'texte', valeur: morceau }
    })

  return { segments: segments.map(majusculeApresPoint), gorgees }
}

export interface OptionsRendu {
  alea?: Alea
  /** Pénalité déjà tirée pour cette carte : on la reprend au lieu de retirer au sort. */
  gorgees?: number
}

/**
 * Transforme une carte en carte jouée : prénoms, actions de boisson (ou gages) et pénalité.
 * La pénalité suit la difficulté de la carte ; le premier jeton « je bois » la reçoit
 * et les autres nombres de la carte sont décalés d'autant.
 */
export function rendreCarte(
  carte: Carte,
  joueursChoisis: Joueur[],
  reglages: Reglages,
  { alea = Math.random, gorgees: gorgeesImposees }: OptionsRendu = {},
): CarteJouee {
  const { intensite } = reglages
  const jetons = lireJetons(carte.texte)
  const reference = jetons.find((j) => VERBES_POUR_SOI.includes(j.verbe)) ?? jetons[0]
  const base = reference?.nb ?? GORGEES_PAR_DEFAUT
  const repete = carte.tags.includes(TAG_REPETE)

  function tirer(): number {
    if (repete) return decalerGorgees(base, 0, intensite)
    if (carte.difficulte !== undefined) {
      return gorgeesSelonDifficulte(carte.difficulte, intensite, alea)
    }
    return gorgeesSansDifficulte(base, intensite, alea)
  }
  const nb = Math.min(gorgeesImposees ?? tirer(), plafondGorgees(intensite))
  const ecart = nb - base

  const { segments, gorgees } = rendreTexte(carte.texte, joueursChoisis, reglages, (jeton) =>
    borneGroupe(jeton.verbe, decalerGorgees(jeton.nb, ecart, intensite), intensite),
  )
  const premier = joueursChoisis[0]
  const penalite: Penalite = {
    gorgees: nb,
    // Une pénalité qui se répète reste petite, quelle que soit la difficulté de la carte.
    taille: repete ? 'petit' : tailleGage(carte.difficulte, nb),
    distribue: reference?.verbe === 'distribue',
    speciale: carte.difficulte === DIFFICULTE_EXTREME && jetons.length === 0,
    repete,
    enGage: reglages.sansAlcool || (premier !== undefined && !premier.boitAlcool),
  }
  return { carte, joueurs: joueursChoisis, segments, gorgees, penalite }
}

/**
 * Rend une phrase qui accompagne une carte (consigne du jeu, verdict d'une manche) :
 * tous ses jetons prennent la pénalité de la carte, plafonnée pour les pénalités de groupe.
 */
export function rendreConsigne(
  texte: string,
  joueursChoisis: Joueur[],
  reglages: Reglages,
  gorgeesCarte: number,
): { segments: Segment[]; gorgees: number } {
  const nb = decalerGorgees(gorgeesCarte, 0, reglages.intensite)
  return rendreTexte(texte, joueursChoisis, reglages, (jeton) =>
    borneGroupe(jeton.verbe, nb, reglages.intensite),
  )
}

/** Met une majuscule à une action de boisson placée en début de phrase (« Raté ? Bois… »). */
function majusculeApresPoint(segment: Segment, index: number, tous: Segment[]): Segment {
  if (segment.type !== 'boisson') return segment
  const avant = tous[index - 1]
  const debutDePhrase =
    avant === undefined || (avant.type === 'texte' && /[.?!…]\s*$/.test(avant.valeur))
  if (!debutDePhrase) return segment
  return {
    ...segment,
    valeur: segment.valeur.charAt(0).toLocaleUpperCase('fr') + segment.valeur.slice(1),
  }
}

/** Carte « fin de règle » fabriquée à partir d'une règle temporaire. */
function carteFinDeRegle(regle: CarteJouee, reglages: Reglages): CarteJouee | null {
  if (regle.carte.texteFin === undefined) return null
  const fin: Carte = {
    ...regle.carte,
    id: `${regle.carte.id}-fin`,
    categorie: 'Fin de règle',
    texte: regle.carte.texteFin,
    texteFin: undefined,
  }
  const gorgees = regle.penalite?.gorgees
  return { ...rendreCarte(fin, regle.joueurs, reglages, { gorgees }), gorgees: 0, penalite: null }
}

/**
 * Réordonne un paquet pour doser l'enjeu : on commence doucement, pas de carte
 * « les plus dures » dans les premières cartes, et jamais deux cartes difficiles d'affilée quand c'est évitable.
 */
export function etalerDifficultes(cartes: readonly Carte[]): Carte[] {
  const restantes = [...cartes]
  const ordre: Carte[] = []
  while (restantes.length > 0) {
    const precedente = ordre[ordre.length - 1]
    const apresForte = (precedente?.difficulte ?? 0) >= DIFFICULTE_FORTE
    const position = restantes.findIndex((carte) => {
      const difficulte = carte.difficulte ?? 0
      if (ordre.length < DEBUT_SANS_EXTREME && difficulte > DIFFICULTE_FORTE) return false
      if (ordre.length < DEBUT_SANS_DIFFICILE && difficulte >= DIFFICULTE_FORTE) return false
      return !(apresForte && difficulte >= DIFFICULTE_FORTE)
    })
    ordre.push(...restantes.splice(Math.max(0, position), 1))
  }
  return ordre
}

/**
 * Cartes qui peuvent sortir à ce moment d'une partie tirée carte par carte (La Roue) :
 * mêmes règles de dosage que `etalerDifficultes`. Si rien ne passe, on garde tout.
 */
export function cartesDuMoment(
  cartes: readonly Carte[],
  nbDejaJouees: number,
  precedente: Carte | undefined,
): Carte[] {
  const apresForte = (precedente?.difficulte ?? 0) >= DIFFICULTE_FORTE
  const permises = cartes.filter((carte) => {
    const difficulte = carte.difficulte ?? 0
    if (nbDejaJouees < DEBUT_SANS_EXTREME && difficulte > DIFFICULTE_FORTE) return false
    if (nbDejaJouees < DEBUT_SANS_DIFFICILE && difficulte >= DIFFICULTE_FORTE) return false
    return !(apresForte && difficulte >= DIFFICULTE_FORTE)
  })
  return permises.length > 0 ? permises : [...cartes]
}

export interface OptionsPaquet {
  taille: number
  alea?: Alea
  /** Cartes déjà vues lors des parties précédentes : elles sortent en dernier. */
  dejaVues?: ReadonlySet<string>
}

/** Fabrique le paquet d'une partie : cartes filtrées, mélangées, joueurs attribués. */
export function construirePaquet(
  cartes: Carte[],
  joueurs: Joueur[],
  reglages: Reglages,
  { taille, alea = Math.random, dejaVues = new Set() }: OptionsPaquet,
): CarteJouee[] {
  const autorisees = melanger(filtrerCartes(cartes, joueurs, reglages), alea)
  const nouvelles = autorisees.filter((c) => !dejaVues.has(c.id))
  const revues = autorisees.filter((c) => dejaVues.has(c.id))
  const selection = etalerDifficultes([...nouvelles, ...revues].slice(0, taille))

  // Attribution des joueurs, en équilibrant le nombre de cartes de chacun.
  const { jouees } = selection.reduce<{
    jouees: CarteJouee[]
    compteurs: Record<string, number>
  }>(
    (etat, carte) => {
      const choisis = choisirJoueurs(carte, joueurs, etat.compteurs, alea)
      const compteurs = choisis.reduce(
        (acc, j) => ({ ...acc, [j.id]: (acc[j.id] ?? 0) + 1 }),
        etat.compteurs,
      )
      return {
        jouees: [...etat.jouees, rendreCarte(carte, choisis, reglages, { alea })],
        compteurs,
      }
    },
    { jouees: [], compteurs: {} },
  )

  // Les règles temporaires reçoivent leur carte de fin quelques tours plus tard.
  return jouees.reduce<CarteJouee[]>((paquet, jouee) => {
    const fin = carteFinDeRegle(jouee, reglages)
    if (fin === null) return paquet
    const duree = DUREE_REGLE_MIN + Math.floor(alea() * DUREE_REGLE_VARIATION)
    const positionRegle = paquet.findIndex((c) => c.carte.id === jouee.carte.id)
    const position = Math.min(paquet.length, positionRegle + duree + 1)
    return [...paquet.slice(0, position), fin, ...paquet.slice(position)]
  }, jouees)
}
