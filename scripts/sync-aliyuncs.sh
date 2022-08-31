VERSION=''
re="\"(version)\": \"([^\"]*)\""

while read -r l; do
  if [[ $l =~ $re ]]; then
    value="${BASH_REMATCH[2]}"
    VERSION="$value"
  fi
done <package.json

echo v${VERSION}
tag="docker.io/mereith/van-blog:v${VERSION}"
tag1="registry.cn-beijing.aliyuncs.com/mereith/van-blog:v${VERSION}"
tag2="registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest"
docker rmi ${tag}
docker pull ${tag}
docker tag ${tag} ${tag1}
docker push ${tag1}
docker tag ${tag1} ${tag2}
docker push ${tag2}
