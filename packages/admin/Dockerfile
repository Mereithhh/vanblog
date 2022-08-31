FROM circleci/node:latest-browsers as BUILD_IMAGE
ENV NODE_OPTIONS='--max_old_space_size=4096 --openssl-legacy-provider'
ENV EEE=production
WORKDIR /app
USER root
COPY ./ ./
# RUN rm yarn.lock
RUN yarn global add umi
RUN yarn
RUN yarn build

FROM nginx
WORKDIR /usr/share/nginx/html/
RUN mkdir admin
COPY --from=BUILD_IMAGE /app/dist/ ./admin/
COPY default.conf /etc/nginx/conf.d/
EXPOSE 3002
