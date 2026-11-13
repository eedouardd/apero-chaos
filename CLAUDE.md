# Apéro Chaos

Web app de jeux de soirée en français, jouée sur un seul téléphone qui passe de main en main (2 à 12 joueurs). PWA installable, sans compte, hébergée sur GitHub Pages : https://eedouardd.github.io/apero-chaos/

L'état d'avancement est dans `PROGRESS.md`, le format des cartes et les commandes dans `README.md`.

## Repères

- Stack : Vite, React, TypeScript, Tailwind CSS 4, vite-plugin-pwa, Vitest, oxlint.
- Cartes : `src/contenu/*.json`, un fichier par jeu. Jetons dans les textes : `{j1}`, `{j2}`, `{bois:N}`, `{boit:N}`, `{boivent:N}`, `{buvez:N}`, `{distribue:N}`, `{gorgees:N}`.
- Logique pure et testée : `src/moteur/`. Catalogue des jeux : `src/jeux/catalogue.ts`.
- Thème et couleurs : variables dans `src/index.css`.
- Vérifier avant un push : `npm test`, `npm run lint`, `npm run build`.
- Chaque push sur `main` redéploie le site via GitHub Actions.
- Code et commentaires en français. Commits au format `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.

## Règles de sécurité du contenu (non négociables, même en Hard)

Rien sur la conduite, pas de mélange d'alcools, pas de « cul sec » ni de shots, aucun défi physiquement dangereux, rien d'humiliant ou de discriminant. Les pénalités sont en gorgées, avec un gage en mode Sans alcool. Aucun paiement réel, aucune pub.

## Sous-agents de l'équipe création

Les définitions sont dans `.claude/agents/`. Seul `auteur-contenu` modifie des fichiers ; les quatre autres rendent un avis que le développeur applique.

| Sous-agent | Quand l'utiliser | Ce qu'il rend |
|------------|------------------|---------------|
| `game-designer` | Avant de coder un nouveau jeu. Pour critiquer les règles, le rythme ou l'équilibre d'un jeu existant, ou trancher une question de mécanique (durée, nombre de joueurs, hasard). | Un verdict, des problèmes classés avec leur correction, ou les règles complètes d'un nouveau jeu. Ne code pas. |
| `auteur-contenu` | Dès qu'un jeu a besoin de cartes, questions, gages ou textes de règles : en écrire, en compléter, en réécrire ou en relire. | Les fichiers JSON modifiés, les tests lancés, un récap par ton et intensité. |
| `ux-designer` | Après avoir créé ou modifié un écran ou un parcours (joueurs, réglages, partie, fin) : ergonomie, lisibilité, zones tactiles, textes d'interface. | Les 3 problèmes les plus gênants avec une correction précise. Ne code pas. |
| `directeur-artistique` | Pour toute décision visuelle ou sonore : couleur d'accent d'un nouveau jeu, animations, sons, icônes, cohérence du thème. | Un diagnostic et des valeurs concrètes (couleurs, durées, variables). Ne code pas. |
| `qa-testeur` | Après chaque nouveau jeu ou modification importante, et avant chaque push. | « OK pour push » ou « à corriger », avec la liste des bugs et comment les reproduire. Ne corrige pas. |

### Ordre habituel pour un nouveau jeu

1. `game-designer` conçoit les règles et le format des cartes.
2. Le développeur code la mécanique.
3. `auteur-contenu` écrit les cartes (au moins 80 par jeu).
4. `ux-designer` et `directeur-artistique` relisent l'écran, en parallèle.
5. `qa-testeur` passe avant le push.

Pour une simple retouche de cartes, `auteur-contenu` puis `qa-testeur` suffisent.

Dans la demande faite à un sous-agent, préciser le jeu ou l'écran concerné et les fichiers à lire.

## Skills du projet

Dans `.claude/skills/` :

- `apero-chaos-contenu` : règles d'écriture des cartes (ton, intensité, sécurité, format JSON). Suivi par `auteur-contenu`.
- `apero-chaos-nouveau-jeu` : checklist pour ajouter ou modifier un jeu, de la conception à la mise en ligne.
