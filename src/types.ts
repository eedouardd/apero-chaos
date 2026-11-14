// Types partagés par toute l'app.

/** Ton du contenu, du plus sage au plus osé. */
export type Ton = 'tout-public' | 'pimente' | 'hard'

/** Intensité des défis et du nombre de gorgées. */
export type Intensite = 'soft' | 'normal' | 'hard'

/**
 * Étiquettes d'une carte. Quatre d'entre elles pilotent le filtrage :
 * - `physique` : demande de bouger (réservé aux joueurs qui aiment les défis physiques)
 * - `intime` et `genant` : réservés aux joueurs qui acceptent les questions gênantes
 * - `alcool` : n'a de sens qu'avec de l'alcool (retirée en mode Sans alcool)
 * Les autres étiquettes sont libres (ex. `mime`, `chant`) et servent de repère.
 */
export type Tag = string

export interface Joueur {
  id: string
  prenom: string
  /** Aime les défis physiques. */
  defisPhysiques: boolean
  /** Accepte les questions gênantes ou intimes. */
  questionsIntimes: boolean
  /** Boit de l'alcool (sinon : gages à la place des gorgées). */
  boitAlcool: boolean
}

export interface Reglages {
  ton: Ton
  intensite: Intensite
  /** Mode Sans alcool : toutes les gorgées deviennent des gages. */
  sansAlcool: boolean
  /** « Boire = gorgées » : jamais de verres ni de shots. */
  gorgeesSeulement: boolean
}

/** Une carte telle qu'elle est écrite dans les fichiers JSON de `src/contenu`. */
export interface Carte {
  id: string
  /**
   * Texte de la carte. Peut contenir :
   * - `{j1}`, `{j2}` : prénoms de joueurs tirés au sort
   * - `{bois:2}`, `{boit:2}`, `{boivent:2}`, `{buvez:2}`, `{distribue:2}` :
   *   une action de boisson, transformée en gage en mode Sans alcool
   */
  texte: string
  ton: Ton
  intensite: Intensite
  tags: Tag[]
  minJoueurs: number
  /** Sous-titre affiché en haut de la carte (ex. « Défi », « Vérité », « Règle »). */
  categorie?: string
  /** Pour les règles temporaires : texte de la carte qui met fin à la règle. */
  texteFin?: string
}

/** Une paire de mots de L'Imposteur, telle qu'écrite dans `src/contenu/imposteur.json`. */
export interface PaireMots {
  id: string
  /** Deux mots proches : l'un pour les innocents, l'autre pour les imposteurs (tirés au sort). */
  mots: [string, string]
  ton: Ton
  /** 1 = mots bien distincts, 2 = proches, 3 = quasi-synonymes. */
  difficulte: 1 | 2 | 3
  tags: Tag[]
  /** Jamais affiché : évite deux paires du même thème dans une partie. */
  theme: string
}

/** Morceau de texte prêt à afficher. */
export type Segment =
  | { type: 'texte'; valeur: string }
  | { type: 'joueur'; valeur: string }
  | { type: 'boisson'; valeur: string }

/** Une carte tirée, avec ses joueurs et son texte final. */
export interface CarteJouee {
  carte: Carte
  joueurs: Joueur[]
  segments: Segment[]
  /** Gorgées attribuées par cette carte (pour le récap de fin). */
  gorgees: number
}

export type IdJeu =
  | 'defis-verites'
  | 'je-nai-jamais'
  | 'qui-pourrait'
  | 'la-roue'
  | 'duel'
  | 'tu-preferes'
  | 'la-bombe'
  | 'vrai-ou-bluff'
  | 'imposteur'

/** Jeux dont le contenu n'est pas une liste de cartes classiques. */
export type IdJeuSpecial = 'imposteur'

/** Jeux qui tirent leurs cartes dans `CARTES` (voir `src/contenu`). */
export type IdJeuCartes = Exclude<IdJeu, IdJeuSpecial>

/** Petite récompense affichée sur l'écran de fin. */
export interface Trophee {
  emoji: string
  titre: string
  prenom: string
  detail: string
}

/** Statistiques d'une partie, pour l'écran de fin. */
export interface StatsPartie {
  /** Nombre de cartes (ou de manches, selon le jeu) jouées. */
  cartesJouees: number
  /** Par identifiant de joueur. */
  parJoueur: Record<string, { cartes: number; gorgees: number }>
  /** Trophées propres au jeu. Absents : on prend ceux des jeux de cartes. */
  trophees?: Trophee[]
}

export const REGLAGES_PAR_DEFAUT: Reglages = {
  ton: 'pimente',
  intensite: 'normal',
  sansAlcool: false,
  gorgeesSeulement: true,
}

export const NB_JOUEURS_MIN = 2
export const NB_JOUEURS_MAX = 12
export const LONGUEUR_PRENOM_MAX = 14
