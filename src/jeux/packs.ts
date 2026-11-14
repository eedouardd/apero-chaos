// Packs premium : préparés mais pas encore en vente.
//
// Pour brancher un paiement plus tard, il suffira de :
// 1. passer `disponible` à true et renseigner un `prix` ;
// 2. remplacer `estDebloque` par une vraie vérification d'achat
//    (ex. un code de déblocage ou une réponse de Stripe / Lemon Squeezy) ;
// 3. ajouter le fichier de cartes du pack dans `src/contenu`.
// Le reste de l'app passe déjà par `estDebloque` : rien d'autre à réécrire.

export interface PackPremium {
  id: string
  nom: string
  emoji: string
  description: string
  /** `false` = affiché avec un cadenas « Bientôt disponible ». */
  disponible: boolean
  /** Prix en euros, quand le pack sera en vente. */
  prix: number | null
}

export const PACKS_PREMIUM: PackPremium[] = [
  {
    id: 'hard-plus',
    nom: 'Pack Hard +',
    emoji: '😈',
    description: '150 cartes encore plus osées',
    disponible: false,
    prix: null,
  },
  {
    id: 'evjf-evg',
    nom: 'Pack EVJF / EVG',
    emoji: '💍',
    description: 'Spécial futurs mariés',
    disponible: false,
    prix: null,
  },
  {
    id: 'couple',
    nom: 'Pack Couple',
    emoji: '💘',
    description: 'À deux, sans témoins',
    disponible: false,
    prix: null,
  },
]

/** Seul point de passage pour savoir si un pack est utilisable. */
export function estDebloque(pack: PackPremium): boolean {
  // Aucun paiement pour l'instant : rien n'est débloqué.
  return pack.disponible && pack.prix === 0
}
