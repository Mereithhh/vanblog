#!/bin/bash
yarn docs:build
docker build -t registry.cn-beijing.aliyuncs.com/mereith/van-blog:docs ./docs && docker push  registry.cn-beijing.aliyuncs.com/mereith/van-blog:docs


