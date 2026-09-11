#!/usr/bin/env bash
# Unit tests for vanblog.sh update(): mock docker/compose, no real daemon.
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
  local image="$2"
  cat >"${dest}" <<EOF
version: '3'
services:
  vanblog:
    image: ${image}
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
STATE="${VANBLOG_TEST_STATE}"
LOG="${VANBLOG_TEST_LOG}"
. "${STATE}"

log_cmd() {
  echo "running=${RUNNING:-0} docker $*" >>"${LOG}"
}

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

cmd="${1-}"
shift || true
log_cmd "${cmd}" "$@"

case "${cmd}" in
inspect)
  format=""
  cid=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
    -f | --format)
      format="${2-}"
      shift 2
      ;;
    *)
      cid="$1"
      shift
      ;;
    esac
  done
  current_cid="$(get_var CONTAINER_ID)"
  if [[ -z "${cid}" || "${cid}" != "${current_cid}" ]]; then
    echo "Error: No such container: ${cid}" >&2
    exit 1
  fi
  case "${format}" in
  *".Image"*)
    get_var IMAGE_ID
    echo
    ;;
  *".State.Running"*)
    if [[ "$(get_var RUNNING)" == "1" ]]; then
      echo true
    else
      echo false
    fi
    ;;
  *".Config.Env"*)
    echo "VAN_BLOG_VERSION=$(get_var VERSION)"
    echo "TZ=Asia/Shanghai"
    ;;
  *)
    echo "unsupported inspect format" >&2
    exit 1
    ;;
  esac
  ;;
ps)
  ancestor=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
    --filter)
      if [[ "${2-}" == ancestor=* ]]; then
        ancestor="${2#ancestor=}"
      fi
      shift 2
      ;;
    *)
      shift
      ;;
    esac
  done
  if [[ -n "${ancestor}" && "${ancestor}" == "$(get_var IMAGE_ID)" && -n "$(get_var CONTAINER_ID)" ]]; then
    get_var CONTAINER_ID
    echo
  fi
  if [[ -n "${ancestor}" && "${ancestor}" == "$(get_var EXTRA_IN_USE_IMAGE)" && -n "$(get_var EXTRA_IN_USE_IMAGE)" ]]; then
    echo "extra-container"
  fi
  ;;
rmi)
  target="${1-}"
  if [[ "$(get_var RUNNING)" == "1" && "$(get_var IMAGE_ID)" == "${target}" ]]; then
    echo "rmi_while_running docker rmi ${target}" >>"${LOG}"
    echo "Error response from daemon: conflict: unable to delete (cannot be forced) - image is being used by running container" >&2
    exit 1
  fi
  if [[ -n "$(get_var EXTRA_IN_USE_IMAGE)" && "$(get_var EXTRA_IN_USE_IMAGE)" == "${target}" ]]; then
    echo "rmi_while_running docker rmi ${target}" >>"${LOG}"
    echo "Error response from daemon: conflict: unable to delete (cannot be forced) - image is being used by running container" >&2
    exit 1
  fi
  echo "rmi ${target}" >>"${LOG}"
  ;;
*)
  exit 0
  ;;
esac
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

echo "running=$(get_var RUNNING) docker-compose $*" >>"${LOG}"

cmd="${1-}"
shift || true
case "${cmd}" in
ps)
  if [[ "$(get_var CONTAINER_ID)" != "" ]]; then
    echo "$(get_var CONTAINER_ID)"
  fi
  ;;
down)
  if [[ "$(get_var DOWN_FAIL)" == "1" ]]; then
    exit 1
  fi
  set_var RUNNING 0
  set_var CONTAINER_ID ""
  ;;
pull)
  if [[ "$(get_var PULL_FAIL)" == "1" ]]; then
    exit 1
  fi
  echo "pulled $*" >>"${LOG}"
  set_var PULLED 1
  set_var IMAGE_ID "$(get_var NEXT_IMAGE_ID)"
  set_var VERSION "$(get_var NEXT_VERSION)"
  ;;
up)
  if [[ "$(get_var UP_FAIL)" == "1" ]]; then
    exit 1
  fi
  echo "up $*" >>"${LOG}"
  set_var CONTAINER_ID "vanblog-ctr"
  set_var RUNNING 1
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
RUNNING=1
CONTAINER_ID=vanblog-ctr
IMAGE_ID=sha-old
VERSION=0.53.0
NEXT_IMAGE_ID=sha-new
NEXT_VERSION=0.54.0
PULLED=0
UP_DONE=0
PULL_FAIL=0
UP_FAIL=0
DOWN_FAIL=0
EXTRA_IN_USE_IMAGE=
EOF
  write_compose "${TEST_DIR}/vanblog/docker-compose.yaml" "mereith/van-blog:latest"
  install_mocks "${TEST_DIR}/bin"
  export VANBLOG_TEST_STATE VANBLOG_TEST_LOG
  export PATH="${TEST_DIR}/bin:${PATH}"
  VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
}

source_script() {
  export VANBLOG_SKIP_MAIN=1
  # shellcheck disable=SC1090
  source "${SCRIPT}"
}

run_update() {
  # Existing compose-path cases skip installer self-update (menu 6 still uses this flag after one exec).
  UPDATE_OUT="$(VANBLOG_SKIP_SCRIPT_UPDATE=1 update 0 2>&1)"
  UPDATE_RC=$?
}

install_script_download_mocks() {
  local bindir="$1"
  cat >"${bindir}/wget" <<'EOF'
#!/usr/bin/env bash
set -u
LOG="${VANBLOG_TEST_LOG}"
PAYLOAD="${VANBLOG_TEST_SCRIPT_PAYLOAD}"
COUNTER="${VANBLOG_TEST_DOWNLOAD_COUNT}"
FAIL_ALL="${VANBLOG_TEST_DOWNLOAD_FAIL:-0}"
BUMP="${VANBLOG_TEST_SCRIPT_BUMP:-0}"

dest=""
url=""
while [[ $# -gt 0 ]]; do
  case "$1" in
  -O | -o)
    dest="${2-}"
    shift 2
    ;;
  -t | -T | --timeout | --tries | --connect-timeout | --retry | --max-time)
    shift 2
    ;;
  --no-check-certificate | -q | -s | -S | -L | -f)
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

echo "wget ${url} dest=${dest}" >>"${LOG}"

count=0
if [[ -f "${COUNTER}" ]]; then
  count="$(cat "${COUNTER}")"
fi
count=$((count + 1))
echo "${count}" >"${COUNTER}"

if [[ "${FAIL_ALL}" == "1" ]]; then
  : >"${dest}"
  exit 1
fi

if [[ "${count}" -ge 3 ]]; then
  echo "INFINITE_SCRIPT_UPDATE_LOOP" >>"${LOG}"
  : >"${dest}"
  exit 1
fi

if [[ -z "${url}" || -z "${dest}" || ! -f "${PAYLOAD}" ]]; then
  exit 1
fi

mkdir -p "$(dirname "${dest}")"
if [[ "${BUMP}" == "1" ]]; then
  sed "s/^VANBLOG_SCRIPT_VERSION=.*/VANBLOG_SCRIPT_VERSION=\"v99.0.${count}\"/" "${PAYLOAD}" >"${dest}"
  echo "# download-count=${count}" >>"${dest}"
else
  cat "${PAYLOAD}" >"${dest}"
fi
exit 0
EOF

  cat >"${bindir}/curl" <<'EOF'
#!/usr/bin/env bash
set -u
echo "curl-should-not-run $*" >>"${VANBLOG_TEST_LOG}"
exit 1
EOF
  chmod +x "${bindir}/wget" "${bindir}/curl"
}

setup_self_update_case() {
  setup_case
  VANBLOG_TEST_DOWNLOAD_COUNT="${TEST_DIR}/download.count"
  VANBLOG_TEST_SCRIPT_PAYLOAD="${TEST_DIR}/script-payload.sh"
  VANBLOG_SCRIPT_PATH="${TEST_DIR}/vanblog.sh"
  : >"${VANBLOG_TEST_DOWNLOAD_COUNT}"
  echo 0 >"${VANBLOG_TEST_DOWNLOAD_COUNT}"
  cp "${SCRIPT}" "${VANBLOG_SCRIPT_PATH}"
  cp "${SCRIPT}" "${VANBLOG_TEST_SCRIPT_PAYLOAD}"
  install_script_download_mocks "${TEST_DIR}/bin"
  export VANBLOG_TEST_DOWNLOAD_COUNT VANBLOG_TEST_SCRIPT_PAYLOAD VANBLOG_SCRIPT_PATH
  export VANBLOG_TEST_DOWNLOAD_FAIL=0
  export VANBLOG_TEST_SCRIPT_BUMP=0
}

run_update_with_self_update() {
  UPDATE_OUT="$(update 0 2>&1)"
  UPDATE_RC=$?
}

download_count() {
  if [[ -f "${VANBLOG_TEST_DOWNLOAD_COUNT}" ]]; then
    cat "${VANBLOG_TEST_DOWNLOAD_COUNT}"
  else
    echo 0
  fi
}

echo "== vanblog.sh update tests =="

if [[ ! -f "${SCRIPT}" ]]; then
  echo "missing ${SCRIPT}"
  exit 1
fi

assert_eq "$(cmp -s "${SCRIPT}" "${PUBLIC_SCRIPT}" && echo same || echo diff)" "same" "scripts/vanblog.sh matches docs public copy"

# --- success: stop → pull → up, then unused rmi, print success ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
run_update
assert_eq "${UPDATE_RC}" "0" "success path exits 0"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "success path prints success"
assert_contains "${UPDATE_OUT}" "0.53.0 -> 0.54.0" "success path reports version move"
assert_file_contains "${VANBLOG_TEST_LOG}" "docker-compose down" "success path stops containers"
assert_file_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "success path pulls vanblog"
assert_file_contains "${VANBLOG_TEST_LOG}" "up -d" "success path brings stack up"
assert_file_contains "${VANBLOG_TEST_LOG}" "rmi sha-old" "success path deletes unused old image"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "rmi_while_running" "success path never rmi while running"

# command order: down before pull before up; rmi only after down
order_ok=1
down_n="$(grep -n 'docker-compose down' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
pull_n="$(grep -n 'pulled vanblog' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
up_n="$(grep -n 'up -d' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
rmi_n="$(grep -n 'rmi sha-old' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
if [[ -z "${down_n}" || -z "${pull_n}" || -z "${up_n}" || -z "${rmi_n}" ]]; then
  order_ok=0
elif [[ "${down_n}" -ge "${pull_n}" || "${pull_n}" -ge "${up_n}" || "${rmi_n}" -le "${down_n}" ]]; then
  order_ok=0
fi
assert_eq "${order_ok}" "1" "order is down → pull → up, rmi after down"

if grep -q 'rmi_while_running' "${VANBLOG_TEST_LOG}"; then
  fail "no docker rmi while container still running"
else
  pass "no docker rmi while container still running"
fi
if grep -q 'running=1 docker rmi sha-new' "${VANBLOG_TEST_LOG}"; then
  fail "does not rmi the image the new container is using"
else
  pass "does not rmi the image the new container is using"
fi

# --- pull failure: no false success ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
sed -i 's/^PULL_FAIL=.*/PULL_FAIL=1/' "${VANBLOG_TEST_STATE}"
run_update
assert_eq "${UPDATE_RC}" "1" "pull failure exits 1"
assert_not_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "pull failure does not print success"
assert_contains "${UPDATE_OUT}" "拉取镜像失败" "pull failure prints error"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "rmi_while_running" "pull failure never rmi while running"

# --- up failure: no false success ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
sed -i 's/^UP_FAIL=.*/UP_FAIL=1/' "${VANBLOG_TEST_STATE}"
run_update
assert_eq "${UPDATE_RC}" "1" "up failure exits 1"
assert_not_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "up failure does not print success"
assert_contains "${UPDATE_OUT}" "启动失败" "up failure prints error"

# --- same image after pull: no false success ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
sed -i 's/^NEXT_IMAGE_ID=.*/NEXT_IMAGE_ID=sha-old/' "${VANBLOG_TEST_STATE}"
sed -i 's/^NEXT_VERSION=.*/NEXT_VERSION=0.53.0/' "${VANBLOG_TEST_STATE}"
run_update
assert_eq "${UPDATE_RC}" "1" "unchanged image exits 1"
assert_not_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "unchanged image does not print success"
assert_contains "${UPDATE_OUT}" "仍使用旧镜像" "unchanged image prints error"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "rmi sha-old" "unchanged image does not delete in-use/current image"

# --- down failure ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
sed -i 's/^DOWN_FAIL=.*/DOWN_FAIL=1/' "${VANBLOG_TEST_STATE}"
run_update
assert_eq "${UPDATE_RC}" "1" "down failure exits 1"
assert_not_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "down failure does not print success"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "down failure does not pull"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "rmi_while_running" "down failure never rmi while running"

# --- China mirror compose is aligned to Docker Hub latest ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
write_compose "${TEST_DIR}/vanblog/docker-compose.yaml" "registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest"
run_update
assert_eq "${UPDATE_RC}" "0" "China-mirror path exits 0 after align+update"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "China-mirror path prints success only after move"
assert_contains "${UPDATE_OUT}" "中国镜像 latest 可能未同步" "China-mirror path rewrites stale latest"
assert_file_contains "${TEST_DIR}/vanblog/docker-compose.yaml" "mereith/van-blog:latest" "China compose now uses Docker Hub latest"
if grep -q 'registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest' "${TEST_DIR}/vanblog/docker-compose.yaml"; then
  fail "China compose no longer pins Aliyun latest"
else
  pass "China compose no longer pins Aliyun latest"
fi
assert_file_contains "${VANBLOG_TEST_LOG}" "docker-compose down" "China path stops first"
assert_file_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "China path pulls vanblog"
assert_file_contains "${VANBLOG_TEST_LOG}" "up -d" "China path ups after pull"
if grep -q 'rmi_while_running' "${VANBLOG_TEST_LOG}"; then
  fail "China path does not rmi while running"
else
  pass "China path does not rmi while running"
fi

# --- skip rmi when another container still uses the old image ---
setup_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
sed -i 's/^EXTRA_IN_USE_IMAGE=.*/EXTRA_IN_USE_IMAGE=sha-old/' "${VANBLOG_TEST_STATE}"
run_update
assert_eq "${UPDATE_RC}" "0" "in-use old image still allows successful update"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "in-use old image still prints success after move"
assert_contains "${UPDATE_OUT}" "旧镜像仍被容器使用，跳过删除" "skips rmi when old image still used"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "rmi sha-old" "does not rmi image still in use"

# --- skip flag: no script download, service update still succeeds ---
setup_self_update_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
export VANBLOG_SKIP_SCRIPT_UPDATE=1
run_update_with_self_update
unset VANBLOG_SKIP_SCRIPT_UPDATE
assert_eq "${UPDATE_RC}" "0" "skip-flag path exits 0"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "skip-flag path prints success"
assert_not_contains "${UPDATE_OUT}" "先更新管理脚本" "skip-flag path does not self-update"
assert_eq "$(download_count)" "0" "skip-flag path does not download installer"
assert_file_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "skip-flag path still pulls vanblog"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "wget " "skip-flag path never calls wget"

# --- same version: self-update runs before compose pull, no re-exec ---
setup_self_update_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
unset VANBLOG_SKIP_SCRIPT_UPDATE || true
run_update_with_self_update
assert_eq "${UPDATE_RC}" "0" "same-version self-update then service update exits 0"
assert_contains "${UPDATE_OUT}" "先更新管理脚本" "same-version path tries self-update first"
assert_contains "${UPDATE_OUT}" "脚本已是最新" "same-version path skips replace"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "same-version path still updates service"
assert_eq "$(download_count)" "1" "same-version path downloads installer once"
assert_file_contains "${VANBLOG_TEST_LOG}" "wget " "same-version path downloads before compose"
down_n="$(grep -n 'docker-compose down' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
wget_n="$(grep -n '^wget ' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
pull_n="$(grep -n 'pulled vanblog' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
self_before_pull=0
if [[ -n "${wget_n}" && -n "${down_n}" && -n "${pull_n}" && "${wget_n}" -lt "${down_n}" && "${down_n}" -lt "${pull_n}" ]]; then
  self_before_pull=1
fi
assert_eq "${self_before_pull}" "1" "self-update download happens before compose down/pull"

# --- download failure: warn and still update the service ---
setup_self_update_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
export VANBLOG_TEST_DOWNLOAD_FAIL=1
run_update_with_self_update
export VANBLOG_TEST_DOWNLOAD_FAIL=0
assert_eq "${UPDATE_RC}" "0" "script download failure still updates service"
assert_contains "${UPDATE_OUT}" "先更新管理脚本" "download-failure path still attempts self-update"
assert_contains "${UPDATE_OUT}" "将使用当前脚本继续更新 VanBlog" "download-failure path continues"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "download-failure path prints service success"
assert_file_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "download-failure path still pulls"

# --- newer script: re-exec with skip flags before compose pull ---
setup_self_update_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
export VANBLOG_TEST_SCRIPT_BUMP=1
vanblog_reexec() {
  printf 'reexec' >>"${VANBLOG_TEST_LOG}"
  local a
  for a in "$@"; do
    printf ' %s' "${a}" >>"${VANBLOG_TEST_LOG}"
  done
  printf '\n' >>"${VANBLOG_TEST_LOG}"
  exit 99
}
run_update_with_self_update
export VANBLOG_TEST_SCRIPT_BUMP=0
assert_eq "${UPDATE_RC}" "99" "newer-script path re-execs instead of pulling in this process"
assert_contains "${UPDATE_OUT}" "先更新管理脚本" "newer-script path prints self-update"
assert_contains "${UPDATE_OUT}" "使用新脚本继续更新 VanBlog" "newer-script path announces re-exec"
assert_not_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "newer-script path does not finish service update before re-exec"
assert_file_contains "${VANBLOG_TEST_LOG}" "reexec VANBLOG_SKIP_SCRIPT_UPDATE=1 VANBLOG_AFTER_SELF_UPDATE=1" "re-exec sets skip env"
assert_file_contains "${VANBLOG_TEST_LOG}" " update --after-self-update" "re-exec continues as update --after-self-update"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "newer-script path does not pull before re-exec"
assert_file_contains "${TEST_DIR}/vanblog.sh" 'VANBLOG_SCRIPT_VERSION="v99.0.1"' "newer-script path replaces local installer"

# --- menu mode re-exec keeps --menu so the new script can return to the menu ---
setup_self_update_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
export VANBLOG_TEST_SCRIPT_BUMP=1
vanblog_reexec() {
  echo "reexec $*" >>"${VANBLOG_TEST_LOG}"
  exit 77
}
UPDATE_OUT="$(update 2>&1)"
UPDATE_RC=$?
export VANBLOG_TEST_SCRIPT_BUMP=0
assert_eq "${UPDATE_RC}" "77" "menu-mode newer script re-execs"
assert_file_contains "${VANBLOG_TEST_LOG}" " update --after-self-update --menu" "menu-mode re-exec passes --menu"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "menu-mode re-exec happens before pull"

# --- real exec: no infinite loop, then service update succeeds ---
setup_self_update_case
export VANBLOG_TEST_SCRIPT_BUMP=1
export VANBLOG_SKIP_PRE_CHECK=1
export VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
unset VANBLOG_SKIP_MAIN VANBLOG_SKIP_SCRIPT_UPDATE VANBLOG_AFTER_SELF_UPDATE
chmod +x "${VANBLOG_SCRIPT_PATH}"
UPDATE_OUT="$(
  "${VANBLOG_SCRIPT_PATH}" update 2>&1
)"
UPDATE_RC=$?
unset VANBLOG_SKIP_PRE_CHECK
export VANBLOG_TEST_SCRIPT_BUMP=0
assert_eq "${UPDATE_RC}" "0" "exec self-update path exits 0"
assert_contains "${UPDATE_OUT}" "先更新管理脚本" "exec path self-updates first"
assert_contains "${UPDATE_OUT}" "使用新脚本继续更新 VanBlog" "exec path announces new script"
assert_contains "${UPDATE_OUT}" "VanBlog 更新并重启成功" "exec path updates service after re-exec"
assert_eq "$(download_count)" "1" "exec path downloads installer only once"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "INFINITE_SCRIPT_UPDATE_LOOP" "exec path does not loop self-update"
assert_file_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "exec path pulls after self-update"
wget_n="$(grep -n '^wget ' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
pull_n="$(grep -n 'pulled vanblog' "${VANBLOG_TEST_LOG}" | head -n1 | cut -d: -f1)"
exec_order=0
if [[ -n "${wget_n}" && -n "${pull_n}" && "${wget_n}" -lt "${pull_n}" ]]; then
  exec_order=1
fi
assert_eq "${exec_order}" "1" "exec path downloads script before compose pull"

# --- update_script (menu 20) still only refreshes the script and re-enters the menu ---
setup_self_update_case
source_script
VANBLOG_BASE_PATH="${TEST_DIR}/vanblog"
cat >"${VANBLOG_TEST_SCRIPT_PAYLOAD}" <<'EOF'
#!/bin/bash
VANBLOG_SCRIPT_VERSION="v0.3.7"
echo "menu-only-reexec argv:$*"
echo "skip=${VANBLOG_SKIP_SCRIPT_UPDATE-}"
exit 0
EOF
UPDATE_SCRIPT_OUT="$(
  cd "${TEST_DIR}" || exit 1
  sleep() { :; }
  clear() { :; }
  update_script
  echo "update_script-should-not-return"
)"
UPDATE_SCRIPT_RC=$?
assert_eq "${UPDATE_SCRIPT_RC}" "0" "update_script standalone path exits 0"
assert_contains "${UPDATE_SCRIPT_OUT}" "更新脚本" "update_script prints script-only header"
assert_contains "${UPDATE_SCRIPT_OUT}" "menu-only-reexec argv:" "update_script execs menu (no update argv)"
assert_not_contains "${UPDATE_SCRIPT_OUT}" "update_script-should-not-return" "update_script execs and does not return"
assert_not_contains "${UPDATE_SCRIPT_OUT}" "先更新管理脚本" "update_script does not use service self-update path"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "pulled vanblog" "update_script does not pull vanblog"
assert_file_not_contains "${VANBLOG_TEST_LOG}" "docker-compose down" "update_script does not stop containers"

echo
echo "passed=${PASS} failed=${FAIL}"
if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi
exit 0
