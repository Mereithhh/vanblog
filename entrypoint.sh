#!/bin/bash
nginx
nohup node /app/website/server.js -p 3001 > /var/log/vanblog-website.log 2>&1 &
# nohup node /app/server/main.js  > /var/log/vanblog-server.log 2>&1 &
node /app/server/main.js 


