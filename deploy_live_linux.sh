#!/usr/bin/env bash

# ==============================================================================
# LIBI DIAMONDS canonical-domain deployment (server-side)
# ==============================================================================

set -euo pipefail

APP_ROOT="$(pwd)"
PROCESS_NAME="libi-diamonds-live"
FRONTEND_PORT="${FRONTEND_PORT:-3105}"
ROOT_DOMAIN="libidiamonds.co.il"
CANONICAL_DOMAIN="www.libidiamonds.co.il"
PUBLIC_SITE_URL="https://$CANONICAL_DOMAIN"
NGINX_CONF="/etc/nginx/sites-available/libidiamonds.co.il.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/libidiamonds.co.il.conf"
CERT_DIR="/etc/letsencrypt/live/libidiamonds.co.il"
CERT_EMAIL="Libidiamonds@gmail.com"

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

log "Installing dependencies for the canonical-domain build..."
if [ -f package-lock.json ]; then
    npm ci --silent
else
    npm install --silent
fi

log "Building the root-path, indexable site for $PUBLIC_SITE_URL..."
NEXT_BASE_PATH="" NEXT_PUBLIC_BASE_PATH="" \
    NEXT_PUBLIC_SITE_URL="$PUBLIC_SITE_URL" NEXT_PUBLIC_ALLOW_INDEXING=true \
    npm run build

log "Starting PM2 process $PROCESS_NAME on port $FRONTEND_PORT..."
pm2 delete "$PROCESS_NAME" > /dev/null 2>&1 || true
PORT="$FRONTEND_PORT" NEXT_BASE_PATH="" NEXT_PUBLIC_BASE_PATH="" \
    NEXT_PUBLIC_SITE_URL="$PUBLIC_SITE_URL" NEXT_PUBLIC_ALLOW_INDEXING=true \
    pm2 start npm --name "$PROCESS_NAME" --cwd "$APP_ROOT" -- start
pm2 save > /dev/null

log "Waiting for the root-path application health check..."
for attempt in {1..30}; do
    if curl -fsS "http://127.0.0.1:$FRONTEND_PORT/" > /dev/null 2>&1; then
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        log "The canonical-domain application did not become healthy." "ERROR"
        pm2 logs "$PROCESS_NAME" --lines 100 --nostream --no-color || true
        exit 1
    fi
    sleep 1
done

if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    log "Writing the temporary HTTP virtual host for certificate issuance..."
    cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $ROOT_DOMAIN $CANONICAL_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
    ln -sfn "$NGINX_CONF" "$NGINX_ENABLED"
    nginx -t
    systemctl reload nginx

    log "Issuing the TLS certificate for both LIBI hostnames..."
    certbot certonly --nginx --non-interactive --agree-tos \
        --email "$CERT_EMAIL" \
        -d "$ROOT_DOMAIN" -d "$CANONICAL_DOMAIN"
fi

log "Writing the canonical HTTPS virtual host..."
cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $ROOT_DOMAIN $CANONICAL_DOMAIN;
    return 301 https://$CANONICAL_DOMAIN\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $ROOT_DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://$CANONICAL_DOMAIN\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $CANONICAL_DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    access_log /var/log/nginx/libidiamonds.access.log;
    error_log /var/log/nginx/libidiamonds.error.log;

    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; script-src 'self' http: https: data: blob: 'unsafe-inline' 'wasm-unsafe-eval'" always;
    }
}
NGINX

ln -sfn "$NGINX_CONF" "$NGINX_ENABLED"
nginx -t
systemctl reload nginx

log "Running canonical-domain HTTPS checks..."
curl --noproxy '*' -fsS --resolve "$CANONICAL_DOMAIN:443:127.0.0.1" "$PUBLIC_SITE_URL/" > /dev/null
curl --noproxy '*' -fsSI --resolve "$ROOT_DOMAIN:443:127.0.0.1" "https://$ROOT_DOMAIN/" | grep -qi "location: $PUBLIC_SITE_URL/"

log "LIBI DIAMONDS canonical-domain deployment complete." "SUCCESS"
log "Public: $PUBLIC_SITE_URL" "SUCCESS"
