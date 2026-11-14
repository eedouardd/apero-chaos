---
name: apero-chaos-contenu
description: Rédiger ou relire des cartes, questions, mots ou gages pour l'app de jeux de soirée Apéro Chaos (ton, intensité, règles de sécurité, format JSON).
---

# Contenu Apéro Chaos

À utiliser dès qu'on écrit, complète ou relit du contenu de jeu (cartes, questions, paires de mots, gages, règles) pour Apéro Chaos.

## Avant d'écrire
1. Lire le fichier JSON existant du jeu concerné pour reprendre exactement son format et ses champs.
2. Lire 10 cartes existantes pour caler le style.
3. Vérifier la répartition actuelle par ton et intensité, et combler les trous en priorité.

## Axes obligatoires pour chaque carte
- Reprendre les valeurs de `ton`, `intensite` et `tags` déjà utilisées dans le projet (ne pas en inventer de nouvelles sans raison).
- `tags` (`physique`, `intime`, `genant`, `alcool`…) servent au filtrage selon les profils des joueurs. Ils s'écrivent sans accent, exactement comme dans le code : `genant`, jamais « gênant », sinon la carte n'est pas filtrée.
- `minJoueurs` quand la carte en demande plusieurs.
- `difficulte` (1 à 4) sur **chaque** carte : c'est elle qui fixe la pénalité, voir « Échelle de pénalités ».
- Une version gage doit être possible pour le mode Sans alcool.
- Prénoms des joueurs : utiliser les jetons du projet, `{j1}` et `{j2}`. Vérifier dans le code s'il en existe d'autres avant d'en utiliser.

## Échelle de pénalités

La pénalité d'une carte est ce que coûte un raté **ou un refus**. Refuser est toujours permis, et refuser une carte difficile coûte plus cher que refuser une carte facile. Le moteur (`src/moteur/penalites.ts`) calcule le nombre à partir de `difficulte` et l'affiche dans un bandeau « 🍺 ×N » (vert 1, orange 2-3, rouge 4-5).

| `difficulte` | Niveau | Avec alcool | Sans alcool |
|---|---|---|---|
| 1 | Facile | 1 gorgée | petit gage |
| 2 | Moyenne | 2 ou 3 gorgées | gage moyen |
| 3 | Difficile | 4 ou 5 gorgées | gros gage |
| 4 | Les plus dures | 5 gorgées **à distribuer**, gage collectif ou règle imposée jusqu'à la fin de la partie | gros gage ou règle imposée |

Règles :
- Jamais plus de 5 gorgées d'un coup. Jamais de cul sec, de shot ni de « finis ton verre ».
- En intensité Soft, le moteur plafonne à 3 gorgées (1, 2, 3, 3). En Normal il tire au hasard dans la fourchette, en Hard il prend le haut.
- Pénalité de groupe (`{boivent:N}`, `{buvez:N}`, consignes « ceux qui… ») : plafonnée à 3 gorgées, 2 en Soft. Seul un joueur isolé prend la pénalité pleine.
- Le niveau 4 est une **nature de carte**, écrite dans le texte : on distribue, tout le groupe fait un gage, ou une règle dure jusqu'à la fin. Ce n'est jamais « bois 5 gorgées » pour un seul joueur. Au plus 10 % des cartes d'un jeu.
- Carte dont la pénalité se répète (« à chaque oubli, tu prends {gorgees:1} ») : tag `repete`, nombre écrit à 1. Le moteur la laisse hors échelle pour éviter l'escalade.
- Chaque jeu mélange les niveaux. Répartition visée en 1/2/3/4 : 35/35/20/10 % pour Défis & Vérités, La Roue et Qui pourrait ; 45/35/15/5 % pour les autres. Un test échoue si un jeu n'a pas au moins trois niveaux bien représentés.

Jetons et nombres écrits : le premier jeton « je bois » de la carte (`bois`, `boit`, `boivent`, `buvez`, sinon le premier jeton) reçoit la pénalité ; les autres nombres de la carte sont décalés d'autant. Écrire ce jeton au bas de la fourchette (1, 2, 4 ou 5) et garder les autres en proportion.

Critère de difficulté par jeu :
- **Défis & Vérités, La Roue, Mes cartes** : ce que ça coûte de le faire devant le groupe. 1 = anodin, 2 = un peu gênant ou demande un effort, 3 = vrai courage ou vraie confidence, 4 = distribution, gage collectif ou règle.
- **Je n'ai jamais** : rareté de l'aveu. 1 = presque tout le monde l'a fait, 2 = la moitié, 3 = un ou deux, 4 = aveu rare qui appelle une histoire.
- **Qui pourrait…** : à quel point être désigné pique. 1 = flatteur, 2 = taquin, 3 = vexant, 4 = dossier.
- **Tu préfères…** : ce qu'il faut assumer en public. 1 = goût anodin, 2 = vrai dilemme, 3 = deux options pénibles, 4 = choix qui révèle quelque chose de soi.
- **Vrai ou Bluff** : exposition du conteur. 1 = anecdote banale, 4 = sujet qu'on préférerait taire.
- **La Bombe** : étroitesse de la catégorie. 1 = 30 réponses évidentes ou plus, 2 = 15 à 30, 3 = moins de 15, 4 = double contrainte (12 réponses possibles au minimum).
- **Duel** : part de responsabilité du perdant. 1 = pur hasard, 2 = culture ou réflexe, 3 = performance devant le groupe, 4 = duel long jugé par le groupe.
- **L'Imposteur** : `difficulte` 1 à 3 = proximité des deux mots. Plus la paire est dure, plus l'imposteur démasqué boit.

Gages (`gages.json`) : champ `taille` obligatoire, `petit` (10 secondes, sans gêne), `moyen` (un effort ou une petite gêne), `gros` (dure plusieurs tours ou demande du courage). Au moins 12 gages de chaque taille en Tout public.

Cartes Hard directes : autorisées si elles restent suggestives et non explicites, uniquement en `ton: "hard"`, toujours avec le tag `intime` pour être filtrées chez ceux qui refusent ce type de questions.

## Ton
- **Tout public** : drôle, jamais gênant, jouable en famille.
- **Étudiant pimenté** : taquin, questions gênantes mais soft, références de soirée étudiante française.
- **Hard** : osé et adulte assumé, mais reste un jeu.
- Français naturel, tutoiement, phrases courtes lisibles en 3 secondes sur un téléphone en soirée.

## Règles de sécurité (non négociables, même en Hard)
- Jamais : cul sec, shots, mélanges d'alcools, « finis ton verre », « un demi-verre » ou toute quantité qui n'est pas en gorgées, conduite, défis physiquement dangereux, défis impliquant des inconnus hors du groupe.
- Rien d'humiliant, de discriminant, ou visant un physique, une origine, une orientation.
- Aucun contenu sexuel explicite ; l'intime reste suggestif et toujours filtrable.
- Les défis physiques restent faisables par tous, sur place.

## Qualité
- Pas de doublons ni de quasi-doublons (vérifier avant d'ajouter).
- Questions de quiz : uniquement des faits stables et vérifiés, rien qui change avec le temps (prix, records récents, personnes en poste).
- Varier les structures de phrase ; éviter que 5 cartes d'affilée commencent pareil.

## Après avoir écrit
- Lancer les tests du projet pour valider que le JSON se charge.
- Donner un récap : nombre de cartes ajoutées par ton x intensité, et répartition par `difficulte`.
