#!/bin/bash
echo '---------------------------------------------------'
echo "server host: $VAN_BLOG_SERVER_HOST"
echo "website host: $VAN_BLOG_WEBSITE_HOST"
echo "admin host: $VAN_BLOG_ADMIN_HOST"
echo '---------------------------------------------------'
sed -i "s/admin_host/$VAN_BLOG_ADMIN_HOST/g" /etc/nginx/conf.d/default.conf
sed -i "s/website_host/$VAN_BLOG_WEBSITE_HOST/g" /etc/nginx/conf.d/default.conf
sed -i "s/server_host/$VAN_BLOG_SERVER_HOST/g" /etc/nginx/conf.d/default.conf


nginx
