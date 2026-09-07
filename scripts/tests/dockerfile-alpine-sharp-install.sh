#!/usr/bin/env bash
# Reproduce #413: install the website's pinned sharp on current node:18-alpine.
# Uses the same apk packages + SHARP_IGNORE_GLOBAL_LIBVIPS as the official Dockerfile.
set -eu

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DOCKERFILE="${ROOT}/Dockerfile"
WEBSITE_PKG="${ROOT}/packages/website/package.json"

if ! command -v docker >/dev/null 2>&1; then
  echo "FAIL: docker is required to verify Alpine sharp install"
  exit 1
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

# Same packages the WEBSITE_DEPS stage installs for sharp / node-gyp.
APK_PACKAGES="$(python3 - "${DOCKERFILE}" <<'PY'
import re, sys
text = open(sys.argv[1], encoding="utf-8").read()
start = text.find("FROM node:18-alpine AS WEBSITE_DEPS")
end = text.find("\nFROM ", start + 1)
stage = text[start:end]
match = re.search(r"apk add --no-cache ([^\n\\]+)", stage)
if not match:
    raise SystemExit("could not parse apk packages from WEBSITE_DEPS")
print(match.group(1).strip())
PY
)"
if [[ -z "${APK_PACKAGES}" ]]; then
  echo "FAIL: could not parse apk packages from Dockerfile WEBSITE_DEPS"
  exit 1
fi
if [[ "${APK_PACKAGES}" != *vips-dev* ]] || [[ "${APK_PACKAGES}" != *libc6-compat* ]]; then
  echo "FAIL: parsed apk packages missing vips-dev or libc6-compat: ${APK_PACKAGES}"
  exit 1
fi

echo "Installing sharp@${SHARP_VERSION} on node:18-alpine with: ${APK_PACKAGES}"

docker run --rm \
  -e SHARP_IGNORE_GLOBAL_LIBVIPS=1 \
  node:18-alpine \
  sh -c "set -eu
    apk add --no-cache ${APK_PACKAGES}
    mkdir -p /tmp/sharp-test
    cd /tmp/sharp-test
    npm init -y >/dev/null
    npm install --no-fund --no-audit sharp@${SHARP_VERSION}
    node -e \"require('sharp'); console.log('sharp', require('sharp/package.json').version, 'ok')\"
  "
