# 基础构建镜像
FROM node:20-alpine as base
RUN apk add --no-cache python3 make g++ git
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate
RUN pnpm config set registry=https://registry.npmjs.org
RUN pnpm config set network-timeout=600000
RUN pnpm config set fetch-retries=5
RUN pnpm config set fetch-timeout=600000

# Admin 构建
FROM base as admin-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/admin/package.json ./packages/admin/
RUN pnpm install --frozen-lockfile --filter @vanblog/admin
COPY packages/admin ./packages/admin
RUN cd packages/admin && pnpm build

# Server 构建
FROM base as server-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --filter @vanblog/server
COPY packages/server ./packages/server
RUN cd packages/server && pnpm build

# Website 构建
FROM base as website-builder
WORKDIR /app
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV NODE_ENV="production"
ENV VAN_BLOG_ALLOW_DOMAINS="pic.mereith.com"
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/website/package.json ./packages/website/
RUN pnpm install --frozen-lockfile --filter @vanblog/theme-default
COPY packages/website ./packages/website
RUN cd packages/website && pnpm build

# 最终运行镜像
FROM node:20-alpine as runner
WORKDIR /app

# 安装必要的系统工具
RUN apk add --no-cache --update \
    tzdata \
    caddy \
    nss-tools \
    libwebp-tools \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# 设置 pnpm
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate
RUN pnpm config set registry=https://registry.npmjs.org

# 复制 CLI 工具
WORKDIR /app/cli
COPY packages/cli/package.json ./
RUN pnpm install --frozen-lockfile
COPY packages/cli ./

# 安装 Waline
WORKDIR /app/waline
COPY packages/waline/package.json ./
RUN pnpm install --frozen-lockfile
COPY packages/waline ./

# 复制 Server
WORKDIR /app/server
COPY --from=server-builder /app/packages/server/dist/src ./
COPY --from=server-builder /app/packages/server/node_modules ./node_modules

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

# 复制配置文件
WORKDIR /app
COPY caddyTemplate.json ./
COPY scripts/start.js ./
COPY entrypoint.sh ./

# 环境变量设置
ENV NODE_ENV="production"
ENV PORT="3001"
ENV VAN_BLOG_SERVER_URL="http://127.0.0.1:3000"
ENV VAN_BLOG_ALLOW_DOMAINS="pic.mereith.com"
ENV VAN_BLOG_DATABASE_URL="mongodb://mongo:27017/vanBlog?authSource=admin"
ENV EMAIL="vanblog@mereith.com"
ENV VAN_BLOG_WALINE_DB="waline"

# 版本信息
ARG CORN_VERSION
ENV VAN_BLOG_VERSION=${CORN_VERSION}

# 数据卷
VOLUME ["/app/static", "/var/log", "/root/.config/caddy", "/root/.local/share/caddy"]

# 暴露端口
EXPOSE 80

# 启动命令
ENTRYPOINT ["sh", "entrypoint.sh"]
