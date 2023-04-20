#!/usr/bin/env bash

set -e

LATEST_VERSION="$(git ls-remote "https://github.com/Samedis-care/react-components.git" --tags "master_dist" | xargs | cut -d ' ' -f 1)"
CURRENT_VERSION="$(grep 'Samedis-care/react-components.git' package-lock.json | head -n 1 | cut -d '#' -f 2 | cut -d '"' -f 1)"

if [ "$LATEST_VERSION" = "$CURRENT_VERSION" ]; then
  echo "Already up-2-date (version = $CURRENT_VERSION)"
  exit 1
fi

if [ ! -d "src/node_modules/components-care" ]; then
  echo "This script only works in dev setup. Does not actually update anything. Only updates the references in package-lock.json"
  exit 1
fi

sed -i "s/$CURRENT_VERSION/$LATEST_VERSION/g" package-lock.json
echo "Updated Components-Care $CURRENT_VERSION => $LATEST_VERSION"
