// Formulations interdites partout, même en Hard : dans les cartes du projet
// (vérifiées par les tests) comme dans les cartes écrites par les joueurs.

export const INTERDITS: readonly RegExp[] = [
  /cul[ -]?sec/i,
  /d’une? traite?|d'une? traite?/i,
  /\bshots?\b/i,
  /\bshooters?\b/i,
  /verre entier/i,
  /finis ton verre/i,
  /\bcondui(re|s|t|sez|sent)\b|\bvolant\b/i,
  /m[ée]lange.{0,20}(alcool|verre|bi[èe]re|vin|vodka|rhum|whisky|gin|tequila)/i,
  /(vide|termine|finis|finit|finissez) (ton|son|votre|leur) verre/i,
]
