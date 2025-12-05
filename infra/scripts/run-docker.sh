#!/bin/bash
set -euo pipefail

echo "🛑 Deteniendo y eliminando contenedores (sin borrar imágenes ni volúmenes)..."

echo "Deteniendo infraestructura (RabbitMQ, ...)..."
export COMPOSE_PROJECT_NAME=jac
docker compose -f ./docker/jac-docker-compose.yml down --remove-orphans

echo "🧹 Limpiando builder cache y recursos dangling..."
docker builder prune -f

echo "✅ Contenedores y redes eliminados, imágenes y volúmenes conservados."

echo "🔌 Levantando infraestructura (RabbitMQ, ...)..."
export COMPOSE_PROJECT_NAME=jac
#docker compose -f ./docker/jac-docker-compose.yml pull
docker compose -f ./docker/jac-docker-compose.yml build --no-cache
docker compose -f ./docker/jac-docker-compose.yml up -d --force-recreate

echo "✅ Todo levantado correctamente."