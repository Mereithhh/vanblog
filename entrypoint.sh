#!/bin/sh

# start server
cd /app/server/
node main.js  > /var/log/vanblog-server.log 2>&1 &
# start website
cd /app/website
node server.js -p 3001 > /var/log/vanblog-website.log 2>&1 &
# 开启 nginx
nginx
