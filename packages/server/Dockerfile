FROM node:18 as BUILD_IMAGE
ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /app
RUN yarn config set registry https://registry.npm.taobao.org
COPY . .
RUN yarn
RUN yarn build

FROM node:18
WORKDIR /usr/src/app
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone && \
  yarn config set registry https://registry.npm.taobao.org
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/dist ./
EXPOSE 3000
CMD [ "node", "main.js" ]
