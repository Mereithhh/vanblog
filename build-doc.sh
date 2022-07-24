#!/bin/bash
yarn docs:build
docker build -t registry.cn-beijing.aliyuncs.com/mereith/van-blog:docs:1.0.0 ./docs
docker push  registry.cn-beijing.aliyuncs.com/mereith/van-blog:docs:1.0.0

