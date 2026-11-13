// Moteur de cartes : filtrage selon les réglages et les profils, tirage des joueurs,
// fabrication du texte final. Uniquement des fonctions pures, testées dans cartes.test.ts.

import type {
  Carte,
  CarteJouee,
  Intensite,
  Joueur,
  Reglages,
  Segment,
  Ton,
} from '../types'

/** Générateur de hasard (entre 0 et 1). Remplaçable dans les tests. */
export type Alea = () => number

const NIVEAU_TON: Record<Ton, number> = { 'tout-public': 0, pimente: 1, hard: 2 }
const NIVEAU_INTENSITE: Record<Intensite, number> = { soft: 0, normal: 1, hard: 2 }

const GORGEES_MAX = 5
/** À partir de ce nombre, on parle de « demi-verre » si l'option « boire = gorgées » est coupée. */
const SEUIL_DEMI_VERRE = 4
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

/** Adapte un nombre de gorgées à l'intensité choisie (entre 1 et 5). */
export function ajusterGorgees(base: number, intensite: Intensite): number {
  const decalage = NIVEAU_INTENSITE[intensite] - 1
  return Math.min(GORGEES_MAX, Math.max(1, base + decalage))
}

function quantite(nb: number, reglages: Reglages): string {
  if (!reglages.gorgeesSeulement && nb >= SEUIL_DEMI_VERRE) return 'un demi-verre'
  return `${nb} gorgée${nb > 1 ? 's' : ''}`
}

/** Texte d'une action de boisson, ou du gage qui la remplace. */
function texteBoisson(
  verbe: string,
  nb: number,
  enGage: boolean,
  reglages: Reglages,
): string {
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
  const combien = quantite(nb, reglages)
  return verbe === 'gorgees' ? combien : `${verbe} ${combien}`
}

/**
 * Transforme le texte d'une carte en morceaux prêts à afficher :
 * prénoms des joueurs, actions de boisson (ou gages), texte simple.
 */
export function rendreCarte(
  carte: Carte,
  joueursChoisis: Joueur[],
  reglages: Reglages,
): CarteJouee {
  const premier = joueursChoisis[0]
  // « bois » et « boit » s'adressent au premier joueur : s'il ne boit pas, c'est un gage.
  const premierSansAlcool = premier !== undefined && !premier.boitAlcool
  let gorgees = 0

  const segments: Segment[] = carte.texte
    .split(MOTIF_JETON)
    .filter((morceau) => morceau !== '')
    .map((morceau): Segment => {
      const joueur = /^j(\d)$/.exec(morceau)
      if (joueur) {
        const choisi = joueursChoisis[Number(joueur[1]) - 1]
        return { type: 'joueur', valeur: choisi?.prenom ?? 'Quelqu’un' }
      }
      const boisson = /^(bois|boit|boivent|buvez|distribue|gorgees):(\d+)$/.exec(morceau)
      if (boisson) {
        const verbe = boisson[1]
        const nb = ajusterGorgees(Number(boisson[2]), reglages.intensite)
        const pourLePremier = verbe === 'bois' || verbe === 'boit'
        const enGage =
          reglages.sansAlcool || (pourLePremier && premierSansAlcool)
        if (pourLePremier && premier !== undefined) gorgees += enGage ? 1 : nb
        return { type: 'boisson', valeur: texteBoisson(verbe, nb, enGage, reglages) }
      }
      return { type: 'texte', valeur: morceau }
    })

  return { carte, joueurs: joueursChoisis, segments, gorgees }
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
  return { ...rendreCarte(fin, regle.joueurs, reglages), gorgees: 0 }
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
  const selection = [...nouvelles, ...revues].slice(0, taille)

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
        jouees: [...etat.jouees, rendreCarte(carte, choisis, reglages)],
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
