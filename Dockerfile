ARG USE_CHINA_MIRROR=false

# 基础构建镜像
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--openssl-legacy-provider"

# 配置 APT 源并安装必要的软件包
# 注意：必须先配置源，才能安装软件包
RUN set -ex && \
    # 配置软件源
    if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      echo "Using China mirror for apt" && \
      echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
      echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
      echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware" >> /etc/apt/sources.list && \
      echo "deb http://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list; \
    else \
      # 对于非中国用户，确保 apt 配置正确
      echo "deb http://deb.debian.org/debian bookworm main" > /etc/apt/sources.list && \
      echo "deb http://deb.debian.org/debian bookworm-updates main" >> /etc/apt/sources.list && \
      echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list; \
    fi && \
    # 更新包列表并安装最基础的软件包
    apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    # 安装其他必要软件包
    apt-get install -y --no-install-recommends \
      curl jq \
      tzdata caddy&& \
    # 设置时区
    ln -fs /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    # 配置 npm
    if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      npm config set registry https://registry.npmmirror.com; \
    fi && \
    npm config set ignore-scripts false && \
    npm install -g corepack@latest && \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    # 配置 pnpm
    if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      pnpm config set registry https://registry.npmmirror.com; \
    fi && \
    # 清理
    # apt-get remove -y curl jq && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 依赖构建阶段
FROM base AS deps
WORKDIR /app

# Ensure pnpm is available
RUN pnpm --version

COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm store prune && pnpm fetch

COPY package.json pnpm-workspace.yaml ./
COPY packages/admin/package.json ./packages/admin/
COPY packages/server/package.json ./packages/server/
COPY packages/website/package.json ./packages/website/
COPY packages/cli/package.json ./packages/cli/
COPY packages/waline/package.json ./packages/waline/

# Install dependencies and directly install latest caniuse-lite
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile && \
    pnpm add -g caniuse-lite@latest

# Admin 构建
FROM deps AS admin-builder
WORKDIR /app
# Use a more standard memory setting and keep legacy openssl provider
ENV NODE_OPTIONS="--max_old_space_size=4096 --openssl-legacy-provider"
ENV NODE_ENV="production"
# 禁用 husky
ENV HUSKY="0"
ENV HUSKY_SKIP_INSTALL="1"
ENV npm_config_husky_skip_install="1"
# 禁用 esbuild 服务
ENV ESBUILD_SKIP_DOWNLOAD="1"

# 复制 admin 包源码和所需依赖 
COPY packages/admin ./packages/admin

# 在 admin 目录中执行构建
RUN cd packages/admin && \
    # 确保使用生产模式构建
    export NODE_ENV=production && \
    # 安装依赖并跳过 husky 安装
    npm config set ignore-scripts true && \
    pnpm install --frozen-lockfile && \
    # 确保 vite.config.ts 文件存在且可读
    ls -la vite.config.ts && \
    echo "====== 开始构建 ======" && \
    # 直接使用 Vite 构建，确保使用正确的配置文件
    pnpm build && \
    # 检查构建结果
    ls -la dist || (echo "===== 构建失败，错误信息 =====" && \
    cat npm-debug.log 2>/dev/null || echo "没有找到 npm-debug.log" && \
    cat vite.log 2>/dev/null || echo "没有找到 vite.log" && exit 1)

# 确保 dist 目录存在并显示其内容
RUN test -d /app/packages/admin/dist && \
    echo "Admin 构建成功，文件列表：" && \
    ls -la /app/packages/admin/dist || \
    (echo "Admin 构建失败：dist 目录不存在" && exit 1)

# Server 构建
FROM deps AS server-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
COPY packages/server ./packages/server
RUN cd packages/server && \
    # 确保安装所有依赖，包括 @nestjs/core
    pnpm install --frozen-lockfile && \
    pnpm build && \
    # 创建生产环境依赖目录
    mkdir -p /prod/server && \
    cp -r dist package.json /prod/server/ && \
    cd /prod/server && \
    # 在生产目录中安装依赖，确保包含 @nestjs/core
    pnpm install --prod

# Website 构建
FROM deps AS website-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
ENV VAN_BLOG_ALLOW_DOMAINS="pic.mereith.com"
COPY packages/website ./packages/website
RUN cd packages/website && pnpm build

# CLI 构建
FROM deps AS cli-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
COPY packages/cli ./packages/cli
RUN cd packages/cli && \
    mkdir -p /prod/cli && \
    cp -r . /prod/cli/ && \
    cd /prod/cli && \
    pnpm install --prod

# Waline 构建
FROM deps AS waline-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
COPY packages/waline ./packages/waline
RUN cd packages/waline && \
    mkdir -p /prod/waline && \
    cp -r . /prod/waline/ && \
    cd /prod/waline && \
    pnpm install --prod

FROM base AS runner
WORKDIR /app

# 复制 CLI
WORKDIR /app/cli
COPY --from=cli-builder /prod/cli ./

# 复制 Waline
WORKDIR /app/waline
COPY --from=waline-builder /prod/waline ./

# 复制 Server（修改复制路径以使用 prod 目录）
WORKDIR /app/server
COPY --from=server-builder /prod/server/dist/src ./
COPY --from=server-builder /prod/server/node_modules ./node_modules

# 复制 Website
WORKDIR /app/website
COPY --from=website-builder /app/packages/website/.next/standalone ./
COPY --from=website-builder /app/packages/website/next.config.js ./packages/website/
COPY --from=website-builder /app/packages/website/public ./packages/website/public
COPY --from=website-builder /app/packages/website/package.json ./packages/website/
COPY --from=website-builder /app/packages/website/.next/static ./packages/website/.next/static

# 复制 Admin
WORKDIR /app/admin
COPY --from=admin-builder /app/packages/admin/dist ./
# 创建软链接确保资源可以通过 /admin 路径访问
RUN mkdir -p /app/admin/admin && \
    cd /app/admin/admin && \
    for item in $(ls -A /app/admin/ | grep -v admin); do \
        ln -s /app/admin/$item ./$item; \
    done

# 复制配置文件
WORKDIR /app
COPY caddyTemplate.json ./
COPY Caddyfile* ./
COPY scripts/start.js ./
COPY entrypoint.sh ./

# 环境变量设置
ENV NODE_ENV="production"
ENV PORT="3001"
# 确保服务器 URL 使用正确的本地地址
ENV VAN_BLOG_SERVER_URL="http://127.0.0.1:3000"
ENV NEXT_PUBLIC_VANBLOG_SERVER_URL="window.location.origin"
# 设置 CORS 配置，允许来自所有源的请求
ENV VAN_BLOG_CORS="true"
ENV VAN_BLOG_ALLOW_DOMAINS="pic.mereith.com"
ENV VAN_BLOG_DATABASE_URL="mongodb://mongo:27017/vanBlog?authSource=admin"
ENV EMAIL="vanblog@mereith.com"
ENV VAN_BLOG_WALINE_DB="waline"
# Debug mode configuration
ENV VAN_BLOG_DEBUG_MODE="false"
ENV VAN_BLOG_ADMIN_PROXY=""

# 版本信息
ARG CORN_VERSION
ENV VAN_BLOG_VERSION=${CORN_VERSION}

# 数据卷
VOLUME ["/app/static", "/var/log", "/root/.config/caddy", "/root/.local/share/caddy"]

# 暴露端口
EXPOSE 80

# 启动命令
ENTRYPOINT ["sh", "entrypoint.sh"]
