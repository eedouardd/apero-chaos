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
- `tags` (physique, intime, gênant, culture, rapidité…) servent au filtrage selon les profils des joueurs.
- `minJoueurs` quand la carte en demande plusieurs.
- Toute pénalité exprimée en **gorgées** (1 à 3 en soft, jusqu'à 5 en hard).
- Une version gage doit être possible pour le mode Sans alcool.
- Prénoms des joueurs : utiliser les jetons du projet, `{j1}` et `{j2}`. Vérifier dans le code s'il en existe d'autres avant d'en utiliser.

## Ton
- **Tout public** : drôle, jamais gênant, jouable en famille.
- **Étudiant pimenté** : taquin, questions gênantes mais soft, références de soirée étudiante française.
- **Hard** : osé et adulte assumé, mais reste un jeu.
- Français naturel, tutoiement, phrases courtes lisibles en 3 secondes sur un téléphone en soirée.

## Règles de sécurité (non négociables, même en Hard)
- Jamais : cul sec, shots, mélanges d'alcools, « finis ton verre », conduite, défis physiquement dangereux, défis impliquant des inconnus hors du groupe.
- Rien d'humiliant, de discriminant, ou visant un physique, une origine, une orientation.
- Aucun contenu sexuel explicite ; l'intime reste suggestif et toujours filtrable.
- Les défis physiques restent faisables par tous, sur place.

## Qualité
- Pas de doublons ni de quasi-doublons (vérifier avant d'ajouter).
- Questions de quiz : uniquement des faits stables et vérifiés, rien qui change avec le temps (prix, records récents, personnes en poste).
- Varier les structures de phrase ; éviter que 5 cartes d'affilée commencent pareil.

## Après avoir écrit
- Lancer les tests du projet pour valider que le JSON se charge.
- Donner un récap : nombre de cartes ajoutées par ton x intensité.
