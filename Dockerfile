# 具体每个服务的去看 packages 里面的 Dockerfile
# 这个是 all in one 的。
FROM  circleci/node:latest-browsers as ADMIN_BUILDER
ENV NODE_OPTIONS='--max_old_space_size=4096 --openssl-legacy-provider'
ENV EEE=production
WORKDIR /app
USER root
COPY ./packages/admin/ ./
# RUN yarn config set registry https://registry.npmmirror.com
RUN  yarn config set network-timeout 600000
RUN yarn global add umi
RUN yarn
# RUN sed -i 's/\/assets/\/admin\/assets/g' dist/admin/index.html
RUN yarn build

FROM node:18 as SERVER_BUILDER
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /app
COPY ./packages/server/ .
RUN  yarn config set network-timeout 600000
RUN yarn
RUN yarn build

FROM node:16-alpine AS WEBSITE_DEPS
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./packages/website/package.json ./packages/website/yarn.lock* ./packages/website/package-lock.json* ./packages/website/pnpm-lock.yaml* ./
RUN yarn config set network-timeout 60000 -g
# RUN yarn config set registry https://registry.npmmirror.com -g
RUN yarn

FROM node:16-alpine AS WEBSITE_BUILDER
WORKDIR /app
COPY --from=WEBSITE_DEPS /app/node_modules ./node_modules
COPY ./packages/website/ .
ENV isBuild=t
ENV VAN_BLOG_ALLOW_DOMAINS "pic.mereith.com"
ARG VAN_BLOG_BUILD_SERVER
ENV VAN_BLOG_SERVER_URL ${VAN_BLOG_BUILD_SERVER}
ARG VAN_BLOG_VERSIONS
ENV VAN_BLOG_VERSION ${VAN_BLOG_VERSIONS}
RUN yarn config set network-timeout 60000 -g
RUN yarn config set registry https://registry.npmmirror.com -g
RUN yarn build


#运行容器
FROM node:alpine AS RUNNER
WORKDIR /app
RUN  apk add --no-cache --update tzdata caddy nss-tools \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata
RUN  yarn config set network-timeout 600000
# 安装 waline
WORKDIR /app/waline
COPY ./packages/waline/ ./
RUN yarn && yarn cache clean
# 复制 server
WORKDIR /app/server
COPY --from=SERVER_BUILDER /app/node_modules ./node_modules
COPY --from=SERVER_BUILDER /app/dist ./
# 复制 website
WORKDIR /app/website
COPY --from=WEBSITE_BUILDER /app/next.config.js ./
COPY --from=WEBSITE_BUILDER /app/public ./public
COPY --from=WEBSITE_BUILDER /app/package.json ./package.json
COPY --from=WEBSITE_BUILDER  /app/.next/standalone ./
COPY --from=WEBSITE_BUILDER  /app/.next/static ./.next/static
RUN cd  /app/website &&  yarn add sharp && yarn cache clean --all && cd ..
ENV NODE_ENV production
ENV VAN_BLOG_SERVER_URL "http://127.0.0.1:3000"
ENV VAN_BLOG_ALLOW_DOMAINS "pic.mereith.com"
ENV VAN_BLOG_DATABASE_URL "mongodb://mongo:27017/vanBlog?authSource=admin"
ENV EMAIL "vanblog@mereith.com"
ENV VAN_BLOG_WALINE_DB "waline"
# 复制静态文件
WORKDIR /app/admin
COPY --from=ADMIN_BUILDER /app/dist/ ./
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
