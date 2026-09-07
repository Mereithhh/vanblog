#!/usr/bin/env bash
# Guard published nginx reverse-proxy snippets: Host $host must be forwarded (#396).
# File-level checks only; no network.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REVERSE_PROXY="${ROOT}/docs/reference/reverse-proxy.md"
DEPLOY_FAQ="${ROOT}/docs/faq/deploy.md"

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

has_host_header() {
  local haystack="$1"
  grep -Eq -- 'proxy_set_header[[:space:]]+Host[[:space:]]+\$host;' <<<"${haystack}"
}

has_proxy_pass() {
  local haystack="$1"
  grep -Eq -- 'proxy_pass[[:space:]]+' <<<"${haystack}"
}

# Print each ```nginx fenced block, separated by a record delimiter on its own line.
extract_nginx_blocks() {
  local file="$1"
  awk '
    BEGIN { in_block=0 }
    /^```nginx[[:space:]]*$/ { in_block=1; next }
    in_block && /^```[[:space:]]*$/ {
      printf "\n\036\n"
      in_block=0
      next
    }
    in_block { print }
  ' "${file}"
}

# require_proxy_pass: 1 = only blocks that contain proxy_pass (official reverse-proxy examples)
#                    0 = any ```nginx fence (FAQ copy-paste snippet)
assert_nginx_blocks_forward_host() {
  local file="$1"
  local label="$2"
  local min_blocks="${3:-1}"
  local require_proxy_pass="${4:-1}"
  local blocks
  local count=0
  local idx=0
  local kind

  if [[ "${require_proxy_pass}" == "1" ]]; then
    kind="proxy_pass"
  else
    kind="nginx"
  fi

  blocks="$(extract_nginx_blocks "${file}")"
  if [[ -z "${blocks//[$'\n'$'\036']/}" ]]; then
    fail "${label}: found nginx fenced blocks"
    return
  fi

  while IFS= read -r -d $'\036' block; do
    # trim leading/trailing blank lines
    block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
    if [[ -z "${block}" ]]; then
      continue
    fi
    if [[ "${require_proxy_pass}" == "1" ]] && ! has_proxy_pass "${block}"; then
      continue
    fi
    count=$((count + 1))
    idx=$((idx + 1))
    if has_host_header "${block}"; then
      pass "${label}: ${kind} block ${idx} sets Host \$host"
    else
      fail "${label}: ${kind} block ${idx} sets Host \$host"
      echo "---- block ${idx} ----"
      echo "${block}"
      echo "---------------------"
    fi
  done <<<"${blocks}"$'\036'

  if [[ "${count}" -ge "${min_blocks}" ]]; then
    pass "${label}: has at least ${min_blocks} ${kind} block(s) (got ${count})"
  else
    fail "${label}: has at least ${min_blocks} ${kind} block(s) (got ${count})"
  fi
}

echo "== reverse-proxy nginx Host header docs tests =="

if [[ ! -f "${REVERSE_PROXY}" ]]; then
  echo "missing ${REVERSE_PROXY}"
  exit 1
fi
if [[ ! -f "${DEPLOY_FAQ}" ]]; then
  echo "missing ${DEPLOY_FAQ}"
  exit 1
fi

# Matcher itself must reject a snippet that only forwards X-Real-IP (the old docs).
OLD_SNIPPET="$(cat <<'EOF'
  location / {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
  }
EOF
)"
if has_host_header "${OLD_SNIPPET}"; then
  fail "matcher rejects pre-#396 snippet without Host"
else
  pass "matcher rejects pre-#396 snippet without Host"
fi

FIXED_SNIPPET="$(cat <<'EOF'
  location / {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
EOF
)"
if has_host_header "${FIXED_SNIPPET}"; then
  pass "matcher accepts snippet with Host \$host"
else
  fail "matcher accepts snippet with Host \$host"
fi

# Prose mentioning Host must not satisfy the snippet guard: extract fenced nginx only.
PROSE_ONLY="$(mktemp)"
cat >"${PROSE_ONLY}" <<'EOF'
Must set `proxy_set_header Host $host;` or Waline redirects to localhost.

```nginx
server {
  location / {
    proxy_pass http://127.0.0.1:80;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```
EOF
PROSE_BLOCKS="$(extract_nginx_blocks "${PROSE_ONLY}")"
PROSE_FAIL=0
while IFS= read -r -d $'\036' block; do
  block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
  [[ -z "${block}" ]] && continue
  has_proxy_pass "${block}" || continue
  if has_host_header "${block}"; then
    PROSE_FAIL=1
  fi
done <<<"${PROSE_BLOCKS}"$'\036'
rm -f "${PROSE_ONLY}"
if [[ "${PROSE_FAIL}" -eq 0 ]]; then
  pass "snippet guard ignores Host mentioned only in prose"
else
  fail "snippet guard ignores Host mentioned only in prose"
fi

# Published Http + Https examples in reverse-proxy.md.
assert_nginx_blocks_forward_host "${REVERSE_PROXY}" "reverse-proxy.md" 2 1

# If Host lines are removed from the published examples, the guard must fail.
MUTATED="$(mktemp)"
sed '/proxy_set_header[[:space:]]\{1,\}Host[[:space:]]\{1,\}\$host;/d' "${REVERSE_PROXY}" >"${MUTATED}"
MUTATED_HOST_BLOCKS=0
while IFS= read -r -d $'\036' block; do
  block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
  [[ -z "${block}" ]] && continue
  has_proxy_pass "${block}" || continue
  if has_host_header "${block}"; then
    MUTATED_HOST_BLOCKS=$((MUTATED_HOST_BLOCKS + 1))
  fi
done <<<"$(extract_nginx_blocks "${MUTATED}")"$'\036'
rm -f "${MUTATED}"
if [[ "${MUTATED_HOST_BLOCKS}" -eq 0 ]]; then
  pass "removing Host from reverse-proxy.md snippets is detected"
else
  fail "removing Host from reverse-proxy.md snippets is detected (still found ${MUTATED_HOST_BLOCKS})"
fi

# FAQ mini-snippet that users copy must also include Host.
assert_nginx_blocks_forward_host "${DEPLOY_FAQ}" "faq/deploy.md" 1 0

if grep -Eq -- 'localhost' "${DEPLOY_FAQ}" && grep -Eq -- '0\.0\.0\.0' "${DEPLOY_FAQ}"; then
  pass "deploy FAQ describes localhost / 0.0.0.0 Waline redirect"
else
  fail "deploy FAQ describes localhost / 0.0.0.0 Waline redirect"
fi

if grep -Eq -- 'reverse-proxy\.md' "${DEPLOY_FAQ}"; then
  pass "deploy FAQ links to reverse-proxy doc"
else
  fail "deploy FAQ links to reverse-proxy doc"
fi

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
