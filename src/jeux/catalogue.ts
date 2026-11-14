// Catalogue des jeux : nom, couleur, nombre de joueurs, règles.
// Pour ajouter un jeu : une entrée ici + un composant dans `src/jeux`.

import type { IdJeu } from '../types'

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
  /** Rappel affiché sous chaque carte (mêmes jetons que les cartes : {boivent:1}…). */
  consigne?: string
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
      'Refuser, c’est permis : on boit les gorgées indiquées (ou on fait un gage).',
      'Les règles « Jusqu’à nouvel ordre » durent jusqu’à la carte qui les annule.',
    ],
    pret: true,
  },
  {
    id: 'je-nai-jamais',
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
      'Tous ceux qui l’ont déjà fait boivent une gorgée (ou font un gage).',
      'Si une seule personne boit, elle raconte l’histoire.',
      'Personne n’est obligé de se justifier… mais c’est plus drôle.',
    ],
    consigne: 'Ceux qui l’ont déjà fait {boivent:1}.',
    pret: true,
  },
  {
    id: 'qui-pourrait',
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
      'La personne la plus désignée boit autant de gorgées que de doigts pointés (3 maximum).',
      'En cas d’égalité, les ex æquo trinquent ensemble.',
    ],
    consigne: '3, 2, 1… pointez ! La personne la plus désignée prend {gorgees:2}.',
    decompte: true,
    pret: true,
  },
  {
    id: 'la-roue',
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
      'Le reste du groupe arbitre et désigne le vainqueur.',
      'Touchez le prénom du gagnant : le perdant boit (ou fait un gage).',
      'Égalité ? On rejoue le duel, ou les deux trinquent.',
    ],
    pret: true,
  },
  {
    id: 'tu-preferes',
    nom: 'Tu préfères…',
    emoji: '🤔',
    accroche: 'Deux choix impossibles. Parfait à deux ou trois.',
    couleur: '#5dff9b',
    minJoueurs: 2,
    maxJoueurs: 12,
    idealMin: 2,
    idealMax: 3,
    plutotPhysique: false,
    plutotIntime: false,
    regles: [
      'Lisez le dilemme à voix haute.',
      'À 3-2-1, chacun annonce son choix en même temps (A ou B).',
      'Ceux qui sont en minorité boivent une gorgée. À deux : si vous n’êtes pas d’accord, vous buvez tous les deux.',
      'Interdit de répondre « ni l’un ni l’autre ».',
    ],
    consigne:
      '3, 2, 1… votez ! La minorité prend {gorgees:1}. À deux : en cas de désaccord, chacun prend {gorgees:1}.',
    decompte: true,
    pret: true,
  },
  {
    id: 'la-bombe',
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
      'Celui qui tient le téléphone quand la bombe explose boit (ou fait un gage).',
    ],
    pret: true,
  },
  {
    id: 'vrai-ou-bluff',
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
      'Le conteur révèle la vérité : ceux qui se sont trompés boivent.',
      'Si tout le monde a trouvé, c’est le conteur qui boit.',
    ],
    consigne:
      'Histoire vraie ou inventée, au choix. Les autres votent : ceux qui se trompent prennent {gorgees:1}. Tout le monde a trouvé ? {j1} prend {gorgees:2}.',
    decompte: true,
    pret: true,
  },
  {
    id: 'imposteur',
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
      'Imposteur démasqué : il boit (ou fait un gage). Raté : ce sont les innocents qui boivent.',
    ],
    unite: { singulier: 'manche', pluriel: 'manches' },
    pret: true,
  },
]

export function trouverJeu(id: IdJeu): DefinitionJeu {
  const jeu = CATALOGUE.find((candidat) => candidat.id === id)
  if (jeu === undefined) throw new Error(`Jeu inconnu : ${id}`)
  return jeu
}
