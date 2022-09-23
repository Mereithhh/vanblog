#!/bin/sh
echo "欢迎使用 VanBlog 博客系统"
echo "allow_domains: ${VAN_BLOG_ALLOW_DOMAINS}"
echo "mongo_url: ${VAN_BLOG_DATABASE_URL}"
sed "s/VAN_BLOG_EMAIL/${EMAIL}/g" /app/CaddyfileTemplate >/app/Caddyfile
caddy start --config /app/Caddyfile

cd /app/server && node main.js
