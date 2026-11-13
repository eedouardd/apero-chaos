---
name: apero-chaos-nouveau-jeu
description: Checklist pour ajouter ou modifier un jeu dans l'app Apéro Chaos sans casser l'existant, jusqu'à la mise en ligne sur GitHub Pages.
---

# Ajouter un jeu à Apéro Chaos

## 1. Comprendre l'existant
- Lire CLAUDE.md et PROGRESS.md.
- Repérer comment un jeu existant est branché : définition du jeu, moteur de cartes, filtrage par ton, intensité et profils, recommandations, récap de fin.
- Réutiliser les modules partagés (moteur de cartes, paquet de 52 cartes virtuel, chrono, vote) s'ils existent, sinon les créer comme modules partagés, plutôt que dupliquer.

## 2. Concevoir et planifier
- Faire concevoir ou critiquer le jeu par le sous-agent `game-designer`.
- Présenter un plan court (fichiers touchés, modules réutilisés, nouveaux composants) et attendre la validation de l'utilisateur.

## 3. Chaque jeu doit avoir
- Nombre de joueurs min/max et intégration aux recommandations.
- Écran de règles avant la partie.
- Respect des réglages : ton, intensité, mode Sans alcool (gorgées → gages), option boire = gorgées, écran +18 selon les options, profils des joueurs.
- Couleur d'accent propre, animations cohérentes avec le reste, sons qu'on peut couper.
- Récap de fin de partie.
- Contenu dans un JSON séparé, écrit par le sous-agent `auteur-contenu` en suivant le skill `apero-chaos-contenu`.

## 4. Vérifier
- Revue rapide par `ux-designer` et `directeur-artistique` ; appliquer les corrections importantes.
- Type-check, lint, tests ; ajouter des tests pour la logique du jeu (tirage, filtrage, conditions de fin).
- Jouer une partie complète dans le navigateur, en vue mobile.
- Passer le sous-agent `qa-testeur` et corriger ce qu'il bloque.
- Vérifier qu'aucun jeu existant n'est cassé.

## 5. Livrer
- Commit avec un message clair, puis push sur main (GitHub Actions déploie automatiquement sur GitHub Pages).
- Vérifier que le déploiement est passé.
- Mettre à jour PROGRESS.md.
- Dire à l'utilisateur précisément quoi tester sur son téléphone.
