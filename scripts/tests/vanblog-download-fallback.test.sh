#!/usr/bin/env bash
# Unit tests for vanblog.sh compose/script download fallbacks: mock wget/curl, no network.
set -u

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="${ROOT}/scripts/vanblog.sh"
PUBLIC_SCRIPT="${ROOT}/docs/.vuepress/public/vanblog.sh"
TEMPLATE_FIXTURE="${ROOT}/docker-compose/docker-compose-template.yml"

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

url_attempt_order() {
  awk '/^wget / { print $2 }' "${VANBLOG_TEST_LOG}"
}

install_mocks() {
  local bindir="$1"
  cat >"${bindir}/wget" <<'EOF'
#!/usr/bin/env bash
set -u
LOG="${VANBLOG_TEST_LOG}"
FAIL_FILE="${VANBLOG_TEST_FAIL_URLS}"
INVALID_FILE="${VANBLOG_TEST_INVALID_URLS}"
PAYLOAD="${VANBLOG_TEST_PAYLOAD}"

dest=""
url=""
while [[ $# -gt 0 ]]; do
  case "$1" in
  -O | -o)
    dest="${2-}"
    shift 2
    ;;
  -t | -T | --timeout | --tries)
    shift 2
    ;;
  --no-check-certificate | -q | -s | -S | -L | -f)
    shift
    ;;
  --connect-timeout | --retry | --max-time)
    shift 2
    ;;
  -*)
    shift
    ;;
  *)
    url="$1"
    shift
    ;;
  esac
done

echo "wget ${url} dest=${dest}" >>"${LOG}"

if [[ -z "${url}" || -z "${dest}" ]]; then
  exit 1
fi

fail_match=0
if [[ -f "${FAIL_FILE}" ]] && grep -Fxq -- "${url}" "${FAIL_FILE}"; then
  fail_match=1
fi
invalid_match=0
if [[ -f "${INVALID_FILE}" ]] && grep -Fxq -- "${url}" "${INVALID_FILE}"; then
  invalid_match=1
fi

if [[ "${fail_match}" == "1" ]]; then
  : >"${dest}"
  exit 1
fi

mkdir -p "$(dirname "${dest}")"
if [[ "${invalid_match}" == "1" ]]; then
  printf '<html><title>404 Not Found</title></html>\n' >"${dest}"
  exit 0
fi

if [[ ! -f "${PAYLOAD}" ]]; then
  echo "missing payload ${PAYLOAD}" >&2
  exit 1
fi
cat "${PAYLOAD}" >"${dest}"
exit 0
EOF

  cat >"${bindir}/curl" <<'EOF'
#!/usr/bin/env bash
set -u
LOG="${VANBLOG_TEST_LOG}"
FAIL_FILE="${VANBLOG_TEST_FAIL_URLS}"
INVALID_FILE="${VANBLOG_TEST_INVALID_URLS}"
PAYLOAD="${VANBLOG_TEST_PAYLOAD}"

dest=""
url=""
while [[ $# -gt 0 ]]; do
  case "$1" in
  -o | --output)
    dest="${2-}"
    shift 2
    ;;
  --connect-timeout | --retry | --max-time | -m)
    shift 2
    ;;
  -O)
    shift
    ;;
  -*)
    shift
    ;;
  *)
    url="$1"
    shift
    ;;
  esac
done

echo "curl ${url} dest=${dest}" >>"${LOG}"

if [[ -z "${url}" || -z "${dest}" ]]; then
  exit 1
fi

fail_match=0
if [[ -f "${FAIL_FILE}" ]] && grep -Fxq -- "${url}" "${FAIL_FILE}"; then
  fail_match=1
fi
invalid_match=0
if [[ -f "${INVALID_FILE}" ]] && grep -Fxq -- "${url}" "${INVALID_FILE}"; then
  invalid_match=1
fi

if [[ "${fail_match}" == "1" ]]; then
  : >"${dest}"
  exit 1
fi

mkdir -p "$(dirname "${dest}")"
if [[ "${invalid_match}" == "1" ]]; then
  printf '<html><title>404 Not Found</title></html>\n' >"${dest}"
  exit 0
fi

if [[ ! -f "${PAYLOAD}" ]]; then
  echo "missing payload ${PAYLOAD}" >&2
  exit 1
fi
cat "${PAYLOAD}" >"${dest}"
exit 0
EOF
  chmod +x "${bindir}/wget" "${bindir}/curl"
}

setup_case() {
  TEST_DIR="$(mktemp -d)"
  mkdir -p "${TEST_DIR}/bin" "${TEST_DIR}/vanblog"
  VANBLOG_TEST_LOG="${TEST_DIR}/commands.log"
  VANBLOG_TEST_FAIL_URLS="${TEST_DIR}/fail-urls"
  VANBLOG_TEST_INVALID_URLS="${TEST_DIR}/invalid-urls"
  VANBLOG_TEST_PAYLOAD="${TEST_DIR}/payload"
  : >"${VANBLOG_TEST_LOG}"
  : >"${VANBLOG_TEST_FAIL_URLS}"
  : >"${VANBLOG_TEST_INVALID_URLS}"
  cat "${TEMPLATE_FIXTURE}" >"${VANBLOG_TEST_PAYLOAD}"
  install_mocks "${TEST_DIR}/bin"
  export VANBLOG_TEST_LOG VANBLOG_TEST_FAIL_URLS VANBLOG_TEST_INVALID_URLS VANBLOG_TEST_PAYLOAD
  export PATH="${TEST_DIR}/bin:${PATH}"
  VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
}

source_script() {
  export VANBLOG_SKIP_MAIN=1
  # shellcheck disable=SC1090
  source "${SCRIPT}"
}

run_download_compose() {
  local dest="${1:-${VANBLOG_BASE_PATH}/docker-compose-template.yaml}"
  DOWNLOAD_OUT="$(download_compose_template "${dest}" 2>&1)"
  DOWNLOAD_RC=$?
}

run_download_script() {
  local dest="$1"
  DOWNLOAD_OUT="$(download_script "${dest}" 2>&1)"
  DOWNLOAD_RC=$?
}

echo "== vanblog.sh download fallback tests =="

if [[ ! -f "${SCRIPT}" ]]; then
  echo "missing ${SCRIPT}"
  exit 1
fi
if [[ ! -f "${TEMPLATE_FIXTURE}" ]]; then
  echo "missing ${TEMPLATE_FIXTURE}"
  exit 1
fi

assert_eq "$(cmp -s "${SCRIPT}" "${PUBLIC_SCRIPT}" && echo same || echo diff)" "same" "scripts/vanblog.sh matches docs public copy"

# --- fallback order: docs host → GitHub raw (docker-compose/) → jsDelivr ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
mapfile -t COMPOSE_URL_LIST < <(compose_template_urls)
mapfile -t SCRIPT_URL_LIST < <(script_urls)
assert_eq "${#COMPOSE_URL_LIST[@]}" "3" "compose fallback list has 3 URLs"
assert_eq "${COMPOSE_URL_LIST[0]}" "https://vanblog.mereith.com/docker-compose-template.yml" "compose primary is docs host"
assert_eq "${COMPOSE_URL_LIST[1]}" "https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml" "compose second is GitHub raw docker-compose path"
assert_eq "${COMPOSE_URL_LIST[2]}" "https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/docker-compose/docker-compose-template.yml" "compose third is jsDelivr"
assert_eq "${#SCRIPT_URL_LIST[@]}" "3" "script fallback list has 3 URLs"
assert_eq "${SCRIPT_URL_LIST[0]}" "https://vanblog.mereith.com/vanblog.sh" "script primary is docs host"
assert_eq "${SCRIPT_URL_LIST[1]}" "https://raw.githubusercontent.com/Mereithhh/vanblog/master/scripts/vanblog.sh" "script second is GitHub raw scripts path"
assert_eq "${SCRIPT_URL_LIST[2]}" "https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/scripts/vanblog.sh" "script third is jsDelivr"

# --- primary success: only first URL, valid compose, prints which URL worked ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
run_download_compose
assert_eq "${DOWNLOAD_RC}" "0" "primary success exits 0"
assert_contains "${DOWNLOAD_OUT}" "下载成功: https://vanblog.mereith.com/docker-compose-template.yml" "primary success prints working URL"
assert_not_contains "${DOWNLOAD_OUT}" "raw.githubusercontent.com" "primary success does not try GitHub"
assert_not_contains "${DOWNLOAD_OUT}" "jsdelivr" "primary success does not try jsDelivr"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "services:" "primary success writes compose services"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "vanblog:" "primary success writes vanblog service"
assert_file_contains "${VANBLOG_TEST_LOG}" "wget https://vanblog.mereith.com/docker-compose-template.yml" "primary success uses wget"
if grep -q 'raw.githubusercontent.com' "${VANBLOG_TEST_LOG}"; then
  fail "primary success does not request fallback URLs"
else
  pass "primary success does not request fallback URLs"
fi

# --- failed primary + successful secondary writes a valid compose file ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
printf '%s\n' "https://vanblog.mereith.com/docker-compose-template.yml" >"${VANBLOG_TEST_FAIL_URLS}"
run_download_compose
assert_eq "${DOWNLOAD_RC}" "0" "secondary success exits 0"
assert_contains "${DOWNLOAD_OUT}" "该地址不可用: https://vanblog.mereith.com/docker-compose-template.yml" "secondary path reports primary failure"
assert_contains "${DOWNLOAD_OUT}" "下载成功: https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml" "secondary success prints GitHub URL"
assert_not_contains "${DOWNLOAD_OUT}" "jsdelivr" "secondary success does not try jsDelivr"
assert_not_contains "${DOWNLOAD_OUT}" "下载失败，已尝试全部地址" "secondary success is not an all-fail"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "services:" "secondary success writes services"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "vanblog_email" "secondary success writes template placeholders"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "mongo:" "secondary success writes mongo service"
if [[ "$(url_attempt_order | tr '\n' ' ')" == "https://vanblog.mereith.com/docker-compose-template.yml https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml " ]]; then
  pass "wget order is docs host then GitHub raw"
else
  fail "wget order is docs host then GitHub raw (got: $(url_attempt_order | tr '\n' '|'))"
fi
if grep -q 'jsdelivr' "${VANBLOG_TEST_LOG}"; then
  fail "stopped after first successful fallback"
else
  pass "stopped after first successful fallback"
fi

# --- HTML/invalid primary is rejected and GitHub fallback is used ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
printf '%s\n' "https://vanblog.mereith.com/docker-compose-template.yml" >"${VANBLOG_TEST_INVALID_URLS}"
run_download_compose
assert_eq "${DOWNLOAD_RC}" "0" "invalid primary then GitHub exits 0"
assert_contains "${DOWNLOAD_OUT}" "该地址不可用: https://vanblog.mereith.com/docker-compose-template.yml" "HTML primary is treated as unavailable"
assert_contains "${DOWNLOAD_OUT}" "下载成功: https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml" "HTML primary falls through to GitHub"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "services:" "HTML primary still yields valid compose"
assert_file_not_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "<html>" "HTML error page is not kept"

# --- first two fail, jsDelivr succeeds ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
cat >"${VANBLOG_TEST_FAIL_URLS}" <<EOF
https://vanblog.mereith.com/docker-compose-template.yml
https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml
EOF
run_download_compose
assert_eq "${DOWNLOAD_RC}" "0" "jsDelivr fallback exits 0"
assert_contains "${DOWNLOAD_OUT}" "下载成功: https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/docker-compose/docker-compose-template.yml" "jsDelivr success prints CDN URL"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose-template.yaml" "vanblog:" "jsDelivr success writes compose"
if [[ "$(url_attempt_order | wc -l | tr -d ' ')" == "3" ]]; then
  pass "all three compose URLs attempted before jsDelivr success"
else
  fail "all three compose URLs attempted before jsDelivr success (got $(url_attempt_order | wc -l))"
fi

# --- all compose URLs fail: non-zero and clear error, no leftover compose ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
cat >"${VANBLOG_TEST_FAIL_URLS}" <<EOF
https://vanblog.mereith.com/docker-compose-template.yml
https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml
https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/docker-compose/docker-compose-template.yml
EOF
run_download_compose "${TEST_DIR}/vanblog/docker-compose-template.yaml"
assert_eq "${DOWNLOAD_RC}" "1" "all-fail exits 1"
assert_contains "${DOWNLOAD_OUT}" "下载失败，已尝试全部地址" "all-fail prints clear error"
assert_contains "${DOWNLOAD_OUT}" "该地址不可用: https://vanblog.mereith.com/docker-compose-template.yml" "all-fail mentions docs host"
assert_contains "${DOWNLOAD_OUT}" "该地址不可用: https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml" "all-fail mentions GitHub"
assert_contains "${DOWNLOAD_OUT}" "该地址不可用: https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/docker-compose/docker-compose-template.yml" "all-fail mentions jsDelivr"
assert_not_contains "${DOWNLOAD_OUT}" "下载成功:" "all-fail does not print success"
if [[ -e "${TEST_DIR}/vanblog/docker-compose-template.yaml" ]]; then
  fail "all-fail does not leave a compose template"
else
  pass "all-fail does not leave a compose template"
fi
if [[ "$(url_attempt_order | wc -l | tr -d ' ')" == "3" ]]; then
  pass "all-fail tries every compose URL"
else
  fail "all-fail tries every compose URL (got $(url_attempt_order | wc -l))"
fi

# --- config() download failure returns non-zero and does not prompt ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
cat >"${VANBLOG_TEST_FAIL_URLS}" <<EOF
https://vanblog.mereith.com/docker-compose-template.yml
https://raw.githubusercontent.com/Mereithhh/vanblog/master/docker-compose/docker-compose-template.yml
https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/docker-compose/docker-compose-template.yml
EOF
CONFIG_OUT="$(config 0 2>&1)" || CONFIG_RC=$?
CONFIG_RC="${CONFIG_RC:-0}"
assert_eq "${CONFIG_RC}" "1" "config all-fail exits 1"
assert_contains "${CONFIG_OUT}" "下载编排文件失败" "config all-fail prints compose download error"
assert_not_contains "${CONFIG_OUT}" "请输入您的邮箱" "config all-fail does not continue to prompts"

# --- script self-update: failed primary + successful GitHub ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
printf '%s\n' "https://vanblog.mereith.com/vanblog.sh" >"${VANBLOG_TEST_FAIL_URLS}"
cat "${SCRIPT}" >"${VANBLOG_TEST_PAYLOAD}"
run_download_script "${TEST_DIR}/vanblog.sh"
assert_eq "${DOWNLOAD_RC}" "0" "script GitHub fallback exits 0"
assert_contains "${DOWNLOAD_OUT}" "下载成功: https://raw.githubusercontent.com/Mereithhh/vanblog/master/scripts/vanblog.sh" "script fallback prints GitHub URL"
assert_file_contains "${TEST_DIR}/vanblog.sh" "VANBLOG_SCRIPT_VERSION" "script fallback writes a vanblog script"
assert_file_contains "${TEST_DIR}/vanblog.sh" "download_compose_template" "script fallback writes current helper"

# --- script self-update all-fail ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
cat >"${VANBLOG_TEST_FAIL_URLS}" <<EOF
https://vanblog.mereith.com/vanblog.sh
https://raw.githubusercontent.com/Mereithhh/vanblog/master/scripts/vanblog.sh
https://cdn.jsdelivr.net/gh/Mereithhh/vanblog@master/scripts/vanblog.sh
EOF
cat "${SCRIPT}" >"${VANBLOG_TEST_PAYLOAD}"
run_download_script "${TEST_DIR}/vanblog.sh"
assert_eq "${DOWNLOAD_RC}" "1" "script all-fail exits 1"
assert_contains "${DOWNLOAD_OUT}" "下载失败，已尝试全部地址" "script all-fail prints clear error"
if [[ -e "${TEST_DIR}/vanblog.sh" ]]; then
  fail "script all-fail does not leave a partial script"
else
  pass "script all-fail does not leave a partial script"
fi

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
