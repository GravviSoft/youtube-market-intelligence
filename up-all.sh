#!/usr/bin/env bash
set -euo pipefail

# Run all project services (proxy, frontend, backend) in one command.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

NETWORK="proxy-net"
if ! docker network inspect "${NETWORK}" >/dev/null 2>&1; then
  echo "Creating docker network: ${NETWORK}"
  docker network create "${NETWORK}"
fi

docker compose \
  -f "${ROOT_DIR}/infra/proxy/docker-compose.yml" \
  -f "${ROOT_DIR}/frontend/docker-compose.yml" \
  -f "${ROOT_DIR}/backend/docker-compose.yml" \
  up -d --build
