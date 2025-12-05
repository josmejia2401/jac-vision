#!/bin/bash
set -euo pipefail

echo "⚠️  Este script eliminará TODOS los recursos de Docker:"
echo "   - Contenedores"
echo "   - Imágenes"
echo "   - Volúmenes"
echo "   - Redes personalizadas (NO las predeterminadas: bridge, host, none)"
echo
read -p "¿Deseas continuar? Escribe 'y' para confirmar: " confirm

if [[ "$confirm" != "y" ]]; then
  echo "❌ Cancelado por el usuario."
  exit 1
fi

echo "🛑 Deteniendo contenedores..."
docker ps -aq | xargs -r docker stop

echo "🧼 Eliminando contenedores..."
docker ps -aq | xargs -r docker rm -f

echo "🧼 Eliminando imágenes..."
docker images -aq | xargs -r docker rmi -f

echo "🧼 Eliminando volúmenes..."
docker volume ls -q | xargs -r docker volume rm

echo "🧼 Eliminando redes personalizadas..."
docker network ls --filter "type=custom" --format "{{.Name}}" | \
  grep -vE '^(bridge|host|none)$' | \
  xargs -r docker network rm

echo "🧼 Eliminando builder..."
docker builder prune --all --force

echo "✅ Docker ha sido limpiado completamente."

echo "🧹 Eliminando contenedores detenidos..."
docker container prune -f

echo "🧹 Eliminando imágenes sin etiqueta (dangling)..."
docker image prune -f

echo "🧹 Eliminando todas las imágenes (excepto en uso)..."
docker image prune -a -f

echo "🧹 Eliminando volúmenes no usados..."
docker volume prune -f

echo "🧹 Eliminando builders no usados..."
docker builder prune -a -f

echo "🧹 Eliminando redes personalizadas (excepto: bridge, host, none)..."
docker network ls --format '{{.Name}}' | grep -v -E '^bridge$|^host$|^none$' | while read net; do
  echo "  - Eliminando red: $net"
  docker network rm "$net"
done

echo "✅ Limpieza completada."

