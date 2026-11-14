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
 * - `repete` : la pénalité tombe plusieurs fois (« à chaque oubli… »), elle reste hors échelle
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
}

/**
 * Difficulté d'une carte, qui fixe sa pénalité (voir `src/moteur/penalites.ts`) :
 * 1 = facile (1 gorgée), 2 = moyenne (2-3), 3 = difficile (4-5),
 * 4 = les plus dures (5 gorgées à distribuer, gage collectif ou règle imposée).
 */
export type Difficulte = 1 | 2 | 3 | 4

/** Taille du gage qui remplace les gorgées en mode Sans alcool. */
export type TailleGage = 'petit' | 'moyen' | 'gros'

/** Ce que coûte une carte quand on la rate ou qu'on la refuse. Affiché en bandeau. */
export interface Penalite {
  /** Nombre de gorgées, entre 1 et 5 (3 au plus en intensité Soft). */
  gorgees: number
  taille: TailleGage
  /** Vrai si la carte fait distribuer des gorgées au lieu d'en boire. */
  distribue: boolean
  /**
   * Vrai pour une carte « les plus dures » sans nombre écrit (gage collectif, règle imposée) :
   * les gorgées ne sont dues qu'en cas de refus.
   */
  speciale: boolean
  /** Vrai si la pénalité tombe à chaque fois (« à chaque oubli… »), toujours petite. */
  repete: boolean
  /** Vrai si la pénalité est un gage (mode Sans alcool, ou joueur qui ne boit pas). */
  enGage: boolean
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
  /** Absente : pénalité tirée autour du nombre écrit dans la carte (±1 gorgée). */
  difficulte?: Difficulte
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
  /** Pénalité de la carte. `null` pour les cartes sans enjeu (fin de règle). */
  penalite: Penalite | null
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
  | 'mes-cartes'

/** Jeux dont le contenu n'est pas une liste de cartes classiques. */
export type IdJeuSpecial = 'imposteur' | 'mes-cartes'

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
}

export const NB_JOUEURS_MIN = 2
export const NB_JOUEURS_MAX = 12
export const LONGUEUR_PRENOM_MAX = 14
