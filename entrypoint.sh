#!/bin/sh
echo "欢迎使用 VanBlog 博客系统"

# Process Database Url
if ! [ $VAN_BLOG_DATABASE_URL ] || [ -z $VAN_BLOG_DATABASE_URL ]; then
  if [ $VAN_BLOG_DATABASE_USER ]; then
    authInfo="${VAN_BLOG_DATABASE_USER}"
    if [ $VAN_BLOG_DATABASE_PASSWD ]; then
      authInfo="$authInfo:$VAN_BLOG_DATABASE_PASSWD"
    fi
    authInfo="$authInfo@"
  fi
  export VAN_BLOG_DATABASE_URL="mongodb://${authInfo-""}${VAN_BLOG_DATABASE_HOST-"mongo"}:${VAN_BLOG_DATABASE_PORT-"27017"}/${VAN_BLOG_DATABASE_DBNAME-"vanBlog"}?authSource=admin"
fi

echo "mongo_url: ${VAN_BLOG_DATABASE_URL}"
sed "s/VAN_BLOG_EMAIL/${EMAIL}/g" /app/CaddyfileTemplate >/app/Caddyfile
caddy start --config /app/Caddyfile

cd /app/server && node main.js
