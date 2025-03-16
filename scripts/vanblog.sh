#!/bin/bash

#========================================================
# VanBlog 管理脚本
# 系统要求: CentOS 7+ / Debian 8+ / Ubuntu 16+ / Arch Linux
# 描述: 用于安装、配置和管理 VanBlog 博客系统及其 Waline 评论系统
# 版本: Corn Fork v0.3.3
# Github: https://github.com/CornWorld/vanblog
#========================================================

#====================================
# 1. 全局变量和配置
#====================================

# 版本信息
readonly VANBLOG_SCRIPT_VERSION="v0.3.3"

# 路径配置
readonly VANBLOG_BASE_PATH="/var/vanblog"
readonly VANBLOG_DATA_PATH="${VANBLOG_BASE_PATH}/data"
readonly VANBLOG_DATA_PATH_RAW="\/var\/vanblog\/data"

# URL 配置
readonly COMPOSE_URL="https://raw.githubusercontent.com/CornWorld/vanblog/refs/heads/main/docker-compose/docker-compose-template.yml"
readonly SCRIPT_URL="https://raw.githubusercontent.com/CornWorld/vanblog/refs/heads/main/scripts/vanblog.sh"
readonly GITHUB_URL="github.com/CornWorld/vanblog"

# Docker 配置
readonly DEFAULT_DOCKER_URL="get.docker.com"
readonly DEFAULT_DOCKER_ARGS=""
readonly DEFAULT_DOCKER_IMAGE="cornworld/vanblog:latest"

# 变量声明
DOCKER_URL="${DEFAULT_DOCKER_URL}"
DOCKER_ARGS="${DEFAULT_DOCKER_ARGS}"
DOCKER_IMAGE="${DEFAULT_DOCKER_IMAGE}"

# 容器相关变量
container_cmd=""
container_id=""
mongo_cmd=""

# 系统架构
os_arch=""

# 颜色配置
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_BOLD='\033[1m'
readonly COLOR_PLAIN='\033[0m'

# 导出系统路径
export PATH=$PATH:/usr/local/bin

#====================================
# 2. 核心工具函数
#====================================

# 输出带颜色的信息
log_info() {
  echo -e "${COLOR_GREEN}[信息] $1${COLOR_PLAIN}"
}

log_warn() {
  echo -e "${COLOR_YELLOW}[警告] $1${COLOR_PLAIN}"
}

log_error() {
  echo -e "${COLOR_RED}[错误] $1${COLOR_PLAIN}"
}

log_debug() {
  echo -e "${COLOR_BLUE}[调试] $1${COLOR_PLAIN}"
}

# 显示分隔线
show_separator() {
  echo -e "-----------------------------------"
}

# 确认操作
confirm() {
  if [[ $# > 1 ]]; then
    echo && read -e -p "$1 [默认$2]: " temp
    if [[ x"${temp}" == x"" ]]; then
      temp=$2
    fi
  else
    read -e -p "$1 [y/n]: " temp
  fi
  if [[ x"${temp}" == x"y" || x"${temp}" == x"Y" ]]; then
    return 0
  else
    return 1
  fi
}

# 在菜单前暂停
pause_before_menu() {
  echo && echo -n -e "${COLOR_YELLOW}* 按回车返回主菜单 *${COLOR_PLAIN}" && read temp
  menu_show_main
}

pause_before_waline_menu() {
  echo && echo -n -e "${COLOR_YELLOW}* 按回车返回 Waline 管理菜单 *${COLOR_PLAIN}" && read temp
  waline_show_menu
}

# 安装基础工具
util_install_base() {
  (command -v git >/dev/null 2>&1 && command -v curl >/dev/null 2>&1 && command -v wget >/dev/null 2>&1 && command -v unzip >/dev/null 2>&1 && command -v getenforce >/dev/null 2>&1) ||
    (util_install_soft curl wget git unzip)
}

# 安装软件包 - 使用无需确认方式
util_install_soft() {
  # Arch官方库不包含selinux等组件
  (command -v yum >/dev/null 2>&1 && yum makecache && yum install -y $* selinux-policy) ||
    (command -v apt >/dev/null 2>&1 && apt update && apt install -y $* selinux-utils) ||
    (command -v pacman >/dev/null 2>&1 && pacman -Syu --noconfirm $*) ||
    (command -v apt-get >/dev/null 2>&1 && apt-get update && apt-get install -y $* selinux-utils)
}

# 设置 SELinux
util_selinux() {
  # 判断当前的状态
  getenforce | grep '[Ee]nfor'
  if [ $? -eq 0 ]; then
    log_info "SELinux是开启状态，正在关闭！"
    setenforce 0 &>/dev/null
    find_key="SELINUX="
    sed -ri "/^$find_key/c${find_key}disabled" /etc/selinux/config
  fi
}

# 检查系统和权限
util_check_system() {
  mkdir -p ${VANBLOG_BASE_PATH}

  command -v curl >/dev/null 2>&1
  if [[ $? != 0 ]]; then
    log_error "未找到 curl 命令"
    exit 1
  fi

  # 检查 root 权限
  if [[ $EUID -ne 0 ]]; then
    log_error "必须使用 root 用户运行此脚本！"
    exit 1
  fi

  # 检查系统架构
  if [[ $(uname -m | grep 'x86_64') != "" ]]; then
    os_arch="amd64"
  elif [[ $(uname -m | grep 'i386\|i686') != "" ]]; then
    log_error "不支持 386 平台"
    exit 1
  elif [[ $(uname -m | grep 'aarch64\|armv8b\|armv8l') != "" ]]; then
    os_arch="arm64"
  elif [[ $(uname -m | grep 'arm') != "" ]]; then
    log_error "不支持 arm 平台，目前只支持 arm64、amd64"
    exit 1
  elif [[ $(uname -m | grep 's390x') != "" ]]; then
    log_error "不支持 s390x 平台，目前只支持 arm64、amd64"
    exit 1
  elif [[ $(uname -m | grep 'riscv64') != "" ]]; then
    log_error "不支持 riscv64 平台，目前只支持 arm64、amd64"
    exit 1
  fi
  
  # 检查是否中国 IP，设置合适的镜像
  util_set_docker_vars
}

# 根据位置自动设置 Docker 相关变量
util_set_docker_vars() {
  if [[ -z "${CN}" ]]; then
    if [[ $(curl -m 10 -s https://ipapi.co/json | grep 'China') != "" ]]; then
      echo "根据 ipapi.co 提供的信息，当前 IP 可能在中国"
      read -e -r -p "是否选用中国镜像完成安装? [Y/n] " input
      case $input in
        [yY][eE][sS] | [yY])
          echo "使用中国镜像"
          CN=true
        ;;
        [nN][oO] | [nN])
          echo "不使用中国镜像"
        ;;
        *)
          echo "使用中国镜像"
          CN=true
        ;;
      esac
    fi
  fi

  # 设置 Docker 相关变量
  DOCKER_URL="get.docker.com"
  DOCKER_ARGS=""
  DOCKER_IMAGE="cornworld/vanblog:latest"

  # 如果是中国 IP，可选择使用国内镜像
  if [[ -n "${CN}" ]]; then
    echo "使用中国镜像"
    # 如果需要替换为国内镜像，可在此处修改
    # DOCKER_URL="vanblog.mereith.com/docker.sh"
    # DOCKER_ARGS=" -s docker --mirror Aliyun"
    # DOCKER_IMAGE="registry.cn-beijing.aliyuncs.com/cornworld/vanblog:latest"
  fi
}

# 清理资源
util_clean_all() {
  if [ -z "$(ls -A ${VANBLOG_BASE_PATH})" ]; then
    rm -rf ${VANBLOG_BASE_PATH}
  fi
}

#====================================
# 3. 容器管理模块
#====================================

# 确定使用哪个容器命令
container_determine_cmd() {
  container_cmd=""
  for cmd in docker nerdctl podman crictl; do
    if command -v "$cmd" &> /dev/null; then
      container_cmd="$cmd"
      log_debug "使用容器运行时: $cmd"
      break
    fi
  done

  if [ -z "$container_cmd" ]; then
    log_error "错误: 未找到容器运行时命令 (docker, nerdctl, podman 等)"
    return 1
  fi
  return 0
}

# 查找包含 "mongo" 标签的容器 ID
container_find_mongo() {
  container_determine_cmd
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  container_id=$($container_cmd ps | grep mongo | awk '{print $1}')

  # 检查是否找到符合条件的容器
  if [ -z "$container_id" ]; then
    log_error "未找到运行中的 MongoDB 容器"
    return 1
  fi

  log_info "找到 MongoDB 容器，ID: $container_id"
  return 0
}

# 确定 MongoDB 客户端命令 (mongo 或 mongosh)
container_determine_mongo_cmd() {
  container_find_mongo
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  mongo_cmd=""
  if $container_cmd exec "$container_id" mongosh --version &> /dev/null; then
    mongo_cmd="mongosh"
    log_debug "使用 MongoDB 客户端: mongosh (新版本)"
  elif $container_cmd exec "$container_id" mongo --version &> /dev/null; then
    mongo_cmd="mongo"
    log_debug "使用 MongoDB 客户端: mongo (旧版本)"
  else
    log_error "错误: 容器中未找到 mongo 或 mongosh 命令"
    return 1
  fi
  return 0
}

# 删除旧的容器镜像
container_delete_old_images() {
  log_info "删除旧镜像"
  docker rmi -f mereith/van-blog-old
}

# 重命名旧的容器镜像
container_retag_old_images() {
  log_info "重命名旧镜像"
  docker tag $(docker images | grep van-blog | awk '{print $3}') mereith/van-blog-old
  # docker tag $(docker images | grep vanblog | awk '{print $3}') mereith/van-blog-old
}

# 安装 Docker
container_install_docker() {
  log_info "正在安装 Docker"
  
  # 首先检查Docker是否已安装
  if command -v docker >/dev/null 2>&1; then
    log_info "Docker已经安装，跳过安装步骤"
    return 0
  fi
  
  # 安装Docker
  log_info "下载安装Docker..."
  bash <(curl -sL https://${DOCKER_URL}) ${DOCKER_ARGS} >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    log_error "Docker安装脚本执行失败，请检查网络连接或手动安装Docker"
    exit 1
  fi
  
  log_info "设置Docker自启动..."
  systemctl enable docker.service
  systemctl start docker.service
  
  # 验证Docker安装成功
  command -v docker >/dev/null 2>&1
  if [[ $? != 0 ]]; then
    log_error "Docker 安装失败，请手动安装"
    exit 1
  fi
  log_info "Docker 安装成功，版本信息:"
  docker --version
  return 0
}

# 设置 docker-compose 别名
container_setup_compose_alias() {
  # 首先检查docker-compose是否已可用
  if command -v docker-compose >/dev/null 2>&1; then
    log_info "docker-compose 已经可用，版本信息:"
    docker-compose --version
    return 0
  fi
  
  # 检查docker compose子命令是否可用
  if docker compose version >/dev/null 2>&1; then
    log_info "检测到 docker compose 命令，将创建 docker-compose 别名"
    echo 'docker compose $@' > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    command -v docker-compose >/dev/null 2>&1
    if [[ $? != 0 ]]; then
      log_error "docker-compose 别名创建失败，请检查权限或手动创建别名"
      exit 1
    fi
    log_info "docker-compose 别名创建成功，版本信息:"
    docker-compose --version
    return 0
  fi
  
  # 都不可用，提示错误
  log_error "未找到 docker compose 或 docker-compose 命令，请安装 Docker Compose"
  log_info "您可以尝试以下命令安装 Docker Compose:"
  log_info "curl -L \"https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
  log_info "chmod +x /usr/local/bin/docker-compose"
  exit 1
}

# 执行MongoDB命令的函数
mongo_execute_command() {
  local js_command="$1"
  local temp_js_file="temp_mongo_command_$(date +%s).js"
  local max_retries=3
  local retry_count=0
  local success=false

  echo "$js_command" > $temp_js_file

  # 添加重试机制
  while [ $retry_count -lt $max_retries ] && [ "$success" = false ]; do
    if $container_cmd cp $temp_js_file "$container_id":/tmp/$temp_js_file &> /dev/null; then
      result=$($container_cmd exec "$container_id" $mongo_cmd waline /tmp/$temp_js_file 2>&1)
      status=$?
      success=true
    else
      retry_count=$((retry_count+1))
      log_warn "与容器通信失败，尝试重试 ($retry_count/$max_retries)"
      sleep 1
    fi
  done

  # 清理临时文件
  rm -f $temp_js_file
  $container_cmd exec "$container_id" rm -f /tmp/$temp_js_file &> /dev/null

  if [ "$success" = false ]; then
    log_error "与容器通信失败，请检查容器状态"
    return 1
  fi

  echo "$result"
  return $status
}

#====================================
# 4. MongoDB 操作模块
#====================================

# 这里不需要重复定义mongo_execute_command函数

#====================================
# 5. Waline 用户管理模块
#====================================

# 列出所有 Waline 用户
waline_list_users() {
  log_info "列出所有 Waline 用户"
  
  container_determine_mongo_cmd
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  log_info "正在获取用户列表..."

  # 根据mongo版本调整打印格式
  if [ "$mongo_cmd" == "mongosh" ]; then
    format_cmd='printjson(db.Users.find().toArray())'
  else
    format_cmd='db.Users.find().forEach(printjson)'
  fi

  result=$(mongo_execute_command "$format_cmd")

  if [ $? -ne 0 ]; then
    log_error "获取用户列表失败"
    return 1
  fi

  # 提取用户信息并格式化输出
  echo -e "${COLOR_BOLD}当前 Waline 用户:${COLOR_PLAIN}"
  
  # 清理MongoDB输出中的连接信息
  user_data=$(echo "$result" | grep -v "MongoDB shell" | grep -v "connecting to:" | grep -v "Implicit session:" | grep -v "MongoDB server version:" | grep -v "bye")
               
  if [ -z "$user_data" ]; then
    show_separator
    log_warn "没有找到用户记录"
    show_separator
    return 0
  fi

  echo "$user_data" | grep -E '(_id|display_name|email|type)' | sed 's/^[[:space:]]*//'\
  | awk 'BEGIN {count=0; print "-----------------------------------"}
         /_id/ {if (count>0) print "-----------------------------------"; count++; print "用户 #" count ":"; print $0}
         !(/_id/) {print $0}
         END {print "-----------------------------------"; print "用户总数: " count}'
  
  if [[ $# == 0 ]]; then
    pause_before_waline_menu
  fi
}

# 删除 Waline 管理员用户
waline_delete_admin() {
  log_info "删除 Waline 管理员用户"
  
  container_determine_mongo_cmd
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  log_info "正在获取管理员列表..."

  # 获取管理员列表
  if [ "$mongo_cmd" == "mongosh" ]; then
    format_cmd='printjson(db.Users.find({type: "administrator"}).toArray())'
  else
    format_cmd='db.Users.find({type: "administrator"}).forEach(printjson)'
  fi

  admins=$(mongo_execute_command "$format_cmd")

  if [ $? -ne 0 ]; then
    log_error "获取管理员列表失败"
    return 1
  fi

  # 清理MongoDB输出
  admins_data=$(echo "$admins" | grep -v "MongoDB shell" | grep -v "connecting to:" | grep -v "Implicit session:" | grep -v "MongoDB server version:" | grep -v "bye")
               
  # 检查是否有管理员账户
  admin_count=$(echo "$admins_data" | grep -c "_id")
  if [ "$admin_count" -eq 0 ]; then
    log_error "未找到管理员账户"
    return 1
  fi

  # 显示管理员列表并让用户选择
  log_info "管理员账户:"
  admin_ids=()
  admin_names=()

  # 提取管理员ID和名称
  while IFS= read -r line; do
    if [[ $line =~ \"_id\"[[:space:]]*:[[:space:]]*ObjectId\(\"([^\"]+)\"\) ]]; then
      current_id="${BASH_REMATCH[1]}"
      admin_ids+=("$current_id")
    elif [[ $line =~ \"display_name\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
      current_name="${BASH_REMATCH[1]}"
      admin_names+=("$current_name")
    fi
  done < <(echo "$admins_data")

  # 显示管理员列表
  echo -e "${COLOR_BOLD}选择要删除的管理员:${COLOR_PLAIN}"
  for i in "${!admin_ids[@]}"; do
    echo -e "$((i+1)). ${admin_names[$i]} (ID: ${admin_ids[$i]})"
  done
  echo -e "0. 取消操作"

  # 让用户选择
  read -p "请输入选择 [0-${#admin_ids[@]}]: " selection

  # 验证输入
  if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 0 ] || [ "$selection" -gt "${#admin_ids[@]}" ]; then
    log_error "无效的选择。操作已取消"
    return 1
  fi

  # 取消操作
  if [ "$selection" -eq 0 ]; then
    log_warn "操作已取消"
    return 0
  fi

  # 执行删除操作
  selection=$((selection-1))
  selected_id="${admin_ids[$selection]}"
  selected_name="${admin_names[$selection]}"

  log_warn "即将删除管理员: $selected_name"
  read -p "确定要删除吗？此操作无法撤销 [y/N]: " confirm

  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    delete_cmd="db.Users.deleteOne({_id: ObjectId('$selected_id')});
                if (db.Users.findOne({_id: ObjectId('$selected_id')}) === null) {
                  print('DELETE_SUCCESS');
                } else {
                  print('DELETE_FAILED');
                }"
    result=$(mongo_execute_command "$delete_cmd")

    # 检查结果中是否包含我们添加的成功标记
    if echo "$result" | grep -q "DELETE_SUCCESS"; then
      log_info "已成功删除管理员: $selected_name"
    else
      log_error "删除管理员失败"
      log_error "请确认 MongoDB 权限是否正确"
    fi
  else
    log_warn "删除操作已取消"
  fi
  
  if [[ $# == 0 ]]; then
    pause_before_waline_menu
  fi
}

# 重置 Waline 管理员密码
waline_reset_admin_password() {
  log_info "重置 Waline 管理员密码"
  
  container_determine_mongo_cmd
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  # 使用已知的密码哈希值（对应 123123）
  default_password_hash='$2a$08$gW.CHW8prPnZMQynsqNM0uiC3wO6olz0EPzEZLCilu1qcyazwJvs2'
  default_email='admin@admin.com'

  log_info "重置管理员密码和邮箱"
  log_warn "这将重置所有管理员账户为:"
  echo -e "  邮箱: $default_email"
  echo -e "  密码: 123123 (使用预设的哈希值)"
  read -p "确定要继续吗? [y/N]: " confirm

  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    update_cmd="db.Users.updateMany(
      { type: 'administrator' },
      {
        \$set: {
          password: '$default_password_hash',
          email: '$default_email'
        }
      }
    );
    var result = db.runCommand('getLastError');
    if (result.ok === 1) {
      print('UPDATE_SUCCESS');
    } else {
      print('UPDATE_FAILED');
    }"

    result=$(mongo_execute_command "$update_cmd")

    # 检查结果中是否包含我们添加的成功标记
    if echo "$result" | grep -q "UPDATE_SUCCESS"; then
      log_info "管理员密码重置成功"
      log_info "请使用邮箱: $default_email 和密码: 123123 登录 Waline"
    else
      log_error "重置管理员密码失败"
      log_error "请确认 MongoDB 权限是否正确"
    fi
  else
    log_warn "密码重置已取消"
  fi
  
  if [[ $# == 0 ]]; then
    pause_before_waline_menu
  fi
}

# 创建新 Waline 管理员账户
waline_create_admin() {
  log_info "创建新 Waline 管理员账户"
  
  container_determine_mongo_cmd
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  log_info "创建新管理员账户"
  log_warn "注意: 默认将使用密码 '123123'"

  read -p "输入显示名称: " display_name
  read -p "输入邮箱: " email

  # 验证必填字段
  if [ -z "$display_name" ] || [ -z "$email" ]; then
    log_error "显示名称和邮箱为必填项。操作已取消"
    return 1
  fi

  read -p "输入网站 URL (可选): " url

  # 使用默认密码哈希值
  password_hash='$2a$08$gW.CHW8prPnZMQynsqNM0uiC3wO6olz0EPzEZLCilu1qcyazwJvs2'
  log_warn "使用默认密码: 123123"

  # 创建新用户
  create_cmd="db.Users.insertOne({
    display_name: '$display_name',
    email: '$email',
    password: '$password_hash',
    url: '$url',
    type: 'administrator'
  });

  var newUser = db.Users.findOne({email: '$email'});
  if (newUser) {
    print('INSERT_SUCCESS');
  } else {
    print('INSERT_FAILED');
  }"

  result=$(mongo_execute_command "$create_cmd")

  # 检查结果中是否包含我们添加的成功标记
  if echo "$result" | grep -q "INSERT_SUCCESS"; then
    log_info "新管理员账户创建成功"
    log_info "请使用邮箱: $email 和密码: 123123 登录"
  else
    log_error "创建管理员账户失败"
    log_error "请确认 MongoDB 权限是否正确，或该邮箱是否已被使用"
  fi
  
  if [[ $# == 0 ]]; then
    pause_before_waline_menu
  fi
}

# Waline 用户管理菜单
waline_show_menu() {
  echo -e "
    ${COLOR_GREEN}Waline 用户管理${COLOR_PLAIN}
    ${COLOR_GREEN}1.${COLOR_PLAIN}  列出所有用户
    ${COLOR_GREEN}2.${COLOR_PLAIN}  重置管理员密码 (为默认值: 123123)
    ${COLOR_GREEN}3.${COLOR_PLAIN}  删除管理员账户
    ${COLOR_GREEN}4.${COLOR_PLAIN}  创建新管理员账户
    ${COLOR_GREEN}0.${COLOR_PLAIN}  返回主菜单
    "
  echo && read -ep "请输入选择 [0-4]: " num

  case "${num}" in
  0)
    menu_show_main
    ;;
  1)
    waline_list_users
    ;;
  2)
    waline_reset_admin_password
    ;;
  3)
    waline_delete_admin
    ;;
  4)
    waline_create_admin
    ;;
  *)
    log_error "请输入正确的数字 [0-4]"
    ;;
  esac
}

pre_check() {
  util_check_system
}

update_script() {
  echo -e "> 更新脚本"

  curl -sL ${SCRIPT_URL} -o /tmp/vanblog.sh
  new_version=$(cat /tmp/vanblog.sh | grep "VANBLOG_SCRIPT_VERSION" | head -n 1 | awk -F "=" '{print $2}' | sed 's/\"//g;s/,//g;s/ //g')
  if [ ! -n "$new_version" ]; then
    echo -e "脚本获取失败，请检查本机能否链接 ${SCRIPT_URL}"
    return 1
  fi
  echo -e "当前最新版本为: ${new_version}"
  mv -f /tmp/vanblog.sh ./vanblog.sh && chmod a+x ./vanblog.sh

  echo -e "3s后执行新脚本"
  sleep 3s
  clear
  exec ./vanblog.sh
  exit 0
}

before_show_menu() {
  pause_before_menu
}

install_base() {
  util_install_base
}

install_vanblog() {
  install_base

  echo -e "> 安装 VanBlog"

  # VanBlog 数据文件夹
  if [ ! -d "${VANBLOG_DATA_PATH}" ]; then
    mkdir -p $VANBLOG_DATA_PATH
  else
    echo "您可能已经安装过 VanBlog，重复安装可能会引发问题，请注意备份。"
    read -e -r -p "是否退出安装? [Y/n] " input
    case $input in
    [yY][eE][sS] | [yY])
      echo "退出安装"
      exit 0
      ;;
    [nN][oO] | [nN])
      echo "继续安装"
      ;;
    *)
      echo "退出安装"
      exit 0
      ;;
    esac
  fi

  chmod 777 -R $VANBLOG_DATA_PATH

  # 检查Docker是否已安装
  if command -v docker >/dev/null 2>&1; then
    log_info "Docker已经安装，跳过安装步骤"
  else
    container_install_docker
  fi

  # 检查docker-compose是否可用
  if command -v docker-compose >/dev/null 2>&1; then
    log_info "docker-compose已经可用，跳过配置步骤"
  else
    container_setup_compose_alias
  fi

  config 0

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

# 检查端口占用情况
check_port_usage() {
  local port=$1
  if lsof -i:"$port" >/dev/null 2>&1 || netstat -tulpn | grep ":$port " >/dev/null 2>&1; then
    log_error "端口 $port 已被占用，请修改配置或关闭占用此端口的服务"
    log_info "可以使用以下命令查看端口占用情况："
    log_info "lsof -i:$port 或 netstat -tulpn | grep :$port"
    return 1
  fi
  return 0
}

# 处理 Docker Compose 文件，移除过时的 version 字段
fix_docker_compose_file() {
  local compose_file="$1"
  if [ -f "$compose_file" ]; then
    # 创建临时文件，跳过version行
    grep -v "^version:" "$compose_file" > "$compose_file.tmp"
    # 替换原文件
    mv "$compose_file.tmp" "$compose_file"
    log_info "已移除 docker-compose 文件中过时的 version 字段"
  fi
}

config() {
  echo -e "> 修改配置"

  echo -e "正在下载编排文件"
  rm ${VANBLOG_BASE_PATH}/docker-compose-template.yaml >/dev/null 2>&1
  wget -t 2 --no-check-certificate -T 10 -O ${VANBLOG_BASE_PATH}/docker-compose-template.yaml ${COMPOSE_URL} >/dev/null 2>&1
  if [[ $? != 0 ]]; then
    echo -e "${COLOR_RED}下载脚本失败，请检查本机能否连接 ${COMPOSE_URL}${COLOR_PLAIN}"
    return 0
  fi

  # 移除过时的version字段
  fix_docker_compose_file "${VANBLOG_BASE_PATH}/docker-compose-template.yaml"

  # read -ep "请输入您想要安装的版本，默认不填为最新：" vanblog_version &&
  read -ep "请输入您的邮箱：" vanblog_email &&
    read -ep "请输入 http 端口（默认为 80）：" vanblog_http_port &&
    read -ep "请输入 https 端口（默认为 443）：" vanblog_https_port
  # echo "接下来您需要输入的域名对应着编排文件中的 VAN_BLOG_ALLOW_DOMAINS 变量（不含协议、不可包含通配符、多个域名通过英文逗号分隔）" &&
  # echo "如果用了 cdn 或图床，需要把图床或 cdn 的域名也加上" &&
  # read -ep "请输入您最终要绑定的域名（小写）:" vanblog_domains

  if [[ -z "${vanblog_email}" ]]; then
    echo -e "${COLOR_RED}除了端口外所有选项都不能为空${COLOR_PLAIN}"
    before_show_menu
    return 1
  fi

  if [[ -z "${vanblog_http_port}" ]]; then
    vanblog_http_port=80
  fi
  if [[ -z "${vanblog_https_port}" ]]; then
    vanblog_https_port=443
  fi
  # if [[ -z "${vanblog_version}" ]]; then
  #   vanblog_version="latest"
  # fi

  # 检查端口是否被占用
  check_port_usage "${vanblog_http_port}" || {
    log_warn "HTTP 端口 ${vanblog_http_port} 已被占用，请选择其他端口"
    before_show_menu
    return 1
  }
  
  check_port_usage "${vanblog_https_port}" || {
    log_warn "HTTPS 端口 ${vanblog_https_port} 已被占用，请选择其他端口"
    before_show_menu
    return 1
  }

  rm ${VANBLOG_BASE_PATH}/docker-compose.yaml >/dev/null 2>&1
  cp ${VANBLOG_BASE_PATH}/docker-compose-template.yaml ${VANBLOG_BASE_PATH}/docker-compose.yaml >/dev/null 2>&1
  sed -i "s/vanblog_data_path/${VANBLOG_DATA_PATH_RAW}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_email/${vanblog_email}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_http_port/${vanblog_http_port}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_https_port/${vanblog_https_port}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  # sed -i "s/vanblog_domains/${vanblog_domains}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  # sed -i "s/vanblog_version/${vanblog_version}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s|vanblog_image|${DOCKER_IMAGE}|g" ${VANBLOG_BASE_PATH}/docker-compose.yaml

  mkdir -p $VANBLOG_DATA_PATH

  echo -e "配置 ${COLOR_GREEN}修改成功，请稍等重启生效${COLOR_PLAIN}"

  restart

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

restart() {
  echo -e "> 重启服务"

  cd $VANBLOG_BASE_PATH
  
  # 检查配置文件中的端口是否被占用
  local http_port=$(grep -oP '(?<=- )\d+(?=:80)' ${VANBLOG_BASE_PATH}/docker-compose.yaml)
  local https_port=$(grep -oP '(?<=- )\d+(?=:443)' ${VANBLOG_BASE_PATH}/docker-compose.yaml)
  
  check_port_usage "${http_port}" || {
    log_warn "无法重启服务：HTTP 端口 ${http_port} 已被占用"
    if [[ $# == 0 ]]; then
      before_show_menu
    fi
    return 1
  }
  
  check_port_usage "${https_port}" || {
    log_warn "无法重启服务：HTTPS 端口 ${https_port} 已被占用"
    if [[ $# == 0 ]]; then
      before_show_menu
    fi
    return 1
  }
  
  docker-compose down -v
  docker-compose up -d
  
  local docker_status=$?
  
  if [[ $docker_status == 0 ]]; then
    echo -e "${COLOR_GREEN}VanBlog 重启成功${COLOR_PLAIN}"
    echo -e "默认管理面板地址：${COLOR_YELLOW}域名:站点访问端口/admin${COLOR_PLAIN}"
  else
    echo -e "${COLOR_RED}重启失败${COLOR_PLAIN}"
    
    # 检查常见的错误
    if docker-compose logs | grep -q "Bind for.*failed: port is already allocated"; then
      echo -e "${COLOR_RED}错误原因: 端口被占用${COLOR_PLAIN}"
      echo -e "请检查 HTTP 端口 ${http_port} 和 HTTPS 端口 ${https_port} 是否被其他服务占用"
      echo -e "可以使用以下命令查看:"
      echo -e "  lsof -i:${http_port}"
      echo -e "  lsof -i:${https_port}"
      echo -e "或者修改 ${VANBLOG_BASE_PATH}/docker-compose.yaml 配置文件中的端口映射"
    else
      echo -e "${COLOR_RED}请查看日志以获取详细错误信息: ${COLOR_PLAIN}"
      echo -e "  cd ${VANBLOG_BASE_PATH} && docker-compose logs"
    fi
  fi

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

update() {
  echo -e "> 更新服务"
  container_retag_old_images

  cd $VANBLOG_BASE_PATH
  
  # 检查配置文件中的端口是否被占用
  local http_port=$(grep -oP '(?<=- )\d+(?=:80)' ${VANBLOG_BASE_PATH}/docker-compose.yaml)
  local https_port=$(grep -oP '(?<=- )\d+(?=:443)' ${VANBLOG_BASE_PATH}/docker-compose.yaml)
  
  check_port_usage "${http_port}" || {
    log_warn "无法更新服务：HTTP 端口 ${http_port} 已被占用"
    if [[ $# == 0 ]]; then
      before_show_menu
    fi
    return 1
  }
  
  check_port_usage "${https_port}" || {
    log_warn "无法更新服务：HTTPS 端口 ${https_port} 已被占用"
    if [[ $# == 0 ]]; then
      before_show_menu
    fi
    return 1
  }
  
  # 修复docker-compose文件，移除过时的version字段
  fix_docker_compose_file "${VANBLOG_BASE_PATH}/docker-compose.yaml"
  
  docker-compose pull
  docker-compose down -v
  docker-compose up -d
  
  local docker_status=$?
  
  if [[ $docker_status == 0 ]]; then
    echo -e "${COLOR_GREEN}VanBlog 更新并重启成功${COLOR_PLAIN}"
    echo -e "默认管理面板地址：${COLOR_YELLOW}域名:站点访问端口${COLOR_PLAIN}"
  else
    echo -e "${COLOR_RED}更新失败${COLOR_PLAIN}"
    
    # 检查常见的错误
    if docker-compose logs | grep -q "Bind for.*failed: port is already allocated"; then
      echo -e "${COLOR_RED}错误原因: 端口被占用${COLOR_PLAIN}"
      echo -e "请检查 HTTP 端口 ${http_port} 和 HTTPS 端口 ${https_port} 是否被其他服务占用"
      echo -e "可以使用以下命令查看:"
      echo -e "  lsof -i:${http_port}"
      echo -e "  lsof -i:${https_port}"
      echo -e "或者修改 ${VANBLOG_BASE_PATH}/docker-compose.yaml 配置文件中的端口映射"
    else
      echo -e "${COLOR_RED}请查看日志以获取详细错误信息: ${COLOR_PLAIN}"
      echo -e "  cd ${VANBLOG_BASE_PATH} && docker-compose logs"
    fi
  fi

  container_delete_old_images

  before_show_menu
}

reset_https() {
    echo -e "> 重置 https 设置（需要先启动 vanblog）"
    cd $VANBLOG_BASE_PATH && docker-compose exec vanblog node /app/cli/resetHttps.js
    before_show_menu
}

start_vanblog() {
  echo -e "> 启动 VanBlog"

  cd $VANBLOG_BASE_PATH
  
  # 检查配置文件中的端口是否被占用
  local http_port=$(grep -oP '(?<=- )\d+(?=:80)' ${VANBLOG_BASE_PATH}/docker-compose.yaml)
  local https_port=$(grep -oP '(?<=- )\d+(?=:443)' ${VANBLOG_BASE_PATH}/docker-compose.yaml)
  
  check_port_usage "${http_port}" || {
    log_warn "无法启动服务：HTTP 端口 ${http_port} 已被占用"
    if [[ $# == 0 ]]; then
      before_show_menu
    fi
    return 1
  }
  
  check_port_usage "${https_port}" || {
    log_warn "无法启动服务：HTTPS 端口 ${https_port} 已被占用"
    if [[ $# == 0 ]]; then
      before_show_menu
    fi
    return 1
  }
  
  docker-compose up -d
  
  local docker_status=$?
  
  if [[ $docker_status == 0 ]]; then
    echo -e "${COLOR_GREEN}VanBlog 启动成功${COLOR_PLAIN}"
  else
    echo -e "${COLOR_RED}启动失败${COLOR_PLAIN}"
    
    # 检查常见的错误
    if docker-compose logs | grep -q "Bind for.*failed: port is already allocated"; then
      echo -e "${COLOR_RED}错误原因: 端口被占用${COLOR_PLAIN}"
      echo -e "请检查 HTTP 端口 ${http_port} 和 HTTPS 端口 ${https_port} 是否被其他服务占用"
      echo -e "可以使用以下命令查看:"
      echo -e "  lsof -i:${http_port}"
      echo -e "  lsof -i:${https_port}"
      echo -e "或者修改 ${VANBLOG_BASE_PATH}/docker-compose.yaml 配置文件中的端口映射"
    else
      echo -e "${COLOR_RED}请查看日志以获取详细错误信息: ${COLOR_PLAIN}"
      echo -e "  cd ${VANBLOG_BASE_PATH} && docker-compose logs"
    fi
  fi

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

stop_vanblog() {
  echo -e "> 停止 VanBlog"

  cd $VANBLOG_BASE_PATH && docker-compose down -v
  if [[ $? == 0 ]]; then
    echo -e "${COLOR_GREEN}VanBlog 停止成功${COLOR_PLAIN}"
  else
    echo -e "${COLOR_RED}停止失败，请稍后查看日志信息${COLOR_PLAIN}"
  fi

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

show_log() {
  echo -e "> 获取日志"

  cd $VANBLOG_BASE_PATH && docker-compose logs -f

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

uninstall_vanblog() {
  echo -e "> 卸载 VanBlog，所有数据将都被删除"
  read -e -r -p "是否退出卸载? [Y/n] " input
  case $input in
  [yY][eE][sS] | [yY])
    echo "退出卸载"
    exit 0
    ;;
  [nN][oO] | [nN])
    echo "继续卸载"
    ;;
  *)
    echo "退出卸载"
    exit 0
    ;;
  esac

  cd $VANBLOG_BASE_PATH &&
    docker-compose down -v
  rm -rf $VANBLOG_BASE_PATH
  docker rmi -f cornworld/vanblog:latest >/dev/null 2>&1
  util_clean_all

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

backup() {
  echo -e "> 备份 vanblog"
  name="vanblog-backup-$(date +"%Y%m%d%H%M%S").tar.gz"
  cd $VANBLOG_BASE_PATH && tar czvf $name ./data
  echo -e "${COLOR_GREEN}备份成功，文件名：${name}${COLOR_PLAIN} 所在路径：${VANBLOG_BASE_PATH}"
}

restore() {
  echo -e "> 恢复 vanblog"
  read -e -r -p "请输入备份文件名（含路径）: " path
  # 检测空
  if [ -z "$path" ]; then
    echo -e "${COLOR_RED}输入为空${COLOR_PLAIN}"
    exit 1
  fi
  # 停止 vanblog
  echo -e "> 停止 vanblog 中..."
  stop_vanblog
  # 覆盖解压到目标路径
  echo -e "> 覆盖解压到目标路径中..."
  tar xzvf $path -C $VANBLOG_BASE_PATH
  echo -e "${COLOR_GREEN}恢复成功${COLOR_PLAIN}，请手动启动 vanblog"
}

#====================================
# 7. 菜单和帮助模块
#====================================

# 显示使用帮助
help_show_usage() {
  echo "VanBlog 管理脚本使用方法: "
  echo "--------------------------------------------------------"
  echo "./vanblog.sh                            - 显示管理菜单"
  echo "./vanblog.sh install                    - 安装 VanBlog"
  echo "./vanblog.sh config                     - 修改 VanBlog 配置"
  echo "./vanblog.sh start                      - 启动 VanBlog"
  echo "./vanblog.sh stop                       - 停止 VanBlog"
  echo "./vanblog.sh restart                    - 重启 VanBlog"
  echo "./vanblog.sh update                     - 更新 VanBlog"
  echo "./vanblog.sh log                        - 查看 VanBlog 日志"
  echo "./vanblog.sh uninstall                  - 卸载 VanBlog"
  echo "./vanblog.sh reset_https                - 重置 https 设置"
  echo "./vanblog.sh backup                     - 备份 VanBlog"
  echo "./vanblog.sh restore                    - 恢复 VanBlog"
  echo "./vanblog.sh waline                     - 管理 Waline 用户"
  echo "./vanblog.sh waline_list                - 列出所有 Waline 用户"
  echo "./vanblog.sh waline_reset_admin         - 重置 Waline 管理员密码"
  echo "./vanblog.sh waline_delete_admin        - 删除 Waline 管理员"
  echo "./vanblog.sh waline_create_admin        - 创建 Waline 管理员"
  echo "--------------------------------------------------------"
  echo "./vanblog.sh update_script              - 更新此脚本"
  echo "--------------------------------------------------------"
}

# 显示主菜单
menu_show_main() {
  echo -e "
    ${COLOR_GREEN}VanBlog 管理脚本${COLOR_PLAIN} ${COLOR_RED}${VANBLOG_SCRIPT_VERSION}${COLOR_PLAIN}
    --- https://github.com/CornWorld/vanblog ---

    ${COLOR_GREEN}1.${COLOR_PLAIN}  安装 VanBlog
    ${COLOR_GREEN}2.${COLOR_PLAIN}  修改配置
    ${COLOR_GREEN}3.${COLOR_PLAIN}  启动服务
    ${COLOR_GREEN}4.${COLOR_PLAIN}  停止服务
    ${COLOR_GREEN}5.${COLOR_PLAIN}  重启服务
    ${COLOR_GREEN}6.${COLOR_PLAIN}  更新
    ${COLOR_GREEN}7.${COLOR_PLAIN}  查看日志
    ${COLOR_GREEN}8.${COLOR_PLAIN}  卸载
    ${COLOR_GREEN}9.${COLOR_PLAIN}  重置 https 设置
    ${COLOR_GREEN}10.${COLOR_PLAIN} 备份 VanBlog
    ${COLOR_GREEN}11.${COLOR_PLAIN} 恢复 VanBlog
    ${COLOR_GREEN}12.${COLOR_PLAIN} 管理 Waline 用户
    ————————————————-
    ${COLOR_GREEN}20.${COLOR_PLAIN} 更新此脚本
    ${COLOR_GREEN}30.${COLOR_PLAIN} 查看脚本使用说明
    ${COLOR_GREEN}0.${COLOR_PLAIN}  退出脚本
    "
  echo && read -ep "请输入选择 [0-30]: " num

  case "${num}" in
  0)
    exit 0
    ;;
  1)
    install_vanblog
    ;;
  2)
    config
    ;;
  3)
    start_vanblog
    ;;
  4)
    stop_vanblog
    ;;
  5)
    restart
    ;;
  6)
    update
    ;;
  7)
    show_log
    ;;
  8)
    uninstall_vanblog
    ;;
  9)
    reset_https
    ;;
  10)
    backup
    ;;
  11)
    restore
    ;;
  12)
    waline_show_menu
    ;;
  20)
    update_script
    ;;
  30)
    help_show_usage
    pause_before_menu
    ;;
  *)
    log_error "请输入正确的数字 [0-30]"
    pause_before_menu
    ;;
  esac
}

#====================================
# 8. 主函数和命令行处理
#====================================

# 处理命令行参数
handle_command_line() {
  if [[ $# > 0 ]]; then
    case $1 in
    "install")
      install_vanblog 0
      ;;
    "config")
      config 0
      ;;
    "start")
      start_vanblog 0
      ;;
    "stop")
      stop_vanblog 0
      ;;
    "restart")
      restart 0
      ;;
    "update")
      update 0
      ;;
    "log")
      show_log 0
      ;;
    "update_script")
      update_script 0
      ;;
    "uninstall")
      uninstall_vanblog 0
      ;;
    "reset_https")
      reset_https 0
      ;;
    "backup")
      backup 0
      ;;
    "restore")
      restore 0
      ;;
    "waline")
      waline_show_menu
      ;;
    "waline_list")
      waline_list_users 0
      ;;
    "waline_reset_admin")
      waline_reset_admin_password 0
      ;;
    "waline_delete_admin")
      waline_delete_admin 0
      ;;
    "waline_create_admin")
      waline_create_admin 0
      ;;
    *) 
      help_show_usage
      ;;
    esac
  else
    menu_show_main
  fi
}

# 主函数
main() {
  # 初始化检查
  util_check_system
  
  # 处理命令行参数
  handle_command_line "$@"
}

# 执行主函数
main "$@"
