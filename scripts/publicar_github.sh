#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <usuario-github> [branch]"
  echo "Exemplo: $0 meuusuario work"
  exit 1
fi

USER_GH="$1"
BRANCH="${2:-work}"
REMOTE_URL="https://github.com/${USER_GH}/RepoDelivery.git"

if git remote get-url origin >/dev/null 2>&1; then
  echo "origin já configurado: $(git remote get-url origin)"
else
  git remote add origin "$REMOTE_URL"
  echo "origin configurado para: $REMOTE_URL"
fi

git push -u origin "$BRANCH"
echo "Push concluído para origin/$BRANCH"
