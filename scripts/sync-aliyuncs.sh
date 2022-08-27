version=v0.21.0
tag="docker.io/mereith/van-blog:${version}"
tag1="registry.cn-beijing.aliyuncs.com/mereith/van-blog:${version}"
tag2="registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest"
docker rmi ${tag}
docker pull ${tag}
docker tag ${tag} ${tag1}
docker push ${tag1}
docker tag ${tag1} ${tag2}
docker push ${tag2}
