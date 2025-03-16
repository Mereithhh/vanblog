VERSION=''
re="\"(version)\": \"([^\"]*)\""

while read -r l; do
  if [[ $l =~ $re ]]; then
    value="${BASH_REMATCH[2]}"
    VERSION="$value"
  fi
done <package.json
                    tag="docker.io/cornworld/vanblog:v${VERSION}"
tag1="registry.cn-beijing.aliyuncs.com/cornworld/vanblog:v${VERSION}"
tag2="registry.cn-beijing.aliyuncs.com/cornworld/vanblog:latest"

echo v${VERSION}
tag="docker.io/cornworld/vanblog:v${VERSION}"
tag1="registry.cn-beijing.aliyuncs.com/cornworld/vanblog:v${VERSION}"
tag2="registry.cn-beijing.aliyuncs.com/cornworld/vanblog:latest"

docker pull ${tag}
docker tag ${tag} ${tag1}
docker tag ${tag1} ${tag2}
docker push ${tag2}
