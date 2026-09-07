#!/usr/bin/env bash
# Reproduce #413: official website-builder install on current node:18-alpine.
# Same apk packages + SHARP_IGNORE_GLOBAL_LIBVIPS as the all-in-one Dockerfile,
# then `pnpm install --frozen-lockfile` and load sharp.
set -eu

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DOCKERFILE="${ROOT}/Dockerfile"
WEBSITE_PKG="${ROOT}/packages/website/package.json"

DOCKER=(docker)
if ! command -v docker >/dev/null 2>&1; then
  echo "FAIL: docker is required to verify Alpine sharp install"
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  if sudo docker info >/dev/null 2>&1; then
    DOCKER=(sudo docker)
  else
    echo "FAIL: docker daemon is not reachable"
    exit 1
  fi
fi

if ! grep -q 'SHARP_IGNORE_GLOBAL_LIBVIPS=1' "${DOCKERFILE}"; then
  echo "FAIL: Dockerfile is missing SHARP_IGNORE_GLOBAL_LIBVIPS=1"
  exit 1
fi

SHARP_VERSION="$(python3 - "${WEBSITE_PKG}" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["dependencies"]["sharp"])
PY
)"

APK_PACKAGES="$(python3 - "${DOCKERFILE}" <<'PY'
import re, sys
text = open(sys.argv[1], encoding="utf-8").read()
start = text.find("FROM node:18-alpine AS WEBSITE_BUILDER")
end = text.find("\nFROM ", start + 1)
stage = text[start:end]
match = re.search(r"apk add --no-cache ([^\n\\]+)", stage)
if not match:
    raise SystemExit("could not parse apk packages from WEBSITE_BUILDER")
print(match.group(1).strip())
PY
)"
if [[ -z "${APK_PACKAGES}" ]]; then
  echo "FAIL: could not parse apk packages from Dockerfile WEBSITE_BUILDER"
  exit 1
fi
if [[ "${APK_PACKAGES}" != *vips-dev* ]] || [[ "${APK_PACKAGES}" != *libc6-compat* ]]; then
  echo "FAIL: parsed apk packages missing vips-dev or libc6-compat: ${APK_PACKAGES}"
  exit 1
fi

SLIM_DOCKERFILE="$(mktemp)"
cleanup() {
  rm -f "${SLIM_DOCKERFILE}"
}
trap cleanup EXIT

cat > "${SLIM_DOCKERFILE}" <<EOF
FROM node:18-alpine
WORKDIR /app
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
RUN apk add --no-cache ${APK_PACKAGES}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/website ./packages/website
RUN corepack enable \\
  && corepack prepare pnpm@8.11.0 --activate \\
  && pnpm config set network-timeout 600000 -g \\
  && pnpm config set fetch-retries 20 -g \\
  && pnpm config set fetch-timeout 600000 -g \\
  && pnpm install --frozen-lockfile \\
  && pnpm --filter @vanblog/theme-default exec node -e "require('sharp'); console.log('sharp', require('sharp/package.json').version, 'ok')"
EOF

echo "Official website-builder install on node:18-alpine (sharp@${SHARP_VERSION})"
echo "apk: ${APK_PACKAGES}"

"${DOCKER[@]}" build \
  -f "${SLIM_DOCKERFILE}" \
  -t vanblog-website-alpine-sharp-413 \
  "${ROOT}"
