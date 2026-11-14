// Catalogue des jeux : nom, couleur, nombre de joueurs, règles.
// Pour ajouter un jeu : une entrée ici + un composant dans `src/jeux`.

import type { IdJeu } from '../types'

export type CategorieJeu = 'cartes' | 'bluff' | 'hasard'

/** Les familles de jeux, dans l'ordre d'affichage. */
export const CATEGORIES: { id: CategorieJeu; titre: string }[] = [
  { id: 'cartes', titre: 'On lit, on répond' },
  { id: 'bluff', titre: 'Bluff et cerveau' },
  { id: 'hasard', titre: 'Hasard et défis' },
]

export interface DefinitionJeu {
  id: IdJeu
  nom: string
  emoji: string
  /** Phrase d'accroche affichée dans la liste des jeux. */
  accroche: string
  /** Couleur d'accent du jeu (néon). */
  couleur: string
  minJoueurs: number
  maxJoueurs: number
  /** Fourchette où le jeu est le plus drôle (sert aux recommandations). */
  idealMin: number
  idealMax: number
  /** Le jeu repose surtout sur des défis physiques. */
  plutotPhysique: boolean
  /** Le jeu repose surtout sur des révélations personnelles. */
  plutotIntime: boolean
  regles: string[]
  /** Règles à afficher en mode Sans alcool, quand les règles normales parlent de boire. */
  reglesSansAlcool?: string[]
  /** Accroche en mode Sans alcool, quand l'accroche normale parle de boire. */
  accrocheSansAlcool?: string
  /** Famille du jeu, pour regrouper la liste. */
  categorie: CategorieJeu
  /** Rappel affiché sous chaque carte (mêmes jetons que les cartes : {boivent:1}…). */
  consigne?: string
  /**
   * Ajout à la consigne quand la carte coûte plus que le plafond des pénalités de groupe :
   * ce que prend le joueur qui se retrouve seul.
   */
  consigneSeul?: string
  /** Affiche un bouton « 3-2-1 » pour voter tous en même temps. */
  decompte?: boolean
  /** Ce qu'on compte dans le récap : « cartes » par défaut, « manches » pour certains jeux. */
  unite?: { singulier: string; pluriel: string }
  /** `false` tant que le jeu n'est pas encore jouable. */
  pret: boolean
}

export const CATALOGUE: DefinitionJeu[] = [
  {
    id: 'defis-verites',
    categorie: 'cartes',
    nom: 'Défis & Vérités',
    emoji: '🔥',
    accroche: 'Défis, questions et règles tordues qui tombent au hasard.',
    couleur: '#ff3d9a',
    minJoueurs: 2,
    maxJoueurs: 12,
    idealMin: 4,
    idealMax: 10,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Le téléphone passe de main en main : lisez la carte à voix haute.',
      'Le joueur dont le prénom s’affiche fait le défi ou répond à la question.',
      'Refuser, c’est permis : ça coûte les gorgées du bandeau 🍺 (1 à 5 selon la difficulté), ou un gage.',
      'Les règles « Jusqu’à nouvel ordre » durent jusqu’à la carte qui les annule.',
    ],
    reglesSansAlcool: [
      'Le téléphone passe de main en main : lisez la carte à voix haute.',
      'Le joueur dont le prénom s’affiche fait le défi ou répond à la question.',
      'Refuser, c’est permis : ça coûte le gage annoncé par la carte (petit, moyen ou gros).',
      'Les règles « Jusqu’à nouvel ordre » durent jusqu’à la carte qui les annule.',
    ],
    pret: true,
  },
  {
    id: 'je-nai-jamais',
    categorie: 'cartes',
    nom: 'Je n’ai jamais',
    emoji: '🙈',
    accroche: 'Ceux qui l’ont déjà fait se dénoncent… et boivent.',
    couleur: '#2ef2ff',
    minJoueurs: 3,
    maxJoueurs: 12,
    idealMin: 4,
    idealMax: 12,
    plutotPhysique: false,
    plutotIntime: true,
    regles: [
      'Lisez la phrase « Je n’ai jamais… » à voix haute.',
      'Tous ceux qui l’ont déjà fait boivent les gorgées affichées sous la carte.',
      'Si une seule personne boit, elle prend les gorgées du bandeau 🍺 et raconte l’histoire.',
      'Personne n’est obligé de se justifier… mais c’est plus drôle.',
    ],
    reglesSansAlcool: [
      'Lisez la phrase « Je n’ai jamais… » à voix haute.',
      'Tous ceux qui l’ont déjà fait font un gage.',
      'Si une seule personne se dénonce, elle raconte l’histoire.',
      'Personne n’est obligé de se justifier… mais c’est plus drôle.',
    ],
    accrocheSansAlcool: 'Ceux qui l’ont déjà fait se dénoncent… et passent au gage.',
    consigne: 'Ceux qui l’ont déjà fait {boivent:1}.',
    consigneSeul: 'Seul à l’avoir fait ? {bois:1} et raconte.',
    pret: true,
  },
  {
    id: 'qui-pourrait',
    categorie: 'cartes',
    nom: 'Qui pourrait…',
    emoji: '👉',
    accroche: 'À 3-2-1, tout le monde pointe du doigt le coupable idéal.',
    couleur: '#ffe14d',
    minJoueurs: 3,
    maxJoueurs: 12,
    idealMin: 5,
    idealMax: 12,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Lisez la question, puis lancez le décompte 3-2-1.',
      'À zéro, chacun pointe du doigt la personne la plus susceptible de le faire.',
      'La personne la plus désignée prend les gorgées du bandeau 🍺 : plus la question pique, plus ça coûte.',
      'En cas d’égalité, les ex æquo trinquent ensemble.',
    ],
    reglesSansAlcool: [
      'Lisez la question, puis lancez le décompte 3-2-1.',
      'À zéro, chacun pointe du doigt la personne la plus susceptible de le faire.',
      'La personne la plus désignée fait un gage.',
      'En cas d’égalité, les ex æquo font le gage ensemble.',
    ],
    consigne: '3, 2, 1… pointez ! La personne la plus désignée prend {gorgees:1}.',
    decompte: true,
    pret: true,
  },
  {
    id: 'la-roue',
    categorie: 'hasard',
    nom: 'La Roue',
    emoji: '🎡',
    accroche: 'La roue choisit sa victime, puis son sort.',
    couleur: '#b57bff',
    minJoueurs: 2,
    maxJoueurs: 12,
    idealMin: 3,
    idealMax: 8,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Touchez la roue pour la lancer : elle désigne un joueur.',
      'Une action tombe ensuite pour ce joueur.',
      'On s’exécute, puis on relance pour le suivant.',
    ],
    pret: true,
  },
  {
    id: 'duel',
    categorie: 'hasard',
    nom: 'Duel',
    emoji: '⚔️',
    accroche: 'Deux joueurs, un mini-défi, un seul survivant.',
    couleur: '#ff5468',
    minJoueurs: 2,
    maxJoueurs: 12,
    idealMin: 4,
    idealMax: 8,
    plutotPhysique: true,
    plutotIntime: false,
    regles: [
      'Deux joueurs sont tirés au sort et s’affrontent sur un mini-défi.',
      'Le reste du groupe arbitre et désigne le vainqueur. À deux, vous tranchez vous-mêmes.',
      'Touchez le prénom du gagnant : le perdant boit les gorgées du bandeau 🍺 (ou fait un gage).',
      'Égalité ? On rejoue le duel, ou les deux trinquent.',
    ],
    reglesSansAlcool: [
      'Deux joueurs sont tirés au sort et s’affrontent sur un mini-défi.',
      'Le reste du groupe arbitre et désigne le vainqueur. À deux, vous tranchez vous-mêmes.',
      'Touchez le prénom du gagnant : le perdant fait un gage.',
      'Égalité ? On rejoue le duel.',
    ],
    pret: true,
  },
  {
    id: 'tu-preferes',
    categorie: 'cartes',
    nom: 'Tu préfères…',
    emoji: '🤔',
    accroche: 'Deux choix impossibles. On vote en même temps, la minorité trinque.',
    accrocheSansAlcool: 'Deux choix impossibles. On vote en même temps, la minorité a un gage.',
    couleur: '#5dff9b',
    minJoueurs: 2,
    maxJoueurs: 12,
    idealMin: 2,
    idealMax: 8,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Lisez le dilemme à voix haute.',
      'À 3-2-1, chacun annonce son choix en même temps (A ou B).',
      'Ceux qui sont en minorité boivent les gorgées affichées sous la carte. Égalité : personne ne boit. À deux : si vous n’êtes pas d’accord, vous buvez tous les deux.',
      'Interdit de répondre « ni l’un ni l’autre ».',
    ],
    reglesSansAlcool: [
      'Lisez le dilemme à voix haute.',
      'À 3-2-1, chacun annonce son choix en même temps (A ou B).',
      'Ceux qui sont en minorité font un gage. Égalité : personne. À deux : si vous n’êtes pas d’accord, un gage chacun.',
      'Interdit de répondre « ni l’un ni l’autre ».',
    ],
    consigne:
      '3, 2, 1… votez ! Ceux de la minorité {boivent:1}, personne en cas d’égalité. À deux : pas d’accord ? {buvez:1} tous les deux.',
    consigneSeul: 'Seul contre tous ? {bois:1}.',
    decompte: true,
    pret: true,
  },
  {
    id: 'la-bombe',
    categorie: 'bluff',
    nom: 'La Bombe',
    emoji: '💣',
    accroche: 'Une catégorie, un minuteur caché, et ça explose dans tes mains.',
    couleur: '#ff8a3d',
    minJoueurs: 3,
    maxJoueurs: 12,
    idealMin: 4,
    idealMax: 8,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Une catégorie s’affiche et le minuteur caché démarre.',
      'Donnez une réponse, puis passez vite le téléphone à votre voisin.',
      'Interdit de répéter une réponse déjà donnée.',
      'Celui qui tient le téléphone quand la bombe explose boit les gorgées du bandeau 🍺 (ou fait un gage).',
    ],
    reglesSansAlcool: [
      'Une catégorie s’affiche et le minuteur caché démarre.',
      'Donnez une réponse, puis passez vite le téléphone à votre voisin.',
      'Interdit de répéter une réponse déjà donnée.',
      'Celui qui tient le téléphone quand la bombe explose fait un gage.',
    ],
    pret: true,
  },
  {
    id: 'vrai-ou-bluff',
    categorie: 'bluff',
    nom: 'Vrai ou Bluff',
    emoji: '🎭',
    accroche: 'Raconte une anecdote, vraie ou inventée. Les autres devinent.',
    couleur: '#5b9dff',
    minJoueurs: 3,
    maxJoueurs: 12,
    idealMin: 3,
    idealMax: 6,
    plutotPhysique: false,
    plutotIntime: true,
    regles: [
      'Le joueur désigné raconte une anecdote sur le thème de la carte : vraie ou totalement inventée.',
      'À 3-2-1, les autres votent : pouce en l’air pour « vrai », pouce en bas pour « bluff ».',
      'Le conteur révèle la vérité : ceux qui se sont trompés boivent les gorgées affichées sous la carte.',
      'Si tout le monde a trouvé, c’est le conteur qui boit les gorgées du bandeau 🍺.',
    ],
    reglesSansAlcool: [
      'Le joueur désigné raconte une anecdote sur le thème de la carte : vraie ou totalement inventée.',
      'À 3-2-1, les autres votent : pouce en l’air pour « vrai », pouce en bas pour « bluff ».',
      'Le conteur révèle la vérité : ceux qui se sont trompés font un gage.',
      'Si tout le monde a trouvé, c’est le conteur qui fait le gage.',
    ],
    consigne:
      'Histoire vraie ou inventée, au choix. Les autres votent : ceux qui se trompent {boivent:1}. Tout le monde a trouvé ? {j1} prend {gorgees:1}.',
    decompte: true,
    pret: true,
  },
  {
    id: 'imposteur',
    categorie: 'bluff',
    nom: 'L’Imposteur',
    emoji: '🕵️',
    accroche: 'Un mot secret chacun. L’un de vous n’a pas le même… et il l’ignore.',
    couleur: '#c8ff3d',
    minJoueurs: 4,
    maxJoueurs: 12,
    idealMin: 5,
    idealMax: 9,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Chacun regarde son mot secret en cachette. Tous ont le même, sauf l’imposteur, qui a un mot proche sans le savoir.',
      'À tour de rôle, dites un seul mot en lien avec le vôtre. Interdit de dire son mot ou un mot déjà cité.',
      'Débattez, puis touchez ensemble le prénom du suspect. À partir de 8 joueurs, il y a deux imposteurs.',
      'Imposteur démasqué : il boit (ou fait un gage), et plus les mots étaient proches, plus ça coûte. Raté : ce sont les innocents qui boivent.',
    ],
    reglesSansAlcool: [
      'Chacun regarde son mot secret en cachette. Tous ont le même, sauf l’imposteur, qui a un mot proche sans le savoir.',
      'À tour de rôle, dites un seul mot en lien avec le vôtre. Interdit de dire son mot ou un mot déjà cité.',
      'Débattez, puis touchez ensemble le prénom du suspect. À partir de 8 joueurs, il y a deux imposteurs.',
      'Imposteur démasqué : il fait un gage. Raté : l’imposteur désigne un innocent qui fait le gage.',
    ],
    unite: { singulier: 'manche', pluriel: 'manches' },
    pret: true,
  },
]

/** « Mes cartes » : les cartes écrites par les joueurs. Hors catalogue, présenté à part. */
export const JEU_MES_CARTES: DefinitionJeu = {
  id: 'mes-cartes',
  categorie: 'cartes',
  nom: 'Mes cartes',
  emoji: '✏️',
  accroche: 'Écris tes propres défis et questions.',
  couleur: '#ff9d5c',
  minJoueurs: 2,
  maxJoueurs: 12,
  idealMin: 3,
  idealMax: 10,
  plutotPhysique: false,
  plutotIntime: false,
  regles: [
    'Le téléphone passe de main en main : lisez la carte à voix haute.',
    'Si un prénom s’affiche, c’est ce joueur qui s’y colle.',
    'Refuser, c’est permis : ça coûte les gorgées du bandeau 🍺, ou un gage.',
  ],
  reglesSansAlcool: [
    'Le téléphone passe de main en main : lisez la carte à voix haute.',
    'Si un prénom s’affiche, c’est ce joueur qui s’y colle.',
    'Refuser, c’est permis : on fait un gage à la place.',
  ],
  pret: true,
}

export function trouverJeu(id: IdJeu): DefinitionJeu {
  const jeu = [...CATALOGUE, JEU_MES_CARTES].find((candidat) => candidat.id === id)
  if (jeu === undefined) throw new Error(`Jeu inconnu : ${id}`)
  return jeu
}

/** Règles à afficher selon le mode : sans alcool, on ne parle jamais de boire. */
export function reglesDuJeu(jeu: DefinitionJeu, sansAlcool: boolean): string[] {
  return sansAlcool ? (jeu.reglesSansAlcool ?? jeu.regles) : jeu.regles
}

/** Accroche à afficher selon le mode. */
export function accrocheDuJeu(jeu: DefinitionJeu, sansAlcool: boolean): string {
  return sansAlcool ? (jeu.accrocheSansAlcool ?? jeu.accroche) : jeu.accroche
}
