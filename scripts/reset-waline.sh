#!/bin/bash

# 查找包含 "mongo" 标签的 Docker 容器 ID
container_id=$(docker ps | grep mongo | awk '{print $1}')

# 检查是否找到符合条件的容器
if [ -z "$container_id" ]; then
  echo "No running MongoDB container found."
  exit 1
fi

echo "Found MongoDB container with ID: $container_id"

# 定义要更新的密码和管理员邮箱
new_password='$2a$08$gW.CHW8prPnZMQynsqNM0uiC3wO6olz0EPzEZLCilu1qcyazwJvs2'
new_email='admin@admin.com'

# 创建一个 JavaScript 文件
cat <<EOF > updateAdmin.js
db.Users.updateMany(
  { type: 'administrator' },
  {
    \$set: {
      password: '$new_password',
      email: '$new_email'
    }
  }
);
EOF

# 将 JavaScript 文件复制到 MongoDB 容器中
docker cp updateAdmin.js "$container_id":/tmp/updateAdmin.js

# 在 MongoDB 容器中执行 JavaScript 文件
docker exec -it "$container_id" mongo waline /tmp/updateAdmin.js

# 删除本地的 JavaScript 文件
rm updateAdmin.js

echo "密码重置完成，请使用 admin@admin.com 和 123123 来登录 waline 试试看。"
