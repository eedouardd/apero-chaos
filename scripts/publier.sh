#!/bin/sh
# Mise en ligne manuelle : construit le site et l'envoie sur la branche « gh-pages ».
# Sert tant que la GitHub Action (.github/workflows/deploy.yml) n'est pas en service.
# Usage : npm run publier
set -eu

DEPOT="https://github.com/eedouardd/apero-chaos.git"
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
TEMPORAIRE="$(mktemp -d)"
trap 'rm -rf "$TEMPORAIRE"' EXIT

cd "$RACINE"
npm test
npm run build

cp -R dist/. "$TEMPORAIRE/"
# Indique à GitHub de servir les fichiers tels quels.
touch "$TEMPORAIRE/.nojekyll"

cd "$TEMPORAIRE"
git init -q -b gh-pages
git add -A
git -c user.name="eedouardd" \
    -c user.email="168652433+eedouardd@users.noreply.github.com" \
    commit -q -m "Mise en ligne du $(date '+%d/%m/%Y %H:%M')"
git -c credential.helper= -c credential.helper='!gh auth git-credential' \
    push -q --force "$DEPOT" gh-pages

echo "Site envoyé. En ligne dans 1 à 2 minutes : https://eedouardd.github.io/apero-chaos/"
