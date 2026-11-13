# Apéro Chaos : où on en est

Dernière mise à jour : 13 novembre 2026

## Décisions actées

- Nom : **Apéro Chaos**. Dossier du projet : `~/Developer/apero-chaos` (hors iCloud).
- Dépôt GitHub public prévu sur le compte `eedouardd`, adresse finale `https://eedouardd.github.io/apero-chaos/`.
- 8 jeux : les 6 du cahier des charges + **La Bombe** + **Vrai ou Bluff**.
- Stack : Vite, React, TypeScript, Tailwind CSS 4, Vitest. `vite-plugin-pwa` est installé mais pas encore configuré.
- Git, Node et l'outil GitHub (`gh`) étaient déjà installés : rien à installer.

## Étape 1 : terminée et vérifiée dans le navigateur

Squelette, design néon, navigation complète : accueil, joueurs (2 à 12, mini-questionnaire de 3 questions qu'on peut sauter), réglages (ton, intensité, sans alcool, boire = gorgées), écran +18, choix du jeu, règles, fin de partie. Sauvegarde des joueurs et réglages dans le téléphone. Packs premium affichés avec cadenas.

## Étape 2 : terminée et vérifiée dans le navigateur

Moteur de cartes + « Défis & Vérités » complet :

- `src/moteur/cartes.ts` : filtrage (ton, intensité, profils), tirage équilibré des joueurs, gorgées ou gages, règles temporaires avec carte de fin.
- `src/jeux/JeuCartes.tsx` : grande carte, tap pour passer, prénom en évidence, pause, tirage de gage, récap de fin.
- `src/contenu/defis-verites.json` : 100 cartes. `src/contenu/gages.json` : 30 gages.
- 47 tests automatiques verts (`npm test`), dont un garde-fou de sécurité sur le contenu (pas de « cul sec », de shots, de conduite).
- Partie complète jouée dans le navigateur : 26 cartes, pause, gages, récap.

Pas encore testé sur un vrai téléphone.

## Mise en ligne : bloquée sur une autorisation GitHub

- Dépôt public créé : https://github.com/eedouardd/apero-chaos (étapes 1 et 2 poussées).
- Le commit `ci: mise en ligne automatique` (fichier `.github/workflows/deploy.yml`) est fait **en local mais pas poussé** : GitHub refuse, il manque l'autorisation « workflow » à l'outil `gh`.

## Prochaine étape

1. Dans un terminal : `gh auth refresh -s workflow` puis suivre la page qui s'ouvre.
2. `git push` depuis `~/Developer/apero-chaos`.
3. Activer Pages en mode « GitHub Actions » (réglages du dépôt, rubrique Pages), relancer l'Action, vérifier https://eedouardd.github.io/apero-chaos/.

## Ensuite

- Étape 3 : les 7 autres jeux (aujourd'hui marqués « Bientôt disponible » via `pret: false` dans `src/jeux/catalogue.ts`).
- Étape 4 : 80 cartes minimum par jeu, finitions du design, animations, sons.
- Étape 5 : PWA (installation, hors ligne), guide final.

## Commandes utiles

```bash
npm run dev
```

```bash
npm test
```

Échéance : app en ligne et utilisable dimanche 15 novembre au soir.
