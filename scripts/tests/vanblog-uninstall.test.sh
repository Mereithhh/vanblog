#!/usr/bin/env bash
# Unit tests for vanblog.sh uninstall_vanblog(): mock docker/compose, no real daemon.
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

install_mocks() {
  local bindir="$1"
  cat >"${bindir}/docker" <<'EOF'
#!/usr/bin/env bash
set -u
LOG="${VANBLOG_TEST_LOG}"
echo "docker $*" >>"${LOG}"
exit 0
EOF

  cat >"${bindir}/docker-compose" <<'EOF'
#!/usr/bin/env bash
set -u
LOG="${VANBLOG_TEST_LOG}"
echo "docker-compose $*" >>"${LOG}"
cmd="${1-}"
if [[ "${cmd}" == "down" ]]; then
  echo "compose_down $*" >>"${LOG}"
fi
exit 0
EOF
  chmod +x "${bindir}/docker" "${bindir}/docker-compose"
}

setup_case() {
  TEST_DIR="$(mktemp -d)"
  mkdir -p "${TEST_DIR}/bin" "${TEST_DIR}/vanblog/data/caddy" "${TEST_DIR}/user-backup"
  VANBLOG_TEST_LOG="${TEST_DIR}/commands.log"
  : >"${VANBLOG_TEST_LOG}"
  write_compose "${TEST_DIR}/vanblog/docker-compose.yaml"
  echo "site-data" >"${TEST_DIR}/vanblog/data/site.txt"
  echo "keep-tarball" >"${TEST_DIR}/vanblog/vanblog-backup-20240228120000.tar.gz"
  mkdir -p "${TEST_DIR}/vanblog/vanblog-backup-marked"
  echo "keep-dir" >"${TEST_DIR}/vanblog/vanblog-backup-marked/keep-me.txt"
  echo "sibling-keep" >"${TEST_DIR}/user-backup/keep.txt"
  install_mocks "${TEST_DIR}/bin"
  export VANBLOG_TEST_LOG
  export PATH="${TEST_DIR}/bin:${PATH}"
  VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
  VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
}

source_script() {
  export VANBLOG_SKIP_MAIN=1
  # shellcheck disable=SC1090
  source "${SCRIPT}"
}

run_uninstall() {
  local answer="${1-y}"
  UNINSTALL_OUT="$(printf '%s\n' "${answer}" | uninstall_vanblog 0 2>&1)"
  UNINSTALL_RC=$?
}

echo "== vanblog.sh uninstall tests =="

if [[ ! -f "${SCRIPT}" ]]; then
  echo "missing ${SCRIPT}"
  exit 1
fi

assert_eq "$(cmp -s "${SCRIPT}" "${PUBLIC_SCRIPT}" && echo same || echo diff)" "same" "scripts/vanblog.sh matches docs public copy"

# --- abort: empty / N does not delete install data or backups ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
run_uninstall ""
assert_eq "${UNINSTALL_RC}" "0" "abort (empty) exits 0"
assert_contains "${UNINSTALL_OUT}" "退出卸载" "abort (empty) prints abort"
assert_not_contains "${UNINSTALL_OUT}" "继续卸载" "abort (empty) does not continue"
if [[ -f "${TEST_DIR}/vanblog/data/site.txt" ]]; then
  pass "abort leaves install data"
else
  fail "abort leaves install data"
fi
if [[ -f "${TEST_DIR}/vanblog/docker-compose.yaml" ]]; then
  pass "abort leaves compose file"
else
  fail "abort leaves compose file"
fi
if [[ -f "${TEST_DIR}/vanblog/vanblog-backup-20240228120000.tar.gz" ]]; then
  pass "abort leaves backup tarball"
else
  fail "abort leaves backup tarball"
fi

setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
run_uninstall "n"
assert_eq "${UNINSTALL_RC}" "0" "abort (n) exits 0"
assert_contains "${UNINSTALL_OUT}" "退出卸载" "abort (n) prints abort"
if [[ -d "${TEST_DIR}/vanblog/data" ]]; then
  pass "abort (n) leaves data directory"
else
  fail "abort (n) leaves data directory"
fi

# --- confirm: remove install data, keep marked backup dir + script tarball + sibling ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
run_uninstall "y"
assert_eq "${UNINSTALL_RC}" "0" "confirm uninstall exits 0"
assert_contains "${UNINSTALL_OUT}" "继续卸载" "confirm path continues"
assert_contains "${UNINSTALL_OUT}" "将删除安装数据与编排文件" "warns before deleting install data"
assert_contains "${UNINSTALL_OUT}" "不会删除脚本备份 vanblog-backup-*" "warns that script backups are kept"
assert_contains "${UNINSTALL_OUT}" "也不会删除安装目录以外的备份" "warns that outside backups are kept"
assert_contains "${UNINSTALL_OUT}" "vanblog-backup-marked" "lists marked backup directory before delete"
assert_contains "${UNINSTALL_OUT}" "vanblog-backup-20240228120000.tar.gz" "lists backup tarball before delete"
assert_contains "${UNINSTALL_OUT}" "已保留备份" "prints kept backups after uninstall"
assert_file_contains "${VANBLOG_TEST_LOG}" "compose_down" "confirm path stops compose stack"
assert_file_contains "${VANBLOG_TEST_LOG}" "docker rmi -f mereith/van-blog:latest" "confirm path removes image"

if [[ -e "${TEST_DIR}/vanblog/data" || -e "${TEST_DIR}/vanblog/data/site.txt" ]]; then
  fail "uninstall removes install data directory"
else
  pass "uninstall removes install data directory"
fi
if [[ -e "${TEST_DIR}/vanblog/docker-compose.yaml" ]]; then
  fail "uninstall removes compose file"
else
  pass "uninstall removes compose file"
fi
if [[ -f "${TEST_DIR}/vanblog/vanblog-backup-20240228120000.tar.gz" ]] &&
  [[ "$(cat "${TEST_DIR}/vanblog/vanblog-backup-20240228120000.tar.gz")" == "keep-tarball" ]]; then
  pass "uninstall keeps script backup tarball"
else
  fail "uninstall keeps script backup tarball"
fi
if [[ -f "${TEST_DIR}/vanblog/vanblog-backup-marked/keep-me.txt" ]] &&
  [[ "$(cat "${TEST_DIR}/vanblog/vanblog-backup-marked/keep-me.txt")" == "keep-dir" ]]; then
  pass "uninstall keeps marked backup directory"
else
  fail "uninstall keeps marked backup directory"
fi
if [[ -d "${TEST_DIR}/vanblog" ]]; then
  pass "uninstall keeps install root when backups remain"
else
  fail "uninstall keeps install root when backups remain"
fi
if [[ -f "${TEST_DIR}/user-backup/keep.txt" ]] &&
  [[ "$(cat "${TEST_DIR}/user-backup/keep.txt")" == "sibling-keep" ]]; then
  pass "uninstall never deletes sibling backup folder"
else
  fail "uninstall never deletes sibling backup folder"
fi

# --- no backups: install root is removed after data/compose cleanup ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog/data"
rm -f "${TEST_DIR}/vanblog/vanblog-backup-20240228120000.tar.gz"
rm -rf "${TEST_DIR}/vanblog/vanblog-backup-marked"
run_uninstall "y"
assert_eq "${UNINSTALL_RC}" "0" "no-backup uninstall exits 0"
if [[ -e "${TEST_DIR}/vanblog" ]]; then
  fail "uninstall removes empty install root when no backups remain"
else
  pass "uninstall removes empty install root when no backups remain"
fi
if [[ -f "${TEST_DIR}/user-backup/keep.txt" ]]; then
  pass "no-backup uninstall still leaves sibling backup folder"
else
  fail "no-backup uninstall still leaves sibling backup folder"
fi
assert_contains "${UNINSTALL_OUT}" "安装目录已删除" "no-backup path reports directory removed"

# --- refuse to rm the install root as if it were data ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
VANBLOG_DATA_PATH="${TEST_DIR}/vanblog"
REMOVE_OUT="$(remove_vanblog_install_files 2>&1)" || true
assert_contains "${REMOVE_OUT}" "拒绝删除" "refuses to treat install root as data path"
if [[ -f "${TEST_DIR}/vanblog/vanblog-backup-marked/keep-me.txt" ]]; then
  pass "invalid data path does not wipe backup directory"
else
  fail "invalid data path does not wipe backup directory"
fi

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
