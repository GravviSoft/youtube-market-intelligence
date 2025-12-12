#!/usr/bin/env bash
set -euo pipefail

# Generate an Nginx server block for a subdomain that proxies to frontend/backend host ports.
# Usage: ./scripts/gen-nginx-conf.sh <domain> <frontend_host_port> <backend_host_port>

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <domain> <frontend_host_port> <backend_host_port>" >&2
  exit 1
fi

DOMAIN="$1"
FRONT_PORT="$2"
BACK_PORT="$3"

cat <<EOF
server {
  listen 80;
  server_name ${DOMAIN};
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ${DOMAIN};

  ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:${FRONT_PORT};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:${BACK_PORT};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
  }
}
EOF
