#!/bin/sh
echo "============================================="
echo "欢迎使用 VanBlog 博客系统"
echo "Github: https://github.com/CornWorld/vanblog"
echo "Version(Env): ${VAN_BLOG_VERSION}"
echo "============================================="

# 显示网络信息
echo "系统网络信息:"
ip -4 addr show
echo "============================================="

# 确保 admin/admin 目录存在
if [ ! -d "/app/admin/admin" ]; then
    mkdir -p /app/admin/admin
    cd /app/admin/admin
    for item in $(ls -A /app/admin/ | grep -v admin); do
        ln -s /app/admin/$item ./$item
    done
    cd /app
fi
echo "============================================="

# 确保测试文件存在
echo "创建测试文件..."
echo "<html><body><h1>Static Test File</h1></body></html>" > /app/admin/test.html
echo "创建完成"
echo "============================================="

# 显示当前环境变量配置
echo "当前调试配置:"
echo "VAN_BLOG_DEBUG_MODE: ${VAN_BLOG_DEBUG_MODE}"
echo "VAN_BLOG_ADMIN_PROXY: ${VAN_BLOG_ADMIN_PROXY}"
echo "============================================="

# 导出 WEBSITE_HOST 环境变量，如果未设置则使用容器内部网络 IP
if [ -z "$WEBSITE_HOST" ] || [ "$WEBSITE_HOST" = "0.0.0.0" ]; then
    # 获取容器 IP 地址（使用 hostname -i 的第一个非 127.0.0.1 地址）
    CONTAINER_IP=$(hostname -i | awk '{print $1}')
    # 检查是否获取到了有效的非环回地址
    if [ "$CONTAINER_IP" = "127.0.0.1" ] || [ "$CONTAINER_IP" = "::1" ] || [ "$CONTAINER_IP" = "0.0.0.0" ]; then
        # 尝试使用 ip 命令获取非环回地址
        CONTAINER_IP=$(ip -4 addr | grep -v '127.0.0.1' | grep 'inet' | grep -v 'docker' | awk '{print $2}' | cut -d/ -f1 | head -n 1)
        # 如果仍然获取不到，默认使用 127.0.0.1
        if [ -z "$CONTAINER_IP" ]; then
            CONTAINER_IP="127.0.0.1"
        fi
    fi
    export WEBSITE_HOST="$CONTAINER_IP"
    echo "设置 WEBSITE_HOST 为容器 IP: $WEBSITE_HOST"
else
    echo "使用配置的 WEBSITE_HOST: $WEBSITE_HOST"
fi

# 根据调试模式选择合适的 Caddyfile
ACTIVE_CADDYFILE="/app/Caddyfile"

if [ "${VAN_BLOG_DEBUG_MODE}" = "true" ] && [ -n "${VAN_BLOG_ADMIN_PROXY}" ]; then
    echo "检测到调试模式，使用开发版 Caddyfile"
    
    # 检查开发版 Caddyfile 是否存在
    if [ -f "/app/Caddyfile.dev" ]; then
        # 创建临时 Caddyfile 并替换代理地址
        cp /app/Caddyfile.dev /app/Caddyfile.active
        
        # 提取代理URL中的协议、主机和端口部分 (删除任何路径)
        # 例如，从 http://host.docker.internal:3000/admin/ 提取 http://host.docker.internal:3000
        PROXY_SCHEME=$(echo "${VAN_BLOG_ADMIN_PROXY}" | grep -o 'http[s]*:\/\/')
        PROXY_HOST=$(echo "${VAN_BLOG_ADMIN_PROXY}" | sed 's|^http[s]*://||' | cut -d'/' -f1)
        
        if [ -n "${PROXY_SCHEME}" ] && [ -n "${PROXY_HOST}" ]; then
            CLEAN_PROXY="${PROXY_SCHEME}${PROXY_HOST}"
            echo "提取的代理地址: ${CLEAN_PROXY}"
        else
            CLEAN_PROXY="${VAN_BLOG_ADMIN_PROXY}"
            echo "无法解析代理地址，使用原始值: ${CLEAN_PROXY}"
        fi
        
        # 使用 sed 替换代理地址占位符
        sed -i "s|ADMIN_PROXY_PLACEHOLDER|${CLEAN_PROXY}|g" /app/Caddyfile.active
        ACTIVE_CADDYFILE="/app/Caddyfile.active"
        echo "已配置开发版 Caddyfile，代理到: ${CLEAN_PROXY}"
    else
        echo "警告: 找不到 Caddyfile.dev，将使用默认 Caddyfile"
    fi
else
    echo "使用生产环境 Caddyfile"
fi

# 显示当前使用的 Caddyfile
echo "正在使用以下 Caddyfile:"
cat ${ACTIVE_CADDYFILE}
echo "============================================="

# 启动 Caddy
echo "使用 ${ACTIVE_CADDYFILE} 启动 Caddy"
caddy start --config ${ACTIVE_CADDYFILE}

# 等待 Caddy 启动
sleep 2

# 启动应用程序
echo "启动 VanBlog 博客系统..."
node start.js
