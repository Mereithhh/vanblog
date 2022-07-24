#!/bin/bash
# 这个build server 是第一次打包镜像拿数据的
# VAN_BLOG_BUILD_SERVER="https://www.mereith.com/"
# export VAN_BLOG_BUILD_SERVER="https://www.mereith.com/"
docker build --build-arg VAN_BLOG_BUILD_SERVER="https://www.mereith.com/" -t registry.cn-beijing.aliyuncs.com/mereith/van-blog:1.0.0 .
# docker push registry.cn-beijing.aliyuncs.com/mereith/van-blog:1.0.0


