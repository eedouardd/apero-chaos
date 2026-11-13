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

## Étape 2 : en cours (moteur + « Défis & Vérités »)

Déjà écrit, le code compile, mais **pas encore branché à l'écran ni testé** :

- `src/moteur/cartes.ts` : filtrage des cartes (ton, intensité, profils), tirage équilibré des joueurs, gorgées ou gages, règles temporaires avec carte de fin.
- `src/moteur/gages.ts`, `src/moteur/recap.ts` (statistiques et trophées de fin), `src/jeux/memoire.ts`.
- `src/contenu/defis-verites.json` : 100 cartes. `src/contenu/gages.json` : 30 gages.

Reste à faire pour finir l'étape 2 :

1. Écrire le composant de partie (`src/jeux/JeuCartes.tsx`) : grande carte, tap pour passer, prénom en évidence, bouton pause, bouton gage. Le brancher dans `src/ecrans/Partie.tsx` (encore provisoire).
2. Écrire les tests du moteur (`src/moteur/cartes.test.ts`) et un test de sécurité du contenu (pas de « cul sec », de shots, de conduite).
3. Jouer une partie complète dans le navigateur, puis commit.

## Ensuite

- Mise en ligne anticipée sur GitHub Pages dès la fin de l'étape 2 (créer le dépôt, GitHub Action de déploiement).
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
