#!/bin/sh
echo "============================================="
echo "欢迎使用 VanBlog 博客系统"
echo "Github: https://github.com/mereithhh/vanblog"
echo "Version(Env): ${VAN_BLOG_VERSION}"
echo "============================================="


sed "s/VAN_BLOG_EMAIL/${EMAIL}/g" /app/caddyTemplate.json >/app/caddy.json
caddy start --config /app/caddy.json

node start.js
