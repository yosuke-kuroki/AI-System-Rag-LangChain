#!/usr/bin/env bash
set -euo pipefail

# --- CONFIGURATION ---
# Your GitHub user/org
GITHUB_USER=hoangsonww
# Image name = ghcr.io/<user>/<repo>
IMAGE=ghcr.io/${GITHUB_USER}/rag-langchain-system-api

# Read version from package.json
VERSION=$(node -p "require('./package.json').version")

# --- BUILD & TAG ---
echo "🛠  Building Docker image ${IMAGE}:${VERSION}"
docker build -t ${IMAGE}:${VERSION} .

# Also tag "latest"
docker tag ${IMAGE}:${VERSION} ${IMAGE}:latest

# --- LOGIN & PUSH ---
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "❌ GITHUB_TOKEN not set. Export one with write:packages & read:packages scopes."
  exit 1
fi

echo "🔐 Logging in to GitHub Container Registry"
echo "${GITHUB_TOKEN}" | docker login ghcr.io -u "${GITHUB_USER}" --password-stdin

echo "📤 Pushing ${IMAGE}:${VERSION} and ${IMAGE}:latest"
docker push ${IMAGE}:${VERSION}
docker push ${IMAGE}:latest

echo "✅ Done!"
