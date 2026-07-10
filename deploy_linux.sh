#!/usr/bin/env bash

# ==============================================================================
# LIBI DIAMONDS Production Deployment Script (Server-Side)
# ==============================================================================

set -euo pipefail

APP_ROOT="$(pwd)"
REMOTE_REPO="https://github.com/lironatar1994-coder/LibiDiamonds.git"
PROCESS_NAME="libi-diamonds"
FRONTEND_PORT="${FRONTEND_PORT:-3102}"
ROUTE_BASE="/LibiDiamonds"
LOWER_ROUTE_BASE="/libidiamonds"
NGINX_CONF="/etc/nginx/sites-available/vee-app.co.il.conf"
NGINX_SNIPPET="/etc/nginx/snippets/libi-diamonds-locations.conf"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    local message="$1"
    local level="${2:-INFO}"
    local color="$NC"
    case "$level" in
        "INFO") color="$BLUE" ;;
        "SUCCESS") color="$GREEN" ;;
        "WARN") color="$YELLOW" ;;
        "ERROR") color="$RED" ;;
    esac
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $message${NC}"
}

run_npm_install() {
    if [ -f package-lock.json ]; then
        npm ci --silent
    else
        npm install --silent
    fi
}

log "Starting LIBI DIAMONDS deployment..."

if [ "${SKIP_GIT_SYNC:-0}" != "1" ]; then
    log "Syncing repository from origin/main..."
    git remote set-url origin "$REMOTE_REPO"
    git fetch origin main
    git reset --hard origin/main
else
    log "Skipping git sync because SKIP_GIT_SYNC=1." "WARN"
fi

log "Installing dependencies..."
cd "$APP_ROOT"
run_npm_install

log "Building Next.js app for $ROUTE_BASE..."
NEXT_BASE_PATH="$ROUTE_BASE" NEXT_PUBLIC_BASE_PATH="$ROUTE_BASE" npm run build

log "Starting/restarting PM2 process $PROCESS_NAME on port $FRONTEND_PORT..."
pm2 delete "$PROCESS_NAME" > /dev/null 2>&1 || true
PORT="$FRONTEND_PORT" NEXT_BASE_PATH="$ROUTE_BASE" NEXT_PUBLIC_BASE_PATH="$ROUTE_BASE" \
    pm2 start npm --name "$PROCESS_NAME" --cwd "$APP_ROOT" -- start
pm2 save > /dev/null

log "Writing Nginx route snippet for vee-app.co.il$ROUTE_BASE..."
cat > "$NGINX_SNIPPET" <<NGINX
location = $ROUTE_BASE {
    return 301 $ROUTE_BASE/\$is_args\$args;
}

location = $LOWER_ROUTE_BASE {
    return 301 $ROUTE_BASE/\$is_args\$args;
}

location ^~ $LOWER_ROUTE_BASE/ {
    rewrite ^$LOWER_ROUTE_BASE(.*)$ $ROUTE_BASE\$1 permanent;
}

location ^~ $ROUTE_BASE/ {
    proxy_pass http://127.0.0.1:$FRONTEND_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}
NGINX

python3 - "$NGINX_CONF" "$NGINX_SNIPPET" <<'PY'
from pathlib import Path
import sys

conf_path = Path(sys.argv[1])
snippet_path = Path(sys.argv[2])
include_line = f"    include {snippet_path};\n"
text = conf_path.read_text()

if include_line not in text:
    marker = "    location /text-to-pdf {"
    if marker not in text:
        marker = "    location / {"
    if marker not in text:
        raise SystemExit("Could not find insertion point in vee-app.co.il.conf")
    text = text.replace(marker, include_line + "\n" + marker, 1)
    conf_path.write_text(text)
PY

log "Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

log "Running health check..."
for attempt in {1..20}; do
    if curl -fsS "http://127.0.0.1:$FRONTEND_PORT$ROUTE_BASE/" > /dev/null 2>&1; then
        break
    fi
    if [ "$attempt" -eq 20 ]; then
        log "Local app health check failed after waiting." "ERROR"
        pm2 logs "$PROCESS_NAME" --lines 80 --nostream --no-color || true
        exit 1
    fi
    sleep 1
done

curl -kfsS --resolve vee-app.co.il:443:127.0.0.1 "https://vee-app.co.il$ROUTE_BASE/" > /dev/null

log "LIBI DIAMONDS deployment complete." "SUCCESS"
log "Public: https://vee-app.co.il$ROUTE_BASE/" "SUCCESS"
