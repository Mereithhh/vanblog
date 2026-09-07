#!/usr/bin/env bash
# Unit tests for vanblog.sh reset_https(): mock docker/compose, no real daemon.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="${ROOT}/scripts/vanblog.sh"
PUBLIC_SCRIPT="${ROOT}/docs/.vuepress/public/vanblog.sh"

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

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"
  if [[ "${haystack}" == *"${needle}"* ]]; then
    pass "${label}"
  else
    fail "${label} (missing: ${needle})"
    echo "---- output ----"
    echo "${haystack}"
    echo "----------------"
  fi
}

assert_not_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"
  if [[ "${haystack}" == *"${needle}"* ]]; then
    fail "${label} (unexpected: ${needle})"
    echo "---- output ----"
    echo "${haystack}"
    echo "----------------"
  else
    pass "${label}"
  fi
}

assert_eq() {
  local got="$1"
  local want="$2"
  local label="$3"
  if [[ "${got}" == "${want}" ]]; then
    pass "${label}"
  else
    fail "${label} (got '${got}', want '${want}')"
  fi
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

write_compose() {
  local dest="$1"
  cat >"${dest}" <<EOF
version: '3'
services:
  vanblog:
    image: mereith/van-blog:latest
    restart: always
  mongo:
    image: mongo:4.4.16
EOF
}

write_redirect_configs() {
  local base="$1"
  mkdir -p "${base}/data/caddy/config"
  cat >"${base}/data/caddy/config/autosave.json" <<'EOF'
{
  "apps": {
    "http": {
      "servers": {
        "srv1": {
          "listen": [":80"],
          "listener_wrappers": [
            {
              "wrapper": "http_redirect"
            }
          ]
        }
      }
    }
  }
}
EOF
  cat >"${base}/data/caddy/Caddyfile" <<'EOF'
http:// {
  redir https://{host}{uri} permanent
  reverse_proxy 127.0.0.1:3000
}
https:// {
  reverse_proxy 127.0.0.1:3000
}
EOF
  cat >"${base}/data/https.json" <<'EOF'
{"redirect": true}
EOF
  echo "1" >"${base}/data/caddy/force-https"
}

install_mocks() {
  local bindir="$1"
  cat >"${bindir}/docker" <<'EOF'
#!/usr/bin/env bash
set -u
exit 0
EOF

  cat >"${bindir}/docker-compose" <<'EOF'
#!/usr/bin/env bash
set -u
STATE="${VANBLOG_TEST_STATE}"
LOG="${VANBLOG_TEST_LOG}"

get_var() {
  # shellcheck disable=SC1090
  . "${STATE}"
  eval "printf '%s' \"\${$1-}\""
}

set_var() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "${STATE}"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "${STATE}"
  else
    echo "${key}=${value}" >>"${STATE}"
  fi
}

echo "docker-compose $*" >>"${LOG}"

cmd="${1-}"
shift || true
case "${cmd}" in
exec)
  if [[ "$(get_var EXEC_FAIL)" == "1" ]]; then
    echo "exec_fail $*" >>"${LOG}"
    exit 1
  fi
  echo "exec $*" >>"${LOG}"
  if [[ "$*" == *deleteMany* || "$*" == *'type:"https"'* || "$*" == *resetHttps* ]]; then
    echo "mongo_https_cleared $*" >>"${LOG}"
    set_var MONGO_CLEARED 1
  fi
  if [[ "$*" == *listener_wrappers* ]]; then
    echo "caddy_api_cleared $*" >>"${LOG}"
    set_var CADDY_API_CLEARED 1
  fi
  ;;
restart)
  if [[ "$(get_var RESTART_FAIL)" == "1" ]]; then
    echo "restart_fail $*" >>"${LOG}"
    exit 1
  fi
  echo "restart $*" >>"${LOG}"
  set_var RESTARTED 1
  ;;
up)
  if [[ "$(get_var UP_FAIL)" == "1" ]]; then
    exit 1
  fi
  echo "up $*" >>"${LOG}"
  set_var UP_DONE 1
  ;;
*)
  exit 0
  ;;
esac
EOF
  chmod +x "${bindir}/docker" "${bindir}/docker-compose"
}

setup_case() {
  TEST_DIR="$(mktemp -d)"
  mkdir -p "${TEST_DIR}/bin" "${TEST_DIR}/vanblog"
  VANBLOG_TEST_STATE="${TEST_DIR}/state"
  VANBLOG_TEST_LOG="${TEST_DIR}/commands.log"
  : >"${VANBLOG_TEST_LOG}"
  cat >"${VANBLOG_TEST_STATE}" <<EOF
EXEC_FAIL=0
RESTART_FAIL=0
UP_FAIL=0
MONGO_CLEARED=0
CADDY_API_CLEARED=0
RESTARTED=0
UP_DONE=0
EOF
  write_compose "${TEST_DIR}/vanblog/docker-compose.yaml"
  write_redirect_configs "${TEST_DIR}/vanblog"
  install_mocks "${TEST_DIR}/bin"
  export VANBLOG_TEST_STATE VANBLOG_TEST_LOG
  export PATH="${TEST_DIR}/bin:${PATH}"
  VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
  VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
}

source_script() {
  export VANBLOG_SKIP_MAIN=1
  # shellcheck disable=SC1090
  source "${SCRIPT}"
}

run_reset() {
  RESET_OUT="$(reset_https 0 2>&1)"
  RESET_RC=$?
}

echo "== vanblog.sh reset_https tests =="

if [[ ! -f "${SCRIPT}" ]]; then
  echo "missing ${SCRIPT}"
  exit 1
fi

assert_eq "$(cmp -s "${SCRIPT}" "${PUBLIC_SCRIPT}" && echo same || echo diff)" "same" "scripts/vanblog.sh matches docs public copy"

# --- success: host Caddy/https flags cleared, mongo + Caddy API + restart ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
run_reset
assert_eq "${RESET_RC}" "0" "success path exits 0"
assert_contains "${RESET_OUT}" "已重置 https 设置" "success path prints success"
assert_contains "${RESET_OUT}" "HTTP 和 IP 访问应已恢复" "success path mentions HTTP/IP restore"
assert_not_contains "${RESET_OUT}" "重置失败" "success path does not print failure"
assert_file_not_contains "${TEST_DIR}/vanblog/data/caddy/config/autosave.json" "http_redirect" "autosave.json no longer has http_redirect"
assert_file_not_contains "${TEST_DIR}/vanblog/data/caddy/config/autosave.json" "listener_wrappers" "autosave.json no longer has listener_wrappers"
assert_file_not_contains "${TEST_DIR}/vanblog/data/caddy/Caddyfile" "redir https" "Caddyfile no longer redirects HTTP to HTTPS"
assert_file_contains "${TEST_DIR}/vanblog/data/https.json" '"redirect": false' "https.json redirect flag is false"
if [[ -e "${TEST_DIR}/vanblog/data/caddy/force-https" ]]; then
  fail "force-https flag file is removed"
else
  pass "force-https flag file is removed"
fi
assert_file_contains "${VANBLOG_TEST_LOG}" "mongo_https_cleared" "success path clears mongo https setting"
assert_file_contains "${VANBLOG_TEST_LOG}" "caddy_api_cleared" "success path calls Caddy API to drop redirect"
assert_file_contains "${VANBLOG_TEST_LOG}" "restart vanblog" "success path restarts vanblog"

# --- missing compose file ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
rm -f "${TEST_DIR}/vanblog/docker-compose.yaml"
run_reset
assert_eq "${RESET_RC}" "1" "missing compose exits 1"
assert_contains "${RESET_OUT}" "未找到" "missing compose prints error"
assert_not_contains "${RESET_OUT}" "已重置 https 设置" "missing compose does not print success"
assert_file_contains "${TEST_DIR}/vanblog/data/caddy/config/autosave.json" "http_redirect" "missing compose leaves redirect config"

# --- restart failure ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
sed -i 's/^RESTART_FAIL=.*/RESTART_FAIL=1/' "${VANBLOG_TEST_STATE}"
sed -i 's/^UP_FAIL=.*/UP_FAIL=1/' "${VANBLOG_TEST_STATE}"
run_reset
assert_eq "${RESET_RC}" "1" "restart failure exits 1"
assert_contains "${RESET_OUT}" "重置失败" "restart failure prints failure"
assert_contains "${RESET_OUT}" "容器重启失败" "restart failure mentions restart"
assert_not_contains "${RESET_OUT}" "已重置 https 设置，HTTP 和 IP 访问应已恢复" "restart failure does not print success"

# --- mongo + Caddy API both fail: do not claim success even if files were rewritten ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
sed -i 's/^EXEC_FAIL=.*/EXEC_FAIL=1/' "${VANBLOG_TEST_STATE}"
run_reset
assert_eq "${RESET_RC}" "1" "exec failure exits 1"
assert_contains "${RESET_OUT}" "重置失败" "exec failure prints failure"
assert_contains "${RESET_OUT}" "未能清除数据库 https 设置" "exec failure warns mongo setting remains"
assert_not_contains "${RESET_OUT}" "已重置 https 设置，HTTP 和 IP 访问应已恢复" "exec failure does not print success"
assert_file_not_contains "${TEST_DIR}/vanblog/data/caddy/config/autosave.json" "http_redirect" "exec failure still strips host Caddy redirect"

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
