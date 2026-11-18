#!/bin/bash
set -e
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd ~/projects/corrales-web
echo "→ Compilando..."
pnpm build
echo "✓ Build exitoso, reiniciando..."
pm2 restart corrales-web
echo "✓ Listo: https://corrales.157.230.83.213.nip.io"
