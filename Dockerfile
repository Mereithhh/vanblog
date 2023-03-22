# 具体每个服务的去看 packages 里面的 Dockerfile
# 这个是 all in one 的。
FROM  node:18-alpine as BUILDER
ENV NODE_OPTIONS='--max_old_space_size=4096'
ENV EEE=production
WORKDIR /app
USER root
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
COPY ./ ./
RUN npm install --global pnpm
RUN pnpm config set network-timeout 600000 -g
RUN pnpm config set registry https://registry.npmjs.org -g
RUN pnpm config set fetch-retries 20 -g
RUN pnpm config set fetch-timeout 600000 -g
RUN pnpm i
ENV isBuild=t
ARG VAN_BLOG_BUILD_SERVER
ENV VAN_BLOG_SERVER_URL ${VAN_BLOG_BUILD_SERVER}
ARG VAN_BLOG_VERSIONS
ENV VAN_BLOG_VERSION ${VAN_BLOG_VERSIONS}
# RUN sed -i 's/\/assets/\/admin\/assets/g' dist/admin/index.html
RUN pnpm build

#运行容器
FROM node:18-alpine AS RUNNER
WORKDIR /app
RUN  apk add --no-cache --update tzdata caddy nss-tools \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone \
  && apk del tzdata
RUN npm install --global pnpm
RUN pnpm config set network-timeout 600000 -g
RUN pnpm config set registry https://registry.npmmirror.com -g
RUN pnpm config set fetch-retries 20 -g
RUN pnpm config set fetch-timeout 600000 -g
# 复制根部 node_modules
COPY --from=BUILDER /app/node_modules ./node_modules
# 复制waline
WORKDIR /app/waline
COPY --from=BUILDER /app/packages/waline/ ./
# 复制 server
WORKDIR /app/server
COPY --from=BUILDER /app/packages/server/node_modules ./node_modules
COPY --from=BUILDER /app/packages/server/dist/ ./
# 复制 website
WORKDIR /app/website
COPY --from=BUILDER /app/packages/website/node_modules ./node_modules
COPY --from=BUILDER /app/packages/website/next.config.js ./
COPY --from=BUILDER /app/packages/website/public ./
COPY --from=BUILDER /app/packages/website/package.json ./
COPY --from=BUILDER  /app/packages/website/.next/standalone ./
COPY --from=BUILDER  /app/packages/website/.next/static ./.next/static
ENV NODE_ENV production
ENV VAN_BLOG_SERVER_URL "http://127.0.0.1:3000"
ENV VAN_BLOG_ALLOW_DOMAINS "pic.mereith.com"
ENV VAN_BLOG_DATABASE_URL "mongodb://mongo:27017/vanBlog?authSource=admin"
ENV EMAIL "vanblog@mereith.com"
ENV VAN_BLOG_WALINE_DB "waline"
# 复制静态文件
WORKDIR /app/admin
COPY --from=BUILDER /app/packages/admin/dist/ ./
COPY CaddyfileTemplate /app/CaddyfileTemplate
# 复制入口文件
WORKDIR /app
COPY ./entrypoint.sh ./
ENV PORT 3001
# 增加版本
ARG VAN_BLOG_VERSIONS
ENV VAN_BLOG_VERSION ${VAN_BLOG_VERSIONS}
VOLUME /app/static
VOLUME /var/log
VOLUME /root/.config/caddy
VOLUME /root/.local/share/caddy

EXPOSE 80
ENTRYPOINT [ "sh","entrypoint.sh" ]
# CMD [ "entrypoint.sh" ]
