#!/usr/bin/env bash
set -euo pipefail

IMAGE="ghcr.io/hoangsonww/rag-ai-system-portfolio-support:1.0.0"

echo "🛠  Building Docker image ${IMAGE}"
docker build -t "${IMAGE}" .

echo "🚀 Pushing ${IMAGE} to GitHub Container Registry"
echo "${GITHUB_TOKEN}" | docker login ghcr.io -u hoangsonww --password-stdin
docker push "${IMAGE}"

echo "✅ Done!"
