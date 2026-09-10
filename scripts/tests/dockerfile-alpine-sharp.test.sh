#!/usr/bin/env bash
# Assert official all-in-one Dockerfile can install sharp on Alpine (#413).
# File-level checks only; the companion install script needs Docker.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DOCKERFILE="${ROOT}/Dockerfile"
WEBSITE_PKG="${ROOT}/packages/website/package.json"
LOCKFILE="${ROOT}/pnpm-lock.yaml"

PASS=0
FAIL=0

fail() {
  echo "FAIL: $*"
  FAIL=$((FAIL + 1))
}

pass() {
  echo "PASS: $*"
  PASS=$((PASS + 1))
}

assert_file_contains() {
  local file="$1"
  local needle="$2"
  local label="$3"
  if grep -q -- "${needle}" "${file}"; then
    pass "${label}"
  else
    fail "${label} (missing in ${file}: ${needle})"
  fi
}

assert_file_not_contains() {
  local file="$1"
  local needle="$2"
  local label="$3"
  if grep -q -- "${needle}" "${file}"; then
    fail "${label} (unexpected in ${file}: ${needle})"
  else
    pass "${label}"
  fi
}

# Isolate the WEBSITE_BUILDER stage so ADMIN/SERVER/RUNNER lines cannot
# satisfy the assertions.
WEBSITE_STAGES="$(awk '
  BEGIN { keep=0 }
  $0 ~ /^FROM / { keep=0 }
  $0 ~ /^FROM .* AS WEBSITE_BUILDER/ { keep=1 }
  keep { print }
' "${DOCKERFILE}")"

if [[ -z "${WEBSITE_STAGES}" ]]; then
  fail "Dockerfile defines WEBSITE_BUILDER stage"
else
  pass "Dockerfile defines WEBSITE_BUILDER stage"
fi

assert_contains_in() {
  local haystack="$1"
  local needle="$2"
  local label="$3"
  if [[ "${haystack}" == *"${needle}"* ]]; then
    pass "${label}"
  else
    fail "${label} (missing: ${needle})"
  fi
}

assert_contains_in "${WEBSITE_STAGES}" "node:18-alpine" "website builder uses node:18-alpine"
assert_contains_in "${WEBSITE_STAGES}" "SHARP_IGNORE_GLOBAL_LIBVIPS=1" "website builder ignores Alpine system libvips"
assert_contains_in "${WEBSITE_STAGES}" "vips-dev" "website builder installs vips-dev"
assert_contains_in "${WEBSITE_STAGES}" "libc6-compat" "website builder installs libc6-compat"
assert_contains_in "${WEBSITE_STAGES}" "fftw-dev" "website builder installs fftw-dev"
assert_contains_in "${WEBSITE_STAGES}" "python3" "website builder still has python3 for node-gyp fallback"
assert_contains_in "${WEBSITE_STAGES}" "make" "website builder still has make for node-gyp fallback"
assert_contains_in "${WEBSITE_STAGES}" "g++" "website builder still has g++ for node-gyp fallback"
assert_contains_in "${WEBSITE_STAGES}" "pnpm install --frozen-lockfile" "website builder keeps frozen lockfile"
assert_contains_in "${WEBSITE_STAGES}" "pnpm@8.11.0" "website builder pins pnpm 8.11.0 (repo packageManager, not latest)"

if [[ "${WEBSITE_STAGES}" == *"apk add"* ]] && [[ "${WEBSITE_STAGES}" == *"vips-dev"* ]]; then
  pass "website builder apk add includes vips-dev"
else
  fail "website builder apk add includes vips-dev"
fi

# ENV must be set before pnpm install in the website builder stage.
python3 - "${DOCKERFILE}" <<'PY' && pass "SHARP_IGNORE_GLOBAL_LIBVIPS is set before website pnpm install" || fail "SHARP_IGNORE_GLOBAL_LIBVIPS is set before website pnpm install"
import sys
text = open(sys.argv[1], encoding="utf-8").read()
start = text.find("FROM node:18-alpine AS WEBSITE_BUILDER")
end = text.find("\nFROM ", start + 1)
if start < 0 or end < 0:
    raise SystemExit(1)
stage = text[start:end]
env_at = stage.find("SHARP_IGNORE_GLOBAL_LIBVIPS=1")
install_at = stage.find("pnpm install --frozen-lockfile")
if env_at < 0 or install_at < 0 or env_at > install_at:
    raise SystemExit(1)
PY

assert_file_not_contains "${DOCKERFILE}" "pnpm@latest" "Dockerfile does not activate floating pnpm@latest"
assert_file_contains "${WEBSITE_PKG}" '"sharp": "0.32.6"' "website pins sharp 0.32.6 (coerces Alpine musl 1.2.4_git*)"
assert_file_not_contains "${WEBSITE_PKG}" '"sharp": "^0.31.' "website no longer depends on sharp 0.31"
assert_file_contains "${LOCKFILE}" "/sharp@0.32.6:" "lockfile resolves sharp 0.32.6"
assert_file_not_contains "${LOCKFILE}" "/sharp@0.31.3:" "lockfile no longer pins sharp 0.31.3"

# RUNNER needs musl compat for Next/sharp native binaries copied from the builder.
RUNNER_STAGE="$(awk '
  BEGIN { keep=0 }
  $0 ~ /^FROM / { keep=0 }
  $0 ~ /^FROM .* AS RUNNER/ { keep=1 }
  keep { print }
' "${DOCKERFILE}")"
assert_contains_in "${RUNNER_STAGE}" "libc6-compat" "runner installs libc6-compat for sharp/next native binaries"
assert_contains_in "${RUNNER_STAGE}" "libavif-apps" "runner installs libavif-apps (avifenc) for AVIF fallback"
assert_contains_in "${RUNNER_STAGE}" "libwebp-tools" "runner still installs libwebp-tools (cwebp)"
assert_contains_in "${RUNNER_STAGE}" "COPY --from=WEBSITE_BUILDER" "runner still copies website from WEBSITE_BUILDER"

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
