# 具体每个服务的去看 packages 里面的 Dockerfile
# 这个是 all in one 的。
FROM node:18 as ADMIN_BUILDER
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /usr/src/app
# RUN yarn config set registry https://registry.npm.taobao.org
COPY ./packages/admin/package.json ./
RUN yarn
COPY ./packages/admin/ ./
ENV NODE_OPTIONS='--max_old_space_size=4096 --openssl-legacy-provider'
# RUN sed -i 's/\/assets/\/admin\/assets/g' dist/admin/index.html
ENV EEE=production
RUN yarn build

FROM node:18 as SERVER_BUILDER
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /app
RUN yarn config set registry https://registry.npm.taobao.org
COPY ./packages/server/ .
RUN yarn
RUN yarn build

FROM node:16-alpine AS WEBSITE_DEPS
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./packages/website/package.json ./packages/website/yarn.lock* ./packages/website/package-lock.json* ./packages/website/pnpm-lock.yaml* ./
RUN yarn

FROM node:16-alpine AS WEBSITE_BUILDER
WORKDIR /app
COPY --from=WEBSITE_DEPS /app/node_modules ./node_modules
COPY ./packages/website/ .
ENV isBuild=t
ENV VAN_BLOG_REVALIDATE_TIME=10
ENV VAN_BLOG_ALLOW_DOMAINS "pic.mereith.com"
ARG VAN_BLOG_BUILD_SERVER
ENV VAN_BLOG_SERVER_URL ${VAN_BLOG_BUILD_SERVER}
RUN yarn build

#运行容器
FROM node:18 AS RUNNER
WORKDIR /app
# 安装 nginx
RUN apt update &&  apt install nginx -y
# 设置时区
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone && \
  yarn config set registry https://registry.npm.taobao.org
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
ENV NODE_ENV production
ENV VAN_BLOG_SERVER_URL "http://127.0.0.1:3000"
ENV VAN_BLOG_REVALIDATE_TIME 10
ENV VAN_BLOG_ALLOW_DOMAINS "pic.mereith.com"
# 复制静态文件
WORKDIR /usr/share/nginx/html/
COPY --from=ADMIN_BUILDER /usr/src/app/dist/ ./admin/
COPY default.conf /etc/nginx/sites-available/default
# 复制入口文件
WORKDIR /app
COPY ./entrypoint.sh ./
ENV PORT 3001
EXPOSE 80
ENTRYPOINT [ "bash","entrypoint.sh" ]
# CMD [ "entrypoint.sh" ]
