#!/bin/bash

#========================================================
#   System Required: CentOS 7+ / Debian 8+ / Ubuntu 16+ /
#     Arch 未测试
#   Description: vanblog 安装脚本
#   Github: https://github.com/mereithhh/van-blog
#========================================================

VANBLOG_BASE_PATH="/var/vanblog"
VANBLOG_DATA_PATH="${VANBLOG_BASE_PATH}/data"
VANBLOG_DATA_PATH_RAW="\/var\/vanblog\/data"
VANBLOG_SCRIPT_VERSION="v0.3.2"

COMPOSE_URL="https://vanblog.mereith.com/docker-compose-template.yml"
SCRIPT_URL="https://vanblog.mereith.com/vanblog.sh"
GITHUB_URL="dn-dao-github-mirror.daocloud.io"
Get_Docker_URL="vanblog.mereith.com/docker.sh"
Get_Docker_Argu=" -s docker --mirror Aliyun"

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
plain='\033[0m'
export PATH=$PATH:/usr/local/bin

os_arch=""


delete_old_images() {
  echo -e "> 删除旧镜像"
  docker rmi -f mereith/van-blog-old
}

retag_old_images() {
  echo -e "> 重命名旧镜像"
  docker tag $(docker images | grep van-blog | awk '{print $3}') mereith/van-blog-old
  # docker tag $(docker images | grep vanblog | awk '{print $3}') mereith/van-blog-old
}

pre_check() {

  mkdir -p ${VANBLOG_BASE_PATH}

  command -v curl >/dev/null 2>&1
  if [[ $? != 0 ]]; then
    echo "未找到 curl 命令"
    exit 1
  fi

  # check root
  [[ $EUID -ne 0 ]] && echo -e "${red}错误: ${plain} 必须使用root用户运行此脚本！\n" && exit 1

  ## os_arch
  if [[ $(uname -m | grep 'x86_64') != "" ]]; then
    os_arch="amd64"
  elif [[ $(uname -m | grep 'i386\|i686') != "" ]]; then
    echo "不支持 386 平台"
    exit 1
  elif [[ $(uname -m | grep 'aarch64\|armv8b\|armv8l') != "" ]]; then
    os_arch="arm64"
  elif [[ $(uname -m | grep 'arm') != "" ]]; then
    echo "不支持 arm 平台，目前只支持 arm64、amd64"
    exit 1
  elif [[ $(uname -m | grep 's390x') != "" ]]; then
    echo "不支持 s390x 平台，目前只支持 arm64、amd64"
    exit 1
  elif [[ $(uname -m | grep 'riscv64') != "" ]]; then
    echo "不支持 riscv64 平台，目前只支持 arm64、amd64"
    exit 1
  fi

      ## China_IP
    if [[ -z "${CN}" ]]; then
        if [[ $(curl -m 10 -s https://ipapi.co/json | grep 'China') != "" ]]; then
            echo "根据ipapi.co提供的信息，当前IP可能在中国"
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

    if [[ -z "${CN}" ]]; then
        Get_Docker_URL="get.docker.com"
        GITHUB_URL="dn-dao-github-mirror.daocloud.io"
        Get_Docker_Argu=" "
        Docker_IMG="mereith\/van-blog:latest"
    else
        echo "使用中国镜像"
        Get_Docker_URL="vanblog.mereith.com/docker.sh"
        GITHUB_URL="github.com"
        Get_Docker_Argu=" -s docker --mirror Aliyun"
        Docker_IMG="registry.cn-beijing.aliyuncs.com\/mereith\/van-blog:latest"
    fi

}

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
  echo && echo -n -e "${yellow}* 按回车返回主菜单 *${plain}" && read temp
  show_menu
}

install_base() {
  (command -v git >/dev/null 2>&1 && command -v curl >/dev/null 2>&1 && command -v wget >/dev/null 2>&1 && command -v unzip >/dev/null 2>&1 && command -v getenforce >/dev/null 2>&1) ||
    (install_soft curl wget git unzip)
}

install_soft() {
  # Arch官方库不包含selinux等组件
  (command -v yum >/dev/null 2>&1 && yum makecache && yum install $* selinux-policy -y) ||
    (command -v apt >/dev/null 2>&1 && apt update && apt install $* selinux-utils -y) ||
    (command -v pacman >/dev/null 2>&1 && pacman -Syu $*) ||
    (command -v apt-get >/dev/null 2>&1 && apt-get update && apt-get install $* selinux-utils -y)
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

  command -v docker >/dev/null 2>&1
  if [[ $? != 0 ]]; then
    echo -e "正在安装 Docker"
    bash <(curl -sL https://${Get_Docker_URL}) ${Get_Docker_Argu} >/dev/null 2>&1
    systemctl enable docker.service
    systemctl start docker.service
    command -v docker >/dev/null 2>&1
    if [[ $? != 0 ]]; then
      echo -e "${red}Docker 安装失败${plain}"
      exit 0
    fi
    echo -e "${green}Docker${plain} 安装成功"
  fi


  if [[ $(docker compose | grep 'Usage') != "" ]]; then
    echo -e "未找到 docker-compose ，尝试使用 docker compose 创建别名"
    echo 'docker compose $@' > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    command -v docker-compose >/dev/null 2>&1
    if [[ $? != 0 ]]; then
      echo -e "${red}Docker Compose 别名创建失败${plain}，请手动安装 Docker Compose"
      exit 0
    fi
    echo -e "${green}Docker Compose${plain} 别名创建成功"
  fi

  config 0

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

selinux() {
  #判断当前的状态
  getenforce | grep '[Ee]nfor'
  if [ $? -eq 0 ]; then
    echo -e "SELinux是开启状态，正在关闭！"
    setenforce 0 &>/dev/null
    find_key="SELINUX="
    sed -ri "/^$find_key/c${find_key}disabled" /etc/selinux/config
  fi
}

config() {
  echo -e "> 修改配置"

  echo -e "正在下载编排文件"
  rm ${VANBLOG_BASE_PATH}/docker-compose-template.yaml >/dev/null 2>&1
  wget -t 2 --no-check-certificate -T 10 -O ${VANBLOG_BASE_PATH}/docker-compose-template.yaml ${COMPOSE_URL} >/dev/null 2>&1
  if [[ $? != 0 ]]; then
    echo -e "${red}下载脚本失败，请检查本机能否连接 ${COMPOSE_URL}${plain}"
    return 0
  fi

  # read -ep "请输入您想要安装的版本，默认不填为最新：" vanblog_version &&
  read -ep "请输入您的邮箱：" vanblog_email &&
    read -ep "请输入 http 端口（默认为 80）：" vanblog_http_port &&
    read -ep "请输入 https 端口（默认为 443）：" vanblog_https_port
  # echo "接下来您需要输入的域名对应着编排文件中的 VAN_BLOG_ALLOW_DOMAINS 变量（不含协议、不可包含通配符、多个域名通过英文逗号分隔）" &&
  # echo "如果用了 cdn 或图床，需要把图床或 cdn 的域名也加上" &&
  # read -ep "请输入您最终要绑定的域名（小写）:" vanblog_domains

  if [[ -z "${vanblog_email}" ]]; then
    echo -e "${red}除了端口外所有选项都不能为空${plain}"
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

  rm ${VANBLOG_BASE_PATH}/docker-compose.yaml >/dev/null 2>&1
  cp ${VANBLOG_BASE_PATH}/docker-compose-template.yaml ${VANBLOG_BASE_PATH}/docker-compose.yaml >/dev/null 2>&1
  sed -i "s/vanblog_data_path/${VANBLOG_DATA_PATH_RAW}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_email/${vanblog_email}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_http_port/${vanblog_http_port}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_https_port/${vanblog_https_port}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  # sed -i "s/vanblog_domains/${vanblog_domains}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  # sed -i "s/vanblog_version/${vanblog_version}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml
  sed -i "s/vanblog_image/${Docker_IMG}/g" ${VANBLOG_BASE_PATH}/docker-compose.yaml

  mkdir -p $VANBLOG_DATA_PATH

  echo -e "配置 ${green}修改成功，请稍等重启生效${plain}"

  restart

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

restart() {
  echo -e "> 重启服务"

  cd $VANBLOG_BASE_PATH
  docker-compose down -v
  docker-compose up -d
  if [[ $? == 0 ]]; then
    echo -e "${green}VanBlog 重启成功${plain}"
    echo -e "默认管理面板地址：${yellow}域名:站点访问端口/admin${plain}"
  else
    echo -e "${red}重启失败，可能是因为启动时间超过了两秒，请稍后查看日志信息${plain}"
  fi

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}
update() {
  echo -e "> 更新服务"
  retag_old_images

  cd $VANBLOG_BASE_PATH
  docker-compose pull
  docker-compose down -v
  docker-compose up -d
  if [[ $? == 0 ]]; then
    echo -e "${green}VanBlog 更新并重启成功${plain}"
    echo -e "默认管理面板地址：${yellow}域名:站点访问端口${plain}"
  else
    echo -e "${red}重启失败，可能是因为启动时间超过了两秒，请稍后查看日志信息${plain}"
  fi

  delete_old_images

  before_show_menu

}

reset_https() {
    echo -e "> 重置 https 设置（需要先启动 vanblog）"
    cd $VANBLOG_BASE_PATH && docker-compose exec vanblog node /app/cli/resetHttps.js
    before_show_menu
}

start_vanblog() {
  echo -e "> 启动 VanBlog"

  cd $VANBLOG_BASE_PATH && docker-compose up -d
  if [[ $? == 0 ]]; then
    echo -e "${green}VanBlog 启动成功${plain}"
  else
    echo -e "${red}启动失败，请稍后查看日志信息${plain}"
  fi

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

stop_vanblog() {
  echo -e "> 停止 VanBlog"

  cd $VANBLOG_BASE_PATH && docker-compose down -v
  if [[ $? == 0 ]]; then
    echo -e "${green}VanBlog 停止成功${plain}"
  else
    echo -e "${red}停止失败，请稍后查看日志信息${plain}"
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
  docker rmi -f mereith/van-blog:latest >/dev/null 2>&1
  clean_all

  if [[ $# == 0 ]]; then
    before_show_menu
  fi
}

clean_all() {
  if [ -z "$(ls -A ${VANBLOG_BASE_PATH})" ]; then
    rm -rf ${VANBLOG_BASE_PATH}
  fi
}

backup() {
  echo -e "> 备份 vanblog"
  name="vanblog-backup-$(date +"%Y%m%d%H%M%S").tar.gz"
  cd $VANBLOG_BASE_PATH && tar czvf $name ./data
  echo -e "${green}备份成功，文件名：${name}${plain} 所在路径：${VANBLOG_BASE_PATH}"
}

restore() {
  echo -e "> 恢复 vanblog"
  read -e -r -p "请输入备份文件名（含路径）: " path
  # 检测空
  if [ -z "$path" ]; then
    echo -e "${red}输入为空${plain}"
    exit 1
  fi
  # 停止 vanblog
  echo -e "> 停止 vanblog 中..."
  stop_vanblog
  # 覆盖解压到目标路径
  echo -e "> 覆盖解压到目标路径中..."
  tar xzvf $path -C $VANBLOG_BASE_PATH
  echo -e "${green}恢复成功${plain}，请手动启动 vanblog"
}

show_usage() {
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
  echo "--------------------------------------------------------"
  echo "./vanblog.sh update_script              - 更新此脚本"
  echo "--------------------------------------------------------"
}

show_menu() {
  echo -e "
    ${green}VanBlog 管理脚本${plain} ${red}${VANBLOG_SCRIPT_VERSION}${plain}
    --- https://github.com/mereithhh/van-blog ---
    ${green}1.${plain}  安装 VanBlog
    ${green}2.${plain}  修改配置
    ${green}3.${plain}  启动服务
    ${green}4.${plain}  停止服务
    ${green}5.${plain}  重启服务
    ${green}6.${plain}  更新
    ${green}7.${plain}  查看日志
    ${green}8.${plain}  卸载
    ${green}9.${plain}  重置 https 设置
    ${green}10.${plain} 备份 VanBlog
    ${green}11.${plain} 恢复 VanBlog
    ————————————————-
    ${green}20.${plain} 更新此脚本
    ${green}30.${plain} 查看脚本使用说明
    ${green}0.${plain}  退出脚本
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
  20)
    update_script
    ;;
  30)
    show_usage
    ;;
  *)
    echo -e "${red}请输入正确的数字 [0-8]${plain}"
    ;;
  esac
}

pre_check

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
  *) show_usage ;;
  esac
else
  show_menu
fi
