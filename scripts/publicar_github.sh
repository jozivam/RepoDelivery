#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <usuario-github> [branch]"
  echo "Exemplo: $0 jozivam work"
  exit 1
fi

USER_GH="$1"
BRANCH="${2:-work}"
REMOTE_URL="https://github.com/${USER_GH}/RepoDelivery.git"

CURRENT_URL=""
if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_URL="$(git remote get-url origin)"
fi

if [[ -n "$CURRENT_URL" ]]; then
  if [[ "$CURRENT_URL" != "$REMOTE_URL" ]]; then
    echo "origin já existe com outra URL: $CURRENT_URL"
    echo "Atualizando origin para: $REMOTE_URL"
    git remote set-url origin "$REMOTE_URL"
  else
    echo "origin já configurado corretamente: $CURRENT_URL"
  fi
else
  git remote add origin "$REMOTE_URL"
  echo "origin configurado para: $REMOTE_URL"
fi

echo "Fazendo push da branch '$BRANCH'..."
git push -u origin "$BRANCH"
echo "Push concluído para origin/$BRANCH"
