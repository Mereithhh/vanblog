::: tip 温馨提示

VanBlog 现在支持一键脚本部署了。经过测试，宝塔也可以通过一键脚本进行部署。

建议您通过[一键脚本部署](../guide/get-started.md#一键脚本部署)，这样后期可以通过脚本一键升级会方便一些。

如果您想通过图形化部署，请看下文。

宝塔面板自带的 nginx 会占用 80 端口，所以以下教程用的 8880 端口，如果您想关闭 nginx，可以输入 `nginx -s stop`，并把端口映射改为默认的 80 和 443。

否则默认需要您反代 `8880` 端口。

:::

你也可以通过宝塔面板图形化操作部署 VanBlog，具体步骤如下：

### 安装依赖

进入宝塔后台，点击侧边栏 `Docker` ，点击安装按钮。

![安装 Docker](https://www.mereith.com/static/img/ea11d7d7f754edf2303c710071ce540b.clipboard-2022-09-02.png)

耐心等一会，宝塔会自动安装好这些：

![等待安装完成](https://www.mereith.com/static/img/e5b15c94a2a0d38c1f9b9b4ca1dcc8dd.clipboard-2022-09-02.png)

### 添加 docker-compose 模板

如图所示，添加 `docker-compose` 模板，模板名称为 `vanblog`，描述随意。

![安装 Docker Compose](https://www.mereith.com/static/img/d4a56888230de79cc31bbeb603578e02.clipboard-2022-09-03.png)

![等待安装完成](https://www.mereith.com/static/img/9a207817805fb0f0a4b65a85edb699b4.clipboard-2022-09-02.png)

模板内容请复制下面的代码，注意需要按注释修改 `EMAIL` 为你的邮箱：

```yaml
version: '3'

services:
  vanblog:
    # 阿里云镜像源
    # image: registry.cn-beijing.aliyuncs.com/mereith/van-blog:latest
    image: mereith/van-blog:latest
    restart: always
    environment:
      TZ: 'Asia/Shanghai'
      # 邮箱地址，用于自动申请 https 证书
      EMAIL: 'someone@mereith.com'
    volumes:
      # 图床文件的存放地址，按需修改。
      - /var/vanblog/data/static:/app/static
      # 日志文件
      - /var/vanblog/log:/var/log
      # Caddy 配置存储
      - /var/vanblog/caddy/config:/root/.config/caddy
      # Caddy 证书存储
      - /var/vanblog/caddy/data:/root/.local/share/caddy
    ports:
      # 前面的是映射到宿主机的端口号，该端口的话改前面的。
      - 8880:80
      - 4443:443
  mongo:
    # 某些机器不支持 avx 会报错，所以默认用 v4 版本。有的话用最新的。
    image: mongo:4.4.16
    restart: always
    environment:
      TZ: 'Asia/Shanghai'
    volumes:
      - /var/vanblog/data/mongo:/data/db
```

所有可用的环境变量详见 [参考 → 环境变量](../reference/env.md)

### 启动

如下图所示，新建 `Compose` 项目，名称写 `vanblog`，模板选择刚刚创建的。

![创建项目](https://www.mereith.com/static/img/920dd318b4073cc793c11caa4700d7b9.clipboard-2022-09-02.png)

然后会弹出窗口拉取镜像启动容器：

![创建日志](https://www.mereith.com/static/img/193a1acb5f783923ffc83dc67de6fced.clipboard-2022-09-02.png)

启动完毕后，请 [完成初始化](./init.md)。

### 调整 nginx 缓存

根据群友反应，宝塔的 nginx 配置反代后经常会出现缓存问题，具体表现为在后台修改后，内容不能及时反映到前台页面上。

这时需要设置手动在宝塔 nginx 设置一个较短的缓存时间即可（比如1分钟），不然默认的缓存时间会很长。

如果宝塔已有项目较少，还是推荐使用 [nginx-proxy-manager](https://nginxproxymanager.com/) 进行反代管理会更方便。

### 常见问题

::: info 部署失败

请查看容器的日志进行排查。

:::

::: info 端口被占用

需要修改编排文件里的端口映射，改为非常用端口。

![修改端口](https://pic.mereith.com/img/47a03229d46e9120ad1e7bf1abf4b504.clipboard-2022-09-14.png)

如果你只部署 VanBlog ，并想关闭 Ngnix ，请输入以下命令关闭 Ngnix:

```bash
nginx -s stop
```

:::
