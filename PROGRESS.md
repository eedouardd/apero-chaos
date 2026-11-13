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

## Mise en ligne : faite

- Dépôt public : https://github.com/eedouardd/apero-chaos
- Site en ligne : https://eedouardd.github.io/apero-chaos/
- Déploiement automatique : chaque `git push` sur `main` lance la GitHub Action `.github/workflows/deploy.yml` (tests, construction, publication). GitHub Pages est réglé en mode « GitHub Actions ».

## Étape 3 : terminée et vérifiée dans le navigateur

Les 8 jeux sont jouables, avec 80 cartes ou plus chacun (644 au total) :

- Jeux à cartes (`src/jeux/JeuCartes.tsx`) : Défis & Vérités, Je n'ai jamais, Qui pourrait…, Tu préfères…, Vrai ou Bluff, avec consigne sous la carte et bouton de décompte 3-2-1.
- `src/jeux/JeuRoue.tsx` (roue animée), `src/jeux/JeuDuel.tsx` (on touche le gagnant, le perdant boit), `src/jeux/JeuBombe.tsx` (minuteur caché de 12 à 35 secondes).
- Recommandations « Recommandé pour vous » selon le nombre de joueurs et leurs profils.
- 80 tests automatiques verts.

Les cartes ont été écrites à partir de fichiers compacts convertis en JSON ; les fichiers JSON de `src/contenu` sont désormais la seule source, à modifier à la main.

## Prochaine étape

Étape 4 : finitions (relecture du design sur téléphone, sons, animations), puis étape 5 : PWA (installation sur l'écran d'accueil, hors ligne) et guide final (installer sur iPhone et Android, modifier les cartes).

À vérifier par Edouard : test sur un vrai téléphone, surtout les sons et les vibrations.

## Commandes utiles

```bash
npm run dev
```

```bash
npm test
```

Échéance : app en ligne et utilisable dimanche 15 novembre au soir.
