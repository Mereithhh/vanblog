FROM nginx
WORKDIR /app
COPY default.conf /etc/nginx/conf.d/
COPY entrypoint.sh ./
EXPOSE 80
ENV VAN_BLOG_SERVER_HOST=server:3000
ENV VAN_BLOG_WEBSITE_HOST=website:3001
ENV VAN_BLOG_ADMIN_HOST=admin:3002
CMD [ "sh","/app/entrypoint.sh"]
