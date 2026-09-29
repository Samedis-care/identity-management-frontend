#!/usr/bin/env bash

set -e

MASTER_COMMIT_INFO="$(curl -q --no-progress-meter https://api.github.com/repos/Samedis-care/react-components/commits/master)"
MASTER_COMMIT_MSG="$(echo "$MASTER_COMMIT_INFO" | jq -r .commit.message)"
MASTER_COMMIT_SHA="$(echo "$MASTER_COMMIT_INFO" | jq -r .sha)"
while true; do
  BUILD_COMMIT_INFO="$(curl -q --no-progress-meter https://api.github.com/repos/Samedis-care/react-components/commits/master_dist)"
  BUILD_COMMIT_MSG="$(echo "$BUILD_COMMIT_INFO" | jq -r .commit.message)"
  BUILD_COMMIT_SHA="$(echo "$BUILD_COMMIT_INFO" | jq -r .sha)"
  BUILD_FOR_SHA=$(echo "$BUILD_COMMIT_MSG" | grep -Po 'commit [a-f0-9]+' | cut -d ' ' -f2)
  [ "$(echo "$MASTER_COMMIT_SHA" | grep -o "^$BUILD_FOR_SHA")" = "$BUILD_FOR_SHA" ] && break
  echo "Build in progress, retrying in 30s..."
  sleep 30
done

echo "Commit: $MASTER_COMMIT_MSG"

LATEST_VERSION="$BUILD_COMMIT_SHA" #$(git ls-remote "https://github.com/Samedis-care/react-components.git" --tags "master_dist" | xargs | cut -d ' ' -f 1)
CURRENT_VERSION="$(grep -oP '(?<=Samedis-care/react-components/tar\.gz/)[a-f0-9]+' pnpm-lock.yaml | head -n 1)"

if [ "$LATEST_VERSION" = "$CURRENT_VERSION" ]; then
  echo "Already up-2-date (version = $CURRENT_VERSION)"
  exit 1
fi

pnpm update components-care

echo "Updated Components-Care $CURRENT_VERSION => $LATEST_VERSION"