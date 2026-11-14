# Apéro Chaos

Jeux de soirée sur un seul téléphone qui passe de main en main. Web app installable, en français, sans compte.

**Jouer : https://eedouardd.github.io/apero-chaos/**

Neuf jeux : Défis & Vérités, Je n'ai jamais, Qui pourrait…, La Roue, Duel, Tu préfères…, La Bombe, Vrai ou Bluff, L'Imposteur. Plus « Mes cartes », pour jouer avec des cartes écrites par le groupe. Trois tons (Tout public, Étudiant pimenté, Hard), trois intensités, et un mode Sans alcool où les gorgées deviennent des gages.

## Installer l'app sur son téléphone

**iPhone (Safari)** : ouvre le lien, touche le bouton Partager (le carré avec une flèche), puis « Sur l'écran d'accueil ».

**Android (Chrome)** : ouvre le lien, touche le menu ⋮ en haut à droite, puis « Installer l'application » (ou « Ajouter à l'écran d'accueil »).

Une fois ouverte une première fois avec du réseau, l'app fonctionne hors ligne. Quand une nouvelle version est en ligne, un bandeau « Nouvelle version prête » apparaît sur l'accueil : un toucher et c'est à jour.

## Modifier ou ajouter des cartes

Les cartes sont dans `src/contenu`, un fichier par jeu (`defis-verites.json`, `je-nai-jamais.json`, etc.). Les gages sont dans `gages.json`. Une carte ressemble à ceci :

```json
{ "id": "dv-101", "categorie": "Défi", "texte": "{j1}, imite {j2}. Raté ? {bois:2}.", "ton": "tout-public", "intensite": "soft", "difficulte": 2, "tags": ["mime"], "minJoueurs": 3 }
```

| Champ | Valeurs | Rôle |
|-------|---------|------|
| `id` | texte unique dans le fichier | identifie la carte |
| `texte` | libre | ce qui s'affiche |
| `ton` | `tout-public`, `pimente`, `hard` | la carte sort si le ton choisi est au moins celui-ci |
| `intensite` | `soft`, `normal`, `hard` | idem pour l'intensité |
| `difficulte` | `1`, `2`, `3`, `4` | fixe la pénalité : voir « Échelle de pénalités » |
| `tags` | liste de mots | voir ci-dessous |
| `minJoueurs` | nombre | nombre de joueurs minimum |
| `categorie` | facultatif | étiquette en haut de la carte |
| `texteFin` | facultatif | pour une règle « Jusqu'à nouvel ordre » : la carte qui l'annule |

**Tags qui comptent** : `physique` (jamais donnée à un joueur qui refuse les défis physiques), `intime` et `genant` (jamais données à un joueur qui refuse les questions gênantes), `alcool` (retirée en mode Sans alcool), `repete` (pénalité qui tombe plusieurs fois, « à chaque oubli… » : écris-la à 1 gorgée, elle n'est jamais augmentée). Les autres tags sont libres.

**Mots magiques dans le texte** :

- `{j1}`, `{j2}` : prénoms de joueurs tirés au sort.
- `{bois:2}`, `{boit:2}` : « bois 2 gorgées », « boit 2 gorgées ». Ils s'adressent à `{j1}`.
- `{boivent:1}`, `{buvez:1}`, `{distribue:2}`, `{gorgees:2}` : « boivent 1 gorgée », « buvez 1 gorgée », « distribue 2 gorgées », « 2 gorgées ».

Tout devient un gage en mode Sans alcool ou pour un joueur qui ne boit pas.

**Échelle de pénalités** : la pénalité est ce que coûte un raté ou un refus. Elle s'affiche dans un bandeau « 🍺 ×N » sur la carte (vert 1, orange 2-3, rouge 4-5).

| `difficulte` | Avec alcool | Sans alcool |
|---|---|---|
| 1, facile | 1 gorgée | petit gage |
| 2, moyenne | 2 ou 3 gorgées | gage moyen |
| 3, difficile | 4 ou 5 gorgées | gros gage |
| 4, les plus dures | 5 gorgées à distribuer, gage collectif ou règle jusqu'à la fin | gros gage ou règle |

Jamais plus de 5 gorgées d'un coup, 3 en intensité Soft, et 3 au plus quand plusieurs joueurs boivent en même temps. Le premier nombre « je bois » de la carte reçoit la pénalité et les autres nombres suivent ; écris-le au bas de la fourchette (1, 2, 4 ou 5). Une carte sans `difficulte` (comme celles de « Mes cartes ») garde son nombre écrit, à une gorgée près. Les gages de `gages.json` ont une `taille` : `petit`, `moyen` ou `gros`.

**Règles de sécurité, même en Hard** : rien sur la conduite, pas de mélange d'alcools, pas de « cul sec » ni de shots, aucun défi dangereux, rien d'humiliant ou de discriminant. `npm test` refuse les formulations interdites les plus courantes.

### Paires de mots de L'Imposteur

`src/contenu/imposteur.json` a son propre format, une paire par ligne :

```json
{ "id": "im-001", "mots": ["chat", "poisson rouge"], "ton": "tout-public", "difficulte": 1, "tags": [], "theme": "animaux" }
```

| Champ | Valeurs | Rôle |
|-------|---------|------|
| `mots` | 2 mots distincts, 16 caractères au plus | l'un va aux innocents, l'autre aux imposteurs (tirage au sort) |
| `ton` | `tout-public`, `pimente`, `hard` | comme pour les cartes |
| `difficulte` | `1`, `2`, `3` | 1 = mots bien distincts, 3 = presque synonymes ; la partie monte en difficulté |
| `tags` | liste de mots | `intime` ou `genant` retire la paire si la majorité du groupe refuse ce contenu |
| `theme` | libre | jamais affiché ; évite deux paires du même thème dans une partie |

Un même mot ne doit servir que dans une seule paire, pluriels et accents compris (`npm test` le vérifie).

### Gages

`src/contenu/gages.json` : `{ "id": "g-31", "texte": "…", "ton": "tout-public", "physique": true, "genant": true }`. `physique` et `genant` sont facultatifs : le gage est écarté dès qu'un joueur refuse les défis physiques ou les questions gênantes.

## Travailler sur le code

Lancer l'app sur son ordinateur (et sur le téléphone du même Wi-Fi, à l'adresse « Network » affichée) :

```bash
npm run dev
```

Vérifier que rien n'est cassé :

```bash
npm test
```

Mettre en ligne : chaque `git push` sur `main` lance la GitHub Action qui teste, construit et publie le site en une à deux minutes.

```bash
git add -A && git commit -m "feat: nouvelles cartes" && git push
```

## Organisation

```text
src/
├── contenu/      cartes (JSON) et gages
├── moteur/       filtrage, tirage, recommandations, récap (+ tests)
├── jeux/         catalogue des jeux, un composant par mécanique, packs premium
├── ecrans/       accueil, joueurs, réglages, +18, choix du jeu, règles, partie, fin
├── composants/   boutons, carte, fenêtres, mise en page
├── effets/       sons et vibrations
└── stockage/     sauvegarde locale (joueurs, réglages)
```

Les packs premium (`src/jeux/packs.ts`) sont annoncés comme « bientôt ». Aucun paiement n'est branché : le fichier explique comment en ajouter un plus tard.

L'abus d'alcool est dangereux pour la santé. Réservé aux adultes dès qu'il y a de l'alcool.
