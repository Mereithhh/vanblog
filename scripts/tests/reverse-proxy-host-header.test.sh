#!/usr/bin/env bash
# Guard published nginx reverse-proxy snippets:
#   - Host $host must be forwarded (#396)
#   - proxy_no_cache / proxy_cache_bypass must be present so HTML is not stale (#469)
# File-level checks only; no network.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REVERSE_PROXY="${ROOT}/docs/reference/reverse-proxy.md"
DEPLOY_FAQ="${ROOT}/docs/faq/deploy.md"
USAGE_FAQ="${ROOT}/docs/faq/usage.md"
BT_PANEL="${ROOT}/docs/guide/bt-panel.snippet.md"
ISR_DOC="${ROOT}/docs/advanced/isr.md"
CHANGELOG="${ROOT}/CHANGELOG.md"
DOCS_CHANGELOG="${ROOT}/docs/changelog.md"

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

# Uncommented location-level directives only; a leading # must not count.
has_cache_bypass() {
  local haystack="$1"
  grep -Eq -- '^[[:space:]]*proxy_no_cache[[:space:]]+1;' <<<"${haystack}" \
    && grep -Eq -- '^[[:space:]]*proxy_cache_bypass[[:space:]]+1;' <<<"${haystack}"
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

# require_proxy_pass: 1 = only official reverse-proxy examples (must all bypass cache)
#                    0 = any ```nginx fence that contains proxy_pass
assert_nginx_blocks_bypass_cache() {
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
    fail "${label}: found nginx fenced blocks for cache bypass"
    return
  fi

  while IFS= read -r -d $'\036' block; do
    block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
    if [[ -z "${block}" ]]; then
      continue
    fi
    if [[ "${require_proxy_pass}" == "1" ]] && ! has_proxy_pass "${block}"; then
      continue
    fi
    if [[ "${require_proxy_pass}" == "0" ]] && ! has_proxy_pass "${block}"; then
      continue
    fi
    count=$((count + 1))
    idx=$((idx + 1))
    if has_cache_bypass "${block}"; then
      pass "${label}: ${kind} block ${idx} sets proxy_no_cache / proxy_cache_bypass"
    else
      fail "${label}: ${kind} block ${idx} sets proxy_no_cache / proxy_cache_bypass"
      echo "---- block ${idx} ----"
      echo "${block}"
      echo "---------------------"
    fi
  done <<<"${blocks}"$'\036'

  if [[ "${count}" -ge "${min_blocks}" ]]; then
    pass "${label}: has at least ${min_blocks} ${kind} block(s) with cache bypass (got ${count})"
  else
    fail "${label}: has at least ${min_blocks} ${kind} block(s) with cache bypass (got ${count})"
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

ENV_DOC="${ROOT}/docs/reference/env.md"
if grep -Eq -- 'VAN_BLOG_SERVER_HOST' "${ENV_DOC}" \
  && grep -Eq -- '127\.0\.0\.1' "${ENV_DOC}"; then
  pass "env.md documents VAN_BLOG_SERVER_HOST for loopback bind"
else
  fail "env.md documents VAN_BLOG_SERVER_HOST for loopback bind"
fi

if grep -Eq -- 'VAN_BLOG_SERVER_HOST' "${REVERSE_PROXY}" \
  && grep -Eq -- '127\.0\.0\.1:80:80' "${REVERSE_PROXY}"; then
  pass "reverse-proxy.md documents listen host and compose bind"
else
  fail "reverse-proxy.md documents listen host and compose bind"
fi

if grep -Eq -- 'VAN_BLOG_SERVER_HOST' "${DEPLOY_FAQ}" \
  && grep -Eq -- '127\.0\.0\.1:80:80' "${DEPLOY_FAQ}"; then
  pass "deploy FAQ documents listen host and compose bind"
else
  fail "deploy FAQ documents listen host and compose bind"
fi

echo "== reverse-proxy nginx HTML cache bypass docs tests (#469) =="

if [[ ! -f "${USAGE_FAQ}" ]]; then
  echo "missing ${USAGE_FAQ}"
  exit 1
fi
if [[ ! -f "${BT_PANEL}" ]]; then
  echo "missing ${BT_PANEL}"
  exit 1
fi
if [[ ! -f "${ISR_DOC}" ]]; then
  echo "missing ${ISR_DOC}"
  exit 1
fi
if [[ ! -f "${CHANGELOG}" ]]; then
  echo "missing ${CHANGELOG}"
  exit 1
fi
if [[ ! -f "${DOCS_CHANGELOG}" ]]; then
  echo "missing ${DOCS_CHANGELOG}"
  exit 1
fi

# Matcher itself must reject a snippet that only forwards Host (the pre-#469 official example).
OLD_CACHE_SNIPPET="$(cat <<'EOF'
  location / {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
EOF
)"
if has_cache_bypass "${OLD_CACHE_SNIPPET}"; then
  fail "matcher rejects pre-#469 snippet without cache bypass"
else
  pass "matcher rejects pre-#469 snippet without cache bypass"
fi

# Commented-out directives must not satisfy the guard (宝塔 fix is commenting proxy_cache).
COMMENTED_CACHE_SNIPPET="$(cat <<'EOF'
  location / {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    # proxy_no_cache 1;
    # proxy_cache_bypass 1;
  }
EOF
)"
if has_cache_bypass "${COMMENTED_CACHE_SNIPPET}"; then
  fail "matcher rejects commented-out proxy_no_cache / proxy_cache_bypass"
else
  pass "matcher rejects commented-out proxy_no_cache / proxy_cache_bypass"
fi

FIXED_CACHE_SNIPPET="$(cat <<'EOF'
  location / {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_set_header Host $host;
    proxy_no_cache 1;
    proxy_cache_bypass 1;
  }
EOF
)"
if has_cache_bypass "${FIXED_CACHE_SNIPPET}"; then
  pass "matcher accepts snippet with uncommented cache bypass"
else
  fail "matcher accepts snippet with uncommented cache bypass"
fi

# Only one of the two directives is not enough.
ONLY_NO_CACHE="$(cat <<'EOF'
  location / {
    proxy_pass http://127.0.0.1:<PORT>;
    proxy_no_cache 1;
  }
EOF
)"
if has_cache_bypass "${ONLY_NO_CACHE}"; then
  fail "matcher requires both proxy_no_cache and proxy_cache_bypass"
else
  pass "matcher requires both proxy_no_cache and proxy_cache_bypass"
fi

# Prose mentioning the directives must not satisfy the snippet guard.
PROSE_CACHE="$(mktemp)"
cat >"${PROSE_CACHE}" <<'EOF'
Set `proxy_no_cache 1;` and `proxy_cache_bypass 1;` so HTML is not cached.

```nginx
server {
  location / {
    proxy_pass http://127.0.0.1:80;
    proxy_set_header Host $host;
  }
}
```
EOF
PROSE_CACHE_HIT=0
while IFS= read -r -d $'\036' block; do
  block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
  [[ -z "${block}" ]] && continue
  has_proxy_pass "${block}" || continue
  if has_cache_bypass "${block}"; then
    PROSE_CACHE_HIT=1
  fi
done <<<"$(extract_nginx_blocks "${PROSE_CACHE}")"$'\036'
rm -f "${PROSE_CACHE}"
if [[ "${PROSE_CACHE_HIT}" -eq 0 ]]; then
  pass "snippet guard ignores cache bypass mentioned only in prose"
else
  fail "snippet guard ignores cache bypass mentioned only in prose"
fi

# Published Http + Https + FAQ examples in reverse-proxy.md (all proxy_pass blocks).
assert_nginx_blocks_bypass_cache "${REVERSE_PROXY}" "reverse-proxy.md" 2 1

# deploy FAQ copy-paste proxy_pass snippets must also bypass cache (Host-only one-liner excluded).
assert_nginx_blocks_bypass_cache "${DEPLOY_FAQ}" "faq/deploy.md" 1 1

# If cache-bypass lines are removed from the published examples, the guard must fail.
MUTATED_CACHE="$(mktemp)"
sed '/^[[:space:]]*proxy_no_cache[[:space:]]\{1,\}1;/d; /^[[:space:]]*proxy_cache_bypass[[:space:]]\{1,\}1;/d' \
  "${REVERSE_PROXY}" >"${MUTATED_CACHE}"
MUTATED_BYPASS_BLOCKS=0
while IFS= read -r -d $'\036' block; do
  block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
  [[ -z "${block}" ]] && continue
  has_proxy_pass "${block}" || continue
  if has_cache_bypass "${block}"; then
    MUTATED_BYPASS_BLOCKS=$((MUTATED_BYPASS_BLOCKS + 1))
  fi
done <<<"$(extract_nginx_blocks "${MUTATED_CACHE}")"$'\036'
rm -f "${MUTATED_CACHE}"
if [[ "${MUTATED_BYPASS_BLOCKS}" -eq 0 ]]; then
  pass "removing cache bypass from reverse-proxy.md snippets is detected"
else
  fail "removing cache bypass from reverse-proxy.md snippets is detected (still found ${MUTATED_BYPASS_BLOCKS})"
fi

# FAQ / reference prose for the operator-facing title and issue link.
for label_file in \
  "reverse-proxy.md:${REVERSE_PROXY}" \
  "faq/deploy.md:${DEPLOY_FAQ}" \
  "faq/usage.md:${USAGE_FAQ}"; do
  label="${label_file%%:*}"
  file="${label_file#*:}"
  if grep -Eq -- '后台发布后前台不刷新仍显示旧文章' "${file}" \
    && grep -Eq -- 'Mereithhh/vanblog/issues/469' "${file}"; then
    pass "${label}: FAQ title and #469"
  else
    fail "${label}: FAQ title and #469"
  fi
done

if grep -Eq -- '/www/server/nginx/conf/proxy\.conf' "${REVERSE_PROXY}" \
  && grep -Eq -- '/www/server/nginx/conf/proxy\.conf' "${DEPLOY_FAQ}" \
  && grep -Eq -- '/www/server/nginx/conf/proxy\.conf' "${USAGE_FAQ}" \
  && grep -Eq -- 'proxy_cache cache_one' "${REVERSE_PROXY}" \
  && grep -Eq -- 'proxy_cache cache_one' "${DEPLOY_FAQ}"; then
  pass "docs name 宝塔 proxy.conf and proxy_cache cache_one"
else
  fail "docs name 宝塔 proxy.conf and proxy_cache cache_one"
fi

if grep -Eq -- '默认不缓存' "${REVERSE_PROXY}" \
  && grep -Eq -- 'Caddy' "${REVERSE_PROXY}"; then
  pass "reverse-proxy.md notes Caddy reverse_proxy does not cache by default"
else
  fail "reverse-proxy.md notes Caddy reverse_proxy does not cache by default"
fi

if grep -Eq -- '前台 HTML' "${REVERSE_PROXY}" \
  && grep -Eq -- 'no-store' "${REVERSE_PROXY}" \
  && grep -Eq -- 'Cloudflare' "${REVERSE_PROXY}"; then
  pass "reverse-proxy.md notes public HTML can still be cached by proxy/CDN"
else
  fail "reverse-proxy.md notes public HTML can still be cached by proxy/CDN"
fi

if grep -Eq -- 'RubyXun' "${DEPLOY_FAQ}" \
  && grep -Eq -- 'lateautumn233' "${DEPLOY_FAQ}" \
  && grep -Eq -- 'Mereithhh/vanblog/issues/332' "${DEPLOY_FAQ}"; then
  pass "deploy FAQ credits community solution and links #332"
else
  fail "deploy FAQ credits community solution and links #332"
fi

# 宝塔 panel guide: real nginx snippet + proxy.conf, not just "shorten cache to 1 minute".
if grep -Eq -- 'proxy_no_cache[[:space:]]+1;' "${BT_PANEL}" \
  && grep -Eq -- 'proxy_cache_bypass[[:space:]]+1;' "${BT_PANEL}" \
  && grep -Eq -- 'proxy\.conf' "${BT_PANEL}" \
  && grep -Eq -- 'Mereithhh/vanblog/issues/469' "${BT_PANEL}"; then
  pass "bt-panel snippet documents cache bypass and #469"
else
  fail "bt-panel snippet documents cache bypass and #469"
fi

BT_PANEL_BYPASS=0
while IFS= read -r -d $'\036' block; do
  block="$(printf '%s' "${block}" | sed '/^[[:space:]]*$/d')"
  [[ -z "${block}" ]] && continue
  if has_host_header "${block}" && has_cache_bypass "${block}"; then
    BT_PANEL_BYPASS=$((BT_PANEL_BYPASS + 1))
  fi
done <<<"$(extract_nginx_blocks "${BT_PANEL}")"$'\036'
if [[ "${BT_PANEL_BYPASS}" -ge 1 ]]; then
  pass "bt-panel snippet has a fenced nginx block with Host and cache bypass"
else
  fail "bt-panel snippet has a fenced nginx block with Host and cache bypass"
fi

if grep -Eq -- '后台发布后前台不刷新仍显示旧文章' "${ISR_DOC}" \
  && grep -Eq -- 'Mereithhh/vanblog/issues/469' "${ISR_DOC}"; then
  pass "isr.md points stale public HTML to the #469 FAQ"
else
  fail "isr.md points stale public HTML to the #469 FAQ"
fi

if grep -Eq -- 'Mereithhh/vanblog/issues/469' "${CHANGELOG}" \
  && grep -Eq -- 'proxy_no_cache' "${CHANGELOG}"; then
  pass "CHANGELOG.md documents #469"
else
  fail "CHANGELOG.md documents #469"
fi

if grep -Eq -- 'Mereithhh/vanblog/issues/469' "${DOCS_CHANGELOG}" \
  && grep -Eq -- 'proxy_no_cache' "${DOCS_CHANGELOG}"; then
  pass "docs/changelog.md documents #469"
else
  fail "docs/changelog.md documents #469"
fi

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
