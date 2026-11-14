# Apéro Chaos : où on en est

Dernière mise à jour : 14 novembre 2026

## Décisions actées

- Nom : **Apéro Chaos**. Dossier du projet : `~/Developer/apero-chaos` (hors iCloud).
- Dépôt GitHub public prévu sur le compte `eedouardd`, adresse finale `https://eedouardd.github.io/apero-chaos/`.
- 8 jeux : les 6 du cahier des charges + **La Bombe** + **Vrai ou Bluff**. Depuis le 14 novembre : 4 jeux de plus prévus, dont **L'Imposteur** (fait).
- Stack : Vite, React, TypeScript, Tailwind CSS 4, Vitest, `vite-plugin-pwa`.
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

## Étapes 4 et 5 : faites

- Design néon, animations (retournement de carte, roue, bombe), sons synthétisés et vibrations, bouton pour couper le son. Mise en page vérifiée en 320 et 375 px de large.
- PWA : `vite-plugin-pwa` configuré dans `vite.config.ts` (manifeste, icônes, 26 fichiers mis en cache pour le hors ligne).
- Guide dans `README.md` : installer sur iPhone et Android, modifier les cartes.

**Non vérifié** : l'installation sur l'écran d'accueil et le mode hors ligne n'ont pas pu être testés dans le navigateur intégré de Claude (il refuse les service workers). Le fichier `sw.js` est bien généré et sa liste de fichiers est complète.

## Étape 7, phase 1 : état des lieux et corrections (14 novembre 2026)

Relecture complète par `qa-testeur`, `auteur-contenu` et `ux-designer`, puis correction de tout ce qui était classé bloquant ou important.

**Moteur et jeux**

- Groupe où personne ne boit : toute la partie passe en mode Sans alcool (`reglagesEffectifs` dans `src/moteur/joueurs.ts`).
- La Bombe : la pause gèle la mèche, pas de gage pendant la mèche, on peut corriger le joueur désigné.
- Duel : prénoms en entier, correction du gagnant possible, 30 duels jouables à deux sans arbitre.
- La Roue : tirage équilibré (`tirerJoueurRoue`), jamais trois fois de suite le même joueur, plus de 16e tour.
- L'Imposteur : un mot ne ressort jamais deux fois dans une partie, et plus aucun mot dans deux paires.
- Garde contre les touchers fortuits (`src/effets/garde.ts`) : une carte ou un bouton qui vient d'apparaître ignore les touchers pendant une demi-seconde. Bouton « carte précédente » dans les jeux de cartes.
- Gages : 60 gages, filtrés aussi pour les joueurs qui refusent les questions gênantes (champ `genant`).

**App**

- Bandeau « Nouvelle version prête » sur l'accueil (`src/effets/miseAJour.ts`, service worker en mode `prompt`).
- Liste des jeux regroupée : « Pour vous ce soir », trois familles, puis « Fait par vous ».
- « Mes cartes » : gratuit, sorti des packs. Le groupe écrit ses cartes, gardées sur le téléphone (`src/ecrans/MesCartes.tsx`, `src/moteur/cartesPerso.ts`).
- Parcours raccourci pour un groupe qui revient : réglages, confirmation +18 (12 h) et règles déjà lues ne sont plus réimposés. Les règles se relisent depuis la pause.
- Bouton retour du téléphone : revient à l'écran précédent, ouvre la pause en partie (`src/effets/retour.ts`).
- Mode Sans alcool : règles, accroches et écran +18 ne parlent plus de boire.
- Écran maintenu allumé pendant toutes les parties.

**Laissé de côté (mineur)** : doublons de joueurs dans la sauvegarde, prénoms en emojis, libellés du récap, barre d'avancement avec les règles temporaires, mémoire des cartes vues perdue au rechargement, vibration liée au son, piège à focus des fenêtres, lint dans la CI, reprise d'une partie après fermeture. « Un demi-verre » et l'option « boire = gorgées » ont été supprimés en phase 2.

## Étape 7, phase 2 : échelle de pénalités selon la difficulté (14 novembre 2026)

Retour du test sur téléphone : le nombre de gorgées était toujours le même dans un même jeu. Chaque carte a maintenant une difficulté, qui fixe ce que coûte un raté ou un refus.

| Difficulté | Avec alcool | Sans alcool |
|---|---|---|
| 1, facile | 1 gorgée | petit gage |
| 2, moyenne | 2 ou 3 gorgées | gage moyen |
| 3, difficile | 4 ou 5 gorgées | gros gage |
| 4, les plus dures | 5 gorgées à distribuer, gage collectif ou règle jusqu'à la fin | gros gage ou règle |

- **Moteur** (`src/moteur/penalites.ts`, `src/moteur/cartes.ts`) : jamais plus de 5 gorgées, 3 en Soft (Soft prend le bas de la fourchette, Normal tire au hasard, Hard prend le haut). Une pénalité de groupe (« ceux qui… boivent ») est plafonnée à 3, 2 en Soft ; seul un joueur isolé prend la pénalité pleine. Carte sans difficulté (« Mes cartes ») : nombre écrit ±1. Cartes « à chaque oubli… » (tag `repete`) : toujours 1 gorgée ou un petit gage.
- **Dosage d'une partie** : on commence par des cartes faciles ou moyennes, pas de carte de niveau 4 dans les cinq premières, jamais deux cartes difficiles d'affilée (jeux de cartes et La Roue).
- **Affichage** : bandeau « 🍺 ×N » sur chaque carte (`src/composants/BandeauPenalite.tsx`), vert 1, orange 2-3, rouge 4-5. En Sans alcool : « Petit gage », « Gage moyen », « Gros gage », et le bouton Gage tire un gage de cette taille (champ `taille` dans `gages.json`). Variantes : « Distribue 🍺 ×5 », « à chaque fois », « Refus : 🍺 ×5 » pour un gage collectif ou une règle.
- **Duel et La Bombe** : le perdant boit la pénalité de la carte au lieu de 2 gorgées fixes. **L'Imposteur** : l'imposteur démasqué boit d'autant plus que les mots étaient proches (1 à 3 en Soft, 2 à 4 en Normal, 3 à 5 en Hard) ; groupe trompé : 2 par innocent sur une paire facile, 1 sinon.
- **Supprimé** : « un demi-verre » et l'option « boire = gorgées ». L'écran +18 dit que personne n'est obligé de faire une carte et que refuser coûte les gorgées affichées (ou le gage).
- **Contenu** : difficulté attribuée aux 742 cartes par `auteur-contenu`, 64 gages avec leur taille, 12 difficultés de paires de L'Imposteur corrigées, 4 cartes Hard trop explicites réécrites (`tp-074`, `vb-080`, `bo-076`, `bo-080`), toutes les cartes Hard portent `intime`. 26 cartes ajoutées, surtout de niveau 4.
- 169 tests verts, dont un par jeu qui vérifie plusieurs niveaux de difficulté et le mélange des pénalités dans une partie. Skill `apero-chaos-contenu` et README mis à jour.

**Laissé de côté après le passage de `qa-testeur`** : en Hard, 40 à 47 % des cartes coûtent encore 1 gorgée (beaucoup de cartes faciles) et les valeurs 2 et 4 ne sortent jamais ; des cartes sur le thème « gueule de bois » restent visibles en Sans alcool ; garde-fou par joueur (plafonner après plusieurs grosses pénalités de suite) non fait.

**Non vérifié** : rendu du bandeau sur un vrai téléphone.

## Étape 6 : quatre nouveaux jeux (en cours)

Ordre prévu : L'Imposteur, Quiz du bar, Le Roi, Le Bus. Un jeu est fini avant d'ouvrir le suivant.

### L'Imposteur : fait, joué en entier dans le navigateur (375 et 320 px)

- 4 à 12 joueurs, 5 manches, 1 imposteur (2 à partir de 8 joueurs). Chacun voit son mot en maintenant le doigt appuyé ; l'imposteur ne sait pas qu'il l'est.
- Tour de mots à l'oral, débat de 90 secondes (chrono gelé pendant la pause), vote collectif sur un prénom avec confirmation.
- Barème : voir la phase 2 (selon la difficulté de la paire). En mode Sans alcool, les imposteurs désignent un innocent qui fait un gage. Jamais plus de 5 gorgées par manche.
- `src/moteur/imposteur.ts` (logique pure, 23 tests), `src/jeux/JeuImposteur.tsx`, `src/jeux/RevelationImposteur.tsx`, `src/contenu/imposteur.json` (160 paires : 70 tout public, 55 pimenté, 35 hard).
- Récap de fin propre au jeu : score du groupe, Caméléon, Bouc émissaire, Démasqué.

### Socle partagé ajouté pour les nouveaux jeux

- `StatsPartie.trophees` : un jeu peut fournir ses propres trophées ; `DefinitionJeu.unite` pour compter des manches au lieu de cartes.
- `cartesDuJeu(id)` dans `src/contenu` : les jeux à format propre n'ont pas d'entrée dans `CARTES`.
- `src/moteur/sanctions.ts` : phrase de sanction hors carte, avec les mêmes règles de gorgées et de gages.
- Composants réutilisables : `PasseTelephone`, `MotSecret`, `ChoixJoueur`. `src/effets/ecran.ts` garde l'écran allumé.
- Menu pause : « Terminer la partie » et « Quitter sans récap » demandent maintenant une confirmation, dans tous les jeux.

**Non vérifié** : l'appui maintenu, les sons et le maintien de l'écran allumé sur un vrai téléphone.

### Reste à faire

Quiz du bar, Le Roi (avec le paquet de 52 cartes partagé), Le Bus.

## Prochaine étape

À faire par Edouard sur un vrai téléphone : ouvrir https://eedouardd.github.io/apero-chaos/, l'ajouter à l'écran d'accueil, couper le réseau et relancer l'app, vérifier les sons et vibrations, jouer une partie de chaque jeu.

Idées pour plus tard : packs premium payants, durée de partie réglable.

## Commandes utiles

```bash
npm run dev
```

```bash
npm test
```

Échéance : app en ligne et utilisable dimanche 15 novembre au soir.
