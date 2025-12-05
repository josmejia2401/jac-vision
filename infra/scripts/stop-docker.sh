#!/bin/bash
set -euo pipefail

echo "Deteniendo infraestructura (Redis, PostgreSQL)..."
export COMPOSE_PROJECT_NAME=jac
docker compose -f ./docker/jac-docker-compose.yml down

echo "✅ Todo detenido correctamente."
