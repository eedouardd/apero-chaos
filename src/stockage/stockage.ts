// Sauvegarde locale (localStorage) : derniers joueurs, réglages, son coupé.
// Tout ce qui est relu est vérifié : on ne fait jamais confiance au contenu stocké.

import {
  LONGUEUR_PRENOM_MAX,
  NB_JOUEURS_MAX,
  REGLAGES_PAR_DEFAUT,
  type Intensite,
  type Joueur,
  type Reglages,
  type Ton,
} from '../types'

import {
  LONGUEUR_CARTE_PERSO_MAX,
  NB_CARTES_PERSO_MAX,
  filtrerCartesPerso,
} from '../moteur/cartesPerso'

const CLE_STOCKAGE = 'apero-chaos:v1'

export interface Sauvegarde {
  joueurs: Joueur[]
  reglages: Reglages
  sonCoupe: boolean
  /** Date (ms) de la dernière confirmation « 18 ans ou plus », ou null. */
  ageConfirmeLe: number | null
  /** Jeux dont les règles ont déjà été lues : on ne les réimpose plus. */
  /** Les réglages ont déjà été validés une fois : on ne les réimpose plus à chaque partie. */
  reglagesVus: boolean
  reglesVues: string[]
  /** Textes des cartes écrites par les joueurs (« Mes cartes »). */
  cartesPerso: string[]
}

const SAUVEGARDE_VIDE: Sauvegarde = {
  joueurs: [],
  reglages: REGLAGES_PAR_DEFAUT,
  sonCoupe: false,
  ageConfirmeLe: null,
  reglagesVus: false,
  reglesVues: [],
  cartesPerso: [],
}

const TONS: Ton[] = ['tout-public', 'pimente', 'hard']
const INTENSITES: Intensite[] = ['soft', 'normal', 'hard']

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null
}

function lireJoueur(brut: unknown): Joueur | null {
  if (!estObjet(brut)) return null
  const { id, prenom } = brut
  if (typeof id !== 'string' || typeof prenom !== 'string') return null
  const prenomPropre = prenom.trim().slice(0, LONGUEUR_PRENOM_MAX)
  if (prenomPropre === '') return null
  return {
    id,
    prenom: prenomPropre,
    defisPhysiques: brut.defisPhysiques !== false,
    questionsIntimes: brut.questionsIntimes !== false,
    boitAlcool: brut.boitAlcool !== false,
  }
}

function lireReglages(brut: unknown): Reglages {
  if (!estObjet(brut)) return REGLAGES_PAR_DEFAUT
  return {
    ton: TONS.includes(brut.ton as Ton)
      ? (brut.ton as Ton)
      : REGLAGES_PAR_DEFAUT.ton,
    intensite: INTENSITES.includes(brut.intensite as Intensite)
      ? (brut.intensite as Intensite)
      : REGLAGES_PAR_DEFAUT.intensite,
    sansAlcool: brut.sansAlcool === true,
    gorgeesSeulement: brut.gorgeesSeulement !== false,
  }
}

const NB_REGLES_VUES_MAX = 50
const LONGUEUR_ID_MAX = 40

/** Liste de textes non vides, bornée en nombre et en longueur. */
function lireTextes(brut: unknown, nbMax: number, longueurMax: number): string[] {
  if (!Array.isArray(brut)) return []
  return brut
    .filter((t): t is string => typeof t === 'string' && t.trim() !== '' && t.length <= longueurMax)
    .slice(0, nbMax)
}

/** Transforme un contenu brut (potentiellement abîmé) en sauvegarde valide. */
export function lireSauvegarde(brut: unknown): Sauvegarde {
  if (!estObjet(brut)) return SAUVEGARDE_VIDE
  const joueursBruts = Array.isArray(brut.joueurs) ? brut.joueurs : []
  const joueurs = joueursBruts
    .map(lireJoueur)
    .filter((joueur): joueur is Joueur => joueur !== null)
    .slice(0, NB_JOUEURS_MAX)
  return {
    joueurs,
    reglages: lireReglages(brut.reglages),
    sonCoupe: brut.sonCoupe === true,
    ageConfirmeLe:
      typeof brut.ageConfirmeLe === 'number' && Number.isFinite(brut.ageConfirmeLe)
        ? brut.ageConfirmeLe
        : null,
    reglagesVus: brut.reglagesVus === true,
    reglesVues: lireTextes(brut.reglesVues, NB_REGLES_VUES_MAX, LONGUEUR_ID_MAX),
    // Les cartes relues repassent les mêmes contrôles qu'à la saisie.
    cartesPerso: filtrerCartesPerso(
      lireTextes(brut.cartesPerso, NB_CARTES_PERSO_MAX, LONGUEUR_CARTE_PERSO_MAX),
    ),
  }
}

export function charger(): Sauvegarde {
  try {
    const texte = localStorage.getItem(CLE_STOCKAGE)
    return texte === null ? SAUVEGARDE_VIDE : lireSauvegarde(JSON.parse(texte))
  } catch (erreur) {
    // Stockage indisponible (navigation privée) ou contenu illisible : on repart de zéro.
    console.warn('Sauvegarde illisible, valeurs par défaut utilisées.', erreur)
    return SAUVEGARDE_VIDE
  }
}

export function sauvegarder(modifications: Partial<Sauvegarde>): void {
  try {
    const suivante = { ...charger(), ...modifications }
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(suivante))
  } catch (erreur) {
    // L'app reste jouable sans sauvegarde : on signale seulement le souci.
    console.warn('Impossible de sauvegarder sur ce téléphone.', erreur)
  }
}
