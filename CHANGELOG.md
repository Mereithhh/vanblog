# Changelog

## [0.54.0](https://github.com/Mereithhh/vanblog/compare/v0.53.0...v0.54.0) (2023-06-27)

### 🐛 Bug Fixes | Bug 修复

- icp 备案文案错误 ([29d0e09](https://github.com/Mereithhh/vanblog/commit/29d0e09606868a4bd610f69e86f9962c8b8005cf))
- public api 文章字段过滤错误 ([fdbd26a](https://github.com/Mereithhh/vanblog/commit/fdbd26a8e1228e77cf51fa345baad5ac6432d9ac))

### ✨ Features | 新功能

- 增加一键脚本来关闭 https 重定向 ([ea41ea8](https://github.com/Mereithhh/vanblog/commit/ea41ea8535ddaaaebc5052951d34e45f6dc31d83))
- 文章或草稿支持批量导出markdown或批量删除操作 [#296](https://github.com/Mereithhh/vanblog/issues/296) ([7dec2f8](https://github.com/Mereithhh/vanblog/commit/7dec2f8f98a8c67f34ba5b8755b9e8fde08e9c21))
- 文章支持锚点定位 [#309](https://github.com/Mereithhh/vanblog/issues/309) ([0ab9fdb](https://github.com/Mereithhh/vanblog/commit/0ab9fdbf31246712a6fad07066d975eb7711de4f))
- 文章标题过长自动截断 [#291](https://github.com/Mereithhh/vanblog/issues/291) ([32df7cd](https://github.com/Mereithhh/vanblog/commit/32df7cd1153278cd8ee99fc1992310300a856dc5))
- 本地图床复制和插入markdown链接改为相对url [#303](https://github.com/Mereithhh/vanblog/issues/303) ([3290dec](https://github.com/Mereithhh/vanblog/commit/3290dece37a3f331d44ac7ec62e9bfd416c6ab59))
- 本地编辑器缓存增加时间戳校验，只有比服务器更新时才会采用本地缓存。另外默认关闭本地缓存，可在编辑器右上角偏好设置中开启 ([7010d32](https://github.com/Mereithhh/vanblog/commit/7010d3217d8aaa5288169995fadfc9801df644b3))
- 系统日志查看功能 ([872930d](https://github.com/Mereithhh/vanblog/commit/872930d75a63faa2b82e12cdadc6327723acc9e6))

### 🚀 Chore | 构建/工程依赖/工具

- 一键脚本增加中国ip检测，分流国内外下载地址 ([a352ad7](https://github.com/Mereithhh/vanblog/commit/a352ad7fd301efba467fe6cdf10de62734278056))
- 一键脚本增加备份恢复功能 ([752f467](https://github.com/Mereithhh/vanblog/commit/752f4670500a8596c81fcc770e35cb686ebefc8f))
- 优化一键脚本 ([784a414](https://github.com/Mereithhh/vanblog/commit/784a41408b909541766a2f2c880b6ed721a1665c))

### ✏️ Documentation | 文档

- 更新备份恢复文档和脚本演示图片 ([f07fc18](https://github.com/Mereithhh/vanblog/commit/f07fc189becf843a31d039658aa041a7f44cd981))
- 更新批量操作相关文档 ([760fce9](https://github.com/Mereithhh/vanblog/commit/760fce953ae721140ecc5b1ee569b146f1543a42))
- 更新文档 ([9fefb8e](https://github.com/Mereithhh/vanblog/commit/9fefb8e2fb1ac998df2f7916cb7a019b8ff7984c))
- 更新文档 ([104a93f](https://github.com/Mereithhh/vanblog/commit/104a93f84810b43628d47ffcb525e4261d750781))
- 更新文档 ([005a246](https://github.com/Mereithhh/vanblog/commit/005a2464a39cd891d58acaf16d81328b89cf6099))
- 更新样例 [#295](https://github.com/Mereithhh/vanblog/issues/295) ([3ca4b7a](https://github.com/Mereithhh/vanblog/commit/3ca4b7a79c4a6f96f39630faed674f74420809a1))
- 更新系统日志文档 ([51e21d8](https://github.com/Mereithhh/vanblog/commit/51e21d8d41a267ab47d7c6bf6827dbdd6aabe058))
- 更新谁在使用 ([8d91726](https://github.com/Mereithhh/vanblog/commit/8d91726986d1c2e4ffb0d3ce49ee7b808c062830))
- 更新谁在使用 [#307](https://github.com/Mereithhh/vanblog/issues/307) ([e085035](https://github.com/Mereithhh/vanblog/commit/e08503541d18284289cd5c399bc6e58cb2a8dc13))
- 更新谁在使用 [#315](https://github.com/Mereithhh/vanblog/issues/315) ([f52aa07](https://github.com/Mereithhh/vanblog/commit/f52aa07e12955bab30c207aa7ddd8dda4ad8b1a4))
- 更新谁在使用 [#317](https://github.com/Mereithhh/vanblog/issues/317) ([3fbca1c](https://github.com/Mereithhh/vanblog/commit/3fbca1c6ef94ef16c7ba7cd1446f8163907d8a92))
- 更新谁在使用 [#320](https://github.com/Mereithhh/vanblog/issues/320) ([fb2097b](https://github.com/Mereithhh/vanblog/commit/fb2097b4926d4bbdcd2631410041683b3ea3a979))

## [0.53.0](https://github.com/Mereithhh/vanblog/compare/v0.52.0...v0.53.0) (2023-05-05)

### 🐛 Bug Fixes | Bug 修复

- 分析面板中分类数量不准确 ([d8ebe73](https://github.com/Mereithhh/vanblog/commit/d8ebe73d32e0a849d559f0929cebf2c7f2be9a3b))

### 💄 Styles | 风格

- z-index 使用保守的数值 ([80fe17c](https://github.com/Mereithhh/vanblog/commit/80fe17c879b9f839ba54fcba06a7580e835ec865))
- 扩大pc导航栏可点击范围，优化体验 ([50ac020](https://github.com/Mereithhh/vanblog/commit/50ac0206cea8f65d7bfb0ac1f3e059406b2f2109))

### ✨ Features | 新功能

- **admin:** 管理后台文章和草稿列表页的导入按钮可以多选导入了 ([4690cbf](https://github.com/Mereithhh/vanblog/commit/4690cbfd97a488d7edab409c89bd9d017527be2b))
- gif 格式图片上传 & 修复某些情况下上传图片报错 [#285](https://github.com/Mereithhh/vanblog/issues/285) ([43f84e6](https://github.com/Mereithhh/vanblog/commit/43f84e63a48ab3b483bc58ea5c5ab75bc4cffcc8))
- markdown 内允许 script（虽然后台预览无效但前台生效） 和 iframe ([24b7e5f](https://github.com/Mereithhh/vanblog/commit/24b7e5fda5955a107183f6e9d27699881805f73c))
- 前台编辑按钮登录态判断优化 ([de45b90](https://github.com/Mereithhh/vanblog/commit/de45b9069285d91f0539a2b6bac1d55f87de9b41))
- 增加一些类名，便于进行自定义 CSS ([20d7075](https://github.com/Mereithhh/vanblog/commit/20d7075174fe4e17010e92cc1f5b4458bc996706))
- 文章卡片标题和子标题增加类名 ([b97289b](https://github.com/Mereithhh/vanblog/commit/b97289bdfd15ee574901bbae69a78252f1b148eb))
- 登录时，前台展示编辑按钮 [#234](https://github.com/Mereithhh/vanblog/issues/234) ([6af8a1b](https://github.com/Mereithhh/vanblog/commit/6af8a1be9586f2cbd3d509ee5d31a96e1553e4af))

### ✏️ Documentation | 文档

- 更新前台编辑按钮相关文档 ([bff5ded](https://github.com/Mereithhh/vanblog/commit/bff5ded1df1302c6858e9576b7a9b2115d861d60))
- 更新谁在使用 [#286](https://github.com/Mereithhh/vanblog/issues/286) ([ee58831](https://github.com/Mereithhh/vanblog/commit/ee58831f65ef311fceb5df94ca154472e4fb9cdf))

## [0.52.0](https://github.com/Mereithhh/vanblog/compare/v0.51.1...v0.52.0) (2023-04-14)

### 🚀 Chore | 构建/工程依赖/工具

- pnpm lock version ([85c5412](https://github.com/Mereithhh/vanblog/commit/85c54125931a139127c4e251dff83e4445ef1374))

### 🐛 Bug Fixes | Bug 修复

- https 自动跳转失效 [#273](https://github.com/Mereithhh/vanblog/issues/273) ([8b6f416](https://github.com/Mereithhh/vanblog/commit/8b6f41615fba22e45a0954c770296b489734c2e7))
- 当前浏览器不计入统计的 bug [#261](https://github.com/Mereithhh/vanblog/issues/261) ([d153465](https://github.com/Mereithhh/vanblog/commit/d153465d4a96c65d4ec6408dced69b7d88c82b2e))

### ✨ Features | 新功能

- 上传图片时自动压缩（webp） [#276](https://github.com/Mereithhh/vanblog/issues/276) ([cd88c08](https://github.com/Mereithhh/vanblog/commit/cd88c0871eb28a402d08d8f66b1faebad6f8ff27))

### 💄 Styles | 风格

- 微调 UI ([98de0f7](https://github.com/Mereithhh/vanblog/commit/98de0f7b6844ee1ddf4e87ccbb00c458d6cdf5d8))

### ✏️ Documentation | 文档

- site verify ([4dcf8b0](https://github.com/Mereithhh/vanblog/commit/4dcf8b0ce7bc7f5aaec27ee1905f181ed1a189bc))
- update ([2dd8b6b](https://github.com/Mereithhh/vanblog/commit/2dd8b6ba52a396d3cc04a8d4a6c7cfef80bf9c6e))
- 图片自动压缩文档和文案 ([82fad8c](https://github.com/Mereithhh/vanblog/commit/82fad8c690067af2eebcb739863e16c2fc9cfb37))
- 增加QQ邮件消息配置参数说明 ([#278](https://github.com/Mereithhh/vanblog/issues/278)) ([4896a50](https://github.com/Mereithhh/vanblog/commit/4896a5048bf7ea3dbc9ffd85d53624a5f6189b57))
- 增加案例 ([a55b8f5](https://github.com/Mereithhh/vanblog/commit/a55b8f5e7fe946bafa031b9a14e4215c02c9167e))
- 文档样式修改 ([1ad0946](https://github.com/Mereithhh/vanblog/commit/1ad0946f12ba941803f8e3a0613435de94273351))
- 更新使用样例 ([caab272](https://github.com/Mereithhh/vanblog/commit/caab2729c2a27130ff8a2d63bf44e293281c209f))
- 更新描述 [#227](https://github.com/Mereithhh/vanblog/issues/227) ([354676b](https://github.com/Mereithhh/vanblog/commit/354676b8ffd94b93a02ce496106d2d36b2603e4f))
- 更新文档 ([fab6e5a](https://github.com/Mereithhh/vanblog/commit/fab6e5a7d772bfd25820b6ceba30690604e5eab9))
- 更新文档 ([3550a06](https://github.com/Mereithhh/vanblog/commit/3550a06724b6f8830fd1bf5f22bed56d06fa5924))
- 更新文档 ([d9432a1](https://github.com/Mereithhh/vanblog/commit/d9432a1afbac05f6187e5d1f8d5311bc25c49fff))
- 更新文档 ([e0baffb](https://github.com/Mereithhh/vanblog/commit/e0baffbaca1686b7720d650dee3a2b386c8ce520))
- 更新文档 ([86b8e90](https://github.com/Mereithhh/vanblog/commit/86b8e90ec549d8413d6aa87d6800aa9de45f2204))
- 更新谁在使用 [#267](https://github.com/Mereithhh/vanblog/issues/267) ([79d48b7](https://github.com/Mereithhh/vanblog/commit/79d48b74014ec3a00ced698f0d87d8303e88191f))
- 添加样例 [#279](https://github.com/Mereithhh/vanblog/issues/279) ([46787bd](https://github.com/Mereithhh/vanblog/commit/46787bd8869e7717e162b2709c5ff0db7c82d11d))

### [0.51.1](https://github.com/Mereithhh/vanblog/compare/v0.51.0...v0.51.1) (2023-03-27)

### ✏️ Documentation | 文档

- 更新宝塔部署文档，增加缓存配置提醒 ([ed2bc8b](https://github.com/Mereithhh/vanblog/commit/ed2bc8b0750e6475e5ea4f4af1db5af4e0d5e66c))
- 更新文档 ([3fa4c7e](https://github.com/Mereithhh/vanblog/commit/3fa4c7efebbd990312109a77ce22f1346ce3297a))
- 更新文档 ([b30454b](https://github.com/Mereithhh/vanblog/commit/b30454baa9a40588337b5e386540481e0c8d0f66))
- 更新直接部署文档 ([fff1f34](https://github.com/Mereithhh/vanblog/commit/fff1f3413a98c9c215251208512b09961c921094))
- 替换文档内有水印的图片 ([9beb31c](https://github.com/Mereithhh/vanblog/commit/9beb31c460fe09aa42e2705ce64a2d226c204e55))

### 🐛 Bug Fixes | Bug 修复

- **admin:** 后台为配置百度和谷歌统计跳转到对应配置项的地址错误 ([51211a8](https://github.com/Mereithhh/vanblog/commit/51211a8ca72a48adfab47aba36d15e965f848dc5))
- 图片放大失效、作者头像取消旋转效果、图片加载失败时增加一个原有src属性的展示属性 ([b6aad90](https://github.com/Mereithhh/vanblog/commit/b6aad901233e3f7c152e86e7411e43095ff2037d))

### 🚀 Chore | 构建/工程依赖/工具

- **docs:** 部署成功后自动刷新 CDN ([74f56dc](https://github.com/Mereithhh/vanblog/commit/74f56dc9b1acdd3e7a231c43d686a768954b45b3))
- **website:** 前台构建类型错误 ([3dfa57a](https://github.com/Mereithhh/vanblog/commit/3dfa57affb027082a21c3941de74c0f7b615ea54))
- 一键脚本更新前自动删除老镜像 ([402d451](https://github.com/Mereithhh/vanblog/commit/402d451748fdaf3066f684edc622b82a37480223))
- 测试tag自动打包部署到测试环境 ([ebe1c14](https://github.com/Mereithhh/vanblog/commit/ebe1c14f73b5a1ead609895f934a299a00aa35f6))
- 测试流水线部署失败 ([3847fd5](https://github.com/Mereithhh/vanblog/commit/3847fd5d997224025cb958f4348d1f87dd5bea8f))

## [0.51.0](https://github.com/Mereithhh/vanblog/compare/v0.50.0...v0.51.0) (2023-03-22)

### 🚀 Chore | 构建/工程依赖/工具

- update pnpm lock ([3a15f32](https://github.com/Mereithhh/vanblog/commit/3a15f3247a23527aaad899116789492e8504111a))

### ✏️ Documentation | 文档

- 更新文档 ([7b31b0f](https://github.com/Mereithhh/vanblog/commit/7b31b0f983a8698f3504030da4c305a8953d3839))
- 更新文档 ([cb163d4](https://github.com/Mereithhh/vanblog/commit/cb163d47467c0995a913a6feeced0a72864f7149))

### 💄 Styles | 风格

- markdown 代码块单行代码时会跑偏 ([f583898](https://github.com/Mereithhh/vanblog/commit/f583898ad992f48a4c7b23ddfc3a28e8ddbf07a5))

### ✨ Features | 新功能

- markdown 内写html标签时，允许使用 style 属性（之前不行），允许 center 标签 ([688172b](https://github.com/Mereithhh/vanblog/commit/688172b6e70aaae5e233315290a5ed5c3badbda0))
- markdown 图片语法中支持 dataURL 格式 ([971de9a](https://github.com/Mereithhh/vanblog/commit/971de9a50fcda344529671ffc6e487eb9a3d46d3))
- 后台编辑器增加保存快捷键提示 ([70a6895](https://github.com/Mereithhh/vanblog/commit/70a6895bb436a65e662e09c9b0faaa86df551664))

### 🐛 Bug Fixes | Bug 修复

- 搜索 API 报错 [#174](https://github.com/Mereithhh/vanblog/issues/174) ([d58aeb8](https://github.com/Mereithhh/vanblog/commit/d58aeb88a8bea92047699ee2229026a6b92bc8c0))
- 流水线页面是否异步标签展示不准确 ([dec024b](https://github.com/Mereithhh/vanblog/commit/dec024b26ff82367bca1fa9403567f5960677e20))
- 点击站点logo或打赏图片不会触发全屏预览 [#172](https://github.com/Mereithhh/vanblog/issues/172) ([ce90009](https://github.com/Mereithhh/vanblog/commit/ce90009c62b61774acd90006ae505be6a3a56d3b))

## [0.50.0](https://github.com/Mereithhh/vanblog/compare/v0.49.0...v0.50.0) (2023-03-21)

### ✏️ Documentation | 文档

- 更新文档 ([8392dc3](https://github.com/Mereithhh/vanblog/commit/8392dc3cc5cababd7e5ac8c70a850d23551229b8))

### ✨ Features | 新功能

- 前后台统一Markdown组件，展示效果完全一致；解决了主题重影问题 [#136](https://github.com/Mereithhh/vanblog/issues/136) ([4c09630](https://github.com/Mereithhh/vanblog/commit/4c09630461939503ba00ef204b2632304825e9bf))

### 💄 Styles | 风格

- 前台目录增加最大高度 ([e6e05ea](https://github.com/Mereithhh/vanblog/commit/e6e05ea06c513c409fafad87532cca4f73bbf587))

### 🐛 Bug Fixes | Bug 修复

- **admin:** 代码编辑器中流水线帮助文档打不开 ([5d0a7fb](https://github.com/Mereithhh/vanblog/commit/5d0a7fb866230f2d03be5ff2c082e585a33647c6))
- 开始加载时导航栏右上角样式闪动 [#188](https://github.com/Mereithhh/vanblog/issues/188) ([7d5a82c](https://github.com/Mereithhh/vanblog/commit/7d5a82cb463e26ff49badded9ec444b187ece236))

## [0.49.0](https://github.com/Mereithhh/vanblog/compare/v0.48.4...v0.49.0) (2023-03-17)

### ✨ Features | 新功能

- API Token 管理功能 ([e1adcf1](https://github.com/Mereithhh/vanblog/commit/e1adcf1c2fcb90dbd24ccff50a671123fed40d98))
- jwt 密钥持久化存数据库 ([6440732](https://github.com/Mereithhh/vanblog/commit/644073205445821879ccbcefdddd7cdf50606917))
- 更新 API 文档 ([4444d54](https://github.com/Mereithhh/vanblog/commit/4444d541cd52403d787501ca0f2481139760c738))
- 流水线功能,可在特定事件发生后执行自定义的任意js代码 ([63263fa](https://github.com/Mereithhh/vanblog/commit/63263fa24fbe4e03e251d883051a72d320cba886))

### 🚀 Chore | 构建/工程依赖/工具

- **server:** 单独开发模式时，不触发 isr ([757abba](https://github.com/Mereithhh/vanblog/commit/757abbafb6c794ac08ef1642c0d04f27b582510e))
- 构建报错 ([27434d1](https://github.com/Mereithhh/vanblog/commit/27434d1cc6ddfc7647c5ddf5c98fa2945126913d))

### ✏️ Documentation | 文档

- 更新API token相关文档 ([0d8d04d](https://github.com/Mereithhh/vanblog/commit/0d8d04d9a875b5fd5f8acac153b235dc087043a5))
- 更新文档 ([5ebf893](https://github.com/Mereithhh/vanblog/commit/5ebf8931a9acde32716b94a87b6e855b40020f53))
- 更新文档todo ([810bfac](https://github.com/Mereithhh/vanblog/commit/810bfac6e784ff5b4ec58943291308c32279277d))
- 更新流水线相关文档 ([287e9b1](https://github.com/Mereithhh/vanblog/commit/287e9b1be0e655cb3fedd7fa36195bb2c9de888d))
- 更新谁在使用 [#255](https://github.com/Mereithhh/vanblog/issues/255) ([ff2fa61](https://github.com/Mereithhh/vanblog/commit/ff2fa619b74707c741567a6003e0ae0c7def0338))

### [0.48.4](https://github.com/Mereithhh/vanblog/compare/v0.48.3...v0.48.4) (2023-03-14)

### ✏️ Documentation | 文档

- 更新文档 ([3623f68](https://github.com/Mereithhh/vanblog/commit/3623f683014b605a3ac4acbb56bdbcbcbd61316b))
- 更新文档 ([6911c48](https://github.com/Mereithhh/vanblog/commit/6911c484c5391aa2a55e17550feea7e8b17c63d5))
- 更新案例 [#232](https://github.com/Mereithhh/vanblog/issues/232) ([cf01aa7](https://github.com/Mereithhh/vanblog/commit/cf01aa7e013c0e0893c2998699b5b5cafb4105b5))
- 补充访客统计文档 ([fa29dd9](https://github.com/Mereithhh/vanblog/commit/fa29dd9ad7e28cf1ce1818390316b9bc05657808))

### 🐛 Bug Fixes | Bug 修复

- 前台不展示自定义高亮块 ([dae79f9](https://github.com/Mereithhh/vanblog/commit/dae79f95d7cfdd05049708c34b73af14006eb17e))

### 🚀 Chore | 构建/工程依赖/工具

- 更新依赖 ([76a5c45](https://github.com/Mereithhh/vanblog/commit/76a5c45babe30666d6d153c4d057bb5c11390f7e))

### [0.48.3](https://github.com/Mereithhh/vanblog/compare/v0.48.1...v0.48.3) (2023-03-13)

### ♻️ Code Refactoring | 代码重构

- **admin:** refine CustomPageModal ([#243](https://github.com/Mereithhh/vanblog/issues/243)) ([ed2689f](https://github.com/Mereithhh/vanblog/commit/ed2689f0712c2c343e6ff52e1835b5f63d4efb8c))

### 🐛 Bug Fixes | Bug 修复

- **admin:** style error ([679d50d](https://github.com/Mereithhh/vanblog/commit/679d50d248687e03682bd58093dcca6fa69b1ab9))
- **website:** 作者头像无法显示 ([29eb22e](https://github.com/Mereithhh/vanblog/commit/29eb22e13677ed418d56e34bae25bb9ab704065c))
- 修复auto、dark模式下在刷新后，code模块未同步的情况 ([#227](https://github.com/Mereithhh/vanblog/issues/227)) ([c615d81](https://github.com/Mereithhh/vanblog/commit/c615d819bbbda2147683fc990612673775a43a6a))
- 自定义高亮块不展示 ([82c1ceb](https://github.com/Mereithhh/vanblog/commit/82c1ceb38a8fdbc47a49f2dbe9e6fcaa8dfa02e0))

### ✏️ Documentation | 文档

- **docs:** update workflow ([2aa9c81](https://github.com/Mereithhh/vanblog/commit/2aa9c81a7096a8fae2ca303eb0730a3ae7e988a3))
- fix changelog ([#224](https://github.com/Mereithhh/vanblog/issues/224)) ([afa684d](https://github.com/Mereithhh/vanblog/commit/afa684dd4f95c2140346a97684627d253d81ce3d))
- 更新文档 ([cad2fc6](https://github.com/Mereithhh/vanblog/commit/cad2fc6bf13cca66eda2a549eab1bd8488570dd2))
- 更新文档 ([b12d3c6](https://github.com/Mereithhh/vanblog/commit/b12d3c666f950cfc0cdd77a55d1b7a994854b5d9))
- 更新文档 ([b49f040](https://github.com/Mereithhh/vanblog/commit/b49f0408def53c1afdcda42c99ce22f03432cc62))
- 更新文档 ([79cee57](https://github.com/Mereithhh/vanblog/commit/79cee57a93699afee0b508aed622b12a315975e8))
- 更新谁在使用 [#246](https://github.com/Mereithhh/vanblog/issues/246) ([b413dfe](https://github.com/Mereithhh/vanblog/commit/b413dfe4e37b520af37be32100ab7bafeefd420a))

### 🚀 Chore | 构建/工程依赖/工具

- add clean script and pnpm workspace yaml ([7ce9293](https://github.com/Mereithhh/vanblog/commit/7ce929379239474cdf30099649db9a2433ab4d3e))
- **admin:** refine ArticleList ([#235](https://github.com/Mereithhh/vanblog/issues/235)) ([f26ed55](https://github.com/Mereithhh/vanblog/commit/f26ed55b280a4731ae568fb0d73d3c35da28ef39))
- **admin:** refine AuthorField ([#239](https://github.com/Mereithhh/vanblog/issues/239)) ([6c480d8](https://github.com/Mereithhh/vanblog/commit/6c480d8dcf7111f0bd592a84695bc378a42a14fe))
- **admin:** refine CodeEditor ([#240](https://github.com/Mereithhh/vanblog/issues/240)) ([eac9a8d](https://github.com/Mereithhh/vanblog/commit/eac9a8d29a63a513da89be59fd04a69dfb6f2fa5))
- **admin:** refine collaborator-modal ([#237](https://github.com/Mereithhh/vanblog/issues/237)) ([ecb5259](https://github.com/Mereithhh/vanblog/commit/ecb5259bf21644dfd92093b4c659235f4753236a))
- **admin:** refine ColumnsToolBar ([#241](https://github.com/Mereithhh/vanblog/issues/241)) ([e97768c](https://github.com/Mereithhh/vanblog/commit/e97768c638c1c338e871b19ceee2e43a0345cbb3))
- **admin:** refine CopyUploadBtn ([#242](https://github.com/Mereithhh/vanblog/issues/242)) ([72e4ef3](https://github.com/Mereithhh/vanblog/commit/72e4ef37c79874190da22dfc16764f249568b8cf))
- **admin:** refine custom-container plugin ([#244](https://github.com/Mereithhh/vanblog/issues/244)) ([982a41b](https://github.com/Mereithhh/vanblog/commit/982a41b230d5f4b6bba24ab89d7131797a8dabfc))
- **admin:** update emoji plugin ([#245](https://github.com/Mereithhh/vanblog/issues/245)) ([ec38f5b](https://github.com/Mereithhh/vanblog/commit/ec38f5b3f5a18846b72ee51b2ddc293472a57599))
- **release:** 0.48.2 ([dfafd04](https://github.com/Mereithhh/vanblog/commit/dfafd04e9089f6fc22a88b8208a584a2a5e06115))
- **release:** 0.48.3 ([06a8c2c](https://github.com/Mereithhh/vanblog/commit/06a8c2c174f4a99aa8e3526dc14b4aafcdc923d2))
- **release:** 0.48.3 ([dbf501e](https://github.com/Mereithhh/vanblog/commit/dbf501e8b7397abb3168a0fa07efe68e43ce5c4e))
- transform to pnpm workspace, refine tsconfig, update dev docs [#179](https://github.com/Mereithhh/vanblog/issues/179) [#199](https://github.com/Mereithhh/vanblog/issues/199) ([8cf6cba](https://github.com/Mereithhh/vanblog/commit/8cf6cba33517bf1b089a493539795db2ef53fd61))
- update workflow ([4740457](https://github.com/Mereithhh/vanblog/commit/474045792d0acfa42d043d054b3dba64d4c2cf67))
- update workflow , increase timeout ([f809852](https://github.com/Mereithhh/vanblog/commit/f809852e64ec498d32c9c81131b1b3beada7b80b))
- 迁移到 pnpm + monorepo, tsconfig 结构优化 ([3be68d0](https://github.com/Mereithhh/vanblog/commit/3be68d0b66ad34a0e49033a175a32e8092341da8))

### ⏪ Revert | 回退

- workflow error ([70ab21b](https://github.com/Mereithhh/vanblog/commit/70ab21b67489fbc0d327d06ff644f13c958d374d))
- workflow timeout error ([6cf6aa6](https://github.com/Mereithhh/vanblog/commit/6cf6aa6b051dfc1d802b1f87e9c49ad19318b22c))

### [0.48.2](https://github.com/Mereithhh/vanblog/compare/v0.48.1...v0.48.2) (2023-03-11)

### ♻️ Code Refactoring | 代码重构

- **admin:** refine CustomPageModal ([#243](https://github.com/Mereithhh/vanblog/issues/243)) ([ed2689f](https://github.com/Mereithhh/vanblog/commit/ed2689f0712c2c343e6ff52e1835b5f63d4efb8c))

### 🚀 Chore | 构建/工程依赖/工具

- add clean script and pnpm workspace yaml ([7ce9293](https://github.com/Mereithhh/vanblog/commit/7ce929379239474cdf30099649db9a2433ab4d3e))
- **admin:** refine ArticleList ([#235](https://github.com/Mereithhh/vanblog/issues/235)) ([f26ed55](https://github.com/Mereithhh/vanblog/commit/f26ed55b280a4731ae568fb0d73d3c35da28ef39))
- **admin:** refine AuthorField ([#239](https://github.com/Mereithhh/vanblog/issues/239)) ([6c480d8](https://github.com/Mereithhh/vanblog/commit/6c480d8dcf7111f0bd592a84695bc378a42a14fe))
- **admin:** refine CodeEditor ([#240](https://github.com/Mereithhh/vanblog/issues/240)) ([eac9a8d](https://github.com/Mereithhh/vanblog/commit/eac9a8d29a63a513da89be59fd04a69dfb6f2fa5))
- **admin:** refine collaborator-modal ([#237](https://github.com/Mereithhh/vanblog/issues/237)) ([ecb5259](https://github.com/Mereithhh/vanblog/commit/ecb5259bf21644dfd92093b4c659235f4753236a))
- **admin:** refine ColumnsToolBar ([#241](https://github.com/Mereithhh/vanblog/issues/241)) ([e97768c](https://github.com/Mereithhh/vanblog/commit/e97768c638c1c338e871b19ceee2e43a0345cbb3))
- **admin:** refine CopyUploadBtn ([#242](https://github.com/Mereithhh/vanblog/issues/242)) ([72e4ef3](https://github.com/Mereithhh/vanblog/commit/72e4ef37c79874190da22dfc16764f249568b8cf))
- **admin:** refine custom-container plugin ([#244](https://github.com/Mereithhh/vanblog/issues/244)) ([982a41b](https://github.com/Mereithhh/vanblog/commit/982a41b230d5f4b6bba24ab89d7131797a8dabfc))
- **admin:** update emoji plugin ([#245](https://github.com/Mereithhh/vanblog/issues/245)) ([ec38f5b](https://github.com/Mereithhh/vanblog/commit/ec38f5b3f5a18846b72ee51b2ddc293472a57599))
- transform to pnpm workspace, refine tsconfig, update dev docs [#179](https://github.com/Mereithhh/vanblog/issues/179) [#199](https://github.com/Mereithhh/vanblog/issues/199) ([8cf6cba](https://github.com/Mereithhh/vanblog/commit/8cf6cba33517bf1b089a493539795db2ef53fd61))
- 迁移到 pnpm + monorepo, tsconfig 结构优化 ([3be68d0](https://github.com/Mereithhh/vanblog/commit/3be68d0b66ad34a0e49033a175a32e8092341da8))

### 🐛 Bug Fixes | Bug 修复

- **admin:** style error ([679d50d](https://github.com/Mereithhh/vanblog/commit/679d50d248687e03682bd58093dcca6fa69b1ab9))
- 修复auto、dark模式下在刷新后，code模块未同步的情况 ([#227](https://github.com/Mereithhh/vanblog/issues/227)) ([c615d81](https://github.com/Mereithhh/vanblog/commit/c615d819bbbda2147683fc990612673775a43a6a))

### ✏️ Documentation | 文档

- **docs:** update workflow ([2aa9c81](https://github.com/Mereithhh/vanblog/commit/2aa9c81a7096a8fae2ca303eb0730a3ae7e988a3))
- fix changelog ([#224](https://github.com/Mereithhh/vanblog/issues/224)) ([afa684d](https://github.com/Mereithhh/vanblog/commit/afa684dd4f95c2140346a97684627d253d81ce3d))
- 更新文档 ([79cee57](https://github.com/Mereithhh/vanblog/commit/79cee57a93699afee0b508aed622b12a315975e8))
- 更新谁在使用 [#246](https://github.com/Mereithhh/vanblog/issues/246) ([b413dfe](https://github.com/Mereithhh/vanblog/commit/b413dfe4e37b520af37be32100ab7bafeefd420a))

### [0.48.1](https://github.com/Mereithhh/van-blog/compare/v0.48.0...v0.48.1) (2023-03-06)

### ✏️ Documentation | 文档

- bump deps ([c242819](https://github.com/Mereithhh/van-blog/commit/c242819ed18a8577995cd3f047e6a6fc505f7082))
- capitalize Markdown ([90b5457](https://github.com/Mereithhh/van-blog/commit/90b545775263b227146a1368d828959d817a3d53))
- fix footer copyright on homepage ([f5f2658](https://github.com/Mereithhh/van-blog/commit/f5f2658f92288c6fb753cb8569306f6165d6ed72))
- fix intro typos and docs improvement ([9b9578d](https://github.com/Mereithhh/van-blog/commit/9b9578df06223917c15de65a17eca60b3a5b1909))
- fix typo ([#195](https://github.com/Mereithhh/van-blog/issues/195)) ([008e4e5](https://github.com/Mereithhh/van-blog/commit/008e4e50f3975666947d9ca6de4a90018b16d074))
- rebuild ([#191](https://github.com/Mereithhh/van-blog/issues/191)) ([896253a](https://github.com/Mereithhh/van-blog/commit/896253a7f8fcb33032dc10e6ef0305ed1994799f))
- rebuild ([#196](https://github.com/Mereithhh/van-blog/issues/196)) ([6fcc40b](https://github.com/Mereithhh/van-blog/commit/6fcc40b2e68020c5277d584f675cecd54940947e))
- rebuild docker and http ([cf3c667](https://github.com/Mereithhh/van-blog/commit/cf3c66778643115c44bfa35095ffd6337603beb5))
- update docs ([#192](https://github.com/Mereithhh/van-blog/issues/192)) ([a4446be](https://github.com/Mereithhh/van-blog/commit/a4446be0da0e28437c851793e8eefb0307eb9a44))
- update guide and fix typos ([3f34bbe](https://github.com/Mereithhh/van-blog/commit/3f34bbeb03a6d52fd2ea9f3c97f27e963e98e70d))
- update readme, close [#213](https://github.com/Mereithhh/van-blog/issues/213) ([87ffcb7](https://github.com/Mereithhh/van-blog/commit/87ffcb75db2fc40cb68299c478aef72f96ab754e))
- update reference ([c24503b](https://github.com/Mereithhh/van-blog/commit/c24503ba9262bb4b8ab6e59413d0f73b76d27885))
- update some of the advance files ([75e585f](https://github.com/Mereithhh/van-blog/commit/75e585f6be97ec0a7b0d77246cdab6148b284db5))
- update who use ([c8d677b](https://github.com/Mereithhh/van-blog/commit/c8d677b5cb031e93f27f7f8d035315f073c35675))
- 更新文档 ([b1b9cb4](https://github.com/Mereithhh/van-blog/commit/b1b9cb46699dc20627d4d074f26aae1050ce8a55))
- 更新文档 ([1e0ac79](https://github.com/Mereithhh/van-blog/commit/1e0ac796482695f1429d3cd73c27c6055ed87e3d))
- 更新文档 ([8922137](https://github.com/Mereithhh/van-blog/commit/89221379de7464913c4298a919e33d9307db556c))

### 🚀 Chore | 构建/工程依赖/工具

- **server:** remove unused import ([#205](https://github.com/Mereithhh/van-blog/issues/205)) ([18ee51e](https://github.com/Mereithhh/van-blog/commit/18ee51e17e20facb047a3110a51d5a7018450dc3))
- **website:** refine AlertCard ([#216](https://github.com/Mereithhh/van-blog/issues/216)) ([65f99ae](https://github.com/Mereithhh/van-blog/commit/65f99ae648dc613ffbb263a78165ea92ac3158d3))
- **website:** refine ArticleList ([#217](https://github.com/Mereithhh/van-blog/issues/217)) ([cfc8a3f](https://github.com/Mereithhh/van-blog/commit/cfc8a3ffb52e458c2d09df29c8f1cf0f3fe73a53))
- **website:** refine BackToTop ([#219](https://github.com/Mereithhh/van-blog/issues/219)) ([bf171b7](https://github.com/Mereithhh/van-blog/commit/bf171b7042e8c52e8919c7227a664333e3728f15))
- **website:** refine CustomLayout ([#221](https://github.com/Mereithhh/van-blog/issues/221)) ([8d0ea62](https://github.com/Mereithhh/van-blog/commit/8d0ea62fe67a15186ebacc5c3c409fa72b307504))
- **website:** refine Footer ([#222](https://github.com/Mereithhh/van-blog/issues/222)) ([7f9ba2b](https://github.com/Mereithhh/van-blog/commit/7f9ba2bafa4e999a39da12b5b055e8ada1982613))
- **website:** refine unused apiroute [#210](https://github.com/Mereithhh/van-blog/issues/210) ([1a250cc](https://github.com/Mereithhh/van-blog/commit/1a250cc167ec63b7198631a2c578f6e3b8315093))
- **website:** tweaks ([#201](https://github.com/Mereithhh/van-blog/issues/201)) ([c6ba12e](https://github.com/Mereithhh/van-blog/commit/c6ba12e718846e009d4e94cd0558ba619782c7d8))
- **website:** tweaks ([#206](https://github.com/Mereithhh/van-blog/issues/206)) ([79ce1f9](https://github.com/Mereithhh/van-blog/commit/79ce1f9d4586d15bc8bd145749703425ef5a6d03))
- **website:** tweaks pageview ([#212](https://github.com/Mereithhh/van-blog/issues/212)) ([22efeb8](https://github.com/Mereithhh/van-blog/commit/22efeb8115a380b4b9aaa0a0c67506e73d3d9e1f))

### 🐛 Bug Fixes | Bug 修复

- type error ([2bd7f86](https://github.com/Mereithhh/van-blog/commit/2bd7f86eee6697b3046a5c57352c6f86eb56796b))
- 修复dark模式刷新页面后，Code代码阴影问题 ([#226](https://github.com/Mereithhh/van-blog/issues/226)) ([b4774e5](https://github.com/Mereithhh/van-blog/commit/b4774e51af61a4920851bf60ba67bbb5278903f2))

## [0.48.0](https://github.com/Mereithhh/van-blog/compare/v0.47.0...v0.48.0) (2023-02-27)

### ✨ Features | 新功能

- 图片增加水印功能 [#163](https://github.com/Mereithhh/van-blog/issues/163) ([8d6e8f3](https://github.com/Mereithhh/van-blog/commit/8d6e8f3eedf4b0e7c1879361bf5192bb2ef384a9))

### ✏️ Documentation | 文档

- 增加关于水印功能的文档 ([2fb2da4](https://github.com/Mereithhh/van-blog/commit/2fb2da44fa1cdfae56cd2995153e41e8396d61bc))
- 增加备份与迁移文档说明 ([37fcfb9](https://github.com/Mereithhh/van-blog/commit/37fcfb92d98649f1d3abe41e556d4b1c8e95239d))
- 增加自定义路径相关的文档 ([788bf86](https://github.com/Mereithhh/van-blog/commit/788bf86bd63678b2d52010c1e0f91b184d03d016))
- 更新文档 ([5bc5ebf](https://github.com/Mereithhh/van-blog/commit/5bc5ebf7ee6a85c38437f73dcbcf3d5d46194ae9))

### 🐛 Bug Fixes | Bug 修复

- 图片管理中剪切板上传图片失效&水印距离下面位置调高一点 ([646884d](https://github.com/Mereithhh/van-blog/commit/646884d624169077d1f431f932f08408ab98f11a))

## [0.47.0](https://github.com/Mereithhh/vanblog/compare/v0.46.0...v0.47.0) (2023-02-26)

### ✨ Features | 新功能

- use search-pro plugin ([d5a2ab4](https://github.com/Mereithhh/vanblog/commit/d5a2ab455146d7592dfd6a7f0b4cd0f4d3984a26))
- 自定义文章路径 [#159](https://github.com/Mereithhh/vanblog/issues/159) ([14394b5](https://github.com/Mereithhh/vanblog/commit/14394b596d1933069b02dced14d757b3ad1825d8))

### 🚀 Chore | 构建/工程依赖/工具

- fix typos ([88a30b6](https://github.com/Mereithhh/vanblog/commit/88a30b6effbcbaf6f4f4dc774fc7bc0b4a092722))
- update lockfile ([c74e339](https://github.com/Mereithhh/vanblog/commit/c74e3393b6490396bab3042b64a6dc91148727d2))

### ✏️ Documentation | 文档

- tweaks ([30c5758](https://github.com/Mereithhh/vanblog/commit/30c5758831663eb7d9f8ed81644e86204d46ac46))
- update docs ([8bae067](https://github.com/Mereithhh/vanblog/commit/8bae0677981ceee6c620071f1ceb6e9be983cef2))
- 增加关于接口鉴权的描述文字 ([8eda958](https://github.com/Mereithhh/vanblog/commit/8eda9587685c7ff7138311e909858c255c2589e8))
- 更新文档 ([900890f](https://github.com/Mereithhh/vanblog/commit/900890f5c86a24cdefc7970b951fa1b8beb1ff7c))
- 更新文档 ([b728912](https://github.com/Mereithhh/vanblog/commit/b728912a9255070a5d057275f5edb4c66f4c9bb2))
- 更新谁在使用' ([900ca4c](https://github.com/Mereithhh/vanblog/commit/900ca4c481517dda9cd54bd27c22ef806391b3a2))

## [0.46.0](https://github.com/Mereithhh/vanblog/compare/v0.45.6...v0.46.0) (2023-02-25)

### 🐛 Bug Fixes | Bug 修复

- 左右切换页面时，内容不更新[#161](https://github.com/Mereithhh/vanblog/issues/161) ([94acb32](https://github.com/Mereithhh/vanblog/commit/94acb322f967f04fd6ca7d0473ed5095b672c5cd))
- 暗色模式刷新页面代码块重影问题（盲修，不一定完全修好）[#162](https://github.com/Mereithhh/vanblog/issues/162) ([8d888c6](https://github.com/Mereithhh/vanblog/commit/8d888c6cfe72bd45e759c43714f521ec597bf889))

### ♻️ Code Refactoring | 代码重构

- 更新 nextjs 13 后按照新规范修改 Link 标签的使用" ([b453665](https://github.com/Mereithhh/vanblog/commit/b4536650174ed11ce82b7e519e4573e770f36291))

### ✨ Features | 新功能

- 升级到 nextjs 13 ([4632b1b](https://github.com/Mereithhh/vanblog/commit/4632b1bdc71965643aff32fbca8f877c22fabe1f))
- 支持 mac 的 command + k 开启搜索 ([f6ded59](https://github.com/Mereithhh/vanblog/commit/f6ded59de2ec9f8f92de756e71ce4617372f220a))
- 新建文章或草稿自动跳转到编辑页面 ([baf4e3c](https://github.com/Mereithhh/vanblog/commit/baf4e3c0028067d97020386a0842ee3ac4d5bcf7))

### 💄 Styles | 风格

- 后台登录框居中&不自动记录密码 ([7174f11](https://github.com/Mereithhh/vanblog/commit/7174f11b8e1d511c7c160f6b3f8d94f232478676))

### 🚀 Chore | 构建/工程依赖/工具

- server 增加一个不启动 website 前台的模式 ([b2f0b15](https://github.com/Mereithhh/vanblog/commit/b2f0b150d47190c3089b7654afe3a1942f10eb92))
- server 开发时未制定配置 logs 为当前路径 ([57684a4](https://github.com/Mereithhh/vanblog/commit/57684a40d7c8a05e201fb5c21f8a1b88c090b59d))
- website 锁定 nextjs 版本 ([a93cb65](https://github.com/Mereithhh/vanblog/commit/a93cb65492e8178e5f66ddd1886bb9def5d72360))
- 增加一个取消所有进程的命令 ([ee0f564](https://github.com/Mereithhh/vanblog/commit/ee0f5644f48a52eb246fd693177ff53d1d8448fa))

### [0.45.6](https://github.com/Mereithhh/van-blog/compare/v0.45.5...v0.45.6) (2023-02-15)

### 🐛 Bug Fixes | Bug 修复

- 加密文章解密后目录未加载 ([cd6d43b](https://github.com/Mereithhh/van-blog/commit/cd6d43b9ad1fcc60eabfeb2a7de733468418a172))
- 大文本数据报错 ([92714c9](https://github.com/Mereithhh/van-blog/commit/92714c92ea37ce882543b4240fb4829861071883))
- 特殊情况报错 ([f4d3bd0](https://github.com/Mereithhh/van-blog/commit/f4d3bd0f23ae574599c12107f20a03fcae5baf99))

### ✏️ Documentation | 文档

- 更新文档 ([6ffc8c2](https://github.com/Mereithhh/van-blog/commit/6ffc8c2f710b8fca1fcc95849053f1e3183a3fdc))
- 更新文档 ([50729a5](https://github.com/Mereithhh/van-blog/commit/50729a5d9abbcc94ad0e8ed0249ded963b711135))
- 更新文档 ([7e5f9fd](https://github.com/Mereithhh/van-blog/commit/7e5f9fd992c14c33337fbbce9a2646aa53f2c20a))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.45.6 ([8bd73d8](https://github.com/Mereithhh/van-blog/commit/8bd73d8247ed52f5ae1666c672209f95dd936f88))
- **release:** 0.45.7 ([60fd157](https://github.com/Mereithhh/van-blog/commit/60fd1575382b49240eafe60860109de995612ac2))
- 构建报错 ([72ff966](https://github.com/Mereithhh/van-blog/commit/72ff96691053f484019ec4fe9ace72b6655fcd4b))

### ⏪ Revert | 回退

- 构建错误重新发版 ([8cd4cca](https://github.com/Mereithhh/van-blog/commit/8cd4ccac36ec2d0b46cd07c21bf044f44674f100))

### [0.45.5](https://github.com/Mereithhh/van-blog/compare/v0.45.4...v0.45.5) (2023-02-08)

### ✏️ Documentation | 文档

- 更新文档 ([7f27784](https://github.com/Mereithhh/van-blog/commit/7f27784f0603167e7dd3e9d22de7eef6dab3388f))

### 🐛 Bug Fixes | Bug 修复

- 前台挂掉 [#149](https://github.com/Mereithhh/van-blog/issues/149) ([6a136aa](https://github.com/Mereithhh/van-blog/commit/6a136aaa45f3d73dd15deff8dba8699a5c1be2f3))

### [0.45.4](https://github.com/Mereithhh/van-blog/compare/v0.45.3...v0.45.4) (2023-02-07)

### ✏️ Documentation | 文档

- 更新文档 ([bee0f58](https://github.com/Mereithhh/van-blog/commit/bee0f585b73c384e733bd801085c459fd5077983))

### 🐛 Bug Fixes | Bug 修复

- 分类数量显示不准确 [#146](https://github.com/Mereithhh/van-blog/issues/146) ([9a20c05](https://github.com/Mereithhh/van-blog/commit/9a20c051f804328f7a7720d25a1e5c14625a5664))

### ✨ Features | 新功能

- 后台编辑器换行与前台保持统一，两个回车才换行 [#148](https://github.com/Mereithhh/van-blog/issues/148) ([c4939b6](https://github.com/Mereithhh/van-blog/commit/c4939b6e867a9a691f1937be642b05ba4b0b3da3))

### [0.45.3](https://github.com/Mereithhh/van-blog/compare/v0.45.2...v0.45.3) (2023-02-04)

### ✏️ Documentation | 文档

- 更新文档 ([b730bf1](https://github.com/Mereithhh/van-blog/commit/b730bf1bac87a5e2eddca03463a9ede9dd4a5127))

### 🐛 Bug Fixes | Bug 修复

- 在设置自动主题的浏览器或设备上，后台编辑器预览的暗色主题无法切换 ([02e757e](https://github.com/Mereithhh/van-blog/commit/02e757ee1724132345e56d1bed35ef495bc699f5))

### [0.45.2](https://github.com/Mereithhh/van-blog/compare/v0.45.1...v0.45.2) (2023-02-04)

### ✏️ Documentation | 文档

- 更新文档 ([ac6fbc9](https://github.com/Mereithhh/van-blog/commit/ac6fbc900e9895c159a2c93f6d2357dab14f2ac1))

### 🐛 Bug Fixes | Bug 修复

- 域名带有端口号的情况下内置图床无法加载作者头像 ([4a9d507](https://github.com/Mereithhh/van-blog/commit/4a9d5076d2ea609e1385e0179f262a518e87733f))

### ✨ Features | 新功能

- 增加撤销重做按钮 ([1fa3829](https://github.com/Mereithhh/van-blog/commit/1fa382900534a0de845f3479de958da4f2b2542d))

### [0.45.1](https://github.com/Mereithhh/van-blog/compare/v0.45.0...v0.45.1) (2023-02-03)

### ✏️ Documentation | 文档

- 更新文档 ([3e8fcac](https://github.com/Mereithhh/van-blog/commit/3e8fcac72e5840493b78c408ff5be1af897acffa))

### 🐛 Bug Fixes | Bug 修复

- isr 更新报错导致 server 不正常退出 ([9efe654](https://github.com/Mereithhh/van-blog/commit/9efe6540775a471d3fa40c69204c7e5fd903e227))

## [0.45.0](https://github.com/Mereithhh/van-blog/compare/v0.44.0...v0.45.0) (2023-02-02)

### ⚡ Performance Improvements | 性能优化

- 增加索引 ([a4fcaca](https://github.com/Mereithhh/van-blog/commit/a4fcaca69bdb907f0d58b04bc246e4dc8c4791da))

### 🚀 Chore | 构建/工程依赖/工具

- 固定 admin 构建镜像版本，防止构建报错 ([5c6111c](https://github.com/Mereithhh/van-blog/commit/5c6111c519e571006658af75f5eb41d26878ddbc))

### ✨ Features | 新功能

- isr 默认按需更新，非按需时特定情况强制渲染 ([0e8539c](https://github.com/Mereithhh/van-blog/commit/0e8539cf44cc7c1a37624d293063bfe2eed44ee3))
- 分类加密 ([374e6ef](https://github.com/Mereithhh/van-blog/commit/374e6efac60786d5d2ec767277b15662e92658e4))
- 基于文件管理的自定义页面功能 ([eae6a8b](https://github.com/Mereithhh/van-blog/commit/eae6a8b88e7dd6fd1fe0c2e42fff201b309a47d6))
- 定制化可自定义 head 下标签，会跟随前台进行静态页面生成，可用于验证网站所有权 ([041eea4](https://github.com/Mereithhh/van-blog/commit/041eea47abb90405486f6f95014c88c867ec3c6e))
- 新增静态资源更新策略配置，默认采用 nextjs 自动模式以节约资源 ([5fe6898](https://github.com/Mereithhh/van-blog/commit/5fe68982a102ee840dc2eb877adfb748e610d529))
- 更新内置 picgo-core 到 1.5.0 ([e587a4e](https://github.com/Mereithhh/van-blog/commit/e587a4ef5643440c6402a024d376b49882820eac))
- 更新内置 waline 到 1.26.0 ([c28ec1f](https://github.com/Mereithhh/van-blog/commit/c28ec1f2d03c738023f3e8b7fd9d7612e123370c))
- 点击导航栏站点名称时返回首页 ([2a338c2](https://github.com/Mereithhh/van-blog/commit/2a338c2cd250e2e1107aa314ad00b723cddac828))

### ✏️ Documentation | 文档

- 增加静态页面更新策略文档 ([1366eb3](https://github.com/Mereithhh/van-blog/commit/1366eb35110821d4167b7929f6e2dd3e200b24af))
- 新版自定义页面文档 ([2282634](https://github.com/Mereithhh/van-blog/commit/2282634c7035fec74e70edce2a889829a0c24c33))
- 更新图床文档 ([df792e8](https://github.com/Mereithhh/van-blog/commit/df792e824288679a81d3f4c77d8d3a6cb711c39e))
- 更新开发指南 ([8a95244](https://github.com/Mereithhh/van-blog/commit/8a95244c80b31b8843d1e2c29316ce246a7212a5))
- 更新文档 ([385841e](https://github.com/Mereithhh/van-blog/commit/385841e7c6b4aacab1896c04eb271bfdf9513275))
- 更新文档 ([0c3d5ef](https://github.com/Mereithhh/van-blog/commit/0c3d5ef761c884ffc54d89167c9760dfb84f4d65))
- 更新谁在使用 ([939f560](https://github.com/Mereithhh/van-blog/commit/939f560e139e7db6fb0f4635ef2322b1470408df))
- 更新谁在使用 ([c90a17e](https://github.com/Mereithhh/van-blog/commit/c90a17ef9074c6dea7e6c51de9acfc5be641fe7b))

### 🐛 Bug Fixes | Bug 修复

- firefox 浏览器目录滚动条白条 [#132](https://github.com/Mereithhh/van-blog/issues/132) ([23d753c](https://github.com/Mereithhh/van-blog/commit/23d753cc78dc32b4467a4db81497240f55f703d6))
- isr 配置表单初始值未带入 ([f56f828](https://github.com/Mereithhh/van-blog/commit/f56f828f56afe7b26a7f486d4b8c173cc3eb75c1))
- isr 配置读取报错 ([2534cec](https://github.com/Mereithhh/van-blog/commit/2534cec1019ca68c0335dd0cf72675e70bc6062a))
- 分类接口获取报错 ([772ed36](https://github.com/Mereithhh/van-blog/commit/772ed362ea3d768f8bd4c323d779b8a2ae195537))
- 更新后台 isr 帮助文档指向' ([84bdcf3](https://github.com/Mereithhh/van-blog/commit/84bdcf3d6288da38bc05ba13eeeac3176e313989))
- 目录丢失问题 [#117](https://github.com/Mereithhh/van-blog/issues/117) ([72659f6](https://github.com/Mereithhh/van-blog/commit/72659f65173a8f1309e2dfa39eafcb19dd33ba47))
- 目录标题相同时，显示跳转异常 [#112](https://github.com/Mereithhh/van-blog/issues/112) ([5ac2f5f](https://github.com/Mereithhh/van-blog/commit/5ac2f5ff7cc80c5de0c4f700341fbee6a02fa5c5))
- 获取分类接口报错 ([dcd9083](https://github.com/Mereithhh/van-blog/commit/dcd908355bd28f0ac16d81777534b59ac51eb147))

## [0.44.0](https://github.com/Mereithhh/van-blog/compare/v0.43.1...v0.44.0) (2022-12-19)

### 💄 Styles | 风格

- 一级标题目录加缩进&移动端目录样式优化 [#100](https://github.com/Mereithhh/van-blog/issues/100) ([fb6dc9b](https://github.com/Mereithhh/van-blog/commit/fb6dc9b0bda2d0786fd2195b0535cccca40f7d25))

### ✨ Features | 新功能

- 升级内置 waline 到 v1.25.1 ([0379b1c](https://github.com/Mereithhh/van-blog/commit/0379b1c127dcd3cbbea1f0bcaf16f9d83979a41b))
- 联系方式中增加 gitee [#81](https://github.com/Mereithhh/van-blog/issues/81) ([7a00bb6](https://github.com/Mereithhh/van-blog/commit/7a00bb6b4ec1a59e76fa9d1dd33aa24ad8d47331))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.44.0 ([c64efdd](https://github.com/Mereithhh/van-blog/commit/c64efdd437ef6d8fec8d7d785bcd3a51f0bfb4e4))
- 增加一个方便开发的一键命令&脚本 ([f9c945e](https://github.com/Mereithhh/van-blog/commit/f9c945e2314bccf5db628f42408ab14b8f914b53))

### ✏️ Documentation | 文档

- 增加一个外置 cos 图床配置指南 ([177c318](https://github.com/Mereithhh/van-blog/commit/177c31811a4cccafbea69a9284f03457f851d0fc))
- 更新文档 ([cb01dfe](https://github.com/Mereithhh/van-blog/commit/cb01dfe0cec2429a658096aba1b08ef5b8c23826))
- 更新文档 ([4b37839](https://github.com/Mereithhh/van-blog/commit/4b378395c7cbad1bf68bff2ad7a980333fdbed2e))
- 更新文档 ([8660fe9](https://github.com/Mereithhh/van-blog/commit/8660fe9c200053cf462c5410ae2f32ef621d3f36))
- 更新文档 ([f22178f](https://github.com/Mereithhh/van-blog/commit/f22178f5d456e7e81d3c949514d0fa0ab3d70f66))
- 更新文档 ([1fc1ab9](https://github.com/Mereithhh/van-blog/commit/1fc1ab9ab41713744e2402171bb05fa10850ba2d))
- 更新谁在使用 ([098ba5b](https://github.com/Mereithhh/van-blog/commit/098ba5b8d51d041a3d81b93a6f466f1baaa8b2ba))
- 添加样例 ([3590efd](https://github.com/Mereithhh/van-blog/commit/3590efd7067eeedd967c494ca593d72c25a29624))

### 🐛 Bug Fixes | Bug 修复

- type error ([69db2a5](https://github.com/Mereithhh/van-blog/commit/69db2a5cc46b8f417b12f4e8973e9f5792b1fc8f))
- 个别分类无法删除修改 [#107](https://github.com/Mereithhh/van-blog/issues/107) ([fdb4ec2](https://github.com/Mereithhh/van-blog/commit/fdb4ec2101f9ee74d45bc42d64947dc1be161252))
- 修改文章信息时，修改后再次弹窗信息并未及时更新 [#111](https://github.com/Mereithhh/van-blog/issues/111) ([eb46785](https://github.com/Mereithhh/van-blog/commit/eb46785e4cf32e1a8bca3327672bbf96656a4584))
- 恢恢复后文章 post 后面数字的顺序与原来相反 [#80](https://github.com/Mereithhh/van-blog/issues/80) ([3828d1e](https://github.com/Mereithhh/van-blog/commit/3828d1ef2f927286d38bca6f46eb158f40e81a5d))
- 目录的滚动条自动跟随失效 [#87](https://github.com/Mereithhh/van-blog/issues/87) ([27db88b](https://github.com/Mereithhh/van-blog/commit/27db88bd5a9a5271ba000042fa045519f052bafc))
- 重启或更新服务时，一键脚本将删除匿名卷 ([0ff1761](https://github.com/Mereithhh/van-blog/commit/0ff176198bd31fbb948e75ae3c4d063861391bda))

### ⏪ Revert | 回退

- 回退改个 bug 重新发版 ([fdd82a1](https://github.com/Mereithhh/van-blog/commit/fdd82a1056e49e852b0134362f581a07a2637005))

### [0.43.1](https://github.com/Mereithhh/van-blog/compare/v0.43.0...v0.43.1) (2022-11-22)

### ✏️ Documentation | 文档

- 更新谁在使用 ([a16424d](https://github.com/Mereithhh/van-blog/commit/a16424db86faed7b0285466170648bc6140b8435))

### 🐛 Bug Fixes | Bug 修复

- 容器内 website 服务无限重启，导致 inode 缓慢增加占满硬盘空间 [#93](https://github.com/Mereithhh/van-blog/issues/93) [#85](https://github.com/Mereithhh/van-blog/issues/85) ([76c17cb](https://github.com/Mereithhh/van-blog/commit/76c17cb6c4be1ca05facbc3e9e27b11337c5f0d6))

## [0.43.0](https://github.com/Mereithhh/van-blog/compare/v0.42.0...v0.43.0) (2022-11-06)

### ✏️ Documentation | 文档

- 样例提交 ([39c66b8](https://github.com/Mereithhh/van-blog/commit/39c66b8447d50661b6a08b3333f46f1d0f14b850))
- 增加一个 docker pull 数量的图标 ([45caef7](https://github.com/Mereithhh/van-blog/commit/45caef7bf0d59ea54e91c4168d0a036aa75cebf9))
- 增加关于更新的描述 ([a1994f4](https://github.com/Mereithhh/van-blog/commit/a1994f45034a7f9c0964856dde6789fadba664c7))
- 更新文档 ([81e8bf6](https://github.com/Mereithhh/van-blog/commit/81e8bf68d00e6c6e890a229c5403f93439b9cb13))
- 更新文档 ([aff561a](https://github.com/Mereithhh/van-blog/commit/aff561af416d2e6b4039b7720dfcc75c733ca86d))
- 更新文档 ([5c0ab9d](https://github.com/Mereithhh/van-blog/commit/5c0ab9dfe012407b7ad09df8a2d94ad468ea8bb1))
- 更新文档 ([c219a77](https://github.com/Mereithhh/van-blog/commit/c219a77bfd74a20a5e70b483d9f11d7f7575c9af))
- 更新样例 ([289675e](https://github.com/Mereithhh/van-blog/commit/289675e57ba0762deab735b77c2474a985311b81))
- 更新样例 ([be4761d](https://github.com/Mereithhh/van-blog/commit/be4761d283076012ac4e38bfe99cb989aec7542a))
- 编辑此页失效 ([3393cbb](https://github.com/Mereithhh/van-blog/commit/3393cbb45bbeb89364de927596eb2a5d532fa72a))

### ✨ Features | 新功能

- mac 可以 command + s 保存文章 ([5cc4086](https://github.com/Mereithhh/van-blog/commit/5cc4086fa6ad982b26d013bca63d8f6cdeb0ee18))
- 增加是否显示文章内容过时提示框的配置项 ([6cac2e0](https://github.com/Mereithhh/van-blog/commit/6cac2e065c33bbdf76c035dd924c73c673544ba4))
- 屏蔽一些可忽略的 warning 日志 ([d982d4f](https://github.com/Mereithhh/van-blog/commit/d982d4f5e6b089bdbbc270962d43689e558ae1ae))
- 每篇文章都可设置独立的自定义版权声明文字 ([91ea94a](https://github.com/Mereithhh/van-blog/commit/91ea94a3a2f9504796b747f8c3bd82bcfaf9637d))
- 移动端文章页面自动生成目录放到最上方 ([dcdee68](https://github.com/Mereithhh/van-blog/commit/dcdee6852db3632d564ee473264c6beb917fad7f))

### 🐛 Bug Fixes | Bug 修复

- 一键脚本报错 ([8afab4d](https://github.com/Mereithhh/van-blog/commit/8afab4d9fb71a0f06f5f01bb432e97d59adf303f))
- 修复一键部署脚本下载编排报错 ([cb99533](https://github.com/Mereithhh/van-blog/commit/cb99533adfcf89257c29e12c9efbbcf1dbe38d1a))
- 编辑器预览的换行行为和前台换行行为不一致（编辑器预览换行但前台页面不换行） [#78](https://github.com/Mereithhh/van-blog/issues/78) ([680e9a3](https://github.com/Mereithhh/van-blog/commit/680e9a3ae7a4c3e61710cd32106a64476d3d296b))
- 部署脚本报错选项不为空 ([94eadc2](https://github.com/Mereithhh/van-blog/commit/94eadc28f74f61d41eee8e785270b35c4b3b449a))

## [0.42.0](https://github.com/Mereithhh/van-blog/compare/v0.41.5...v0.42.0) (2022-10-24)

### 🚀 Chore | 构建/工程依赖/工具

- 增加日志文件配置项 ([ae1e260](https://github.com/Mereithhh/van-blog/commit/ae1e260545a2285e7b0b3eceb4032cae100d770b))

### ✏️ Documentation | 文档

- 更新一些 faq ([f507ad1](https://github.com/Mereithhh/van-blog/commit/f507ad1d5f5288fb2e6b6e2ad7b7120dfb0af344))
- 更新捐赠信息 ([551cb00](https://github.com/Mereithhh/van-blog/commit/551cb00902c4b12c4e7fe8c09bd592d7f1f75cb4))
- 更新文档 ([7639869](https://github.com/Mereithhh/van-blog/commit/7639869b405f83081166de54ae8c60326791a75a))

### ✨ Features | 新功能

- 优化代码块样式: 减少滚动条高度、增加语言显示、复制按钮置顶以免挡住代码 [#72](https://github.com/Mereithhh/van-blog/issues/72) [#71](https://github.com/Mereithhh/van-blog/issues/71) [#73](https://github.com/Mereithhh/van-blog/issues/73) ([ae8cae4](https://github.com/Mereithhh/van-blog/commit/ae8cae4693f666b8bc3e35f638e6d81b731adf2c))
- 去掉 ALLOW_DOMAINS 环境变量，精简配置，自动读取图片允许域名，避免再出现作者 logo 无法显示问题 ([dfd1a94](https://github.com/Mereithhh/van-blog/commit/dfd1a9491acb3010da2bec067f7d3806b573466a))
- 增加版权协议的配置项 ([c9d1d18](https://github.com/Mereithhh/van-blog/commit/c9d1d18c31a66ee8b71d259a2430abc537cd1833))
- 增加页脚公安备案号展示的配置项 ([9a43d7f](https://github.com/Mereithhh/van-blog/commit/9a43d7f4582a35a6962a97871df3972ff2f46c74))
- 编辑器页面可按 ctrl+s 快捷保存 ([e92f2ba](https://github.com/Mereithhh/van-blog/commit/e92f2baf743fa139580d14a6db172b8754ecdfba))

### 🐛 Bug Fixes | Bug 修复

- 主题切换闪屏 [#54](https://github.com/Mereithhh/van-blog/issues/54) ([dfd9aca](https://github.com/Mereithhh/van-blog/commit/dfd9acaebbba914ef7c0bf608bf2a6a4daede24a))
- 代码块操作符背景颜色块不一致 ([c961883](https://github.com/Mereithhh/van-blog/commit/c961883ddb069a4c78ff0f5353f70b97ed6da1f2))
- 减少本地浏览器主题和服务端默认主题不一致时的闪屏时间 [#54](https://github.com/Mereithhh/van-blog/issues/54) ([b581f07](https://github.com/Mereithhh/van-blog/commit/b581f07103131465ce68f186f069167b32794424))
- 禁止发布草稿时自动填充密码以避免发布报错 ([02754c7](https://github.com/Mereithhh/van-blog/commit/02754c77e01983d7465a58b0302f91fd905aa1b9))

### [0.41.5](https://github.com/Mereithhh/van-blog/compare/v0.41.4...v0.41.5) (2022-10-07)

### ✏️ Documentation | 文档

- 更新文档 ([7feeb23](https://github.com/Mereithhh/van-blog/commit/7feeb23199d4d36ed72b2dd6f87b16fabe08068d))

### 💄 Styles | 风格

- 多个标签时溢出会换行展示（原来不会） ([0f8cfc6](https://github.com/Mereithhh/van-blog/commit/0f8cfc695261a1314b296367f16c3214c6e7fef3))

### 🐛 Bug Fixes | Bug 修复

- encodeQuerystring 报错 ([b208daf](https://github.com/Mereithhh/van-blog/commit/b208dafb2b693c5cf8cd95c720c824874e9c8ef1))
- markdown 内部 img 标签加 style 属性报错 [#63](https://github.com/Mereithhh/van-blog/issues/63) ([f94f5cf](https://github.com/Mereithhh/van-blog/commit/f94f5cff9a9ee7751dc5aec833fe2516e1994156))

### [0.41.4](https://github.com/Mereithhh/vanblog/compare/v0.41.3...v0.41.4) (2022-09-30)

### ✏️ Documentation | 文档

- 更新文档 ([9bd2c03](https://github.com/Mereithhh/vanblog/commit/9bd2c03da6fba370721d672fb119b0328b634a24))
- 更新样例 ([d053df0](https://github.com/Mereithhh/vanblog/commit/d053df07fc15fef9b4cf8367f0adc1da5210e53d))

### 👷 Continuous Integration | CI 配置

- window 开发后端无法正常启动 ([a80eca8](https://github.com/Mereithhh/vanblog/commit/a80eca82abe81aec637e064c2854c1dbc067deaa))

### 🐛 Bug Fixes | Bug 修复

- 导航栏下级与副导航栏渲染图层问题[#60](https://github.com/Mereithhh/vanblog/issues/60) ([0cf2f67](https://github.com/Mereithhh/vanblog/commit/0cf2f67ca6db55b06c8c19d1d3f14ad03b117975))
- 二级导航栏未适配黑色主题 ([0e471b3](https://github.com/Mereithhh/vanblog/commit/0e471b3405aa4a62370d5bfa9b1288cb5182c041))

### [0.41.3](https://github.com/Mereithhh/van-blog/compare/v0.41.2...v0.41.3) (2022-09-28)

### ✏️ Documentation | 文档

- 更新文档 ([fda963d](https://github.com/Mereithhh/van-blog/commit/fda963dd6cf93bfd70d25b8c78f06364a1dd25d6))

### 🐛 Bug Fixes | Bug 修复

- markdown 中的 img 标签无法调整图片大小 ([3e2dbfa](https://github.com/Mereithhh/van-blog/commit/3e2dbfaf9ad8fe61da91cf64be076e080833db68))

### [0.41.2](https://github.com/Mereithhh/van-blog/compare/v0.41.1...v0.41.2) (2022-09-28)

### ✏️ Documentation | 文档

- 增加案例 ([bfa52b8](https://github.com/Mereithhh/van-blog/commit/bfa52b8121dc85d593eec0d66b37f378ceb91d63))
- 更新宝塔部署教程 ([80bf1ec](https://github.com/Mereithhh/van-blog/commit/80bf1ec53a45daa0817d3af77aa9e30ce6ff338f))
- 更新文档 ([c00d36f](https://github.com/Mereithhh/van-blog/commit/c00d36f5c94bbc78e424400b9b9eaa6aaf4b7971))
- 更新文档 ([6b78fce](https://github.com/Mereithhh/van-blog/commit/6b78fce71f5a84b434b111c261f6177a1a024fde))
- 更新文档 ([c79552e](https://github.com/Mereithhh/van-blog/commit/c79552ef6c3800b5b1772d7c40b1f644b55d7fd4))
- 更新部署文档 ([48e1ae8](https://github.com/Mereithhh/van-blog/commit/48e1ae8b19c8267dc9e690f1709ac2c00ebf5d4e))

### 🐛 Bug Fixes | Bug 修复

- 特殊情形 markdown 标题解析失败会阻塞前台页面更新 ([10db49c](https://github.com/Mereithhh/van-blog/commit/10db49c7938a148c2b5d91bebc35fdf1a2046a99))

### ✨ Features | 新功能

- 进入后台编辑页面时，页面标题以编辑内容标题为准 [#56](https://github.com/Mereithhh/van-blog/issues/56) ([0ec23c1](https://github.com/Mereithhh/van-blog/commit/0ec23c1b83c2c96c362c617b011cd144bf4393d6))

### [0.41.1](https://github.com/Mereithhh/van-blog/compare/v0.41.0...v0.41.1) (2022-09-26)

### ✏️ Documentation | 文档

- 更新 TODO ([882240b](https://github.com/Mereithhh/van-blog/commit/882240b276bd91078b2b9496d6bc4f360a7c6835))
- 更新文档 ([0b04c04](https://github.com/Mereithhh/van-blog/commit/0b04c044459b31866a412c474e236eabfde06a14))
- 更新文档 ([256be97](https://github.com/Mereithhh/van-blog/commit/256be973172bef83019e61a1055e851fc1c17f41))
- 更新文档 ([d194055](https://github.com/Mereithhh/van-blog/commit/d1940558a4f6fc3d1d5eedb1cd90b6e5343defbb))
- 更新文档 ([197d84d](https://github.com/Mereithhh/van-blog/commit/197d84de60e76d1c7f4c335e776c57505867ea40))
- 更新文档 ([0b668a4](https://github.com/Mereithhh/van-blog/commit/0b668a47715332b365aa42950f6871138dfffa28))
- 预览图更新 ([4a7bd6f](https://github.com/Mereithhh/van-blog/commit/4a7bd6fd392a64c0487d6e54bf968707d55cde48))

### 🐛 Bug Fixes | Bug 修复

- markdown 中标题带有链接时目录无法正常展示 ([1cb79ba](https://github.com/Mereithhh/van-blog/commit/1cb79baa003631eeac6fefeef56b90b104310348))
- sitemap 失效 ([4e3cddd](https://github.com/Mereithhh/van-blog/commit/4e3cdddc29e944797e8a359acfe6f1c8311f45f1))
- 一键脚本错误 ([5deb9fa](https://github.com/Mereithhh/van-blog/commit/5deb9fa704da7a49c29a07a1ec53b0cfa4ed5eee))
- 优化 waline 重启逻辑 ([8e9325c](https://github.com/Mereithhh/van-blog/commit/8e9325cea0dd375db006e683509cf7edae1c6094))
- 修正一键脚本版本号显示问题 ([b30be89](https://github.com/Mereithhh/van-blog/commit/b30be89a694adf1246240b2bf85fb1b5a9ad68a7))
- 修正一键脚本的更新错误 ([f25db21](https://github.com/Mereithhh/van-blog/commit/f25db211daca043f8c4be6d5e6f0fa4c4b89f4ca))

## [0.41.0](https://github.com/Mereithhh/van-blog/compare/v0.40.2...v0.41.0) (2022-09-23)

### ✨ Features | 新功能

- 前台 next.js 服务增加意外退出自动重启机制（website 由后端通过 child_process 控制） ([930adc8](https://github.com/Mereithhh/van-blog/commit/930adc80f6358d152ebcef529a92b795b4c2a845))
- 后台增加控制页面链接点击跳转行为配置（可选择为在新窗口打开） ([7d214c8](https://github.com/Mereithhh/van-blog/commit/7d214c8dff2d08fa43393fc9baf769c36f1eccc7))
- 增加单天访客/访问数的趋势图 ([b55d603](https://github.com/Mereithhh/van-blog/commit/b55d603f72632fa98fbedea4a7f4bd1057a62bbe))
- 文章内的跳转链接会在新窗口/标签页打开 ([7a63eb4](https://github.com/Mereithhh/van-blog/commit/7a63eb43d2c1d6a32ed12cbcd37fb012bdd99b41))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.41.0 ([0d4568c](https://github.com/Mereithhh/van-blog/commit/0d4568c309839cba3d6fde3318e3dc5e502ca625))

### 👷 Continuous Integration | CI 配置

- 增加提交样例的 ISSUE 模板 ([7a4bb21](https://github.com/Mereithhh/van-blog/commit/7a4bb2185ea4dcaef0c8121a4009a1c53d1a96da))

### ✏️ Documentation | 文档

- 提交使用案例 ([9fb01d8](https://github.com/Mereithhh/van-blog/commit/9fb01d81c827aa5c03b2495e615c2488c46b70d9))
- 更新宝塔部署和升级文档 ([5e244a2](https://github.com/Mereithhh/van-blog/commit/5e244a2e42f65721f0d923e1273c85f770b17186))
- 更新文档 ([f288e1e](https://github.com/Mereithhh/van-blog/commit/f288e1ee1d7fa77d349bec78081857c4693888c8))
- 更新文档 ([b9d9eed](https://github.com/Mereithhh/van-blog/commit/b9d9eed8c3193b89d9f4af6859678f78d85efeae))
- 更新文档 ([e51b161](https://github.com/Mereithhh/van-blog/commit/e51b16170bff35c074dc9a8fbc39eee9d0150b30))
- 更新文档 ([0e0e482](https://github.com/Mereithhh/van-blog/commit/0e0e482c254ac5a6fa3fd7c1043fd3721313aea7))
- 更新文档 ([7297bbc](https://github.com/Mereithhh/van-blog/commit/7297bbce2d2b0e40a1370396e20461ee9c6ada3c))
- 更新文档 ([35199c9](https://github.com/Mereithhh/van-blog/commit/35199c9562b59ab246c78ee719bed668c6fe4625))
- 更新文档 ([edc519f](https://github.com/Mereithhh/van-blog/commit/edc519f4ef454194548d6302dbff28055f405b30))
- 补充文档关于 Caddy 的描述 ([9cc7e70](https://github.com/Mereithhh/van-blog/commit/9cc7e70fbafa3770b974db4d63c58d6d5adc4f9d))

### 🐛 Bug Fixes | Bug 修复

- 全文无标题但代码块内有 # 开头注释会被目录组件误识别成标题 ([bba4b48](https://github.com/Mereithhh/van-blog/commit/bba4b48a020e91d5199506dd186af3dbbde2d26b))
- 前台 markdown 组件渲染时报错 ([42892c1](https://github.com/Mereithhh/van-blog/commit/42892c1f5c1321ccdcb1d79566bcb9480d7005de))
- 后台编辑器渲染行内公式导致页面溢出 ([a9fb466](https://github.com/Mereithhh/van-blog/commit/a9fb4668acd01158f67a304653b1ec21c8f29f58))
- 图片名有空格编辑器无法预览 ([afab503](https://github.com/Mereithhh/van-blog/commit/afab50386fda610b83c0e9c9a05e9cdd05471aa0))
- 精简前台 next.js 配置文件去掉多余的报错 ([8c355f7](https://github.com/Mereithhh/van-blog/commit/8c355f781499e3b517fb378b4b983f9f0d9fc92f))

### ⏪ Revert | 回退

- 加个 fix 重新发版 ([7a94c34](https://github.com/Mereithhh/van-blog/commit/7a94c347546417fc6f67dcaa1297d32ed6a0f9e8))

### [0.40.2](https://github.com/Mereithhh/van-blog/compare/v0.40.1...v0.40.2) (2022-09-20)

### ⚡ Performance Improvements | 性能优化

- 调整一下 ISR 页面静态化顺序，这样串行 ISR 的时候修改的文章页和首页会优先更新 ([13641b6](https://github.com/Mereithhh/van-blog/commit/13641b6eb622d11e48d6207cbb7f9168a1112513))

### ✏️ Documentation | 文档

- j 优化一键脚本 ([9f93939](https://github.com/Mereithhh/van-blog/commit/9f939395b4e16da5b93d7bea668b5e32e211508a))
- README 增加一键部署脚本 ([1502a8b](https://github.com/Mereithhh/van-blog/commit/1502a8b94b622eabb52ca63019a4ac074cf73051))
- 更新文档 ([20ae6d2](https://github.com/Mereithhh/van-blog/commit/20ae6d27087dd98235ccb1d2925c4525632fbe68))
- 更新文档 ([8693c9b](https://github.com/Mereithhh/van-blog/commit/8693c9b672ae95e7cc17248b88bb47fc1c392842))
- 更新文档 ([b09cad8](https://github.com/Mereithhh/van-blog/commit/b09cad889dc3fba4b55612ae1ee969527939f6aa))
- 更新文档 ([e463729](https://github.com/Mereithhh/van-blog/commit/e4637296c35bb8aa75f9f1ede75d43faa1da6b5d))
- 部署脚本加个截图 ([4846520](https://github.com/Mereithhh/van-blog/commit/4846520934dc6da1e1eac10f15465a1cd41c87d1))

### [0.40.1](https://github.com/Mereithhh/van-blog/compare/v0.40.0...v0.40.1) (2022-09-20)

### ✏️ Documentation | 文档

- 更新文档 ([5763ae4](https://github.com/Mereithhh/van-blog/commit/5763ae4c28a68d192131aed03d9e7208a1c7bf5e))

### 🐛 Bug Fixes | Bug 修复

- 更新字数缓存防抖错误 & ISR 触发改为串行 ([d8311ac](https://github.com/Mereithhh/van-blog/commit/d8311ac55213ce09d6b9d68833529b1a1358e65c))
- 第一个一级标题不在目录中出现 ([da898ac](https://github.com/Mereithhh/van-blog/commit/da898acf9ac58f93ec834933713f8029166e904c))

## [0.40.0](https://github.com/Mereithhh/van-blog/compare/v0.39.0...v0.40.0) (2022-09-20)

### ⚡ Performance Improvements | 性能优化

- ISR 触发和 RSS 生成增加防抖 ([45f39f0](https://github.com/Mereithhh/van-blog/commit/45f39f050c7c2bfb312c3b8f4166fefd39829e73))
- 增加一些数据库索引 ([2e23496](https://github.com/Mereithhh/van-blog/commit/2e234967003393966daad0b94969b022e2bcf086))

### ✨ Features | 新功能

- picgo 可后台配置安装插件 [#48](https://github.com/Mereithhh/van-blog/issues/48) ([2a49110](https://github.com/Mereithhh/van-blog/commit/2a49110f705940656867519b66e7d47ed82d897e))
- 删除 JWT 密钥配置，每次启动完全随机 ([5ceefd1](https://github.com/Mereithhh/van-blog/commit/5ceefd17cd0e7c34d21d9be45439582593bdfb3d))
- 增加一个 robots.txt （原来是 robot.txt） ([0bf6563](https://github.com/Mereithhh/van-blog/commit/0bf65638480766dbbde70b0f65c4248e0e7c259c))
- 增加内置 Token 管理，登出或修改用户会强制失效所有已签发 Token [#45](https://github.com/Mereithhh/van-blog/issues/45) ([4984981](https://github.com/Mereithhh/van-blog/commit/4984981f0df3fab1fe3e29e766f7c1a2a7384ad2))
- 忘记密码恢复功能 ([48f2728](https://github.com/Mereithhh/van-blog/commit/48f272848de955c60844b4c7c4a2af093dd89773))
- 登录凭证有效期后台可配置 [#44](https://github.com/Mereithhh/van-blog/issues/44) ([853ca38](https://github.com/Mereithhh/van-blog/commit/853ca38968d13538784659d899b48adaaa202077))
- 自动生成 SiteMap ([2f4397c](https://github.com/Mereithhh/van-blog/commit/2f4397c542b6a785f0ff3ed1ef8f53f5cec3cdf1))

### ✏️ Documentation | 文档

- 先屏蔽一下一键脚本，测试后再打开 ([484e183](https://github.com/Mereithhh/van-blog/commit/484e1836c8bd46df446eb8ed4488be7471dfd87f))
- 增加全自动部署脚本 ([e7b7325](https://github.com/Mereithhh/van-blog/commit/e7b73253f0a0357e762445a1eac7ec63df327abc))
- 开放一键部署脚本 ([50f17f0](https://github.com/Mereithhh/van-blog/commit/50f17f058bf9aba7aa3d70eb4fd0835c1058ef11))
- 更新 tudo ([08670b7](https://github.com/Mereithhh/van-blog/commit/08670b7ca95ab18538dea73712c824b21f7b0205))
- 更新打赏信息 ([bd1cc23](https://github.com/Mereithhh/van-blog/commit/bd1cc235291b0c494dd9ff593cf09f90facc1ab0))
- 更新文档 ([b97ec09](https://github.com/Mereithhh/van-blog/commit/b97ec0998017d13ef8b600aac2a6a65c18bf5de9))
- 更新文档 ([417a48f](https://github.com/Mereithhh/van-blog/commit/417a48f1aaaec4fc3b561d128d54dfae5a7bfe58))
- 更新文档 ([8ef4869](https://github.com/Mereithhh/van-blog/commit/8ef486907498ffaa24ef8222e5b6a065038c98d8))
- 更新文档 ([cf49a85](https://github.com/Mereithhh/van-blog/commit/cf49a852c9cea5651ec56ff6045171300253a8e8))
- 更新文档 ([a3fd9ab](https://github.com/Mereithhh/van-blog/commit/a3fd9ab7cf2da916ea316eeeca89aea5506bf186))
- 更新文档 ([4681052](https://github.com/Mereithhh/van-blog/commit/46810526248110fc44f5c22fe97ddf91f6c4fd98))
- 更新文档 ([a3989aa](https://github.com/Mereithhh/van-blog/commit/a3989aa3fa2be251b5ac9e9d057edd7f92bd3585))
- 更新文档（FAQ） ([ead35db](https://github.com/Mereithhh/van-blog/commit/ead35dbae039ff2792c383081564184834fa2dbd))
- 更新新功能的文档 ([74e689d](https://github.com/Mereithhh/van-blog/commit/74e689d946d220b7a717f55d562a652a43463e23))
- 精简编排配置项 ([64ad8a8](https://github.com/Mereithhh/van-blog/commit/64ad8a857fb811c8385607d96b4b1dcff767eef0))
- 群晖和宝塔部署默认推荐映射存储防止数据丢失 ([99f6edc](https://github.com/Mereithhh/van-blog/commit/99f6edc1f730dc8d9defa24a8fb99e355f56010e))

## [0.39.0](https://github.com/Mereithhh/van-blog/compare/v0.38.2...v0.39.0) (2022-09-17)

### ✨ Features | 新功能

- SEO 优化：文章页、首页和列表页会根据标签和分类增加 keywords 的 meta 标签 ([26733ff](https://github.com/Mereithhh/van-blog/commit/26733ff89c1666032160a9154fbe3d9450892fe4))
- 内置 waline 支持传递自定义的环境变量配置 ([99e4305](https://github.com/Mereithhh/van-blog/commit/99e4305badc67bf21b54f3a9c84c3391cf19c9ce))
- 后台增加迁移助手，可批量导入草稿/文章 ([d1e3166](https://github.com/Mereithhh/van-blog/commit/d1e3166dd13d7503cdbbaced82823343f5015bcd))

### ✏️ Documentation | 文档

- 更新一下 faq ([87dd17c](https://github.com/Mereithhh/van-blog/commit/87dd17c69927e4fc1f678c64af44800656613612))
- 更新一个群晖部署文档 ([9d9f4ae](https://github.com/Mereithhh/van-blog/commit/9d9f4aee1b4177b2dc347710c69ea7cd3260be52))
- 更新文档 ([d9844a7](https://github.com/Mereithhh/van-blog/commit/d9844a79e2aaee4c1064500230b1efcbf8e02986))
- 更新文档 ([4096b34](https://github.com/Mereithhh/van-blog/commit/4096b345dcaa68f54dbb660b3a4a6aa9a90de144))
- 更新文档 ([7f3c2f8](https://github.com/Mereithhh/van-blog/commit/7f3c2f86ee719e4ba10eab19c118e5307b8d176d))
- 更新文档 ([fc4686c](https://github.com/Mereithhh/van-blog/commit/fc4686c9a8f536e54c0512636aa544b39f579d7b))
- 更新文档 ([ba56bf5](https://github.com/Mereithhh/van-blog/commit/ba56bf5efb10ae554d0891b384e6ec498848d9be))
- 更新文档&捐赠信息 ([1137404](https://github.com/Mereithhh/van-blog/commit/113740425b2d64337b562b671029a4e00074a0df))

### 🐛 Bug Fixes | Bug 修复

- 分类导航栏显示时，分类过长导致的排版错乱 ([f42469d](https://github.com/Mereithhh/van-blog/commit/f42469d893e7583ba61a3ebeba9ea5e81de981b0))
- 分类或标签中含有 # 或 / 出现的 404 问题 ([5e4ae6c](https://github.com/Mereithhh/van-blog/commit/5e4ae6c5c1a2bb8755f21d2e720438496eb458ab))
- 友链申领要求重复 ([81c03dd](https://github.com/Mereithhh/van-blog/commit/81c03dd9abd2258dccb4419d388fa108f512ab27))
- 群晖系统无法登录评论后台 ([450d6c6](https://github.com/Mereithhh/van-blog/commit/450d6c6a68a2911dbf3b442b8b7c39c639cb4adf))

### [0.38.2](https://github.com/Mereithhh/van-blog/compare/v0.38.1...v0.38.2) (2022-09-14)

### ✏️ Documentation | 文档

- 更新捐赠信息 ([398c08c](https://github.com/Mereithhh/van-blog/commit/398c08caa817ce8d880b538ca62e51c7e419058d))
- 更新文档 ([3c2cfde](https://github.com/Mereithhh/van-blog/commit/3c2cfdeddf04bbe9de4ea474bc1a4500cb2a7095))
- 更新文档 ([2316912](https://github.com/Mereithhh/van-blog/commit/23169127576d93c5ca433b9a98b0c9fff44a594c))

### 🐛 Bug Fixes | Bug 修复

- 标题和标签中携带"#"导致目录和标签页显示不正常 ([81baad5](https://github.com/Mereithhh/van-blog/commit/81baad553342b0e7dd2ce041a90b69be5efe3de7))

### [0.38.1](https://github.com/Mereithhh/van-blog/compare/v0.38.0...v0.38.1) (2022-09-13)

### ✏️ Documentation | 文档

- 更新文档 ([4bd795a](https://github.com/Mereithhh/van-blog/commit/4bd795a47dc1e438e7343070cb96041dfdf7dd4b))

### 🐛 Bug Fixes | Bug 修复

- RSS 订阅中的 HTML 出现了不合时宜的 a 标签 ([dc86650](https://github.com/Mereithhh/van-blog/commit/dc866501c2f58b169383fbca9b653e7b77050217))

## [0.38.0](https://github.com/Mereithhh/van-blog/compare/v0.37.2...v0.38.0) (2022-09-13)

### ✨ Features | 新功能

- 后台编辑器预览内嵌 HTML [#47](https://github.com/Mereithhh/van-blog/issues/47) ([c920a2e](https://github.com/Mereithhh/van-blog/commit/c920a2e8aded13297a2721032ea85b09796c8bee))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.38.0 ([d16e10b](https://github.com/Mereithhh/van-blog/commit/d16e10b28528610b24639f51bd2236e8d8d6adc2))

### ✏️ Documentation | 文档

- 更新 TODO ([a571cfa](https://github.com/Mereithhh/van-blog/commit/a571cfa37063bffaedb04622e9dd928fff64878d))
- 更新文档 ([883696f](https://github.com/Mereithhh/van-blog/commit/883696f42303dd0ed118c0b9846fa897f5284154))
- 更新文档 ([4b20720](https://github.com/Mereithhh/van-blog/commit/4b20720d1a64bbc857b1367635e2017712d046a6))

### 🐛 Bug Fixes | Bug 修复

- 初始化未添加默认菜单信息导致前台无法更新 ([8064dbb](https://github.com/Mereithhh/van-blog/commit/8064dbbd41a8c1db5d6c224cfdbff4a417b7c3e3))

### [0.37.2](https://github.com/Mereithhh/van-blog/compare/v0.37.1...v0.37.2) (2022-09-13)

### ✏️ Documentation | 文档

- 更新文档 ([d1cd10c](https://github.com/Mereithhh/van-blog/commit/d1cd10c5467aba2002b9f168a7dc4347acdd2362))

### 🐛 Bug Fixes | Bug 修复

- 无凭证首次进入后台出现登录失效 [#46](https://github.com/Mereithhh/van-blog/issues/46) ([6af8093](https://github.com/Mereithhh/van-blog/commit/6af8093176507d819bcd0496b7595c9eda79c41a))

### [0.37.1](https://github.com/Mereithhh/van-blog/compare/v0.37.0...v0.37.1) (2022-09-12)

### ✏️ Documentation | 文档

- 更新文档 ([88dab53](https://github.com/Mereithhh/van-blog/commit/88dab53b14b416e1ee4e9458982be5aadcbb46c1))
- 更新文档 ([5419976](https://github.com/Mereithhh/van-blog/commit/54199760cfe86817ea855ea4c3ddfac443562e39))
- 更新文档 ([baacf31](https://github.com/Mereithhh/van-blog/commit/baacf31d175b672162268b2ada7c7ca778e15610))

### 🐛 Bug Fixes | Bug 修复

- 目录组件 hover 态不填满卡片 ([580d78d](https://github.com/Mereithhh/van-blog/commit/580d78da9599799963eb6f0ccd2081c11a825978))

## [0.37.0](https://github.com/Mereithhh/van-blog/compare/v0.36.2...v0.37.0) (2022-09-10)

### ✏️ Documentation | 文档

- 更新文档 ([833baeb](https://github.com/Mereithhh/van-blog/commit/833baeb685afe0d0181ab4db25f870515a59283b))
- 更新文档 ([1ac5dc0](https://github.com/Mereithhh/van-blog/commit/1ac5dc0a2240abce713ccd91f42b7ccaa02ce638))
- 部署编排更新一个初始化数据库的环境变量 ([72213c8](https://github.com/Mereithhh/van-blog/commit/72213c880caad9a55a63e0a7aa4e4708f99b3e5e))

### 🐛 Bug Fixes | Bug 修复

- 关闭用户缩放 [#40](https://github.com/Mereithhh/van-blog/issues/40) ([3bb1117](https://github.com/Mereithhh/van-blog/commit/3bb1117cce24ca2c3f1499a16847a0ae40cc96ef))
- 草稿导入 ID 重复 [#42](https://github.com/Mereithhh/van-blog/issues/42) ([a69d028](https://github.com/Mereithhh/van-blog/commit/a69d028ba5d0346a94dbc9eb392dcaa386fb0636))

### ✨ Features | 新功能

- 前台代码块随主题亮暗切换 [#43](https://github.com/Mereithhh/van-blog/issues/43) ([fe3c09e](https://github.com/Mereithhh/van-blog/commit/fe3c09e29ae49ebc5baa31fa22feebe03ab8b2f1))
- 升级提示可跳过某个版本 ([35f9f00](https://github.com/Mereithhh/van-blog/commit/35f9f00dd63b62e9c70331b3eb52ee4e82ccde5a))
- 导航菜单完全自定义&二级菜单 [#34](https://github.com/Mereithhh/van-blog/issues/34) ([12f4577](https://github.com/Mereithhh/van-blog/commit/12f4577b2fc5a65e156351275148b93b76d85963))

### ♻️ Code Refactoring | 代码重构

- 代码组件抽离原子化 ([187e48a](https://github.com/Mereithhh/van-blog/commit/187e48ae197fc7f999bc8829f3ec6ecf669a33b1))
- 文章卡片组件抽离 ([7df186a](https://github.com/Mereithhh/van-blog/commit/7df186abe88b62a543076f06564ca83905caaf4d))

### [0.36.2](https://github.com/Mereithhh/van-blog/compare/v0.36.1...v0.36.2) (2022-09-08)

### ✏️ Documentation | 文档

- 更新打赏列表 ([73bc1ab](https://github.com/Mereithhh/van-blog/commit/73bc1ab69358298631fe7e4390c6e814801581b9))
- 更新文档 ([aab5979](https://github.com/Mereithhh/van-blog/commit/aab59793e668bd18086c8ecc0981f2b194705e14))
- 更新文档 ([85a9cdc](https://github.com/Mereithhh/van-blog/commit/85a9cdc7027082b8734dd1e0e3537e3b47b156af))

### 🐛 Bug Fixes | Bug 修复

- 友链超过 5 个无法添加[#39](https://github.com/Mereithhh/van-blog/issues/39) ([a2b60f2](https://github.com/Mereithhh/van-blog/commit/a2b60f262c0ffdca0da0455fe471587eaaf2a877))

### [0.36.1](https://github.com/Mereithhh/van-blog/compare/v0.36.0...v0.36.1) (2022-09-08)

### ✏️ Documentation | 文档

- 更新捐赠信息&修复错误 ([9cc25af](https://github.com/Mereithhh/van-blog/commit/9cc25af7833fb4cd214dc22aa07aa47c829ebbff))
- 更新文档 ([39bf2dc](https://github.com/Mereithhh/van-blog/commit/39bf2dc56b2fbf7ced6ea85f192236ba45d1f298))
- 更新文档 ([50aa999](https://github.com/Mereithhh/van-blog/commit/50aa999222b20ce66c26187869ad04db937ef367))

### ✨ Features | 新功能

- 编辑器后台增加清理缓存按钮 [#38](https://github.com/Mereithhh/van-blog/issues/38) ([647bd08](https://github.com/Mereithhh/van-blog/commit/647bd080a332c9718270ca5645355f3b48752368))

## [0.36.0](https://github.com/Mereithhh/van-blog/compare/v0.35.0...v0.36.0) (2022-09-07)

### 🐛 Bug Fixes | Bug 修复

- 多个 more 标记时前台内容截取了指定字符 ([953d354](https://github.com/Mereithhh/van-blog/commit/953d3549ecc7e4b626e18486682b60022c77ab55))

### ✨ Features | 新功能

- 后台编辑器可以选择 emoji 表情啦 ([55b73b1](https://github.com/Mereithhh/van-blog/commit/55b73b12df6a9c4a38fb25c54303260c97fbd2cf))

### ✏️ Documentation | 文档

- 更新文档 ([f678882](https://github.com/Mereithhh/van-blog/commit/f6788823bfdbc9cb93119bdd2d044b107ff5287b))
- 更新表情选择器文档 ([ca5509a](https://github.com/Mereithhh/van-blog/commit/ca5509a5e1575367965fc608d384ce687f26fce8))

## [0.35.0](https://github.com/Mereithhh/van-blog/compare/v0.34.0...v0.35.0) (2022-09-07)

### ✨ Features | 新功能

- 支持高亮块语法（老费劲了） [#37](https://github.com/Mereithhh/van-blog/issues/37) ([ccf6356](https://github.com/Mereithhh/van-blog/commit/ccf6356294c913401c45accc592e75027c2d2e4f))

### ✏️ Documentation | 文档

- 更新文档 ([bcbf7e6](https://github.com/Mereithhh/van-blog/commit/bcbf7e6a0aba4ba9bb1d9a93f5e392f6a7d6b823))
- 更新文档 ([3589feb](https://github.com/Mereithhh/van-blog/commit/3589feb9ddfd766d3d785d1eb9277be3942ecf06))

### 🐛 Bug Fixes | Bug 修复

- mac 下侧边栏卡片溢出滚动下会出现样式问题 ([d452b56](https://github.com/Mereithhh/van-blog/commit/d452b5655af885784840663973987bf5506f086c))
- mac 下长目录无法跟随滚动 & 优化滚动效果 ([9296820](https://github.com/Mereithhh/van-blog/commit/929682098a10b772708545f58eb0abd98ab74855))
- 获取协作者列表报错 ([33a1501](https://github.com/Mereithhh/van-blog/commit/33a15017fa1e3831828888b1e8b3b5724f7ea9c8))
- 返回顶部按钮触发不丝滑 ([8d086f2](https://github.com/Mereithhh/van-blog/commit/8d086f2fd3ecf39f0b53bf49f6d23c8b142158e9))

## [0.34.0](https://github.com/Mereithhh/van-blog/compare/v0.33.0...v0.34.0) (2022-09-06)

### ✏️ Documentation | 文档

- 修改项目主页文档配置 ([a258328](https://github.com/Mereithhh/van-blog/commit/a258328168c61d59943c7c8ac8fcf14fa22f6a9c))
- 修正错别字 ([87fcaed](https://github.com/Mereithhh/van-blog/commit/87fcaedc3d33674c9345d0ec79b9e15b836bc10e))
- 更新文档 ([b7eee7a](https://github.com/Mereithhh/van-blog/commit/b7eee7a16f8b6ad9dc4c49e7fcd22438a818467e))
- 更新文档 ([0f6fd97](https://github.com/Mereithhh/van-blog/commit/0f6fd9743adafccf7e96aba9074066b30a5d2be9))
- 更新文档 ([5310877](https://github.com/Mereithhh/van-blog/commit/5310877bca6b1a012ed5b2fe98a1cfceb80d0c73))

### ✨ Features | 新功能

- 加一个交流群 ([548bee7](https://github.com/Mereithhh/van-blog/commit/548bee778d804d6596358280e6a96fdef3ffe9e0))
- 密码加盐&去除所有明文密码 ([61ab13d](https://github.com/Mereithhh/van-blog/commit/61ab13dc2d4a52f281530c5276cda775b66c2404))

### ♻️ Code Refactoring | 代码重构

- 删除一些前台未使用的引用和代码 ([ac1eb31](https://github.com/Mereithhh/van-blog/commit/ac1eb3199c21570319ff39397349b525e1891bc9))
- 在前台 Layout 组件中抽离一些组件 ([445c00b](https://github.com/Mereithhh/van-blog/commit/445c00bc012c1ec911d27ad5953690cbc469ac81))

## [0.33.0](https://github.com/Mereithhh/van-blog/compare/v0.32.2...v0.33.0) (2022-09-06)

### 🐛 Bug Fixes | Bug 修复

- http 访问后台无法拷贝链接到截切版 ([6292fc4](https://github.com/Mereithhh/van-blog/commit/6292fc414695ae5dacfecacafd92fbb25a4a48dd))

### 👷 Continuous Integration | CI 配置

- 精简镜像体积 [#36](https://github.com/Mereithhh/van-blog/issues/36) ([250c248](https://github.com/Mereithhh/van-blog/commit/250c248e09cd4ff35b549bdc31d8dae927383c78))

### ✏️ Documentation | 文档

- 文档中替换掉 sudo（有时候加上反而起不来） ([e85e2da](https://github.com/Mereithhh/van-blog/commit/e85e2da2de176aceb54025ea247dc75dbf0c8fa9))
- 更新 TODO ([9c592a1](https://github.com/Mereithhh/van-blog/commit/9c592a17ffe671bb35fc88aa49f6c354df640173))
- 更新开发指南 ([5254186](https://github.com/Mereithhh/van-blog/commit/5254186233dc6aaa4f6965a936517a7e107ec755))
- 更新文档 ([470f54d](https://github.com/Mereithhh/van-blog/commit/470f54d1672923fe73837d48e3808f640aaf1453))
- 更新文档 ([3005034](https://github.com/Mereithhh/van-blog/commit/30050345f342876f96549846bcde16940fad59c9))
- 更新文档 ([442557b](https://github.com/Mereithhh/van-blog/commit/442557bd2c58a9c35e85c984242ebe3793e9abd1))

### ✨ Features | 新功能

- 后台创建修改文章或草稿时增加首次使用先创建分类的提示 ([360e2a5](https://github.com/Mereithhh/van-blog/commit/360e2a57431b64ec14e2e5b7d07caf18c93c75da))
- 后端会在库里记录当前版本信息，方便修改数据结构后的清洗 ([781d747](https://github.com/Mereithhh/van-blog/commit/781d7474d570e4451888e293c0d1d4da750c0b1b))
- 文章草稿可指定作者，默认为登录用户 [#31](https://github.com/Mereithhh/van-blog/issues/31) ([e2a23e2](https://github.com/Mereithhh/van-blog/commit/e2a23e29fcbbbf644f2d3fb474c373ce6f59d9f9))
- 编辑器偏好设置（可选择保存按钮点击后的行为）[#35](https://github.com/Mereithhh/van-blog/issues/35) ([d3907e8](https://github.com/Mereithhh/van-blog/commit/d3907e87022f39251ca737a9916dab14b2f71759))
- 编辑器页面增加一个返回按钮 [#35](https://github.com/Mereithhh/van-blog/issues/35) ([987a8cb](https://github.com/Mereithhh/van-blog/commit/987a8cbaf07366070b70807ab0599b7403bad127))

### [0.32.2](https://github.com/Mereithhh/van-blog/compare/v0.32.1...v0.32.2) (2022-09-05)

### ✏️ Documentation | 文档

- 增加 issue 模板 ([9eb44d9](https://github.com/Mereithhh/van-blog/commit/9eb44d9ef0a61dcfa628d39ce47676530aa59004))
- 更新 issues 模板 ([e806f86](https://github.com/Mereithhh/van-blog/commit/e806f86537f687c1bacac419d03d60315291caa3))
- 更新一下 issue 链接 ([1d2f9e4](https://github.com/Mereithhh/van-blog/commit/1d2f9e49ff034776a651681be62ca8a9df67dd06))
- 更新文档 ([3f6d568](https://github.com/Mereithhh/van-blog/commit/3f6d5682c88c6c98ced2a3c692d5a51825957ba2))

### ♻️ Code Refactoring | 代码重构

- 自己实现目录导航组件 [#29](https://github.com/Mereithhh/van-blog/issues/29) ([7648c1e](https://github.com/Mereithhh/van-blog/commit/7648c1e5351b482d252fb061b045b9321e412db9))

### 🐛 Bug Fixes | Bug 修复

- 修复后台布局设置时提示 URL 不合法的问题 [#32](https://github.com/Mereithhh/van-blog/issues/32) ([3b37cbb](https://github.com/Mereithhh/van-blog/commit/3b37cbb518f7d48c83191fa0f71c099e2720e19a))
- 协作者提示没权限发布草稿 [#31](https://github.com/Mereithhh/van-blog/issues/31) ([708d80a](https://github.com/Mereithhh/van-blog/commit/708d80aeff57373b941ec616c5e61ca8dfe9f2ea))

### [0.32.1](https://github.com/Mereithhh/van-blog/compare/v0.32.0...v0.32.1) (2022-09-04)

### ✏️ Documentation | 文档

- 更新 todo ([9a813d8](https://github.com/Mereithhh/van-blog/commit/9a813d8121c3f13f9add1a80580f239af074c09b))
- 更新 tudo ([592b5ef](https://github.com/Mereithhh/van-blog/commit/592b5ef39d289277bcd058f1a920ccb4040f648d))
- 更新文档 ([2efd18f](https://github.com/Mereithhh/van-blog/commit/2efd18f78f5eb192811d554600f9045b95cde4e7))
- 更新文档 ([6794d6a](https://github.com/Mereithhh/van-blog/commit/6794d6a21085e92ba192648f0dd639241a8852f5))

### 🐛 Bug Fixes | Bug 修复

- 增加传输 json 请求体大小限制 ([4a4df3e](https://github.com/Mereithhh/van-blog/commit/4a4df3e4c7880c5d1f013145e9bf53be7d80a1d2))
- 由于网站 URL 填写格式错误导致的老版本升级后容器无限重启[#27](https://github.com/Mereithhh/van-blog/issues/27) ([4c33704](https://github.com/Mereithhh/van-blog/commit/4c337040ca5ee94a25b641d5b2fd7f17ba6ab96c))

### ✨ Features | 新功能

- 首次进入后台时检查 ALLOW_DOMAINS 和 baseUrl，如不合法会弹窗提示 ([15ee5a7](https://github.com/Mereithhh/van-blog/commit/15ee5a733f95fe57d0f513cd1b2f37dcfe309b36))

## [0.32.0](https://github.com/Mereithhh/van-blog/compare/v0.31.0...v0.32.0) (2022-09-04)

### ✏️ Documentation | 文档

- 更新文档 ([9e3fdab](https://github.com/Mereithhh/van-blog/commit/9e3fdab5afea3fcdbeae95452cb93bfa9b5d40d3))

### 🐛 Bug Fixes | Bug 修复

- 评论组件下拉拖动卡顿 ([94f6a3a](https://github.com/Mereithhh/van-blog/commit/94f6a3abadc6277775d2dd375e5bb5b3034f3d87))

### ✨ Features | 新功能

- 优化初始化表单样式&文案 || 优化 rss 订阅生成字段取值 ([43d0c93](https://github.com/Mereithhh/van-blog/commit/43d0c932d592837b6026ff509f8c7809beda13e4))
- 修复 README 中的坏链 ([78f11ef](https://github.com/Mereithhh/van-blog/commit/78f11efe6539a263dfdcf55f7552a5503bd393a9))
- 导航栏的按钮增加 hover 态的文案（title 属性） ([866456a](https://github.com/Mereithhh/van-blog/commit/866456af1ca3fd26627fa1457cec1b1a1cdf303a))
- 支持 RSS 订阅（小尺寸管理员按钮转移到了抽屉导航栏中） ([5e08dbf](https://github.com/Mereithhh/van-blog/commit/5e08dbf723d7c4ebfc0f42a88b20e585b204ad37))

## [0.31.0](https://github.com/Mereithhh/van-blog/compare/v0.30.1...v0.31.0) (2022-09-03)

### ✏️ Documentation | 文档

- 更新 FAQ ([a703299](https://github.com/Mereithhh/van-blog/commit/a70329939b3ab75832e2ce4468189c981a990f3a))
- 更新文档 ([994c603](https://github.com/Mereithhh/van-blog/commit/994c603726422cf9202792c97c114e1bdb4bc39e))
- 更新文档 ([9c8913e](https://github.com/Mereithhh/van-blog/commit/9c8913e187e788cca90fcf94fb1461b5a3b262ea))
- 更新文档 ([14ffe90](https://github.com/Mereithhh/van-blog/commit/14ffe90ae160b777c5ff730897cf9d4c7d59a59a))
- 自定义页面文档 ([a0ea105](https://github.com/Mereithhh/van-blog/commit/a0ea1053e2ee4252bcc0bbd6c325e749bf8ef105))

### ✨ Features | 新功能

- 完整的自定义页面功能 ([c53321a](https://github.com/Mereithhh/van-blog/commit/c53321ab9c50ab60dc2bae852073ca4502b86ea0))
- 更新提示增加清理浏览器缓存提醒 ([ac65bc2](https://github.com/Mereithhh/van-blog/commit/ac65bc20152a3333e3f0e248b9f395c1cf1543cf))
- 演示站不可自定义页面（怕有人搞事情） ([a826d46](https://github.com/Mereithhh/van-blog/commit/a826d46b5fc1c70a63d7080cace6aa05ec3a1239))
- 自定义页面的代码编辑器增加查看按钮 ([7a32948](https://github.com/Mereithhh/van-blog/commit/7a32948c8ce745c1466e556a81679c79c7aa5aca))

### [0.30.1](https://github.com/Mereithhh/van-blog/compare/v0.30.0...v0.30.1) (2022-09-03)

### 🐛 Bug Fixes | Bug 修复

- 更新后无法登录[#26](https://github.com/Mereithhh/van-blog/issues/26) ([040cfe9](https://github.com/Mereithhh/van-blog/commit/040cfe9e42f6ffca711d5755d4dd36046db6293a))

### ✏️ Documentation | 文档

- 更新文档 ([b0dcd7a](https://github.com/Mereithhh/van-blog/commit/b0dcd7af7c04f09a72076c72d362e26fdf5343b8))
- 更新文档 ([ab44644](https://github.com/Mereithhh/van-blog/commit/ab4464427cc5ee357fda9b46138cb320d1628e44))

## [0.30.0](https://github.com/Mereithhh/van-blog/compare/v0.29.4...v0.30.0) (2022-09-03)

### ✏️ Documentation | 文档

- mongo 默认用 v4 版本（某些机器不支持 avx 无法启动大于 v5 版本） ([9b1295c](https://github.com/Mereithhh/van-blog/commit/9b1295cc3c628b019a4fe7e526e07fd08ad9b76a))
- 增加宝塔面板部署教程 ([ebe7628](https://github.com/Mereithhh/van-blog/commit/ebe76287b25974585c65d94b35928207f2ea9b5c))
- 更新文档 ([30dab24](https://github.com/Mereithhh/van-blog/commit/30dab24272f5d8fb2b82b842ac019ec0c8d82601))
- 更新文档 ([e658519](https://github.com/Mereithhh/van-blog/commit/e65851942410043fd8901f50f7acc530cb985ab3))
- 更新文档 ([49725f4](https://github.com/Mereithhh/van-blog/commit/49725f461a411a09d524d0d4016f10cfbedd4820))

### 👷 Continuous Integration | CI 配置

- 完善构建测试镜像脚本 ([cd5dc19](https://github.com/Mereithhh/van-blog/commit/cd5dc199cee15905583cd96705207a29681766d4))

### 🐛 Bug Fixes | Bug 修复

- 分类页面不显示 404 ([519f7fd](https://github.com/Mereithhh/van-blog/commit/519f7fdb21b643bba81a2b225e71815667fb9f58))
- 未设置站点图标时友情链接的站点信息用作者头像或默认头像 ([7b5e8c3](https://github.com/Mereithhh/van-blog/commit/7b5e8c37416c67919e0d4a4dc8bcc83a2ad270f8))

### ✨ Features | 新功能

- 协作者模式：添加指定权限的协作者账号 ([ebc8543](https://github.com/Mereithhh/van-blog/commit/ebc85431323cdb66b7c65bf4ff16e52985da5b9e))
- 后台关于页面增加更新日志跳转链接 ([ac1647c](https://github.com/Mereithhh/van-blog/commit/ac1647cfd239360c4dfd3696e3609aeaca908125))
- 后台可手动触发增量渲染 ([acb8718](https://github.com/Mereithhh/van-blog/commit/acb87184e34262ff2e1207f448214ee799090b8c))
- 增加实验性登录安全策略配置（暂不开放） ([70cf98b](https://github.com/Mereithhh/van-blog/commit/70cf98b92fa706ba32e3f69b8fdbea072fab8fa4))
- 增加是否显示打赏按钮和版权声明的配置项 ([fbfa930](https://github.com/Mereithhh/van-blog/commit/fbfa930fe03280af2241c3c46a7cf6441ee13b38))
- 增加登录失败检测，同一个 ip 连续三次登录失败需要等 60 秒 ([ba6b663](https://github.com/Mereithhh/van-blog/commit/ba6b663dbf6e1b36f1666938bc17de678dd7d7ee))
- 每到整点触发一次 ISR（避免某些情况下自动主题模式闪屏） ([cf367a2](https://github.com/Mereithhh/van-blog/commit/cf367a22dd44ad7e23971d704c838521e65465fe))

### [0.29.4](https://github.com/Mereithhh/van-blog/compare/v0.29.3...v0.29.4) (2022-09-02)

### ✏️ Documentation | 文档

- 更新文档 ([642fc2a](https://github.com/Mereithhh/van-blog/commit/642fc2af8a05d1340a1a7973e93817e071aceaef))

### ✨ Features | 新功能

- 演示站禁止发布草稿 ([5727dfb](https://github.com/Mereithhh/van-blog/commit/5727dfb6077475f3f77db4242ff5ea6e1f007ba9))

### [0.29.3](https://github.com/Mereithhh/van-blog/compare/v0.29.2...v0.29.3) (2022-09-02)

### ✏️ Documentation | 文档

- 修正 readme 错误 ([ef7ea39](https://github.com/Mereithhh/van-blog/commit/ef7ea395c10b6e6f3844daf8d1f8587c2dd22104))
- 更新文档 ([c63fcd6](https://github.com/Mereithhh/van-blog/commit/c63fcd636d8a3b77989d8ce88359d55e55698429))

### ✨ Features | 新功能

- 演示站紧急收缩权限（因为有人放黄色信息） ([8bdb47e](https://github.com/Mereithhh/van-blog/commit/8bdb47e8c0a9641ac44cf4dad7eaeed5c3fc4c2b))

### [0.29.2](https://github.com/Mereithhh/van-blog/compare/v0.29.1...v0.29.2) (2022-09-02)

### ✏️ Documentation | 文档

- 更新文档 ([744f928](https://github.com/Mereithhh/van-blog/commit/744f928c332d2a017b9e08fc2b5f258037eed7a7))
- 更新文档 ([b6f92d7](https://github.com/Mereithhh/van-blog/commit/b6f92d7868898d61bd07b8a0cb71bb994ca12ba7))

### 🐛 Bug Fixes | Bug 修复

- 后台定制化页面帮助文档指向错误 ([b3ce96e](https://github.com/Mereithhh/van-blog/commit/b3ce96e0819f80ff37f604ace1cb2c0ab736b80b))

### [0.29.1](https://github.com/Mereithhh/van-blog/compare/v0.29.0...v0.29.1) (2022-09-02)

### ✏️ Documentation | 文档

- 更新文档 ([4cbe723](https://github.com/Mereithhh/van-blog/commit/4cbe7239d9818da9aab7446305d4faf4efd6ac19))

### ✨ Features | 新功能

- 优化代码块展示样式（超出不会截断而是会横向滚动） ([61e968c](https://github.com/Mereithhh/van-blog/commit/61e968c30e123773e69457fcb5c798bfb57947a2))

## [0.29.0](https://github.com/Mereithhh/van-blog/compare/v0.28.1...v0.29.0) (2022-09-02)

### ✨ Features | 新功能

- 后台和 server 的自定义 CSS、HTML、Script 框架搭建 ([279f018](https://github.com/Mereithhh/van-blog/commit/279f0182251c1ecb7209cafc9f0f5251dfd99b9a))
- 完善定制化功能（可自定义 HTML、CSS、Script） ([889533f](https://github.com/Mereithhh/van-blog/commit/889533f0876cd38633969a8a9f0dd9b9f0a6a61b))

### ✏️ Documentation | 文档

- 完善一下部署教程 ([c2fbeb3](https://github.com/Mereithhh/van-blog/commit/c2fbeb3a853f36418399a35d9e132f24a9da51d8))
- 更新文档 ([bbf0f85](https://github.com/Mereithhh/van-blog/commit/bbf0f850c37dae0a8aa704bb5849e61534ff09ba))
- 更新文档 ([3d2007b](https://github.com/Mereithhh/van-blog/commit/3d2007bd22ab50819632b5be4880d5fb991869f6))
- 更新新功能文档 ([68ef6c1](https://github.com/Mereithhh/van-blog/commit/68ef6c135a4a42c9fee95687b950a8a83e32b3f3))

### [0.28.1](https://github.com/Mereithhh/van-blog/compare/v0.28.0...v0.28.1) (2022-09-02)

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.28.1 ([837bf67](https://github.com/Mereithhh/van-blog/commit/837bf67d172eb2cdbc4c83e529e7d217b0f0933f))

### ✏️ Documentation | 文档

- 更新 tudo ([9556b3f](https://github.com/Mereithhh/van-blog/commit/9556b3f32c92198c0f2fae130363a6b4509c9086))
- 更新文档 ([57c4aed](https://github.com/Mereithhh/van-blog/commit/57c4aedf14fe52bf60aaf97a0bf8b350b13baf6c))
- 更新文档 ([3dbb04a](https://github.com/Mereithhh/van-blog/commit/3dbb04a5d12fdd2e97c54c372b5bea202b3c074b))
- 更新文档 ([3b5cb58](https://github.com/Mereithhh/van-blog/commit/3b5cb58b5901ce9ce941cdcb5caab049f3096a97))

### ⏪ Revert | 回退

- 多改一个 bug 再发版 ([d9c322b](https://github.com/Mereithhh/van-blog/commit/d9c322b2512d639d9c776f240e4af414a92d405b))

### 🐛 Bug Fixes | Bug 修复

- 建站时间不够精确 [#21](https://github.com/Mereithhh/van-blog/issues/21) ([1098765](https://github.com/Mereithhh/van-blog/commit/1098765480384c8d664f67fd3b5a7dfb4a0b0fc7))
- 隐藏文章会出现在其他文章的上一篇/下一篇 [#19](https://github.com/Mereithhh/van-blog/issues/19) ([9033e4a](https://github.com/Mereithhh/van-blog/commit/9033e4a2bed0f296a90b71c96fe8494f3a490c36))

## [0.28.0](https://github.com/Mereithhh/van-blog/compare/v0.27.3...v0.28.0) (2022-09-01)

### ✏️ Documentation | 文档

- update todo’ ([b32d7ce](https://github.com/Mereithhh/van-blog/commit/b32d7ceb430e54704e5963964a9918e80f0fe115))
- 增加裸机部署指南 ([dcdc94e](https://github.com/Mereithhh/van-blog/commit/dcdc94e86be63b5bc70945d0b36bde463980ff7f))
- 更新文档 ([2abe492](https://github.com/Mereithhh/van-blog/commit/2abe492e5dda2aace2196ed54df43a01c91de613))
- 更新文档 ([b00597f](https://github.com/Mereithhh/van-blog/commit/b00597fbe4519f7090f7d7f04bfd59d69ed7501d))
- 更新文档 ([a58a7a9](https://github.com/Mereithhh/van-blog/commit/a58a7a97f5ea9c3fd3e3960e4b85a1167ebe2ab3))
- 部署说明增加 sudo; ([13bcbc2](https://github.com/Mereithhh/van-blog/commit/13bcbc2e7e378107f869171f35bc4dd97a5801f5))

### ✨ Features | 新功能

- 创建或修改文章/草稿时可指定创建时间 [#18](https://github.com/Mereithhh/van-blog/issues/18) ([f886d4b](https://github.com/Mereithhh/van-blog/commit/f886d4be1d829b915cd3260c2bb585d3a7a5303c))
- 编辑器页面发布草稿后跳转到文章管理页面 ([f1fb898](https://github.com/Mereithhh/van-blog/commit/f1fb898a568b9282b922cabc87da11cc804c49af))

### 🐛 Bug Fixes | Bug 修复

- 文章下方本文链接携带了锚点 [#18](https://github.com/Mereithhh/van-blog/issues/18) ([279e0fe](https://github.com/Mereithhh/van-blog/commit/279e0fe6b7cbd7fd854aa0ecffc210395d300d1e))

### [0.27.3](https://github.com/Mereithhh/van-blog/compare/v0.27.2...v0.27.3) (2022-09-01)

### ✏️ Documentation | 文档

- 更新文档 ([9a5ec77](https://github.com/Mereithhh/van-blog/commit/9a5ec77ef6946f3042097fa2f4fca2c81b78b39d))
- 更新文档 ([b6fd212](https://github.com/Mereithhh/van-blog/commit/b6fd212acb8964fc7d29badb9999df68c84d3d27))
- 更新文档 ([1ce9efc](https://github.com/Mereithhh/van-blog/commit/1ce9efc05222100529315c8eafb7d60738fef383))

### ✨ Features | 新功能

- 当在后台点击访问隐藏文章时，出现人性化提示[#13](https://github.com/Mereithhh/van-blog/issues/13) ([cbf2a56](https://github.com/Mereithhh/van-blog/commit/cbf2a56ebee3cb3d686bac4fbe5f293d4332c3fa))

### 🐛 Bug Fixes | Bug 修复

- 放宽过滤 waline 错误日志的条件 ([57dfbb3](https://github.com/Mereithhh/van-blog/commit/57dfbb389770d33ac7f0c6c3dbc8bac52df090d8))

### [0.27.2](https://github.com/Mereithhh/van-blog/compare/v0.27.1...v0.27.2) (2022-09-01)

### ✏️ Documentation | 文档

- 更新文档 ([c5f919b](https://github.com/Mereithhh/van-blog/commit/c5f919b4d319d85f868ed2848a04eedf08049650))

### ✨ Features | 新功能

- 增加是否可通过 URL 打开隐藏文章配置项[#13](https://github.com/Mereithhh/van-blog/issues/13) ([c77e233](https://github.com/Mereithhh/van-blog/commit/c77e233bc4807d577035a6dd7ccbf7e5c9ee9880))
- 文章/分类管理可以搜索标签（标签太多了选择不过来） ([f4aa62b](https://github.com/Mereithhh/van-blog/commit/f4aa62bcc4b0bcc4461c08a562e763ecd1b36b7a))
- 标签管理页面可以搜索/筛选标签 ([cb9e079](https://github.com/Mereithhh/van-blog/commit/cb9e0797e3dadac78a3d83712ce3551a45e93b10))

### [0.27.1](https://github.com/Mereithhh/van-blog/compare/v0.27.0...v0.27.1) (2022-09-01)

### 🐛 Bug Fixes | Bug 修复

- 目录内联代码块被错误识别 [#12](https://github.com/Mereithhh/van-blog/issues/12) ([8cd4f56](https://github.com/Mereithhh/van-blog/commit/8cd4f5675fbcb7d82749f3d004d33f69bec98a5a))
- 隐藏页面输入地址依然可以打开&增加其他一些 404 页面 [#13](https://github.com/Mereithhh/van-blog/issues/13) ([51e58e7](https://github.com/Mereithhh/van-blog/commit/51e58e7729dec7611c8155aa44bd8365b08bfc44))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.27.1 ([823c445](https://github.com/Mereithhh/van-blog/commit/823c445247d51a9c1fb35c9ba937047807b36b6b))

### ⏪ Revert | 回退

- 新加个功能再发版 ([ba89ee1](https://github.com/Mereithhh/van-blog/commit/ba89ee115ed5f1305612371e8cbb79ed085b5888))

### ✨ Features | 新功能

- demo 站无法查看 waline 配置 ([211137c](https://github.com/Mereithhh/van-blog/commit/211137cecdd0b9db3c0960cd6d1646ec7243f912))
- 演示站禁止删除文章 ([0ca1bb2](https://github.com/Mereithhh/van-blog/commit/0ca1bb2b7fbc40540e51501180606abf040c26ba))

### ✏️ Documentation | 文档

- revert changelog ([03633ab](https://github.com/Mereithhh/van-blog/commit/03633ab261990fa3744feea170c4bd9a747c9a92))
- 更新文档 ([881fe87](https://github.com/Mereithhh/van-blog/commit/881fe876882c5f65515fe810713d55481d10455f))
- 更新文档 ([717f026](https://github.com/Mereithhh/van-blog/commit/717f026e0f4ab057d3bdf720a283238a5b469ef6))

## [0.27.0](https://github.com/Mereithhh/van-blog/compare/v0.26.1...v0.27.0) (2022-09-01)

### ⚡ Performance Improvements | 性能优化

- 优化滚动监听，减少可能的性能问题 ([df5d308](https://github.com/Mereithhh/van-blog/commit/df5d308241af88548c0ca0491af13a2f6bc2a001))
- 去掉 jsx 里面的随机 key ([29fdb23](https://github.com/Mereithhh/van-blog/commit/29fdb2385635101102ce1f098690e4509137c99b))

### ✨ Features | 新功能

- 后台系统设置页面统一卡片样式 ([d52e5c7](https://github.com/Mereithhh/van-blog/commit/d52e5c79eee908a8365c66a0eef68a906cdf831f))
- 增加 robots 和 viewport 标签 ([c5f5c6f](https://github.com/Mereithhh/van-blog/commit/c5f5c6fe7c14b0396619755d59176a72c6479a88))
- 更新站点重启 waline 服务 ([2c982b0](https://github.com/Mereithhh/van-blog/commit/2c982b0a3ae33fe84f36ed94136ffd9654413edb))
- 编辑器页面删除文章/草稿 ([ec13d53](https://github.com/Mereithhh/van-blog/commit/ec13d53287e8dcc5f79800bd0348262dd9cefa41))
- 评论支持邮件通知&webhook 了 ([17b50c6](https://github.com/Mereithhh/van-blog/commit/17b50c62927a7fa0c3d8a22c0c589d2011c5a635))

### 🐛 Bug Fixes | Bug 修复

- viewport warning ([17ffa74](https://github.com/Mereithhh/van-blog/commit/17ffa74ca56f51a11c6ce1c77a1e9834fdac2bef))
- 增加一点前台滚动监听防抖时间 ([db311ae](https://github.com/Mereithhh/van-blog/commit/db311aee8dea4444994d89d60a34e24168cfbecc))
- 无法新建捐赠条目 ([1cd9f2a](https://github.com/Mereithhh/van-blog/commit/1cd9f2aa2c2c23bc4bf771da4a7c8de3915890b4))
- 由于愚蠢的单词拼写问题导致的更新时间错误 ([0dff565](https://github.com/Mereithhh/van-blog/commit/0dff5658b54fc319186fdd107bef302a3d648ea6))

### ✏️ Documentation | 文档

- 更新 todo ([a4700af](https://github.com/Mereithhh/van-blog/commit/a4700afaff6765673aaf975f84c6e2022d866081))
- 更新 todo ([fde68ab](https://github.com/Mereithhh/van-blog/commit/fde68ab8018df784aa593594739d8dc54761dd0f))
- 更新文档 ([8e92532](https://github.com/Mereithhh/van-blog/commit/8e925321775fdb2e940c9da48ae32cbab461e05e))
- 更新文档 ([c5c297b](https://github.com/Mereithhh/van-blog/commit/c5c297b03211ac0baab4ad9f5acc2855e5c86658))
- 更新新功能文档 ([3330a92](https://github.com/Mereithhh/van-blog/commit/3330a92877da502b69f57c1d1a04dd7cb9ccc34b))

### [0.26.1](https://github.com/Mereithhh/van-blog/compare/v0.26.0...v0.26.1) (2022-08-31)

### 👷 Continuous Integration | CI 配置

- 修复同步阿里云的脚本错误 ([7ca0bf3](https://github.com/Mereithhh/van-blog/commit/7ca0bf3df1bc57069bd30bcb38c1ab6e4ff8d6fa))
- 增加本地发布脚本和 workflow（通过 act） ([f4a3819](https://github.com/Mereithhh/van-blog/commit/f4a3819b00f1a6fafd9f54f8e51087da30cfdd38))

### 🐛 Bug Fixes | Bug 修复

- 优化导出图片文案 ([12ab4ca](https://github.com/Mereithhh/van-blog/commit/12ab4ca2a3f43c742579b6c54a33af3b4631af19))

### ✨ Features | 新功能

- 优化备份页面文案 ([62ae234](https://github.com/Mereithhh/van-blog/commit/62ae234924776658a25a51d3fbfafca8a5fa233f))
- 支持打包导出本地图床全部文件 ([46ce000](https://github.com/Mereithhh/van-blog/commit/46ce0003648f84dcf5a2cebd5b9cce11868cc49c))

### ✏️ Documentation | 文档

- 修复项目主页导航栏坏链 ([2e342b6](https://github.com/Mereithhh/van-blog/commit/2e342b6940d3440a6cb615ed4737e997fcff1b05))
- 更新文档 ([d553905](https://github.com/Mereithhh/van-blog/commit/d553905635ee557ef1e17ff44f9d722bb451d515))
- 更新文档 ([ef4c55d](https://github.com/Mereithhh/van-blog/commit/ef4c55d2932424f5ae586d96f202a4918a199b7f))
- 更新新功能文档 ([28bc10d](https://github.com/Mereithhh/van-blog/commit/28bc10dfd5ff75ec967a8d54a3562aca7b15801e))

## [0.26.0](https://github.com/Mereithhh/van-blog/compare/v0.25.5...v0.26.0) (2022-08-31)

### ✨ Features | 新功能

- 文章管理和草稿管理上方工具栏中，标签可以通过下拉选择进行筛选 ([274591a](https://github.com/Mereithhh/van-blog/commit/274591a2ff914ef9e34ceeec52a6ed14426e0fed))
- 新增关于页面可配置是否显示打赏按钮配置项 ([f51ec7c](https://github.com/Mereithhh/van-blog/commit/f51ec7c13d00ed32b00524cf088f4dcac1af269e))
- 标签和分类管理可以快速跳转到相应的前台页面” ([8b7ea89](https://github.com/Mereithhh/van-blog/commit/8b7ea8905d669d33fc106867ffd605be53808b6f))
- 标签管理：可批量重命名或删除标签了 ([b0946f6](https://github.com/Mereithhh/van-blog/commit/b0946f604df22a8047a9543fc53c786372078bed))
- 演示站禁止修改捐赠信息&联系方式&导航配置&友情链接 ([063ce9c](https://github.com/Mereithhh/van-blog/commit/063ce9cc93f50e0d04f35d74009adeeac8a14c43))
- 编辑器实时保存到本地缓存并恢复 ([6c638db](https://github.com/Mereithhh/van-blog/commit/6c638db90371add47c6bf829772e8f7a109b11b2))
- 编辑器页面增加快速查看前台页面入口 ([42631db](https://github.com/Mereithhh/van-blog/commit/42631db754c962fb89177fee14febc99010009ad))
- 评论管理加载态 ([6b8c80e](https://github.com/Mereithhh/van-blog/commit/6b8c80ef581c5aba5e1e9e6a551a466053374444))

### 🐛 Bug Fixes | Bug 修复

- 上传站点图标透明度消失 ([a76e720](https://github.com/Mereithhh/van-blog/commit/a76e720db2eace7a4bbc726ae6142af0d8550f93))
- 关于页面默认隐藏打赏按钮和现在逻辑保持一致 ([2a9b048](https://github.com/Mereithhh/van-blog/commit/2a9b0489665ac3ae4dffd79f1de6e2dd783c3261))
- 前台略微加深滚动条颜色 ([fb9608d](https://github.com/Mereithhh/van-blog/commit/fb9608dd5daa0d6bc946b9f8a4f6b7c371ce4040))
- 前台评论无法登录 ([9ea66c8](https://github.com/Mereithhh/van-blog/commit/9ea66c810d15b31f7595715515af44921c6956b0))
- 后台侧边栏主题切换按钮点击有效区域过小 ([71276e3](https://github.com/Mereithhh/van-blog/commit/71276e378d1d496b447845d6513177ab3d45971e))
- 后台滚动条样式不美观&编辑器页面不该出现的滚动条 ([a1d8530](https://github.com/Mereithhh/van-blog/commit/a1d853020cdd67dd952d167b5e6902738a299b00))
- 调整前台滚动条宽度&样式 ([4f17152](https://github.com/Mereithhh/van-blog/commit/4f171527117d09ca8ce8d006f03ceb0cca3401b2))

### ✏️ Documentation | 文档

- 增加一个打赏二维码 😘 ([81319e0](https://github.com/Mereithhh/van-blog/commit/81319e0b5ef8f15a7bf7a650847060417e69332e))
- 更新截图 ([16257ba](https://github.com/Mereithhh/van-blog/commit/16257ba7b55dc3e47e3571dbc416cc2c7af671ad))
- 更新文档 ([9cb9ce2](https://github.com/Mereithhh/van-blog/commit/9cb9ce2e62e09d24e23e1f658f7f52a341908aec))
- 更新文档 ([a0a63e0](https://github.com/Mereithhh/van-blog/commit/a0a63e0543d3f44f25094ac9bccbfa8615a0bbbe))
- 更新文档 ([9dd7cd6](https://github.com/Mereithhh/van-blog/commit/9dd7cd6f4ba1c90469fad5d2ecab8c53aba2c788))
- 更新文档 ([d121b56](https://github.com/Mereithhh/van-blog/commit/d121b569cb305f2d02ce6adc486484d0ad719618))
- 更新文档 ([1e16bba](https://github.com/Mereithhh/van-blog/commit/1e16bba5d077298972a55a76c9b772e268883c96))
- 更新文档 ([d74e91f](https://github.com/Mereithhh/van-blog/commit/d74e91f7797b61e422ecd42e4ac4e1fd189ae7b5))
- 更新新版本对应文档 ([4cb73d3](https://github.com/Mereithhh/van-blog/commit/4cb73d3c44bca946174db8748e10908541ba5d91))
- 调整图片大小 ([f5beb5b](https://github.com/Mereithhh/van-blog/commit/f5beb5b1e58d4d7ada3364146b8db93785eaa363))

### 👷 Continuous Integration | CI 配置

- 延长 yarn 的超时时间 ([6c89be6](https://github.com/Mereithhh/van-blog/commit/6c89be6365bc851bbec120fc2adfdc4c507a30e2))

## [0.25.0](https://github.com/Mereithhh/van-blog/compare/v0.24.0...v0.25.0) (2022-08-30)

### ♻️ Code Refactoring | 代码重构

- 后台抽离修改信息弹窗组件 ([3838c48](https://github.com/Mereithhh/van-blog/commit/3838c48877ba0f76480d874847dece91ec424790))

### ✨ Features | 新功能

- 文章管理页面支持导出文章和修改文章信息 ([f8b820b](https://github.com/Mereithhh/van-blog/commit/f8b820b8af852f247a18552f962db1dd6b87886a))
- 编辑器页面从文件导入内容 ([be73e60](https://github.com/Mereithhh/van-blog/commit/be73e6015cff71d357dfdf5b87cd85f950c0493d))
- 编辑器页面可导出文章 ([32fd874](https://github.com/Mereithhh/van-blog/commit/32fd874b6a9287f27b91e9effdb7db9ecce8f771))
- 草稿管理页面支持导出草稿和修改草稿信息 ([2dd5245](https://github.com/Mereithhh/van-blog/commit/2dd5245814bc852fdd12a53c6a8a395f84a3fa85))
- 设置前台用户默认主题模式 ([582df60](https://github.com/Mereithhh/van-blog/commit/582df602112b5c0c80f55eda6d53dd799f233418))

### 🐛 Bug Fixes | Bug 修复

- 前台主题切换按钮显示和实际主题不一致 ([4a2f943](https://github.com/Mereithhh/van-blog/commit/4a2f943bee92228c1022d8cdc0b60e50396549cf))

### ⚡ Performance Improvements | 性能优化

- 优化一下主题初始化逻辑 ([bf12394](https://github.com/Mereithhh/van-blog/commit/bf1239466c92242597716a5c085b514d61021214))

### ✏️ Documentation | 文档

- 换一个好看点的 star history 图 ([c4c8f44](https://github.com/Mereithhh/van-blog/commit/c4c8f443f4c21f0f1d600616767bc79d8be27bf8))
- 更新 TODO ([66e5796](https://github.com/Mereithhh/van-blog/commit/66e5796c6b5de08f9e54496efc253e53ffb68ade))
- 更新文档 ([842c005](https://github.com/Mereithhh/van-blog/commit/842c00570d9a8b0814ddc62552fb0f83f79fe9cb))
- 更新文档 ([75c8b0a](https://github.com/Mereithhh/van-blog/commit/75c8b0a4296c2c34fc96e26ee1c4f5abf1817b4b))
- 更新文档 ([f637216](https://github.com/Mereithhh/van-blog/commit/f637216ea4525b46eeef02e3320f507680e35910))
- 更新文档截图和描述 ([1961aad](https://github.com/Mereithhh/van-blog/commit/1961aadeafa308c1a6e1f03fa9adc794f35d4828))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.25.0 ([5158055](https://github.com/Mereithhh/van-blog/commit/5158055d7882341f2ca2dedffe2e62a3ba912e57))
- 修复生成 note 脚本错误 ([92bf19f](https://github.com/Mereithhh/van-blog/commit/92bf19f22f5e8edf51ad25ec6a1063e8c2ce488a))
- 修正 releaseNote 脚本错误 ([570a527](https://github.com/Mereithhh/van-blog/commit/570a527de33e839363bf216caf2445df18708f45))

### ⏪ Revert | 回退

- 因为 note 脚本错误回退版本再重发 ([af0fa06](https://github.com/Mereithhh/van-blog/commit/af0fa06a42e957b83bded98d9982f77217d22903))

## [0.24.0](https://github.com/Mereithhh/van-blog/compare/v0.23.4...v0.24.0) (2022-08-29)

### 🚀 Chore | 构建/工程依赖/工具

- 发版自动生成 releaseNote ([78bac47](https://github.com/Mereithhh/van-blog/commit/78bac4735e59067f84c6c83137d6db23592e10d7))

### ⚡ Performance Improvements | 性能优化

- 内置提示图片由外链改成项目自带 ([bb4422a](https://github.com/Mereithhh/van-blog/commit/bb4422a14c418a537131db8ba593c157ea25e245))

### 🐛 Bug Fixes | Bug 修复

- Google Analytics 配置好不生效 ([4feb16b](https://github.com/Mereithhh/van-blog/commit/4feb16be48b98d10eb86e922841db414486994a6))
- 前台目录关闭自动加序号&前台目录锚点以文字为准 ([dac811c](https://github.com/Mereithhh/van-blog/commit/dac811c1bba383304203c849ff2a8fdbff469598))

### ✨ Features | 新功能

- 从 md 文件导入创建文章 ([2cbd974](https://github.com/Mereithhh/van-blog/commit/2cbd97458cfaa6b0ca0ec8ef57d0b9c40e6995a1))
- 从 md 文件导入创建草稿 ([297bc4f](https://github.com/Mereithhh/van-blog/commit/297bc4f7e809694fd679736abd4aac0e028bcdf5))
- 侧边栏的 API 文档和项目文档挪到关于卡片 ([a3324a8](https://github.com/Mereithhh/van-blog/commit/a3324a83633fc0b387997470030672167d30159e))
- 前台目录锚点使用标题 ([4052701](https://github.com/Mereithhh/van-blog/commit/40527019d2c0c36f11383a7cc155b65c2b9ec145))
- 去掉 footer ([0c8f4d1](https://github.com/Mereithhh/van-blog/commit/0c8f4d18db726fc10568bdaa86f55fab81716bc3))
- 后台关于页面增加 loading ([2e5b472](https://github.com/Mereithhh/van-blog/commit/2e5b47208d5981ad7c2e770fe73c6eff762ce7a7))
- 后台系统设置增加 关于 tab ([2d62ee1](https://github.com/Mereithhh/van-blog/commit/2d62ee1c3a729702c0814da61d5b7011827de2ba))

### ✏️ Documentation | 文档

- 为新功能写文档 ([3ce0acc](https://github.com/Mereithhh/van-blog/commit/3ce0acc63be111119911ff6ac44cb1772952789b))
- 更新文档 ([7d1f1d3](https://github.com/Mereithhh/van-blog/commit/7d1f1d3bfab46aaff92f432b0aecb4c312489234))

### [0.23.4](https://github.com/Mereithhh/van-blog/compare/v0.23.3...v0.23.4) (2022-08-29)

### ✏️ Documentation | 文档

- 更新文档 ([9ffe4ea](https://github.com/Mereithhh/van-blog/commit/9ffe4ea2f8b2cb94b0b835f7d676bbd41e22a55e))

### 🐛 Bug Fixes | Bug 修复

- 草稿中用剪切板一键上传图片后失焦并闪一下 ([6b44e80](https://github.com/Mereithhh/van-blog/commit/6b44e80e8f90ea983aac7791f2532888eb56e39f))

### ✨ Features | 新功能

- 编辑器页面保存按钮和操作并列 ([241a48e](https://github.com/Mereithhh/van-blog/commit/241a48e223574a126b2f48ca3da39cb70ede65c2))

### [0.23.3](https://github.com/Mereithhh/van-blog/compare/v0.23.2...v0.23.3) (2022-08-29)

### ✏️ Documentation | 文档

- 更新 api 文档描述 ([291ba73](https://github.com/Mereithhh/van-blog/commit/291ba73a90b76feb1a171c86e1d432d0934eb24c))
- 更新文档 ([200b037](https://github.com/Mereithhh/van-blog/commit/200b03799cc6ca4a37d27b2685ff607da9c0d46d))
- 更新文档 ([6704e44](https://github.com/Mereithhh/van-blog/commit/6704e446c775f3471b25f3ce59fac80de6237303))
- 补充截图 ([e521615](https://github.com/Mereithhh/van-blog/commit/e521615f9e0610436aea0b1cd955e64bb6721d80))

### 🐛 Bug Fixes | Bug 修复

- 有序列表与无序列表的前后台展示不一致 ([079f66a](https://github.com/Mereithhh/van-blog/commit/079f66a981e6091917948adeefa93c4e14b08ddc))

### [0.23.2](https://github.com/Mereithhh/van-blog/compare/v0.23.1...v0.23.2) (2022-08-29)

### ✏️ Documentation | 文档

- 更新文档 ([ba40cbc](https://github.com/Mereithhh/van-blog/commit/ba40cbcdfdc2a006b04d53772ec61ddf37b01f2a))

### 🐛 Bug Fixes | Bug 修复

- 后台图片管理右键无法下载图片 ([28a1bc4](https://github.com/Mereithhh/van-blog/commit/28a1bc4366555182d8a864b1f6948012ef4fe1e1))

### [0.23.1](https://github.com/Mereithhh/van-blog/compare/v0.23.0...v0.23.1) (2022-08-29)

### ✏️ Documentation | 文档

- 更新文档 ([f75a3bc](https://github.com/Mereithhh/van-blog/commit/f75a3bc6918e162f7c9fcea6a2085ea88869d454))

### ✨ Features | 新功能

- 完善缺少 more 标记的提示并增加截图 ([a8f3d10](https://github.com/Mereithhh/van-blog/commit/a8f3d106ceb5b7c9e9d211bfd73a2c2e6638c50e))

## [0.23.0](https://github.com/Mereithhh/van-blog/compare/v0.22.1...v0.23.0) (2022-08-29)

### ✨ Features | 新功能

- 优化编辑器页面结构，更多位置留给编辑器本身 ([8212ade](https://github.com/Mereithhh/van-blog/commit/8212ade8964a446e588ad299763d3389259806de))
- 后台优化滚动条样式 ([17609e7](https://github.com/Mereithhh/van-blog/commit/17609e756e86c2268522db5bae9973b5d9cea29d))
- 移动端编辑器页面文章标题过长的显示优化 ([3b45059](https://github.com/Mereithhh/van-blog/commit/3b4505953198b7536d6df50f4aa69a7100c1f283))
- 进入编辑器默认收起侧边栏 ([63ed7c4](https://github.com/Mereithhh/van-blog/commit/63ed7c471597918d995fc6ef6323ce4ece3f7d72))

### ✏️ Documentation | 文档

- 更新文档 ([ad9f4ee](https://github.com/Mereithhh/van-blog/commit/ad9f4eeea4b1879468b7701dacb59ed5b2327d74))
- 更新文档 ([891f423](https://github.com/Mereithhh/van-blog/commit/891f42366044dd55989cf392a9a163efce7eb2e4))
- 更新编辑器截图 ([18ec43d](https://github.com/Mereithhh/van-blog/commit/18ec43d5e44f47bac0c490262d87938dd3413edc))
- 补充常见问题 ([6b8cf69](https://github.com/Mereithhh/van-blog/commit/6b8cf69e5a512ae0e5a8e06ad4330a75a9bbc71c))

### [0.22.1](https://github.com/Mereithhh/van-blog/compare/v0.22.0...v0.22.1) (2022-08-28)

### 🚀 Chore | 构建/工程依赖/工具

- 完善同步镜像脚本 ([85d4216](https://github.com/Mereithhh/van-blog/commit/85d4216bc3f89df3db197375727aeaadd6778a19))

### 🐛 Bug Fixes | Bug 修复

- 编辑器黑暗模式 toolbar 颜色不对 ([3ad0988](https://github.com/Mereithhh/van-blog/commit/3ad09888bf820246d8eef43bfbeaeec5a728d979))
- 设置站点图标失效 ([89dfdd6](https://github.com/Mereithhh/van-blog/commit/89dfdd600dacea976e64bf0d43ce43c3c85d5d71))

### ✏️ Documentation | 文档

- update todo ([0ef3075](https://github.com/Mereithhh/van-blog/commit/0ef3075c3eb211c373977671ba5d8419c78697c6))
- 修正文档错误 ([7984c94](https://github.com/Mereithhh/van-blog/commit/7984c9462efd5b76dd55353e647eca267bb1f51a))
- 更新文档 ([f88d643](https://github.com/Mereithhh/van-blog/commit/f88d643bb67e0234320c18e4db9a13fd234cc613))
- 更新文档 ([01066a5](https://github.com/Mereithhh/van-blog/commit/01066a5801a7a16c59b436f26c0e588c1a9e97f1))
- 更新文档 ([e2f29bf](https://github.com/Mereithhh/van-blog/commit/e2f29bfc7babad39826f08a755f6f29e31473d26))
- 补充 faq ([a225ba0](https://github.com/Mereithhh/van-blog/commit/a225ba0de6aee4436958f9f7314f997bec170b80))

## [0.22.0](https://github.com/Mereithhh/van-blog/compare/v0.21.1...v0.22.0) (2022-08-28)

### 🚀 Chore | 构建/工程依赖/工具

- 手动发版文档 ([e7f4b4c](https://github.com/Mereithhh/van-blog/commit/e7f4b4c2efac8df6f34a11d822869424196fe0fd))

### ✨ Features | 新功能

- mermaid 图片全屏预览 ([8576e40](https://github.com/Mereithhh/van-blog/commit/8576e408335fc96711de21212e8afddd2b309321))
- 后台编辑器改为 bytemd，性能更好支持更多语法 ([e72caf0](https://github.com/Mereithhh/van-blog/commit/e72caf0d137611766e9f37d1ed2f31abf57382c5))
- 完整支持 mermaid 图表语法 ([846cc19](https://github.com/Mereithhh/van-blog/commit/846cc1994e5f8b4bb4c5fdbb977e6f7a4d765630))

### 🐛 Bug Fixes | Bug 修复

- 修复缺少 mermaid 类型导致的构建报错 ([16e33a0](https://github.com/Mereithhh/van-blog/commit/16e33a04e9e9893919cc1b222cdab5d3e5f7c996))

### ✏️ Documentation | 文档

- 修正文档中的反代配置 ([3d12b20](https://github.com/Mereithhh/van-blog/commit/3d12b20b965e2669514c05b8b446b87c963f4ddb))
- 手动修改一下 changelog ([3f67ffd](https://github.com/Mereithhh/van-blog/commit/3f67ffd41718dc367161a40f00f0c6119bb46d24))
- 更新文档 ([3592378](https://github.com/Mereithhh/van-blog/commit/3592378750afc8421eaadb21c16f660bf41ba617))
- 更新文档 ([e4426a5](https://github.com/Mereithhh/van-blog/commit/e4426a506414ce793ebb8bb1bc5c2ed3e034b131))
- 更新文档 ([80f5d58](https://github.com/Mereithhh/van-blog/commit/80f5d58c1f032949aa6dd3f6b424937ab8e89649))
- 补充一下常见问题 ([219e638](https://github.com/Mereithhh/van-blog/commit/219e6389e8b80357e7d186f7b5936e8b15763213))

### [0.21.1](https://github.com/Mereithhh/van-blog/compare/v0.21.0...v0.21.1) (2022-08-27)

### ✨ Features | 新功能

- 外置图床配置中帮助链接指向项目文档 ([176e9f5](https://github.com/Mereithhh/van-blog/commit/176e9f53d070850c5be3ce1180c82e4e1e3998d1))

### 🐛 Bug Fixes | Bug 修复

- 修复了隔了多层反代无法获取真实 ip 问题 ([feee634](https://github.com/Mereithhh/van-blog/commit/feee634a8456815d4e297b1046f03d0e93944a26))

### 👷 Continuous Integration | CI 配置

- 加一个同步到阿里云的脚本 ([25acdbe](https://github.com/Mereithhh/van-blog/commit/25acdbeb6b4a0f46443dbaf974941d439852332b))
- 文档切换到 dockerhub ([92db955](https://github.com/Mereithhh/van-blog/commit/92db95569560190e02317dba4179ca4374dcfc2a))
- 调试测试流水线&整理文件 ([feee634](https://github.com/Mereithhh/van-blog/commit/feee634a8456815d4e297b1046f03d0e93944a26))

### ✏️ Documentation | 文档

- 修改图片宽度 ([e9ba718](https://github.com/Mereithhh/van-blog/commit/e9ba718acb6f69a7e41e4ed381d58261210abd53))
- 修改大小写 ([26904b4](https://github.com/Mereithhh/van-blog/commit/26904b45ae41c67be76b281543898b18c7eaf274))
- 修改措辞 ([1ce0a53](https://github.com/Mereithhh/van-blog/commit/1ce0a53d97792489e0a74f4dd68cdb071ea24414))
- 大小写 ([e1401c9](https://github.com/Mereithhh/van-blog/commit/e1401c985a6f70291bae25e9e0dccba977d0155b))
- 更新文档 ([3bccc55](https://github.com/Mereithhh/van-blog/commit/3bccc55228161f443b55da3b316aae4da8cba961))
- 更新文档 ([2d2e330](https://github.com/Mereithhh/van-blog/commit/2d2e3302b9365a13bcb9ea694eac13c47a08db9b))
- 更新文档 ([494a6d7](https://github.com/Mereithhh/van-blog/commit/494a6d73a2abe9d7d84fd552ed12ce3cb5484f74))
- 更新文档 ([c052ad2](https://github.com/Mereithhh/van-blog/commit/c052ad2ee8b31483bd32eb3b1d511bf2ad49e2c6))
- 更新文档 ([426fd31](https://github.com/Mereithhh/van-blog/commit/426fd3131a7e36021e5a1b983ee01f0953aa0efa))
- 更新文档&logo ([3876b2c](https://github.com/Mereithhh/van-blog/commit/3876b2ccdcb2fb14780c1b082965af56b0197622))
- 补充 LightHouse 评分截图 ([48e866d](https://github.com/Mereithhh/van-blog/commit/48e866da05825fe642eca93593ad2e27e2f60e54))

## [0.21.0](https://github.com/Mereithhh/van-blog/compare/v0.20.8...v0.21.0) (2022-08-27)

### ✨ Features | 新功能

- 本地图床上传网站图标时自动防止到根目录 ([5ac6f82](https://github.com/Mereithhh/van-blog/commit/5ac6f822d865f73eee244557daacc0c192d4786b))

### ⏪ Revert | 回退

- actions 运行失败 ([23c7726](https://github.com/Mereithhh/van-blog/commit/23c7726db89e148307f15bfd6e35df51fc492097))

### 👷 Continuous Integration | CI 配置

- Caddy 增加默认 valume ([c2f0d30](https://github.com/Mereithhh/van-blog/commit/c2f0d30c0de6ebfebe9cd3eee59465bd90b44fe8))
- 因为 runner 推阿里云镜像超时，改用 selfhost runner ([8c743b3](https://github.com/Mereithhh/van-blog/commit/8c743b3d40bf186b1500a0ea218217437e41e793))
- 增加测试流水线 ([9ab30d6](https://github.com/Mereithhh/van-blog/commit/9ab30d6b0bf5231413fec52fcd11107cec62226b))
- 支持 arm64 ([f0fa4f4](https://github.com/Mereithhh/van-blog/commit/f0fa4f4bf45997b725e55c7739684635b28172ca))

### ✏️ Documentation | 文档

- 更新文档 ([eb8682f](https://github.com/Mereithhh/van-blog/commit/eb8682ff658a011220cd8ff6fc617f8d14994eb5))
- 更新文档 ([6b4bb75](https://github.com/Mereithhh/van-blog/commit/6b4bb7522135dc5e90f42681982c20dde60e4fcd))
- 更新文档 ([17d7f36](https://github.com/Mereithhh/van-blog/commit/17d7f367214d02b98032b78dded5e43740bdedef))
- 更新文档 ([8b111b2](https://github.com/Mereithhh/van-blog/commit/8b111b2edfe3e382df8e98df0fdd7c65e5aaa4f5))
- 镜像切换成 dockerHub（阿里云 ci 推不上去了) ([dff2ba7](https://github.com/Mereithhh/van-blog/commit/dff2ba7c4d81b229274a69f4ada032e2e51090c7))

### [0.20.8](https://github.com/Mereithhh/van-blog/compare/v0.20.7...v0.20.8) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([4ade609](https://github.com/Mereithhh/van-blog/commit/4ade609b7d088b058418e19aec970b58a34635a8))

### 🐛 Bug Fixes | Bug 修复

- ICP 文案错误 ([a09486e](https://github.com/Mereithhh/van-blog/commit/a09486efcb5185c9c61c7412fdc60be71a30b5ac))

### ✨ Features | 新功能

- 初始化后增加注册评论管理员提示 ([44e8021](https://github.com/Mereithhh/van-blog/commit/44e802111a083f2a9fa392230fb61203c7b7a5e0))

### [0.20.7](https://github.com/Mereithhh/van-blog/compare/v0.20.6...v0.20.7) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([ae1e6eb](https://github.com/Mereithhh/van-blog/commit/ae1e6eb783d3a671839d40e8a649dc80a3c549af))

### 🐛 Bug Fixes | Bug 修复

- 修复内置 waline 后台的一些问题 ([dbd25b9](https://github.com/Mereithhh/van-blog/commit/dbd25b9a63e73512c42d6ec5561a99309733d1e7))

### [0.20.6](https://github.com/Mereithhh/van-blog/compare/v0.20.5...v0.20.6) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([c786b5f](https://github.com/Mereithhh/van-blog/commit/c786b5f7e20f29aebe883bb1a1b8d2b134408811))

### 🐛 Bug Fixes | Bug 修复

- 关闭评论系统导致报错 ([bad6bd4](https://github.com/Mereithhh/van-blog/commit/bad6bd422d4fef5e5cbf7a0821689b35a7ac2649))

### [0.20.5](https://github.com/Mereithhh/van-blog/compare/v0.20.4...v0.20.5) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([69cad9c](https://github.com/Mereithhh/van-blog/commit/69cad9c2f87ef0c501bb8f1ca6421f89eceb44c3))

### 👷 Continuous Integration | CI 配置

- 优化 caddyfile 反代配置 ([891f1b0](https://github.com/Mereithhh/van-blog/commit/891f1b069a7ee8904217db4c0b6cbb538f29ef18))

### 🐛 Bug Fixes | Bug 修复

- 首次启动错误 ([7eaa6fa](https://github.com/Mereithhh/van-blog/commit/7eaa6fa328e3d96f0c22bada5066e06f33efd4fb))

### [0.20.4](https://github.com/Mereithhh/van-blog/compare/v0.20.3...v0.20.4) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([07a0d88](https://github.com/Mereithhh/van-blog/commit/07a0d887e3bdd85cc090444643ab4ab58f326694))

### 🐛 Bug Fixes | Bug 修复

- 内嵌评论无法获取真实 ip ([85bc564](https://github.com/Mereithhh/van-blog/commit/85bc56432ad6f256fd57a5dbc530ebe05290890b))

### [0.20.3](https://github.com/Mereithhh/van-blog/compare/v0.20.2...v0.20.3) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([c480fb3](https://github.com/Mereithhh/van-blog/commit/c480fb3f6453cf058ede1e0ded7357247ccb40b0))

### 🐛 Bug Fixes | Bug 修复

- 作者 logo 无法正常显示 ([8365275](https://github.com/Mereithhh/van-blog/commit/8365275ef0218c17e15f0f29a9e9c63b3e534ff9))

### [0.20.2](https://github.com/Mereithhh/van-blog/compare/v0.20.1...v0.20.2) (2022-08-26)

### ✏️ Documentation | 文档

- 切换成 dockerbub 源(aliyun 的被限流了) ([b307a2a](https://github.com/Mereithhh/van-blog/commit/b307a2a2ab6682def5a27ff1796d1b897ccf21d4))
- 更新文档 ([51c9cd8](https://github.com/Mereithhh/van-blog/commit/51c9cd81a6cf9d71ccfa1bc08f7a5dd24aa86419))
- 更新文档 ([3c71ace](https://github.com/Mereithhh/van-blog/commit/3c71ace3c3e314522d987c30b5d64687b3f23ee7))
- 更新文档 ([a0031b7](https://github.com/Mereithhh/van-blog/commit/a0031b7850e28c3581ce0aa3631693045b2cfba3))

### 🐛 Bug Fixes | Bug 修复

- 初始化不触发增量渲染 ([31fca3b](https://github.com/Mereithhh/van-blog/commit/31fca3be64e84baae855a713f673c0bd7c5f90bd))
- 前台构建器减少初始化边缘情况引起的错误日志 ([f28525b](https://github.com/Mereithhh/van-blog/commit/f28525bd8d8055612c84dcb93c782183aa64a15b))

### [0.20.1](https://github.com/Mereithhh/van-blog/compare/v0.20.0...v0.20.1) (2022-08-26)

### ✏️ Documentation | 文档

- 更新文档 ([9630c59](https://github.com/Mereithhh/van-blog/commit/9630c590a58669e784d0b13048e192b160d86a98))

### 🐛 Bug Fixes | Bug 修复

- 首次使用无法加载 waline 导致报错 ([cb9b11e](https://github.com/Mereithhh/van-blog/commit/cb9b11e0aa303c1367aab1678742d20f4873bfa3))

## [0.20.0](https://github.com/Mereithhh/van-blog/compare/v0.19.1...v0.20.0) (2022-08-25)

### ✏️ Documentation | 文档

- 更新文档 ([6386a6b](https://github.com/Mereithhh/van-blog/commit/6386a6bfd43ec6e92e314eabba3a3a341d50c00e))

### ⚡ Performance Improvements | 性能优化

- 页面跳转有时候不反应 ([889f6ad](https://github.com/Mereithhh/van-blog/commit/889f6ada261695e7be258cf51ddf7adda488e6ad))

### [0.19.1](https://github.com/Mereithhh/van-blog/compare/v0.19.0...v0.19.1) (2022-08-25)

### ✏️ Documentation | 文档

- 更新文档 ([c58d717](https://github.com/Mereithhh/van-blog/commit/c58d717789ce9b339acc2a10f1fa8877373e2798))

### 🐛 Bug Fixes | Bug 修复

- 因为反代 waline 加路径前缀会出现功能不正常，所以在没路径冲突的前提下，把内嵌 waline 的 uri 直接反代到根级别了 ([1c9aa3c](https://github.com/Mereithhh/van-blog/commit/1c9aa3c0c7a3c32ca98279df5a0c9c8ac86dd7b9))

### ✨ Features | 新功能

- 默认显示管理员按钮 ([c25606b](https://github.com/Mereithhh/van-blog/commit/c25606befb3363cc91c111914ac126214c8e136e))

## [0.19.0](https://github.com/Mereithhh/van-blog/compare/v0.18.1...v0.19.0) (2022-08-25)

### ✏️ Documentation | 文档

- 更新文档 ([394bde7](https://github.com/Mereithhh/van-blog/commit/394bde71dcd5b9e144460ff27249c57021221ef2))

### 👷 Continuous Integration | CI 配置

- 去掉多余 webhook ([065d042](https://github.com/Mereithhh/van-blog/commit/065d042dfcb48d22e869e537332b07c3cb27aaa1))

### ✨ Features | 新功能

- 优化上传图片提示（合二为一) ([f7aa86a](https://github.com/Mereithhh/van-blog/commit/f7aa86aec8e95f46d8bfe0fb058076285a8ee9eb))
- 内嵌评论系统 ([0874a85](https://github.com/Mereithhh/van-blog/commit/0874a850e381baf8f9a325f6c30cda39dfb2e2d3))
- 自定义评论所用 db 名 ([1723fe6](https://github.com/Mereithhh/van-blog/commit/1723fe6a39c8445a8c8cafb41e82a76e2312dedd))

### [0.18.1](https://github.com/Mereithhh/van-blog/compare/v0.18.0...v0.18.1) (2022-08-24)

### ✏️ Documentation | 文档

- 更新文档 ([a8ea4fb](https://github.com/Mereithhh/van-blog/commit/a8ea4fb30af4c5c8f6b78780808a2c51336ada7b))

### 🐛 Bug Fixes | Bug 修复

- 减少数据量但是没考虑边缘情况引起的构建错误 ([748cfe5](https://github.com/Mereithhh/van-blog/commit/748cfe55d6810cd4aa5198f68ec7455610296cb4))

## [0.18.0](https://github.com/Mereithhh/van-blog/compare/v0.17.0...v0.18.0) (2022-08-24)

### ✏️ Documentation | 文档

- 更新文档 ([340dd99](https://github.com/Mereithhh/van-blog/commit/340dd996a913316cf9c22b80fea43e1e491b7bfd))

### 👷 Continuous Integration | CI 配置

- 更新脚本 ([b5a876f](https://github.com/Mereithhh/van-blog/commit/b5a876fe78ada1c53d6b1ace9c7568074e4fd967))

### 🐛 Bug Fixes | Bug 修复

- 因为接口类型转换错误导致的页面显示数量过多 ([3c3258c](https://github.com/Mereithhh/van-blog/commit/3c3258cae2265697863c468db9837d603bfdc999))

### ⚡ Performance Improvements | 性能优化

- 去掉多余的评论获取请求 ([63a712b](https://github.com/Mereithhh/van-blog/commit/63a712b1b5f8b9cb9fb5c1d57f5352d83fddbf8e))

### ✨ Features | 新功能

- 优化 logo 展示&404 页面优化 ([3191e0f](https://github.com/Mereithhh/van-blog/commit/3191e0f262f8186c6ba29e751b44abd53a3ec338))

## [0.17.0](https://github.com/Mereithhh/van-blog/compare/v0.16.2...v0.17.0) (2022-08-24)

### ✏️ Documentation | 文档

- 更新文档 ([6d9945a](https://github.com/Mereithhh/van-blog/commit/6d9945a476c6b5df6f128771b770a655790a3db1))

### ✨ Features | 新功能

- 按需触发 ISR，优化增量渲染体验&优化字数缓存日志 ([6f11f83](https://github.com/Mereithhh/van-blog/commit/6f11f831bf5222a5f93d46bc3dc641712ee3d8e6))
- 按需触发 ISR，优化增量渲染体验&优化字数缓存日志(2) ([d494f76](https://github.com/Mereithhh/van-blog/commit/d494f766d2db06fc48a2bde7972866ebdc587d72))
- 触发 ISR 之前测试链接并超时重试 ([2b5777c](https://github.com/Mereithhh/van-blog/commit/2b5777c0bfb4a32beab3d287d6cb450ce9986a6e))

### [0.16.2](https://github.com/Mereithhh/van-blog/compare/v0.16.1...v0.16.2) (2022-08-23)

### ✏️ Documentation | 文档

- 更新文档截图&修复文档错误 ([a20835e](https://github.com/Mereithhh/van-blog/commit/a20835e67361ec0f21c919982948c7d1c88543b3))

### 🐛 Bug Fixes | Bug 修复

- 图片管理鼠标右键菜单栏跑位 ([943fad2](https://github.com/Mereithhh/van-blog/commit/943fad299c6ce4025e6cfe6c7ed19f7e9b7e0434))

### [0.16.1](https://github.com/Mereithhh/van-blog/compare/v0.16.0...v0.16.1) (2022-08-23)

### ✏️ Documentation | 文档

- 更新文档 ([01c563d](https://github.com/Mereithhh/van-blog/commit/01c563d5ae497e265f2b8da9841694f4ad31ecdc))

### 🐛 Bug Fixes | Bug 修复

- 初次更新后日志接口超时 ([c91e411](https://github.com/Mereithhh/van-blog/commit/c91e4114799f693e6b2dcc50c19bbcfbe7f08032))
- 更新后第一次进入获取登录日志接口超时 ([360590a](https://github.com/Mereithhh/van-blog/commit/360590af0540e44f569520ec8d52dd20fa3efd07))

## [0.16.0](https://github.com/Mereithhh/van-blog/compare/v0.15.0...v0.16.0) (2022-08-23)

### ✏️ Documentation | 文档

- 更新文档 ([2f3f67c](https://github.com/Mereithhh/van-blog/commit/2f3f67cd98da095207a49cfc603dff483da48c13))

### ✨ Features | 新功能

- 后台加载页面去掉大 logo ([b09937a](https://github.com/Mereithhh/van-blog/commit/b09937ad17bf0d369ef6be0416ca4333f873f503))
- 登录日志' ([c320761](https://github.com/Mereithhh/van-blog/commit/c3207619daf4b430569d0ea45dd93e5a5582c6ad))

## [0.15.0](https://github.com/Mereithhh/van-blog/compare/v0.14.0...v0.15.0) (2022-08-23)

### 🐛 Bug Fixes | Bug 修复

- 还是不展示大纲 ([a1826f8](https://github.com/Mereithhh/van-blog/commit/a1826f8270e263689a6015f6162ec976f2622c1d))

### ✏️ Documentation | 文档

- 更新文档 ([8a2f394](https://github.com/Mereithhh/van-blog/commit/8a2f394391b389d25ce6262f5363f83e0823a4e1))
- 更新文档 ([0f51dff](https://github.com/Mereithhh/van-blog/commit/0f51dff931a181e690485a42728b472f808b1973))

### ✨ Features | 新功能

- 后台编辑器增加参考文档按钮 ([18cc4ab](https://github.com/Mereithhh/van-blog/commit/18cc4ab21364704dca11b77972d8e2772edb315c))
- 大尺寸下编辑器展示大纲 ([a4661c4](https://github.com/Mereithhh/van-blog/commit/a4661c4d034ae01061e04f6b4def0b98e3c5b2fc))
- 失焦自动保存草稿 ([4a4a26d](https://github.com/Mereithhh/van-blog/commit/4a4a26d4a42f1f5c42de19a5c9ea7e34737033d5))
- 拆分站点管理为多个菜单 ([b858e00](https://github.com/Mereithhh/van-blog/commit/b858e00f1715ffc42c215e50036a86f8fab0b0d4))
- 文章页面和草稿页面默认展示 10 行 ([1918050](https://github.com/Mereithhh/van-blog/commit/19180501dcedfe7f89732b9f2f1de79e5dca9b6f))
- 编辑器移动端工具栏删减 ([e7e0e65](https://github.com/Mereithhh/van-blog/commit/e7e0e6593b09e560b8d8afbd1a539de6985694d8))
- 调整编辑器工具栏 ([97b90ee](https://github.com/Mereithhh/van-blog/commit/97b90eea9b090ef138c9d3c6aa4189a4ee6ba016))

## [0.14.0](https://github.com/Mereithhh/van-blog/compare/v0.13.3...v0.14.0) (2022-08-22)

### ✏️ Documentation | 文档

- 更新文档 ([da05ee9](https://github.com/Mereithhh/van-blog/commit/da05ee9555a86b5bc6e2e6e5b02d61c37b344ba1))

### 👷 Continuous Integration | CI 配置

- 增加发版 doc 脚本” ([1d32329](https://github.com/Mereithhh/van-blog/commit/1d3232991bebcee303aa1fd36908dfb9b90f2bea))

### ✨ Features | 新功能

- 优化布局，大尺寸不显示顶栏，主题切换放到侧边栏 ([193403f](https://github.com/Mereithhh/van-blog/commit/193403fa8eaaf0901a6e96a20c050fad323173b4))

### [0.13.3](https://github.com/Mereithhh/van-blog/compare/v0.13.2...v0.13.3) (2022-08-22)

### ✏️ Documentation | 文档

- 更新 changelog ([0ae0447](https://github.com/Mereithhh/van-blog/commit/0ae04471ae178535b592529a07bb046035d12b93))

### 🐛 Bug Fixes | Bug 修复

- 过度编码导致图片无法显示 ([18cfd82](https://github.com/Mereithhh/van-blog/commit/18cfd8221842c13cd8915364b969a8f1bbc6be0a))

### [0.13.2](https://github.com/Mereithhh/van-blog/compare/v0.13.1...v0.13.2) (2022-08-22)

### 🐛 Bug Fixes | Bug 修复

- 图片 url 特殊字符未转义导致无法正常显示 ([920e5fa](https://github.com/Mereithhh/van-blog/commit/920e5faca039013f6af992bb20b4a779cd35c2e7))

### [0.13.1](https://github.com/Mereithhh/van-blog/compare/v0.13.0...v0.13.1) (2022-08-22)

### ✏️ Documentation | 文档

- 更新文档 ([9f92bb9](https://github.com/Mereithhh/van-blog/commit/9f92bb906c74a28fa465275251e0318a387d70eb))

### 🐛 Bug Fixes | Bug 修复

- 图片名称包含有括号的时候 markdown 链接无法加载成功 ([a11d9b5](https://github.com/Mereithhh/van-blog/commit/a11d9b55f4f56ca535575661824cdf9bd3c82caf))

## [0.13.0](https://github.com/Mereithhh/van-blog/compare/v0.12.3...v0.13.0) (2022-08-22)

### 🐛 Bug Fixes | Bug 修复

- 全称标题过长导致在微信电脑浏览器中侧边栏标题换行 ([0431e97](https://github.com/Mereithhh/van-blog/commit/0431e97b865143806510403d9b8c1b1fcd32623a))
- 文档脚本错误 ([19bb12f](https://github.com/Mereithhh/van-blog/commit/19bb12ff5f92be12643dba410cd4f2ee1943adfa))

### ✏️ Documentation | 文档

- 文档增加 faq ([c53fc56](https://github.com/Mereithhh/van-blog/commit/c53fc56f0f0847bdbb0e13c9c140868dc8767d36))
- 更新 changelog 文档 ([fcec8ef](https://github.com/Mereithhh/van-blog/commit/fcec8ef10bca37abf031a7bdd82db0d35aa40065))

### ✨ Features | 新功能

- console.log 增加求 star 文案 🙏’ ([78aa2bc](https://github.com/Mereithhh/van-blog/commit/78aa2bc659abdbd2e8c71a9d861d433afc3f0030))
- 优化 more 标记提醒逻辑，点击确认依然可以保存 ([a1870db](https://github.com/Mereithhh/van-blog/commit/a1870db4ed9835046e49e5acecee80f3f7dbde7e))
- 后台更新提示的更新日志切换成项目文档中的链接 ([c98878c](https://github.com/Mereithhh/van-blog/commit/c98878c784b0d7ab67b35985aeaaa7a093d0c5f3))
- 后台编辑器切换预览模式持久化保存到设备 ([270beb5](https://github.com/Mereithhh/van-blog/commit/270beb52138dc3d0743cf59730b7fa330e6c275b))
- 后台编辑器自动满屏幕 ([f49a99e](https://github.com/Mereithhh/van-blog/commit/f49a99e649ac9ddec73d15f1f5530104decaec87))
- 后台编辑器页面增加宽度提升体验 ([c14bd6c](https://github.com/Mereithhh/van-blog/commit/c14bd6c7359e2d40df689f4bf3c44fc438fc59ab))
- 编辑器右上角增加字数统计 ([9f29f30](https://github.com/Mereithhh/van-blog/commit/9f29f30f162c4f1c6925063ff0dc7bbf918eb3e3))

### [0.12.3](https://github.com/Mereithhh/van-blog/compare/v0.12.2...v0.12.3) (2022-08-22)

### 🐛 Bug Fixes | Bug 修复

- React Hydration Error ([e47e3f2](https://github.com/Mereithhh/van-blog/commit/e47e3f29fcce1c8aff90ba5e94f00514a8e9a83d))
- 切换页面控制台重复说 hello ([a693a06](https://github.com/Mereithhh/van-blog/commit/a693a06c5ce3736952c59cf011554ad99a4fe2e2))
- 因后端客户端时区不同导致的 Hydration Error ([1f82816](https://github.com/Mereithhh/van-blog/commit/1f82816ed4fb0affdcaa16cfbf991d5093023654))
- 没映射静态文件目录时无法删除本地图床文件 ([80203d7](https://github.com/Mereithhh/van-blog/commit/80203d7a454b38f7d5179ebeba8dc7bac359a46d))
- 长标题+顶置情况下，文章标题样式稍微错位 ([d4c228e](https://github.com/Mereithhh/van-blog/commit/d4c228e2a1e66c884457722b60eaa8e62c32cf0a))

### 👷 Continuous Integration | CI 配置

- 拆分多个 job 并行提高效率 ([d8e8cb9](https://github.com/Mereithhh/van-blog/commit/d8e8cb929cb182ad6216371d4a7a9e63d3c5d934))

### ✏️ Documentation | 文档

- 更新了文档 ([6e5e2df](https://github.com/Mereithhh/van-blog/commit/6e5e2dff3da2468c7d0ead432cddbf72bf586491))
- 更新文档 ([1373781](https://github.com/Mereithhh/van-blog/commit/13737813b65a1c8320d44dfff673effaab2e24a1))

### ✨ Features | 新功能

- 升级提示展示文档和更新日志链接&项目文档增加更新日志 ([aa4514c](https://github.com/Mereithhh/van-blog/commit/aa4514c8ff25042dd1ae193685255f6dcb5e0bbf))
- 后台增加项目文档、API 文档跳转按钮 ([3f2a49e](https://github.com/Mereithhh/van-blog/commit/3f2a49e8cc3eae158000727720e760dab71cd933))
- 后台编辑器工具栏默认固定在最顶端 ([49b44dc](https://github.com/Mereithhh/van-blog/commit/49b44dc9492438fbcc35eb984979cb0895f39410))
- 容器启动时触发两次增量渲染 ([65de8f3](https://github.com/Mereithhh/van-blog/commit/65de8f375a4ed51a13aaf5f3d897a9ae16266df8))

### [0.12.2](https://github.com/Mereithhh/van-blog/compare/v0.12.1...v0.12.2) (2022-08-21)

### ✨ Features | 新功能

- https 自动重定向增加提示 ([9ce2dd8](https://github.com/Mereithhh/van-blog/commit/9ce2dd8c76ba230a7d35059cb16317b5fb3adf2f))
- 开启 https 自动重定向前增加提示文案 ([5896121](https://github.com/Mereithhh/van-blog/commit/5896121b4176131a4caa510af0ecacf005c1db33))
- 演示站禁止修改 https 自动重定向 ([4fe65e7](https://github.com/Mereithhh/van-blog/commit/4fe65e718584347d86b456625348759599e1dd09))

### [0.12.1](https://github.com/Mereithhh/van-blog/compare/v0.12.0...v0.12.1) (2022-08-21)

### ✏️ Documentation | 文档

- 修复文档错误 ([9276de9](https://github.com/Mereithhh/van-blog/commit/9276de9c9aca19a7f6c21498962920d311b68757))

### 🐛 Bug Fixes | Bug 修复

- 老版本迁移无法启动服务 ([1daee14](https://github.com/Mereithhh/van-blog/commit/1daee14c59e46c7567a373f789d98fb2623c1211))

## [0.12.0](https://github.com/Mereithhh/van-blog/compare/v0.11.1...v0.12.0) (2022-08-21)

### ✏️ Documentation | 文档

- 更新文档 ([55e8974](https://github.com/Mereithhh/van-blog/commit/55e89748e7fd1fc5d187d19b64ff52ae67869776))

### ✨ Features | 新功能

- https 证书全自动按需申请&文档更新 ([ac36e7a](https://github.com/Mereithhh/van-blog/commit/ac36e7abfcdc3c5b3c9792cf22741325535afa7c))

### [0.11.1](https://github.com/Mereithhh/van-blog/compare/v0.11.0...v0.11.1) (2022-08-19)

### 🐛 Bug Fixes | Bug 修复

- 演示站修改密码锁定用环境变量传参不生效 ([be663bf](https://github.com/Mereithhh/van-blog/commit/be663bfaeb89e84b03003e7364c404201661f900))

## [0.11.0](https://github.com/Mereithhh/van-blog/compare/v0.10.24...v0.11.0) (2022-08-19)

### ✨ Features | 新功能

- 增加演示站禁止修改账号密码的配置项 ([8c52fa6](https://github.com/Mereithhh/van-blog/commit/8c52fa61faa9f5bd15b4c7e9ee9dac1d5caffc2e))

### ⚡ Performance Improvements | 性能优化

- 优化构建，镜像体积倍减 ([6b2d54d](https://github.com/Mereithhh/van-blog/commit/6b2d54dc03e1ef6f2dccdb426474d510bf0eefbc))

### ✏️ Documentation | 文档

- 修复 README 坏链 ([e9d74ce](https://github.com/Mereithhh/van-blog/commit/e9d74ce0ca6ecca354b07d87465dd12544b9a1e8))
- 修复文档错字 ([8a206bc](https://github.com/Mereithhh/van-blog/commit/8a206bc563f5e4cb70dfccf858b282f846b55c5e))
- 更新文档 ([fb72e15](https://github.com/Mereithhh/van-blog/commit/fb72e15135cc7dc3e7a81901b39fe2f0d7da04cc))
- 更新文档 ([761eef5](https://github.com/Mereithhh/van-blog/commit/761eef51898f68240ee85b953e67379c8e3769f4))

### [0.10.24](https://github.com/Mereithhh/van-blog/compare/v0.10.23...v0.10.24) (2022-08-18)

### 🐛 Bug Fixes | Bug 修复

- 图片加载失败情况下样式不一致 ([f714b22](https://github.com/Mereithhh/van-blog/commit/f714b2232436f90e51a6988aff9e56ececf41029))

### 👷 Continuous Integration | CI 配置

- 调整 ci 顺序 ([9fb6859](https://github.com/Mereithhh/van-blog/commit/9fb68591de95a7f77f0da53478a0b20ce41a5911))

### [0.10.23](https://github.com/Mereithhh/van-blog/compare/v0.10.22...v0.10.23) (2022-08-18)

### 🐛 Bug Fixes | Bug 修复

- 后台前往主站不依赖设置中的 baseUrl ([075334a](https://github.com/Mereithhh/van-blog/commit/075334a9434b8fc30cc8a243db73642fe36d1d27))
- 用 ip 地址时本地图床前端无法正常展示 ([da50209](https://github.com/Mereithhh/van-blog/commit/da502097c4cb12e742190e7bc419e07502c86b06))

### [0.10.22](https://github.com/Mereithhh/van-blog/compare/v0.10.21...v0.10.22) (2022-08-18)

### 🐛 Bug Fixes | Bug 修复

- 本地图床图片上传不显示问题 ([9f5bdfb](https://github.com/Mereithhh/van-blog/commit/9f5bdfbbdb89b69caf20b4ebbd65be05c0a7b0c8))

### [0.10.21](https://github.com/Mereithhh/van-blog/compare/v0.10.20...v0.10.21) (2022-08-18)

### ✏️ Documentation | 文档

- README 预览图调整到前面 ([1162446](https://github.com/Mereithhh/van-blog/commit/1162446ea844470ba20e6358ad52eeede1fbb916))
- 修复文档错误 ([ae85336](https://github.com/Mereithhh/van-blog/commit/ae853367553a79b38f334264257d0e4c0587743d))
- 修复项目文档失效链接&增加预览图 ([e221772](https://github.com/Mereithhh/van-blog/commit/e2217722361c211e148dcec5abe35efeb3de7ac4))
- 更新 README ([ac0ff9d](https://github.com/Mereithhh/van-blog/commit/ac0ff9dd130941307ba3bf3cd2d831a1b61469df))
- 更新 readme 预览图 ([4182cc0](https://github.com/Mereithhh/van-blog/commit/4182cc0a02d714ebbc07815d7ea5a304bde6005e))

### 🐛 Bug Fixes | Bug 修复

- 初始化没办法上传图片 ([5d41997](https://github.com/Mereithhh/van-blog/commit/5d41997acce516b00589d3e610dfb9334ee48b2e))

### [0.10.20](https://github.com/Mereithhh/van-blog/compare/v0.10.19...v0.10.20) (2022-08-18)

### 🐛 Bug Fixes | Bug 修复

- 只有一页隐藏分页按钮 ([89afcbc](https://github.com/Mereithhh/van-blog/commit/89afcbca096e23ceb3b25e986e59ac5af2ad39b5))
- 链接卡片 hover 时图片不旋转 ([285efb5](https://github.com/Mereithhh/van-blog/commit/285efb5b57a6c05e47f32381fa0bb74317baac9d))

### [0.10.19](https://github.com/Mereithhh/van-blog/compare/v0.10.18...v0.10.19) (2022-08-17)

### ✏️ Documentation | 文档

- 更新 README 错字 ([956eda7](https://github.com/Mereithhh/van-blog/commit/956eda7349dad5803a27c99196bb8c49c0ac206c))

### ✨ Features | 新功能

- url 表单输入也会更新图片预览 ([14b6b62](https://github.com/Mereithhh/van-blog/commit/14b6b62f8d789355709f1ada8e640e1d59cbef8f))

### [0.10.18](https://github.com/Mereithhh/van-blog/compare/v0.10.17...v0.10.18) (2022-08-17)

### 🐛 Bug Fixes | Bug 修复

- ci 报错 ([9b1f167](https://github.com/Mereithhh/van-blog/commit/9b1f1675d740bfa2132a3c451ce2c9615e7f0fa2))
- 保存关于提示没有标签 ([701ab8f](https://github.com/Mereithhh/van-blog/commit/701ab8fb95c25b649bf0545e72cc7a2eeedf0a39))

### [0.10.17](https://github.com/Mereithhh/van-blog/compare/v0.10.16...v0.10.17) (2022-08-17)

### ✨ Features | 新功能

- 一页时不显示分页器 ([e091ad4](https://github.com/Mereithhh/van-blog/commit/e091ad4365b2d5243bd30301a1d0c13e7ba8fbde))
- 优化构建模板信息 ([27a264b](https://github.com/Mereithhh/van-blog/commit/27a264b7c560b108ad531699c649fcc262dbf1eb))

### [0.10.16](https://github.com/Mereithhh/van-blog/compare/v0.10.15...v0.10.16) (2022-08-17)

### 🐛 Bug Fixes | Bug 修复

- 完善访客记录逻辑&增加一个洗数据脚本 ([ea7f5c1](https://github.com/Mereithhh/van-blog/commit/ea7f5c13d8fb9c98555166ed01cf51bb44638089))

### [0.10.15](https://github.com/Mereithhh/van-blog/compare/v0.10.14...v0.10.15) (2022-08-17)

### ✨ Features | 新功能

- 优化 console.log 提示语 ([cce36ba](https://github.com/Mereithhh/van-blog/commit/cce36baec0d24351ae3e57aa1155f81e6837bf0c))
- 后台优化文案细节 ([f58fc32](https://github.com/Mereithhh/van-blog/commit/f58fc325fe2b7511cf776834c9fb3c1163b04dcf))

### 🐛 Bug Fixes | Bug 修复

- 修复访客信息展示&增加 console.log 欢迎语 ([210bc93](https://github.com/Mereithhh/van-blog/commit/210bc93fc93f24bc6495692b5843e12f70993ffc))
- 修复顶置失效问题 ([c5a1d66](https://github.com/Mereithhh/van-blog/commit/c5a1d66ed433663bc7a86dc0026950f8c4112915))
- 后台第一次登录后不显示版本“ ([07d6654](https://github.com/Mereithhh/van-blog/commit/07d66544d3514da571628f48482ac5510d47f997))
- 更改文章排序逻辑为排他性 ([b9085d3](https://github.com/Mereithhh/van-blog/commit/b9085d3f0d75d5fbb9c9e17e4b532542908e866e))

### [0.10.14](https://github.com/Mereithhh/van-blog/compare/v0.10.13...v0.10.14) (2022-08-17)

### 👷 Continuous Integration | CI 配置

- 锁定版本 ([f78d582](https://github.com/Mereithhh/van-blog/commit/f78d5826628c0abf56ec86141975d16dde8ad41e))

### [0.10.13](https://github.com/Mereithhh/van-blog/compare/v0.10.12...v0.10.13) (2022-08-17)

### ✏️ Documentation | 文档

- 修改图标 ([fcbbdb2](https://github.com/Mereithhh/van-blog/commit/fcbbdb2a4ef3f2da3a446ef5a8ff4a5f7cbc31e9))
- 增加图标 ([e805a74](https://github.com/Mereithhh/van-blog/commit/e805a747d07a43f2182be538c86fbebd28bb5b00))
- 增加构建图标 ([72392b8](https://github.com/Mereithhh/van-blog/commit/72392b8059d0241432db42111b10882d92f09ca8))

### ✨ Features | 新功能

- 增加趋势图 ([924cf3b](https://github.com/Mereithhh/van-blog/commit/924cf3b5f49d6de1fcc307d180cad97fdf3f725a))

### 🐛 Bug Fixes | Bug 修复

- 修改文档 ([abdb7bb](https://github.com/Mereithhh/van-blog/commit/abdb7bb8f25eb72ca5ed5f55d24f6853fcd10248))
- 登录页面主题自适应 ([e6e88d4](https://github.com/Mereithhh/van-blog/commit/e6e88d4ae29d3488515818c66b22bffefc1bce80))
- 配置文件报错 ([6f2cd92](https://github.com/Mereithhh/van-blog/commit/6f2cd9299d3200d748e69c3c72439725af868fa3))

### [0.10.12](https://github.com/Mereithhh/van-blog/compare/v0.10.11...v0.10.12) (2022-08-16)

### 🐛 Bug Fixes | Bug 修复

- 尝试修复后台切换页面报错 ([f25f380](https://github.com/Mereithhh/van-blog/commit/f25f380f257432fe4c24a52b39df5367b04e945f))

### [0.10.11](https://github.com/Mereithhh/van-blog/compare/v0.10.10...v0.10.11) (2022-08-16)

### 👷 Continuous Integration | CI 配置

- demo 站不用自用镜像 ([559ef38](https://github.com/Mereithhh/van-blog/commit/559ef38778616b67be006df907c742e425d823c0))

### 🐛 Bug Fixes | Bug 修复

- 尝试修复构建后后台切换页面报错 ([df47e26](https://github.com/Mereithhh/van-blog/commit/df47e26c5814d0b1575b200a575018601aa2d59a))

### [0.10.10](https://github.com/Mereithhh/van-blog/compare/v0.10.9...v0.10.10) (2022-08-16)

### 👷 Continuous Integration | CI 配置

- 增加部署 demo 的 job ([4cd838c](https://github.com/Mereithhh/van-blog/commit/4cd838c2dc98d26bec7d2b8335b58761d23f06e1))

### 🐛 Bug Fixes | Bug 修复

- 修复初始化后预览面板报错 ([84f5b11](https://github.com/Mereithhh/van-blog/commit/84f5b110296496f5bc454bde96ce7d373eee9e1d))
- 登录态失效 ([43ea345](https://github.com/Mereithhh/van-blog/commit/43ea345fded8d140ee411d08cec35fca730d594d))
- 默认隐藏后台按钮 ([4da6c5b](https://github.com/Mereithhh/van-blog/commit/4da6c5bae747ee3ec880067c2cf41d1d7849c0d6))

### ✨ Features | 新功能

- 拆分初始化页面&初始化页面自动根据实际适配主题 ([1c92868](https://github.com/Mereithhh/van-blog/commit/1c9286810e13c2282fca8fda975b624e6519ccba))
- 默认上传图片复制 markdown 链接而不是 url ([3addf1c](https://github.com/Mereithhh/van-blog/commit/3addf1ca1681630afde72f9fbe6bec18d563f353))

### ✏️ Documentation | 文档

- 增加初始化文档 ([47e5c55](https://github.com/Mereithhh/van-blog/commit/47e5c550f8926f88b837400b54e7d0205f8aac41))
- 更新 README.md ([1a7fc4c](https://github.com/Mereithhh/van-blog/commit/1a7fc4ce954d58a63d83d6c7dcdd59b873340977))

### [0.10.9](https://github.com/Mereithhh/van-blog/compare/v0.10.8...v0.10.9) (2022-08-16)

### ✏️ Documentation | 文档

- 更新大量文档 ([ffed346](https://github.com/Mereithhh/van-blog/commit/ffed346253c4b15b52fc3b5bc5e835d08180a9d6))

### 🐛 Bug Fixes | Bug 修复

- 修复顶置失效 ([85c98c9](https://github.com/Mereithhh/van-blog/commit/85c98c9e11eec72d966b05b9ba0dbaad33c62f57))

### [0.10.8](https://github.com/Mereithhh/van-blog/compare/v0.10.7...v0.10.8) (2022-08-14)

### 👷 Continuous Integration | CI 配置

- 安装 sharp ([8b46504](https://github.com/Mereithhh/van-blog/commit/8b46504e2356510b3b68ca3ffefadab89dcaed7b))

### [0.10.7](https://github.com/Mereithhh/van-blog/compare/v0.10.6...v0.10.7) (2022-08-14)

### 🐛 Bug Fixes | Bug 修复

- 删除导致 ci 报错的无用代码 ([c4a0514](https://github.com/Mereithhh/van-blog/commit/c4a0514b62f7183c0ea3285fbafef8c5f5f9242a))

### [0.10.6](https://github.com/Mereithhh/van-blog/compare/v0.10.5...v0.10.6) (2022-08-14)

### ✨ Features | 新功能

- 优化主题切换，减少报错 ([cbb5bdb](https://github.com/Mereithhh/van-blog/commit/cbb5bdbd62d4b9a1b16313209a1c8cc91af42f97))
- 前台图片预览增加小工具 ([1460536](https://github.com/Mereithhh/van-blog/commit/146053657f88f6077672d82a4764150bc59540bd))
- 图片增加灯箱 ([c811c5a](https://github.com/Mereithhh/van-blog/commit/c811c5a3f5ea9b4ef3bd7f9cc9425218c32199fd))
- 增加 cdn 配置 ([138c72a](https://github.com/Mereithhh/van-blog/commit/138c72a54f951d0f02c5c739a15aa0bfb3343ae4))

### [0.10.5](https://github.com/Mereithhh/van-blog/compare/v0.10.4...v0.10.5) (2022-08-14)

### 👷 Continuous Integration | CI 配置

- 增加 sharp ([ea1865d](https://github.com/Mereithhh/van-blog/commit/ea1865d79ec39137fd196e36eed641e57da5ddd1))
- 增加 sharp ([425258e](https://github.com/Mereithhh/van-blog/commit/425258e8a794d890ace8eacebd4b46786cc709f7))

### [0.10.4](https://github.com/Mereithhh/van-blog/compare/v0.10.3...v0.10.4) (2022-08-14)

### 👷 Continuous Integration | CI 配置

- prod 安装 sharp ([5339c5a](https://github.com/Mereithhh/van-blog/commit/5339c5a1b2846ce67d4c07d8a51534fd46fea578))

### 🐛 Bug Fixes | Bug 修复

- next 多余的无用 Link ([9984d93](https://github.com/Mereithhh/van-blog/commit/9984d930e9358cc6106e097222bcb75479fa49fe))
- 当无新增访客时，新增访客为负数的问题 ([6c6ab01](https://github.com/Mereithhh/van-blog/commit/6c6ab016c2114b8a636ac6b9e8b6b6afe2c69c1e))
- 每天晚上 0 点定时更新当天的访客记录 ([8810907](https://github.com/Mereithhh/van-blog/commit/881090743bb07aba90105fad2b0ce630e92a6cfb))

### [0.10.3](https://github.com/Mereithhh/van-blog/compare/v0.10.2...v0.10.3) (2022-08-13)

### ✨ Features | 新功能

- 移除 sweetalert2，优化 toast ([4a7620c](https://github.com/Mereithhh/van-blog/commit/4a7620c6322d69049c27e7bd878347b5fc8b7f71))

### [0.10.2](https://github.com/Mereithhh/van-blog/compare/v0.10.1...v0.10.2) (2022-08-13)

### 🐛 Bug Fixes | Bug 修复

- 修复友情链接站点信息错误 ([03a5769](https://github.com/Mereithhh/van-blog/commit/03a5769624b05c85fc0de52eda0c72df3ac0f4f5))

### [0.10.1](https://github.com/Mereithhh/van-blog/compare/v0.10.0...v0.10.1) (2022-08-13)

### 🐛 Bug Fixes | Bug 修复

- 修复未加 props 导致的构建报错 ([a3bea70](https://github.com/Mereithhh/van-blog/commit/a3bea707a7ceb51732eca6b9b908eff7dfde6acd))

## [0.10.0](https://github.com/Mereithhh/van-blog/compare/v0.9.0...v0.10.0) (2022-08-13)

### 🐛 Bug Fixes | Bug 修复

- 修复使用了 admin 相对路由导致的跳转问题 ([215c32e](https://github.com/Mereithhh/van-blog/commit/215c32eeb45239fd457952364bd98282f78398b4))
- 修复文案错误 ([ad8d0ea](https://github.com/Mereithhh/van-blog/commit/ad8d0ea5ad2bf357e832e39e32e25823a4e8875e))

### ✨ Features | 新功能

- 上传图片增加 loading 态 ([f5db57a](https://github.com/Mereithhh/van-blog/commit/f5db57a18bb0ed373942bb55f7e2ab987fdce148))
- 优化初始化提示文案” ([375e130](https://github.com/Mereithhh/van-blog/commit/375e130a953f4425a3bd8705d5aa68d5de528322))
- 优化加密文章显示样式 ([853e882](https://github.com/Mereithhh/van-blog/commit/853e882ca60e26eb313453d77b9c12cfde6eabe7))
- 优化后台友联设置 ([2aedf1d](https://github.com/Mereithhh/van-blog/commit/2aedf1d50219d1787b8e51763066b60c6d6e83ac))
- 优化后台页容器展示 ([1a96f62](https://github.com/Mereithhh/van-blog/commit/1a96f6238e3f1a2f08d983af765cfa780bdb32f5))
- 友链展示 ([71c28fc](https://github.com/Mereithhh/van-blog/commit/71c28fce718a5338c04019966bc354649849bbb3))
- 后台编辑器代码主题随亮暗切换 ([af7adf6](https://github.com/Mereithhh/van-blog/commit/af7adf62893c291f6557960bb52d0932c5798781))
- 增加是否展示友链和捐赠信息的选项 ([542a068](https://github.com/Mereithhh/van-blog/commit/542a0689ea96fe349061ea6494da0d64c1eba302))
- 捐赠信息展示 ([b0cfcc2](https://github.com/Mereithhh/van-blog/commit/b0cfcc2eb83db5c2e6d8ae653b51d38c1bd0a824))
- 文案优化 ([765e8e9](https://github.com/Mereithhh/van-blog/commit/765e8e9607f91138a7f43e6a5e0a7828cf5dfa01))
- 略微优化初始化页面样式 ([631e1ea](https://github.com/Mereithhh/van-blog/commit/631e1ea41fd5f2ef0e014fef3a649085f6fc93b3))
- 调整 markdown 分界线样式 ([1b54021](https://github.com/Mereithhh/van-blog/commit/1b540211bc40cc3a1fc822aeb006c6d9d2807439))
- 隐藏文章功能 ([98d0c23](https://github.com/Mereithhh/van-blog/commit/98d0c23233883e5f6d97c4e8dd68c0f337b52082))

## [0.9.0](https://github.com/Mereithhh/van-blog/compare/v0.8.0...v0.9.0) (2022-08-12)

### 👷 Continuous Integration | CI 配置

- 增加更新版本到 api server 的操作 ([5cf678d](https://github.com/Mereithhh/van-blog/commit/5cf678d0ce1b6cbf0b28b16b857cc58e49765927))

## [0.8.0](https://github.com/Mereithhh/van-blog/compare/v0.7.8...v0.8.0) (2022-08-12)

### 🐛 Bug Fixes | Bug 修复

- 图片信息显示错误 ([b3fb7d4](https://github.com/Mereithhh/van-blog/commit/b3fb7d402014f4f0849857ca7714b1a023da9abc))

### ✨ Features | 新功能

- 优化主题切换定时器“ ([91820e9](https://github.com/Mereithhh/van-blog/commit/91820e9c406a1ae7a73116fd4eacf82e0eb5b7b3))
- 优化后台图片最大高度展示 ([6fbcd48](https://github.com/Mereithhh/van-blog/commit/6fbcd487226e9e02ad646f4b198c1b9ada811b7b))
- 优化图床 meta 信息和后台央视 ([5a9c67d](https://github.com/Mereithhh/van-blog/commit/5a9c67dbb6ae139932fc2080cc474f79a1b53825))
- 优化图片管理展示页面 ([9d6efd8](https://github.com/Mereithhh/van-blog/commit/9d6efd818e3457ae0f74421aee45439fcf74d868))
- 初步增加本地图床 ([939c405](https://github.com/Mereithhh/van-blog/commit/939c4057c717a24d1f069d2a02539b3b3168f023))
- 可查看被引用图片的文章了 ([805d5c6](https://github.com/Mereithhh/van-blog/commit/805d5c6c3ffea2670bfdaca7fa4b7bbbc286c412))
- 后台剪切板图片上传 ([9922314](https://github.com/Mereithhh/van-blog/commit/992231487482d0b582e69ca6c5275f656a259149))
- 后台图片管理完善剪切板复制和右键菜单删除 ([9a27a60](https://github.com/Mereithhh/van-blog/commit/9a27a60c8d2db92718e93d53ec9aa3e2d9d91238))
- 后台图片部分支持内置图床&优化设置表单 ([023fed9](https://github.com/Mereithhh/van-blog/commit/023fed90385c8c68543b82c1f34042e28ab4978f))
- 后台完善右键菜单和剪切板删除 ([15b9bca](https://github.com/Mereithhh/van-blog/commit/15b9bca5615bb702e8536a1d17a93b900f3dcf02))
- 后台编辑器上传 toolbar ([d1d924e](https://github.com/Mereithhh/van-blog/commit/d1d924e13dd02c18f039f7f0dfdce41489e3a9d3))
- 后台设置增加裁剪支持 ([c705397](https://github.com/Mereithhh/van-blog/commit/c7053976a23644742e6b15f4d080bb49f86a6319))
- 图床可以下载图片 ([691c946](https://github.com/Mereithhh/van-blog/commit/691c9468c9a00b1199e5ca88f6f5c00b9ca73805))
- 增加图床设置界面和接口 ([032a0f0](https://github.com/Mereithhh/van-blog/commit/032a0f00855ce0e08b957c7c6cd70f166fb34ec8))
- 备份恢复图床支持 ([2dd253d](https://github.com/Mereithhh/van-blog/commit/2dd253dd946134b7a8b7205dd16e323009f93691))
- 完善图片信息展示&增加删除二次确认弹窗 ([e685250](https://github.com/Mereithhh/van-blog/commit/e6852509009f0416005c5360ba10d8e07d3f7eea))
- 支持扫描文章已存在的图片到图床 ([8fd9b5a](https://github.com/Mereithhh/van-blog/commit/8fd9b5ab9f347b3ab5cbf9912857852747df9163))
- 隐藏多余的设置抽屉 ([7dbf9b7](https://github.com/Mereithhh/van-blog/commit/7dbf9b78276c92885862b2b6f6d946671676a776))

### [0.7.8](https://github.com/Mereithhh/van-blog/compare/v0.7.7...v0.7.8) (2022-08-09)

### ✨ Features | 新功能

- 后台增加黑暗模式 ([c92996a](https://github.com/Mereithhh/van-blog/commit/c92996a3a1824e5b58d008ef9d890f1c32c7344e))

### [0.7.7](https://github.com/Mereithhh/van-blog/compare/v0.7.6...v0.7.7) (2022-08-08)

### 🐛 Bug Fixes | Bug 修复

- 修复接口错误 ([cf0b81e](https://github.com/Mereithhh/van-blog/commit/cf0b81ec4fdfbceec36aabb04882251812819199))

### [0.7.6](https://github.com/Mereithhh/van-blog/compare/v0.7.5...v0.7.6) (2022-08-08)

### 🐛 Bug Fixes | Bug 修复

- 文章卡片展示创建日期 ([51936a1](https://github.com/Mereithhh/van-blog/commit/51936a141f65ae507a63fc03939c7ad66f428df6))

### [0.7.5](https://github.com/Mereithhh/van-blog/compare/v0.7.4...v0.7.5) (2022-08-08)

### 🐛 Bug Fixes | Bug 修复

- 显示后台按钮配置没按预期显示 ([cbbe6fe](https://github.com/Mereithhh/van-blog/commit/cbbe6fe005c0fd4b8fa9727eb012a663c54b8a13))

### [0.7.4](https://github.com/Mereithhh/van-blog/compare/v0.7.3...v0.7.4) (2022-08-08)

### ✨ Features | 新功能

- 优化文章获取接口 ([2e83b41](https://github.com/Mereithhh/van-blog/commit/2e83b41e09a9cce0fef7000e64d1bbd575e8bc85))
- 保存和发布草稿默认检测 more 标记 ([3e684df](https://github.com/Mereithhh/van-blog/commit/3e684dfc90cbd75e6deae8b00673dfa951ce12d6))
- 前台展示版本号 ([c81850b](https://github.com/Mereithhh/van-blog/commit/c81850b4cdadadd9a009fc439fea5a6ed1058d84))

### [0.7.3](https://github.com/Mereithhh/van-blog/compare/v0.7.2...v0.7.3) (2022-08-05)

### ✨ Features | 新功能

- 如果有 noViewer 的标记则不更新访客 ([758398d](https://github.com/Mereithhh/van-blog/commit/758398dd893eef279bcfcabb9b7536c98a4b6740))

### [0.7.2](https://github.com/Mereithhh/van-blog/compare/v0.7.1...v0.7.2) (2022-08-05)

### 👷 Continuous Integration | CI 配置

- 修改脚本 ([2757229](https://github.com/Mereithhh/van-blog/commit/2757229fc67b1b7cdee97be50dbf5d7c59508b8e))

### 🐛 Bug Fixes | Bug 修复

- 修复主站按钮显示 ([ab22fca](https://github.com/Mereithhh/van-blog/commit/ab22fcad4c723096f0e1dcd314b4f16ea36be38e))
- 搜索接口会带上已删除的文章 ([2d66b67](https://github.com/Mereithhh/van-blog/commit/2d66b670c3541a5a050858567f6701b4e5140de7))

### ✨ Features | 新功能

- 增加展示后台按钮配置项 ([6105162](https://github.com/Mereithhh/van-blog/commit/6105162133e33ce983522c5f8650bfc98d9eef94))
- 增加清洗数据脚本 ([76b47f9](https://github.com/Mereithhh/van-blog/commit/76b47f9c4c2fcd4e249dc4c85e79ceb343f536b9))

### [0.7.1](https://github.com/Mereithhh/van-blog/compare/v0.7.0...v0.7.1) (2022-08-04)

### ♻️ Code Refactoring | 代码重构

- 后台优化 query 获取逻辑 ([98b8600](https://github.com/Mereithhh/van-blog/commit/98b8600917d9e1b869faffdebadd931183fe50a8))

### 🐛 Bug Fixes | Bug 修复

- 后台关闭密码自动补全 ([b9f1272](https://github.com/Mereithhh/van-blog/commit/b9f12725f23e4bebdd6dbb59bf038347abd7c1ff))

### ✨ Features | 新功能

- 发布草稿增加成功提示 ([29e4943](https://github.com/Mereithhh/van-blog/commit/29e4943794f69606e79285985d708af4fc4b5af0))
- 后台会持久记忆表格 pageSize ([6ae55e9](https://github.com/Mereithhh/van-blog/commit/6ae55e9ab54db1033a67fc58cb082726b0362fbb))
- 后台编辑器增加快速插入 more 标记按钮 ([b6065c8](https://github.com/Mereithhh/van-blog/commit/b6065c8319df54f5d4040a23109e1b2a092fff7b))
- 增加并完善导航栏配置项，可配置显示网站名/logo ([9f9b79e](https://github.com/Mereithhh/van-blog/commit/9f9b79e9b3b3d6a718b783c3af1b41c27cde0180))
- 增加过时文章提醒 ([c0fa233](https://github.com/Mereithhh/van-blog/commit/c0fa233e30ad7af9bffe11d6338fc98f6444cc84))

## [0.7.0](https://github.com/Mereithhh/van-blog/compare/v0.6.0...v0.7.0) (2022-07-31)

### ✨ Features | 新功能

- 后台管理页面基本适配移动端 ([577ae12](https://github.com/Mereithhh/van-blog/commit/577ae123e8e4265ecfb77cca4ea16db04bad5254))
- 后台文章编辑页面移动端优化 ([dcdb423](https://github.com/Mereithhh/van-blog/commit/dcdb42370f72352c276dfba01939dac79c076919))
- 进一步优化后台移动端样式 ([c4bdac2](https://github.com/Mereithhh/van-blog/commit/c4bdac28e899a6b5c38e362899c93f9a64902714))
- 优化后台文章和草稿页的移动端展示 ([ec96722](https://github.com/Mereithhh/van-blog/commit/ec967224f2558603a9e7940ce5a94350d6ce436d))
- 优化后台移动端表单工具栏样式 ([9889732](https://github.com/Mereithhh/van-blog/commit/9889732ed364f790f87a2505f3b0a43a56214a99))
- 优化后台移动端卡片 extra 区域展示 ([1aac513](https://github.com/Mereithhh/van-blog/commit/1aac513fed7d3fbae244ec75a8731d829acd9bd2))
- 优化平板显示比例 ([09ea652](https://github.com/Mereithhh/van-blog/commit/09ea65255c4a5fabda8a140bfefd1322f2167887))

## [0.6.0](https://github.com/Mereithhh/van-blog/compare/v0.5.11...v0.6.0) (2022-07-31)

### ✨ Features | 新功能

- 后台增加文章分析卡片 ([0617528](https://github.com/Mereithhh/van-blog/commit/061752826cb55875cbf47635f4b599cf51444791))

### [0.5.11](https://github.com/Mereithhh/van-blog/compare/v0.5.10...v0.5.11) (2022-07-31)

### ✨ Features | 新功能

- 访客统计卡片增加更多信息展示 ([cbc5627](https://github.com/Mereithhh/van-blog/commit/cbc56278ac706c4249908b9ad3157a351c7ba37d))
- 后台访客相关数据可选择天数/条数 ([8189497](https://github.com/Mereithhh/van-blog/commit/8189497f671b5ebd0f4352319a72ce8c46eb4be6))
- 后台完善分析卡片&增加提示' ([11485cf](https://github.com/Mereithhh/van-blog/commit/11485cffb09cf8eff0a9c2d26755f9f52c87893b))
- 记录所有的 tabKey ([9fb7464](https://github.com/Mereithhh/van-blog/commit/9fb74649cd45c0850784f9822ee8861ad4c16982))

### [0.5.10](https://github.com/Mereithhh/van-blog/compare/v0.5.9...v0.5.10) (2022-07-31)

### ♻️ Code Refactoring | 代码重构

- 精简访客查询逻辑 ([0332821](https://github.com/Mereithhh/van-blog/commit/033282140111145c9b66e6744ea96a103d9ac91f))
- 文章增加 viewer 字段 ([f70ffc0](https://github.com/Mereithhh/van-blog/commit/f70ffc061b69dc9d0a45adbf0f8be4628765f96d))
- 优化访客记录查询逻辑 ([b15c85a](https://github.com/Mereithhh/van-blog/commit/b15c85afe97e95e652092474988c36da3a229510))
- 优化访客记录分析能力 ([9bca268](https://github.com/Mereithhh/van-blog/commit/9bca2687e49b9f58e33f54b27ce0eccd33612aa3))
- 优化分析接口返回数据 ([449bec0](https://github.com/Mereithhh/van-blog/commit/449bec0c3c7f2d408bf303c324c1e10192377d80))
- 重构-> analysisProvider ([bc9b2ea](https://github.com/Mereithhh/van-blog/commit/bc9b2ea956d7408fdc4f419ece53a7abf9b74ee7))

### ✨ Features | 新功能

- 后台首页拆分 part1 ([976f16e](https://github.com/Mereithhh/van-blog/commit/976f16ee69554b45c81af0ce6988ee8acb8f1208))
- 后台文章列表页访客数可排序 ([03870d3](https://github.com/Mereithhh/van-blog/commit/03870d3ef84548d018f601014324b691e31161d1))
- 后台文章页列表展示浏览量 ([37e2745](https://github.com/Mereithhh/van-blog/commit/37e2745db50bd80466a6287c5d32013cf3aa2fd2))
- 后台优化展示列表列宽 ([ccef55f](https://github.com/Mereithhh/van-blog/commit/ccef55f26d54eea347157a371ade001d095b472d))
- 记录全站最近访问时间 ([d262879](https://github.com/Mereithhh/van-blog/commit/d262879a5a8d33f546dfc1739d6402d70148b8a3))
- 记录最近访问文章的时间 ([4311b93](https://github.com/Mereithhh/van-blog/commit/4311b93a781404726df6861a0dd867334b4c6508))
- 实现了一部分概览分析接口 ([97e4176](https://github.com/Mereithhh/van-blog/commit/97e4176f8fa4c13ee5552303295bf7a05c025de2))
- 拓展分析接口查询能力，可查询指定数量 ([8bb56e9](https://github.com/Mereithhh/van-blog/commit/8bb56e9f2ed49326eff0b0ebebd9c2120c1ff34f))
- 完善 analysis 获取 viewerData 接口 ([f1386b1](https://github.com/Mereithhh/van-blog/commit/f1386b1d5db98c94c10bb883f120a6cefaa281c5))
- 完善方可分析 tab ([984359c](https://github.com/Mereithhh/van-blog/commit/984359c002943f376546d1c99f0783c5e6afa6e3))
- 增加更新最近访问文章逻辑 ([65b2a3b](https://github.com/Mereithhh/van-blog/commit/65b2a3bccfd037691092ad30aba861eb2407a288))

### [0.5.9](https://github.com/Mereithhh/van-blog/compare/v0.5.8...v0.5.9) (2022-07-30)

### ✨ Features | 新功能

- 优化 markdown 标题大小 ([3afcc6e](https://github.com/Mereithhh/van-blog/commit/3afcc6eda1dc9b3043718df66ad6688878c01821))

### [0.5.8](https://github.com/Mereithhh/van-blog/compare/v0.5.7...v0.5.8) (2022-07-30)

### 🐛 Bug Fixes | Bug 修复

- markdown 黑暗模式颜色不对 ([f8bd642](https://github.com/Mereithhh/van-blog/commit/f8bd6422a35792bb7a5c9063113a5e3d76bce3e3))

### [0.5.7](https://github.com/Mereithhh/van-blog/compare/v0.5.6...v0.5.7) (2022-07-30)

### ✨ Features | 新功能

- 导入功能适配新版 dto ([cb84bec](https://github.com/Mereithhh/van-blog/commit/cb84bec8bfefb9116a0091a7f0c993c1fbd216af))

### [0.5.6](https://github.com/Mereithhh/van-blog/compare/v0.5.5...v0.5.6) (2022-07-30)

### 🐛 Bug Fixes | Bug 修复

- 导出按钮点了没反应 ([edf96f2](https://github.com/Mereithhh/van-blog/commit/edf96f25f41a216ee8ce4cd324bd1f6bb8268da5))

### ✨ Features | 新功能

- 备案号变为可选配置 ([57f9900](https://github.com/Mereithhh/van-blog/commit/57f99009ddf7fef9e8e4b7aaa847bc0fe5777062))
- 备份导出访客信息 ([177a909](https://github.com/Mereithhh/van-blog/commit/177a909fceae049b2f5303756e8fc523885d8f54))
- 拆分站点配置 ([11b86d3](https://github.com/Mereithhh/van-blog/commit/11b86d3e4423d5c85df3a259f6d3a81024cee122))
- 继续抽离必填项&修复更新站点信息接口覆盖问题 ([d252796](https://github.com/Mereithhh/van-blog/commit/d2527962ba4d36d197bf45a9085ea3b4b735a9bf))
- 建站时间变为可选项 ([11a3685](https://github.com/Mereithhh/van-blog/commit/11a3685a5950e795e55afea4cebe41f1ad7110f7))
- 修改站点描述表单 ([ea2ec11](https://github.com/Mereithhh/van-blog/commit/ea2ec11f6129d706fdc476b1fdde546f77fcdb06))
- 优化初始化页面 ([4b2ba9f](https://github.com/Mereithhh/van-blog/commit/4b2ba9f2b85be6dcbd9a251702a00422b9342d6e))
- 增加不显示 submenu 的配置 ([0f66bfa](https://github.com/Mereithhh/van-blog/commit/0f66bfaaaaab26be12fd4f2243a8002ed672bc1f))
- 子导航栏没有分类不渲染 ([24c53e8](https://github.com/Mereithhh/van-blog/commit/24c53e8c56bcf44d48e7d9495b437c2b40582ed0))

### [0.5.5](https://github.com/Mereithhh/van-blog/compare/v0.5.4...v0.5.5) (2022-07-30)

### 🐛 Bug Fixes | Bug 修复

- 优化访客记录逻辑&移除定时任务 ([d5197de](https://github.com/Mereithhh/van-blog/commit/d5197de79e92d77db14ff12acf48de48a71e97de))

### [0.5.4](https://github.com/Mereithhh/van-blog/compare/v0.5.3...v0.5.4) (2022-07-30)

### ✨ Features | 新功能

- 优化单独每个页面的访客记录逻辑 ([0c528fa](https://github.com/Mereithhh/van-blog/commit/0c528fa25c39e1e3cab4c6c3e7ce02f44cd1337e))
- 自己实现文章访客记录 ([06a2966](https://github.com/Mereithhh/van-blog/commit/06a2966912636fd55d544304c42812bd18817a6b))

### [0.5.3](https://github.com/Mereithhh/van-blog/compare/v0.5.2...v0.5.3) (2022-07-30)

### ♻️ Code Refactoring | 代码重构

- 前台提升 globalState ([72f6460](https://github.com/Mereithhh/van-blog/commit/72f646013a1f41c6436ab27f43957d6c699d569f))
- themeContext -> globalConext ([b36a254](https://github.com/Mereithhh/van-blog/commit/b36a254fc3022098c1c96e27cf55c28a714ec421))

### ✨ Features | 新功能

- 前台监听路由跳转以优化访客记录逻辑 ([2899f51](https://github.com/Mereithhh/van-blog/commit/2899f51c0c5087153c0f8f7a98db8a991226b5aa))

### [0.5.2](https://github.com/Mereithhh/van-blog/compare/v0.5.1...v0.5.2) (2022-07-30)

### ✨ Features | 新功能

- 自己实现分页器以便调用 next/link ([b5f7505](https://github.com/Mereithhh/van-blog/commit/b5f750519a7756275ac13fd450fcf931f47381b0))
- markdown 样式改为模块导入以减少体积 ([da4713e](https://github.com/Mereithhh/van-blog/commit/da4713ee62a30f35a0b2400736e85c54acf5c612))

### 🐛 Bug Fixes | Bug 修复

- 分页展示问题 ([e770caf](https://github.com/Mereithhh/van-blog/commit/e770caf1ca1d1064bd8e5d58c147eaa306eb88c7))
- 修复记录浏览量逻辑 ([083d569](https://github.com/Mereithhh/van-blog/commit/083d569240fd7b09e75933185406a2cf7c48e337))

### [0.5.1](https://github.com/Mereithhh/van-blog/compare/v0.5.0...v0.5.1) (2022-07-30)

### 👷 Continuous Integration | CI 配置

- 删除通知 step ([24b23b9](https://github.com/Mereithhh/van-blog/commit/24b23b9311f9c4c84fb9991c6c3c14a11754db32))
- 增加一个测试 webhook 的 ci ([239a224](https://github.com/Mereithhh/van-blog/commit/239a224d711c211d29fa4ec687618e4b17392bf9))
- delete test ci ([cdda87b](https://github.com/Mereithhh/van-blog/commit/cdda87b836e25ffe85ab2dc9f92eacfb9b7c79d3))
- fix self use ([fb695f3](https://github.com/Mereithhh/van-blog/commit/fb695f37d1efbf89f8a47324d836319765b565a6))
- fix self use build ([445a8eb](https://github.com/Mereithhh/van-blog/commit/445a8eb96ac67fe88f8849c46980cce9c52305f7))
- test ([aaf6e81](https://github.com/Mereithhh/van-blog/commit/aaf6e81df304c331bdbb38575e4fae6f392f89bf))

### 🐛 Bug Fixes | Bug 修复

- 登录态没能持续保存的问题 ([45ad14e](https://github.com/Mereithhh/van-blog/commit/45ad14e2b8998bcdc32b25171399b67674c8ae59))

### ✨ Features | 新功能

- 按需更新字数缓存，不用定时了 ([3b47eda](https://github.com/Mereithhh/van-blog/commit/3b47eda7a6abc56efda9dc38561fbc550f15ce6c))
- 尝试为后台增加 pwa ([8fba5f3](https://github.com/Mereithhh/van-blog/commit/8fba5f35ace8eedfbdfccc2bb581d2814acde7ce))

## [0.5.0](https://github.com/Mereithhh/van-blog/compare/v0.4.2...v0.5.0) (2022-07-29)

### ♻️ Code Refactoring | 代码重构

- 前台渲染分离各个页面的接口和 props ([d223a76](https://github.com/Mereithhh/van-blog/commit/d223a76ffffcaaf1baacd6dad404bf6a3825ad69))

### 🐛 Bug Fixes | Bug 修复

- 修复前台分类 hover 样式问题 ([889103d](https://github.com/Mereithhh/van-blog/commit/889103da57994317ec8a11492674320964f0c7d4))

### [0.4.2](https://github.com/Mereithhh/van-blog/compare/v0.4.1...v0.4.2) (2022-07-29)

### 🐛 Bug Fixes | Bug 修复

- 修复 updatedAt 日期构建错误 ([8ce03e7](https://github.com/Mereithhh/van-blog/commit/8ce03e7dcc652cd7951ade582317ead8a80ea76d))

### [0.4.1](https://github.com/Mereithhh/van-blog/compare/v0.4.0...v0.4.1) (2022-07-29)

### 🐛 Bug Fixes | Bug 修复

- 备份后删除临时文件 ([26e317d](https://github.com/Mereithhh/van-blog/commit/26e317d73c3a5697172d34b4a8736a9339d6045d))

### 👷 Continuous Integration | CI 配置

- 构建版本号显示不正确 ([4c784b7](https://github.com/Mereithhh/van-blog/commit/4c784b7ef5c1db6dd0123037a55453daea58945c))

## [0.4.0](https://github.com/Mereithhh/van-blog/compare/v0.3.6...v0.4.0) (2022-07-29)

### ♻️ Code Refactoring | 代码重构

- 查询时指定不同的 viewer 以优化性能 ([5fbdbc0](https://github.com/Mereithhh/van-blog/commit/5fbdbc0b33bed846b09a7fe15bfdfbe1019c8c80))
- 分类设置界面分离接口 ([cf2db34](https://github.com/Mereithhh/van-blog/commit/cf2db34194f7307eabaa2fb81193b21c029bb575))
- 分离用户设置 ([5e8b813](https://github.com/Mereithhh/van-blog/commit/5e8b813cd98aed6198568e693abc90f36ad8640d))
- 后台 edit 页面解耦 initState ([b4ca1ad](https://github.com/Mereithhh/van-blog/commit/b4ca1ad358454f08e5d8d8fc4b9ebec8eca76ab5))
- 后台 welcome 页分离接口 ([8c781be](https://github.com/Mereithhh/van-blog/commit/8c781be0f0eb3f9b38aba7028627227ed2553a0a))
- 后台编辑关于我入口 ([dba9b8e](https://github.com/Mereithhh/van-blog/commit/dba9b8e1860067d11e1cfc247f9a74be33d1df50))
- 后台草稿页重构 ([2ade50b](https://github.com/Mereithhh/van-blog/commit/2ade50b9191a8c8093d7ec9759af2d72e2d2e93d))
- 后台分离导航菜单配置接口 ([9be4cf7](https://github.com/Mereithhh/van-blog/commit/9be4cf7ef5a3b401c0215b011cdf9c6e1e093b74))
- 后台分离捐赠管理接口 ([c95b9d0](https://github.com/Mereithhh/van-blog/commit/c95b9d0b4f7f81914acd159696c642cec7c4c7b9))
- 后台分离联系方式卡片接口 ([2d6870d](https://github.com/Mereithhh/van-blog/commit/2d6870d08267e4a5ead6a94ea0767d649a636846))
- 后台分离站点信息配置 ([db8b915](https://github.com/Mereithhh/van-blog/commit/db8b9150b248af1af172824c6856d9df81d389d7))
- 后台欢迎页接口适配 ([03dc24e](https://github.com/Mereithhh/van-blog/commit/03dc24e39e2179f2c2da935f7e17e2c73c2fc4e5))
- 后台获取分类解耦 initState ([9f79ef9](https://github.com/Mereithhh/van-blog/commit/9f79ef9ade95df4130e47a64ad385a15b4485fad))
- 后台接口完全分离 ([38d8911](https://github.com/Mereithhh/van-blog/commit/38d89115542d572130bee6f029e53d7c87821d86))
- 后台进一步解耦分类获取接口 ([3560d02](https://github.com/Mereithhh/van-blog/commit/3560d02a03e3292eb50d58a5f1f0ae81d27007ca))
- 后台文章页分离为单独的接口,以适应大批量的页面 ([b8eafce](https://github.com/Mereithhh/van-blog/commit/b8eafceee83ceec9851d071fb3381b54d0e95725))
- 后台友情链接分离接口 ([53c931c](https://github.com/Mereithhh/van-blog/commit/53c931c8880f82de700c9f36cfce2017be4ac269))
- 后台重构一部分编辑界面 ([a804088](https://github.com/Mereithhh/van-blog/commit/a8040889c994f776728fa9437d1e339c41c06d32))
- 文章查询应用视图 ([3745833](https://github.com/Mereithhh/van-blog/commit/37458332a344fd02b5e305ade13e10bb37d53ee4))
- 优化查询逻辑&时间段查询 ([eef2394](https://github.com/Mereithhh/van-blog/commit/eef2394177973dcda6a8b1950237064eceb06510))
- 优化查询文章字段范围 ([cefb4f1](https://github.com/Mereithhh/van-blog/commit/cefb4f173d97de48a55fa03bb720cabfdfd23dbf))
- 重构导出接口 ([376224e](https://github.com/Mereithhh/van-blog/commit/376224ef09f912f54d60be0ca5f7d998f6c92f57))
- server 调整 controller 规则 ([a5b8290](https://github.com/Mereithhh/van-blog/commit/a5b8290c268513e189eb5aea6d886b448a3716cf))

### ✨ Features | 新功能

- 编辑界面增加提示语和加载态 ([937c02c](https://github.com/Mereithhh/van-blog/commit/937c02c46fcf3eccc80b5dea3e8460cdf27d1f44))
- 草稿发布增加置顶优先级选项 ([9c11940](https://github.com/Mereithhh/van-blog/commit/9c119409433f89c4212daf4f90f54cc00a4d21f4))
- 调整后台布局&去掉 header ([889028d](https://github.com/Mereithhh/van-blog/commit/889028d28bd43607fef0f46d01543e7dedcccf56))
- 后台站点配置优化创建选项 ([95b5df3](https://github.com/Mereithhh/van-blog/commit/95b5df39413162c4c776cb3eeeb31f357a25d95f))
- 优化后台首页图表样式 ([7f50b05](https://github.com/Mereithhh/van-blog/commit/7f50b05bd4054d12c65580c0454d5be50d7a617b))
- 增加版本展示 ([a7c0ff6](https://github.com/Mereithhh/van-blog/commit/a7c0ff6ac5ac8fbf1e101f37148acdbaff6fef21))
- 增加总字数缓存 ([0857ea1](https://github.com/Mereithhh/van-blog/commit/0857ea1580ead74930a57f1bf669aa85f6169e2a))

### 🐛 Bug Fixes | Bug 修复

- 后台分类获取接口调用问题 ([188d2dd](https://github.com/Mereithhh/van-blog/commit/188d2ddcc713753460525871e7b47040041a55a8))
- 修改版本号文案 ([da6ac06](https://github.com/Mereithhh/van-blog/commit/da6ac06844011195a172d945c96603a811d91229))

### [0.3.6](https://github.com/Mereithhh/van-blog/compare/v0.3.5...v0.3.6) (2022-07-28)

### 🐛 Bug Fixes | Bug 修复

- 根目录误引入依赖 ([1441ded](https://github.com/Mereithhh/van-blog/commit/1441dedfdd930342529b40b1c41c3a28ecd344eb))
- 后台列表样式显示出错 ([5f8caec](https://github.com/Mereithhh/van-blog/commit/5f8caeccfc2cdf43d062854cfb1b9ca5a9a88b15))

### ✨ Features | 新功能

- 后台增加访客与访问量趋势图 ([320c296](https://github.com/Mereithhh/van-blog/commit/320c2967aa8ad05a1b18d8c152d2c402fd8356c4))
- 修改后台侧边栏图标 ([46d4b40](https://github.com/Mereithhh/van-blog/commit/46d4b40502185d0396c7f12818ba322672fbfae0))

### ♻️ Code Refactoring | 代码重构

- 后台草稿页抽离组件 ([b3d7552](https://github.com/Mereithhh/van-blog/commit/b3d7552ef28127cd030ecc911e51d1563d2d424c))
- 后台抽离发布草稿组件 ([3e96652](https://github.com/Mereithhh/van-blog/commit/3e9665217f6788b68d7981b5ab862eee9841ac63))
- 后台代码抽离组件(article) ([49e58ee](https://github.com/Mereithhh/van-blog/commit/49e58eeb5b736960c781b1cbd3188b58656d1ba5))
- 后台修复抽离组件问题 ([1da3656](https://github.com/Mereithhh/van-blog/commit/1da36566808446e1646addaaa3db3dad655bbb35))

### [0.3.5](https://github.com/Mereithhh/van-blog/compare/v0.3.4...v0.3.5) (2022-07-28)

### ✨ Features | 新功能

- 后台精简代码 ([a7f2158](https://github.com/Mereithhh/van-blog/commit/a7f215839ad87cca6092bd22f6717be4a898fe3b))
- 后台优化 editor 布局和样式 ([68f6b67](https://github.com/Mereithhh/van-blog/commit/68f6b67c10114d87d8c4a22f3d25450d583f9bbc))
- 后台增加加载状态 ([9de19c4](https://github.com/Mereithhh/van-blog/commit/9de19c4728495ab6da38a556f703dd8161357ba4))
- 删除后台 i18n 代码，精简一下 ([2b33c27](https://github.com/Mereithhh/van-blog/commit/2b33c270db18e1475f05cae44a7d99964f67acda))

### 🐛 Bug Fixes | Bug 修复

- 修复记录访客逻辑 ([792defa](https://github.com/Mereithhh/van-blog/commit/792defa8c7c8b5d40485a83ea3e1d89fd37de007))

### [0.3.4](https://github.com/Mereithhh/van-blog/compare/v0.3.3...v0.3.4) (2022-07-27)

### ✨ Features | 新功能

- 增加本站运行时间动态计算 ([273b0e8](https://github.com/Mereithhh/van-blog/commit/273b0e87bd97fb8afde2b1010ef609a6c3b5103a))

### 🐛 Bug Fixes | Bug 修复

- 主题切换定时器改为 10s 一次 ([8659611](https://github.com/Mereithhh/van-blog/commit/865961183e6de16aadb5eebb040292ba2b01be25))

### [0.3.3](https://github.com/Mereithhh/van-blog/compare/v0.3.2...v0.3.3) (2022-07-26)

### ✨ Features | 新功能

- 导航栏增加动效 ([9772e39](https://github.com/Mereithhh/van-blog/commit/9772e3922347aa88b2979bd4337f529c43ebf137))
- 文章标题可点击 ([80ffbad](https://github.com/Mereithhh/van-blog/commit/80ffbadb5b101dffc09cee5ca33907b012810a13))

### 🐛 Bug Fixes | Bug 修复

- 后台查看文章路由不对 ([1c046d4](https://github.com/Mereithhh/van-blog/commit/1c046d49ac4a4849fabb7b87406abed2bae79424))
- 文章卡片分类点击效果 ([9b172cf](https://github.com/Mereithhh/van-blog/commit/9b172cf9dfa8960182a9ef5b800d2df66ef401d7))

### [0.3.2](https://github.com/Mereithhh/van-blog/compare/v0.3.1...v0.3.2) (2022-07-24)

### 🐛 Bug Fixes | Bug 修复

- nginx 301 带端口问题 ([131f470](https://github.com/Mereithhh/van-blog/commit/131f470840e3144fef4f05cea7c5b568287f2776))

### 0.3.1 (2022-07-24)

### 🎉 Init | 初始化

- 初始化项目后端 ([cbc1c2d](https://github.com/Mereithhh/van-blog/commit/cbc1c2d7ffb262c57380d9c98078adb50edea2e5))

### 🐛 Bug Fixes | Bug 修复

- a min 修复图片 logo 不显示 ([0e7604f](https://github.com/Mereithhh/van-blog/commit/0e7604f870e06a728834b6c6897e810ce285a2e6))
- markdown 内部不显示项目符号 ([eccf3f1](https://github.com/Mereithhh/van-blog/commit/eccf3f1d862192ce491b3e1afde8403e2d404c43))
- markdown 溢出&toc 样式调整 ([dc4fada](https://github.com/Mereithhh/van-blog/commit/dc4fada5b59b0ff444092bb30f2d8c20c923eaf1))
- toc 增加目录文字 ([914b42b](https://github.com/Mereithhh/van-blog/commit/914b42b2bd4a794e2adc35cdd8a4fd9928a97665))
- website 加速打包 ([c925ac9](https://github.com/Mereithhh/van-blog/commit/c925ac9c3ff84cc43e10d6915ecbeb3b79cad61b))
- 不能正常显示初始化页面 ([3e1d082](https://github.com/Mereithhh/van-blog/commit/3e1d082e7fc344e54038072fc7c2e23d3095a3b6))
- 代码复制按钮错位 ([8bf5f5a](https://github.com/Mereithhh/van-blog/commit/8bf5f5a7936f9f97b0ce00936975368e9bf7b465))
- 侧边导航栏按钮样式 ([696d6d8](https://github.com/Mereithhh/van-blog/commit/696d6d8e947a4d1fcf98b7381c7917ab442e7cbf))
- 修复 type ，顺利启动 ([af70db4](https://github.com/Mereithhh/van-blog/commit/af70db43f0b1c396721ad17bfdbc24ab878cdf09))
- 修复主题切换闪屏 ([4ca5a24](https://github.com/Mereithhh/van-blog/commit/4ca5a243d110b368e22f7f238c92e6ae184a23dc))
- 修复了搜索卡片快捷键滚动条消失的问题 ([1b3a882](https://github.com/Mereithhh/van-blog/commit/1b3a8823fff3bbf64c896232a50b8e62dbb8fd9e))
- 修复可能存在的主题切换定时器问题 ([198f28a](https://github.com/Mereithhh/van-blog/commit/198f28a87bb5153d4efd5e3986d810eee1077ef2))
- 修复打赏二维码样式 ([297aec1](https://github.com/Mereithhh/van-blog/commit/297aec1c7531ef03fb028f4c2ba289713483f52b))
- 修改 google 标签为 Script ([0c30421](https://github.com/Mereithhh/van-blog/commit/0c30421c9c889203013461c470f1d4ffe13376ff))
- 修改日落时间判断 && 修复发布文章报错 ([9010db2](https://github.com/Mereithhh/van-blog/commit/9010db20a07108f0c12c66abc2c881a7caa506b1))
- 公共 API 暴漏信息过多 ([5d3cf17](https://github.com/Mereithhh/van-blog/commit/5d3cf172d07d417d2b903658befe7ec0fd85aba3))
- 初始化表单增加用户名选项&导入报错 ([f3d1a0b](https://github.com/Mereithhh/van-blog/commit/f3d1a0b5021985421eddee857f022e9e26aed3ac))
- 前台改为客户端运行时获取链接 ([5aa333a](https://github.com/Mereithhh/van-blog/commit/5aa333ae23b030e0635d540c6b90c35f93d5ab77))
- 去掉 next/image ([c15f1b5](https://github.com/Mereithhh/van-blog/commit/c15f1b56a22e59b20df7f7f12108b6ce89c01600))
- 反代端口不对 ([6719a42](https://github.com/Mereithhh/van-blog/commit/6719a42ff7cb1683c85918afd2620bbe109b66a4))
- 后台主站链接 ([570bb24](https://github.com/Mereithhh/van-blog/commit/570bb24dcb6c87187f0d389a2d058cabe57fda33))
- 后台编辑器默认分屏，全名 zindex 修复 ([26362bb](https://github.com/Mereithhh/van-blog/commit/26362bb92976399e2c6ddf91a59aebbfbf11c25f))
- 图片允许 domain 问题无法显示图片 ([038d933](https://github.com/Mereithhh/van-blog/commit/038d9330be67ebc7daac8a33106946c0733509f3))
- 增加销毁实例 ([ffbdfa0](https://github.com/Mereithhh/van-blog/commit/ffbdfa096cde8ff4d9ac3bface8d0bd626685fc1))
- 导航栏点击范围过小 ([e827caa](https://github.com/Mereithhh/van-blog/commit/e827caa17cf75b9fc67fbea506e11bc1a9540750))
- 尝试修复主题切换摆平 ([3a5c4b5](https://github.com/Mereithhh/van-blog/commit/3a5c4b5b89e6dda62854224cce1756eac0eefc16))
- 工具站跳转为外部链接 ([e9ddbe6](https://github.com/Mereithhh/van-blog/commit/e9ddbe606fb64266f4c4861e7a52a8511d65c3f1))
- 搜索接口大小写不敏感; ([371bdcf](https://github.com/Mereithhh/van-blog/commit/371bdcf66420b52e723ea06277a81d8c3d76dfab))
- 无障碍优化 & 修复 dayjs 报错 ([e12bb1f](https://github.com/Mereithhh/van-blog/commit/e12bb1fb8fc2a50dd371adfa2bf41f9deb70adcb))
- 有序列表显示异常 ([bc78612](https://github.com/Mereithhh/van-blog/commit/bc78612c38ae85c11637e37084e20ae7fb9fa986))
- 有序列表显示异常 ([98d3e75](https://github.com/Mereithhh/van-blog/commit/98d3e752c145993b789614556c9ac3be431802e7))
- 本地开发不计入统计分析 ([f2a25e8](https://github.com/Mereithhh/van-blog/commit/f2a25e82de832813c937b0f09118666f6506e0b3))
- 极端情况页面展示顺序 ([a93a6a2](https://github.com/Mereithhh/van-blog/commit/a93a6a275f2d69886a35939216b6a29acfafad34))
- 构建时带缓存 ([bfda43e](https://github.com/Mereithhh/van-blog/commit/bfda43e7095148e220a0447f11ae69ed23b11a65))
- 某些卡片被撑大 ([ad4ce5b](https://github.com/Mereithhh/van-blog/commit/ad4ce5b938566741699a41f731eb26b8f8a297d9))
- 某些文章卡片撑大问题 ([39dceb5](https://github.com/Mereithhh/van-blog/commit/39dceb5a77baa95721dca555d441301c6118e6be))
- 登录用户名和密码表单逻辑 ([3ee0f4b](https://github.com/Mereithhh/van-blog/commit/3ee0f4bb283b95201aa55ce3d2c94699a2d3c2a0))
- 移动端打赏显示不出来 ([712103d](https://github.com/Mereithhh/van-blog/commit/712103d70762667c8e9a620c74382ff4bbcd6f69))
- 联系方式二维码新弹窗口 ([a5f85a2](https://github.com/Mereithhh/van-blog/commit/a5f85a20282b9e1f9edae192394ab58ec312c4f9))
- 自动切换主题 ([e6ada0f](https://github.com/Mereithhh/van-blog/commit/e6ada0f9057e21f7b2518fcacbe8d8a0afbd637a))
- 自动切换主题时的图标显示 ([e58825c](https://github.com/Mereithhh/van-blog/commit/e58825cf2455a9938d02ce9fda3dfff92512019a))
- 调整 about 卡片样式 ([f6d0073](https://github.com/Mereithhh/van-blog/commit/f6d00734bfd032b498483a693b3c68c330ba1a76))
- 调整 markdown 样式 ([3ddc6cf](https://github.com/Mereithhh/van-blog/commit/3ddc6cf4765d6e2f1fc5d61eb3530d6c1c6a61f1))
- 调整字体大小 ([560260f](https://github.com/Mereithhh/van-blog/commit/560260f19c09829b5ae30f3781a6ced1013fa703))

### ✨ Features | 新功能

- 前台 api 不用 route 用代理 ([33efe2a](https://github.com/Mereithhh/van-blog/commit/33efe2ad162a9b2b96883c564edde739dbe2f2dc))
- appModule 添加 provider 和 controller，顺利启动 ([47425b5](https://github.com/Mereithhh/van-blog/commit/47425b5a812bcb78a2e183ed942deda0c8ad2ce7))
- hover 状态优化 ([bbcdfa2](https://github.com/Mereithhh/van-blog/commit/bbcdfa2c6ee36182fdedec7759388f3889fdea8a))
- init admin 项目 ([359bf84](https://github.com/Mereithhh/van-blog/commit/359bf8473a424bf7bc8734958742866875a1bb82))
- proxy 容器通过环境变量传入主机名 ([d6118ae](https://github.com/Mereithhh/van-blog/commit/d6118ae1f2d669bda3680f84a7e101f6ead120ce))
- SEO 增加站点描述 ([4889da6](https://github.com/Mereithhh/van-blog/commit/4889da6a81b1e75ef4cafc29e966cd1239f0ec84))
- theme 重构为 context ([8ff1c26](https://github.com/Mereithhh/van-blog/commit/8ff1c26be6d2a8167785acbc7a5a54a206595b62))
- TOC 和作者卡片适配暗色模式 ([ebadd1d](https://github.com/Mereithhh/van-blog/commit/ebadd1dbafa381cc3e021781fc3e38e76a90cdf1))
- waline 地址可配置化 ([2f6d412](https://github.com/Mereithhh/van-blog/commit/2f6d41250425e826606d625bdc18ea05080bc9fc))
- 不切换主题自动根据时间切换 ([0fe3881](https://github.com/Mereithhh/van-blog/commit/0fe3881455fd899776c6bcb10c23ea2c4ea2dead))
- 主题切换按钮样式 ([72a0c8f](https://github.com/Mereithhh/van-blog/commit/72a0c8f999915e7a56d8cf683af855724a81b9f7))
- 主题初始化白屏减少' ([efe289d](https://github.com/Mereithhh/van-blog/commit/efe289d4786782afea6dd6a5767b16406ac95f7b))
- 主题自动切换模式 ([1afb52e](https://github.com/Mereithhh/van-blog/commit/1afb52e1e43f5aa37fde3b892f60682d3d160e23))
- 付款码黑暗模式适配 ([67a89ba](https://github.com/Mereithhh/van-blog/commit/67a89ba5f4124e419efe071315f21e570f822bb4))
- 优化 ga 和百度分析加载 ([7c6fd88](https://github.com/Mereithhh/van-blog/commit/7c6fd88e9ab35ab8f7f9dc08820c291ffe989ead))
- 优化后台管理页面 ([ccc013b](https://github.com/Mereithhh/van-blog/commit/ccc013b318d824b45b2193bd93fd803b32ddcd9c))
- 优化搜索接口&修改优先级 ([b13e8f7](https://github.com/Mereithhh/van-blog/commit/b13e8f742e5b2f33745138694ca8ab0e91937ebd))
- 作者 logo 适配暗色模式 ([a3ac5d5](https://github.com/Mereithhh/van-blog/commit/a3ac5d54fd746243a7d148b2347eb6d61cb87776))
- 侧边栏和站点名称展示 ([555d8af](https://github.com/Mereithhh/van-blog/commit/555d8af9e20cb8728990a96e0c1b53bc3d7a2b09))
- 修复文章排序&修复文章没 Toc 的展示 ([5221d76](https://github.com/Mereithhh/van-blog/commit/5221d769b00cd8d8fa056e068fed28b28bd8ca58))
- 修改初始化 midware ([786959c](https://github.com/Mereithhh/van-blog/commit/786959cc72ff43f0de1e5f9935d4ddc4112e9735))
- 分页器适配黑暗模式 ([98c59b2](https://github.com/Mereithhh/van-blog/commit/98c59b211e498cc96b366863b9432bb58b5a3093))
- 切换回 headroom.js 并完美适配 ([1590d89](https://github.com/Mereithhh/van-blog/commit/1590d89c5e7b7542a9980f8072d406913666f0bc))
- 初步添加 swagger ([a2d6062](https://github.com/Mereithhh/van-blog/commit/a2d6062744d57cd2848685f743a48b09e552f4ab))
- 前台去掉一些报错，文章卡片展示改为最近修改时间 ([9ffa7c4](https://github.com/Mereithhh/van-blog/commit/9ffa7c46c5aea5b2a5c3aac2913709777defdadd))
- 前台增加 ISR 选项 ([02ed98e](https://github.com/Mereithhh/van-blog/commit/02ed98ec6cd402a0ff1c0d7f26061bf0eb6f98c6))
- 前台完善了一些基础组件和样式 ([fa183e7](https://github.com/Mereithhh/van-blog/commit/fa183e741cd9c56f5d8c81288b1e982e84290c4a))
- 前台文章卡片子标题改为 icon ([ab71a72](https://github.com/Mereithhh/van-blog/commit/ab71a72f14061cc5008b8cd30a9285ee427c90bc))
- 前台根据配置渲染导航栏 ([a50def6](https://github.com/Mereithhh/van-blog/commit/a50def6d2328a82b7f46da01bf942a119812319e))
- 前台适配 headroom ([ab3f4b7](https://github.com/Mereithhh/van-blog/commit/ab3f4b79e313ed27058a0a4f0fabd16a7d43332b))
- 前台适配评论框 ([b1dfcdd](https://github.com/Mereithhh/van-blog/commit/b1dfcdd9b9811b1deee725db0647bb633006f551))
- 可以正常登录后台 ([fe207cd](https://github.com/Mereithhh/van-blog/commit/fe207cdbc2f364b4781181e3428d540b34f44c69))
- 可以跑的一版 docker-compose ([0df43ed](https://github.com/Mereithhh/van-blog/commit/0df43ed58f0aa35a6dfc5e565181b2d8bf1159a2))
- 后台完善一部分编辑器 ([0e81d4e](https://github.com/Mereithhh/van-blog/commit/0e81d4ea984c70178ea5766107c3d2080d39df8b))
- 后台完善编辑器相关功能 ([7fb5ab6](https://github.com/Mereithhh/van-blog/commit/7fb5ab6f8c7a136b3580a43923d4d2111b584085))
- 后台捐赠管理 ([9d2c1fe](https://github.com/Mereithhh/van-blog/commit/9d2c1fea1426d26b05bf75bf0a3b06b477e43968))
- 后台管理完善关于页面的编辑修改 ([008e58c](https://github.com/Mereithhh/van-blog/commit/008e58c0601f22b4e47fa08fec88be54cd609861))
- 后台设置可修改密码和用户 ([ec3c7f7](https://github.com/Mereithhh/van-blog/commit/ec3c7f794f2931a9a857679ef532809ea3e82ba1))
- 因为图片未知大小，所以 markdown 内用原生的 img 标签，并增加延迟加载 ([034c3ba](https://github.com/Mereithhh/van-blog/commit/034c3ba8753eb6f9d89d173b7b62809d54b0c3d2))
- 图标颜色统一 ([dd48286](https://github.com/Mereithhh/van-blog/commit/dd482860babc75328bb23ab2f19cb748961b4194))
- 图片延迟加载 ([b6ac00c](https://github.com/Mereithhh/van-blog/commit/b6ac00c67fb32d453ff76b34f78fe33234d5a20d))
- 基本完善时间线 ([ec729c6](https://github.com/Mereithhh/van-blog/commit/ec729c6fe5c5cc0f2af5d3f4f89c9619083a525e))
- 基本完善首页 ([3a454b2](https://github.com/Mereithhh/van-blog/commit/3a454b22a9a3750a048fb2ab5b3e63864f11e5e9))
- 基本样式（导航栏和末尾) ([8d921d3](https://github.com/Mereithhh/van-blog/commit/8d921d31f66f5c0151cc38f2081f0db7369a9130))
- 增加 favicon 修改功能 ([15b0e8d](https://github.com/Mereithhh/van-blog/commit/15b0e8d14e60df2695611af772f64edacb8a646b))
- 增加 markdown 组件 ([58c61a0](https://github.com/Mereithhh/van-blog/commit/58c61a04b30837811dff83c35ce733ee2b96ff5b))
- 增加 poweredBy ，调整 footer 顺序 ([1d75ad0](https://github.com/Mereithhh/van-blog/commit/1d75ad0ebe09f0107b204879b8cfa20f241bc4d4))
- 增加 sdk ([ce5786b](https://github.com/Mereithhh/van-blog/commit/ce5786be8e17b9f7cf765585ab85e34f64e750d3))
- 增加 users 和初始化模块/接口 ([7f6f882](https://github.com/Mereithhh/van-blog/commit/7f6f882a5ce21bd8e507113efe83823dcecc50b5))
- 增加 robot.txt&整理代码 ([32dddb3](https://github.com/Mereithhh/van-blog/commit/32dddb32e5fbe4da6f6bff17e5c36caa008964b0))
- 增加 server dockerfile ([b995768](https://github.com/Mereithhh/van-blog/commit/b9957687700d331eb6373f852bc1529c1a1b44d8))
- 增加 server 和 admin 的 dockerfile ([f62d745](https://github.com/Mereithhh/van-blog/commit/f62d745984eb6e4e359560170ad8c4f1445958a9))
- 增加一些运行时的环境变量配置' ([6a6a22a](https://github.com/Mereithhh/van-blog/commit/6a6a22ac33fbba6ecd42e1359b6fcf2f8fc61c13))
- 增加不启用评论系统的选择 ([a2b7407](https://github.com/Mereithhh/van-blog/commit/a2b74072338cb8823a977defb8d8cc135f078fad))
- 增加了一部分 dto 和 schemes ([1edaf0f](https://github.com/Mereithhh/van-blog/commit/1edaf0f013009a267899959cc233f98aeafa8e0b))
- 增加初始化管道&未初始化自动重定向至 /admin/init ([69c8e30](https://github.com/Mereithhh/van-blog/commit/69c8e30655c2ab35d2e6e721474e04fa558b3e0d))
- 增加前端页面 ([ffd3dea](https://github.com/Mereithhh/van-blog/commit/ffd3deac90634b4009f432520a21de8f2b11c3e0))
- 增加导航栏接口 ([0a30832](https://github.com/Mereithhh/van-blog/commit/0a308329b8bd995f3143fe1fb10551144e66f479))
- 增加快捷键图标 ([faa2553](https://github.com/Mereithhh/van-blog/commit/faa25534fc815fd94ae772c0992af4a67efd4a5b))
- 增加数学公式支持 ([c76f562](https://github.com/Mereithhh/van-blog/commit/c76f56238f51bc803c1210df32a585d5158b763f))
- 增加百度与 GA 分析选项 ([f156475](https://github.com/Mereithhh/van-blog/commit/f156475904a6ede0133c48e3a4e5563fedc234a5))
- 增加管理的 all 接口 ([fedcb64](https://github.com/Mereithhh/van-blog/commit/fedcb6464e1339dd6e96bd205492ec938bc8a944))
- 增加置顶选项 ([63ccfcf](https://github.com/Mereithhh/van-blog/commit/63ccfcf640c7b8f987e92a1809dd67872a1e7b6d))
- 增加获取访客数的接口 ([bd97905](https://github.com/Mereithhh/van-blog/commit/bd9790553440251cffeccbdf4083b1c3b9bc9612))
- 增加访客和访问数统计 logo ([3545839](https://github.com/Mereithhh/van-blog/commit/3545839f91588e12148ac96a393657a19bcfd302))
- 增加返回顶部按钮 ([79f4105](https://github.com/Mereithhh/van-blog/commit/79f410541fe7978ff48bd24789d23d817043d39e))
- 增加配置文件 ([101e43a](https://github.com/Mereithhh/van-blog/commit/101e43aa77b1b4e0b6dfcd980c815091f736cb9c))
- 增加黑暗模式相关的一些配置项 ([5921d04](https://github.com/Mereithhh/van-blog/commit/5921d04c22166a5e1db41a40a712ff0ece6c3230))
- 复制弹窗适配暗色模式 ([f0cdeb5](https://github.com/Mereithhh/van-blog/commit/f0cdeb552c5789e5d1d04c4eed9724cb293864eb))
- 完善 markdown 主题 ([32adb62](https://github.com/Mereithhh/van-blog/commit/32adb62b2e0dec5b1a7d7b2a72f463d7ee8672b0))
- 完善一部分前端框架 ([8b7927e](https://github.com/Mereithhh/van-blog/commit/8b7927e424d991547b6a0e059cc394b44d227a81))
- 完善上下页切换 ([c8af7ba](https://github.com/Mereithhh/van-blog/commit/c8af7bacd888cbb22eedb2fc6568701bfb85b702))
- 完善代码高亮" ([c6f70f6](https://github.com/Mereithhh/van-blog/commit/c6f70f65582ea1951e184ee330f1fe4ae2ae5d82))
- 完善初始化相关逻辑，可顺利初始化 ([6a7ddfe](https://github.com/Mereithhh/van-blog/commit/6a7ddfebe2c4ecd601b25dffe10ebc0611fdca76))
- 完善后台品牌化替换 ([b95ea79](https://github.com/Mereithhh/van-blog/commit/b95ea79300950f67d05df1ccae4e47d30517818e))
- 完善导入功能 ([690dca7](https://github.com/Mereithhh/van-blog/commit/690dca7f0d903295d57a30132d1b30547c90d378))
- 完善导出功能，增加导入接口 ([3e36110](https://github.com/Mereithhh/van-blog/commit/3e36110229440bf09186717a5399da181479afc6))
- 完善报错 ([d93bc07](https://github.com/Mereithhh/van-blog/commit/d93bc07e14d2af31e50e37b204b94196d5ac9e4b))
- 完善捐赠逻辑 ([a931627](https://github.com/Mereithhh/van-blog/commit/a931627c24f884a44254a03276583c0e43bba66c))
- 完善搜索卡片 ([5afcf91](https://github.com/Mereithhh/van-blog/commit/5afcf91cf3de213a616cbc387ca3f5ae85bfc1f5))
- 完善搜索卡片状态管理 ([bd2a2ff](https://github.com/Mereithhh/van-blog/commit/bd2a2ffc0e45714dc9b1c99ca69f86906d590129))
- 完善文章页和 TOC ([07c5896](https://github.com/Mereithhh/van-blog/commit/07c589606d026af594b7b7e5378a756b6ddc9793))
- 完善登录和 jwt 认证模块 & 增加守卫 & 验证初始化 ([4ac32f1](https://github.com/Mereithhh/van-blog/commit/4ac32f185f450dc7a71d31396030cc4302a800a5))
- 完善登录登出逻辑 ([e79366d](https://github.com/Mereithhh/van-blog/commit/e79366d8d8ca8ef244359bbd9bb344b6d4db865a))
- 完善编排 ([f6ee1e3](https://github.com/Mereithhh/van-blog/commit/f6ee1e3d162a2b2bd70931512c656abb6c7dba62))
- 完善部分联系方式卡片 ([200a986](https://github.com/Mereithhh/van-blog/commit/200a98602403d812f0efe8db1bd2b3d3a77ca16d))
- 完善预览卡片 ([c2b368c](https://github.com/Mereithhh/van-blog/commit/c2b368c5168129eb1ac06c756ea2acf1b8aedaf2))
- 完善首页页面列表 ([e450e92](https://github.com/Mereithhh/van-blog/commit/e450e9219ea27f1b485c65b31613291124c4720b))
- 完成一部分 controller ([69b8ad8](https://github.com/Mereithhh/van-blog/commit/69b8ad85cec7881ec95d01a7f2e006a4310faa29))
- 导航栏 hover 区域增大 ([7f9d2ed](https://github.com/Mereithhh/van-blog/commit/7f9d2ed551d825ede2d73531f34f266bdc7d45b7))
- 小尺寸搜索框样式 ([1b67d7b](https://github.com/Mereithhh/van-blog/commit/1b67d7bc1304c0f9e15f4c59bf17ed5ab02370ad))
- 小尺寸样式优化 ([e204ef9](https://github.com/Mereithhh/van-blog/commit/e204ef972751beaf7087cd06d41764ad7d28402d))
- 开发了一部分最近评论 ([7b32982](https://github.com/Mereithhh/van-blog/commit/7b32982fbf8e75613bfb164a6d59995be710c7d3))
- 微信二维码暗色模式&优化主题切换逻辑 ([20e3c30](https://github.com/Mereithhh/van-blog/commit/20e3c30562dbc8815aeb822ae2a0103b0e889295))
- 快捷键关闭搜索框 ([ff76407](https://github.com/Mereithhh/van-blog/commit/ff7640715c4b3383dafe28f98358effe0e96116d))
- 快速搜索快捷键 ([3aaafc4](https://github.com/Mereithhh/van-blog/commit/3aaafc4283b381217cca7bb63f01e07dc3af3f2f))
- 总览标签页 ([edf6543](https://github.com/Mereithhh/van-blog/commit/edf6543ce51fdeefec4e012e34fb6a7e3a44ba0e))
- 抽取评论组件&去掉没用的引用 ([e0ed165](https://github.com/Mereithhh/van-blog/commit/e0ed1657120208097b27e134ac1c231a3072f351))
- 搜索框适配暗色模式 ([d8fb9cd](https://github.com/Mereithhh/van-blog/commit/d8fb9cdf1db947d74ca33f1db02a03d06e92dbfc))
- 整理目录结构，去除未引用的代码 ([4b315e6](https://github.com/Mereithhh/van-blog/commit/4b315e61880d7614749ebd7a02bb73ce17d1e292))
- 文章管理:标题搜索和删除" ([39dbb09](https://github.com/Mereithhh/van-blog/commit/39dbb09ff107f9c3f6ff90ce232509f6e84d78c4))
- 文章管理适配了列表页和新建文章 ([3a3ce69](https://github.com/Mereithhh/van-blog/commit/3a3ce697d9fe784efd3aab6b2331ecaf5d73b0dd))
- 文章页全面适配黑暗模式 ([2660b2c](https://github.com/Mereithhh/van-blog/commit/2660b2c68a6f06fd9e1f90d9855836d30b6d4c24))
- 时间线溢出格式 ([94ae4f0](https://github.com/Mereithhh/van-blog/commit/94ae4f093ae2a25bb9d459d0131c266aa456a032))
- 暗色模式调整正文颜色&阅读全文按钮 ([95ac333](https://github.com/Mereithhh/van-blog/commit/95ac333d74251a84e0232d3d2ed659a3f1c90ab1))
- 更新 all in one 编排 ([b46b7cb](https://github.com/Mereithhh/van-blog/commit/b46b7cbc1e31aec59f8320ccc967929730a0975e))
- 标题顶置功能 ([eeda38b](https://github.com/Mereithhh/van-blog/commit/eeda38b7c5e48a6d462f7d42ab9465a1b7ed93ec))
- 注释没用的 console.log ([fd4282f](https://github.com/Mereithhh/van-blog/commit/fd4282f909ae1be09df5328173430228d3a82a9d))
- 现有的图片采用 next/future/image 优化 ([6a8b400](https://github.com/Mereithhh/van-blog/commit/6a8b400effc3257b0ac8063907d24d0a02231c7a))
- 用 context 实现了主题切换 logo 跟随 ([a2ee508](https://github.com/Mereithhh/van-blog/commit/a2ee508d33ad54e76aeb32e70e1961d9df416348))
- 略微修改黑暗模式配色 ([c7cb809](https://github.com/Mereithhh/van-blog/commit/c7cb8098ec7d038ac578b75068224f9e22b4fd2a))
- 目录超长的溢出展示& 跟随滚动 ([e7efcfe](https://github.com/Mereithhh/van-blog/commit/e7efcfe830f485d54689825ce5c16b64ec08c86a))
- 移动端滑动菜单框架 ([05b9062](https://github.com/Mereithhh/van-blog/commit/05b9062a3de978defb91e33e16d5b41612b73903))
- 移动端点完导航收回去 ([96668c0](https://github.com/Mereithhh/van-blog/commit/96668c09a589145ba4c319d72954e49820c1c65a))
- 管理后台友情链接&联系方式 ([ac7fc6e](https://github.com/Mereithhh/van-blog/commit/ac7fc6e18d97ecabb3c83b53ade383f84d441f9b))
- 管理后台完善分类相关逻辑和站点配置 ([054dd3f](https://github.com/Mereithhh/van-blog/commit/054dd3fe37ec79644e68d269a1a8767b496b2042))
- 管理后台完善草稿相关逻辑 ([0e342dc](https://github.com/Mereithhh/van-blog/commit/0e342dc9edaeca37333999b31870053e81829bfb))
- 管理后台时间筛选和分类获取 ([4748770](https://github.com/Mereithhh/van-blog/commit/4748770d112ee616ca59323fd9e6b535d39a394a))
- 管理后台标签搜索 ([9ce8d67](https://github.com/Mereithhh/van-blog/commit/9ce8d67d044bd7cdef6ebd6008fe34e779c862ff))
- 管理后台标签的创建筛选和搜索 ([bea9f73](https://github.com/Mereithhh/van-blog/commit/bea9f7374208122ae32dfa30e1393814121a6928))
- 管理后台设置面板保存 tab ([df41a48](https://github.com/Mereithhh/van-blog/commit/df41a48596f789452b16e35bcee58e638586ea2f))
- 管理后台适配导航配置接口 ([20b2b1a](https://github.com/Mereithhh/van-blog/commit/20b2b1ab0b8e29f94538de7cad18ad1abd4bc9a3))
- 网站 logo 黑暗模式切换 ([3d8289b](https://github.com/Mereithhh/van-blog/commit/3d8289b0b4bf9de20aa17e5a20296d1aca462e5a))
- 联系方式二维码弹窗 ([4b7647e](https://github.com/Mereithhh/van-blog/commit/4b7647eb060b1892035cfc95e08bc48b8c6592fc))
- 自己实现了访问量统计 ([7e6194a](https://github.com/Mereithhh/van-blog/commit/7e6194a6393dc9fb8d7c1c4d3519dbb9b00353b9))
- 补全一些 provider ([068ea53](https://github.com/Mereithhh/van-blog/commit/068ea53762081e40dcd65a9d29cdf46ce7dc92cd))
- 补全接口和 provider ([16e3e3a](https://github.com/Mereithhh/van-blog/commit/16e3e3af3521f30f957489aa49566fe3a2287b71))
- 规范返回格式 ([9b63666](https://github.com/Mereithhh/van-blog/commit/9b63666e44434c334e7eaf3a4e782f3b255733c8))
- 访客数接口实现 ([a034e67](https://github.com/Mereithhh/van-blog/commit/a034e67c46dba2c10c676ddc36178acc17951292))
- 评论区表情搜索暗色 ([de87e6e](https://github.com/Mereithhh/van-blog/commit/de87e6ea9bfd1f52225db22df0d2105faea27f04))
- 调整字体大小 ([1e017ff](https://github.com/Mereithhh/van-blog/commit/1e017ff303d4374b57089f894d973c8a3f8f0d89))
- 调试增量渲染配置 ([cad86b1](https://github.com/Mereithhh/van-blog/commit/cad86b14a5e14b080f26dfb56ca1256e7fdecd03))
- 适配了一部分黑暗主题 ([33c6b93](https://github.com/Mereithhh/van-blog/commit/33c6b9329f15f8c93f2c3190e112f09544ceed2c))
- 适配百度分析 ([d2627f1](https://github.com/Mereithhh/van-blog/commit/d2627f172399275f11edde201e3e5ad98d9e78d8))
- 适配移动端导航栏相关 ([abdced0](https://github.com/Mereithhh/van-blog/commit/abdced08fc5afe6eccf2969f987479ee4a02ab15))
- 集成谷歌分析 ([ab6999d](https://github.com/Mereithhh/van-blog/commit/ab6999d9a2c8cc855c3be0b1011a528582834688))
- 页面内增加项目主页 ([30c34f2](https://github.com/Mereithhh/van-blog/commit/30c34f25e2c3ba2abae8dc8218886bddbbda7acc))

### 🚀 Chore | 构建/工程依赖/工具

- **release:** 0.1.1 ([28b7973](https://github.com/Mereithhh/van-blog/commit/28b7973ccf2f9841656f6ec363a5be7a00f809c0))
- **release:** 0.1.1 ([e86da48](https://github.com/Mereithhh/van-blog/commit/e86da488e1b0ced05382b5282812de36659f52b2))
- **release:** 0.3.1 ([d73b82f](https://github.com/Mereithhh/van-blog/commit/d73b82f469d4300dd7cd7b1c7dc6fda9adc95152))
- **release:** 0.3.1 ([ff3989c](https://github.com/Mereithhh/van-blog/commit/ff3989c32b5ad4f3ea3bea5f7573fbfaaf630e5c))

### 👷 Continuous Integration | CI 配置

- fix ([4fb4051](https://github.com/Mereithhh/van-blog/commit/4fb4051cdeaf9751279dc8f2563df7ebfa718994))
- fix ([8ac8923](https://github.com/Mereithhh/van-blog/commit/8ac89230d111ade8a49b01ceb604549644f264a3))
- revert ([5f30659](https://github.com/Mereithhh/van-blog/commit/5f3065955fc49362b0b4bd9798b3d898224d51f5))
- revert version ([7ab137f](https://github.com/Mereithhh/van-blog/commit/7ab137f249a1428e0226406c56504584347a0320))
- update ([a994df9](https://github.com/Mereithhh/van-blog/commit/a994df94713640da9049852bbe525315c5d7efdb))
- update ([00a24e8](https://github.com/Mereithhh/van-blog/commit/00a24e869c0b143df5a27a68f80b8c6ec242ef26))
- update ([6a86f98](https://github.com/Mereithhh/van-blog/commit/6a86f98bbbc4e1376edbb6e6d38632fa43d4bd0c))
- update ([3b1c447](https://github.com/Mereithhh/van-blog/commit/3b1c44791ff6b87794f6d6611742a6261e824e1e))
- update ([c672969](https://github.com/Mereithhh/van-blog/commit/c6729690fe2a5b880602310de6b372edc43e0b7f))
- 修改自用镜像 ([e5d7d1b](https://github.com/Mereithhh/van-blog/commit/e5d7d1b09d63ff43e76816fae0063f07849e1a78))
- 启动 ci ([58102ae](https://github.com/Mereithhh/van-blog/commit/58102ae06c9bf5cb554f1a9452c788c62cf74727))
- 回退版本测试 ([fd0ed23](https://github.com/Mereithhh/van-blog/commit/fd0ed23f104f1462fd1c31ea786a86b890296f35))
- 增加 .yarnrc.yml ([9c1b8e7](https://github.com/Mereithhh/van-blog/commit/9c1b8e7ab8890666e6a72a67a367d1b11c3a5c3e))
- 增加 all in one Dockerfile ([b0179f5](https://github.com/Mereithhh/van-blog/commit/b0179f5cac0a2e8e52d2717b536dae94038e13d3))
- 增加 release ([10862ad](https://github.com/Mereithhh/van-blog/commit/10862ad9f4f6da0daa21c8779210e4637aab12bf))
- 完善 all in one 镜像 ([af10133](https://github.com/Mereithhh/van-blog/commit/af1013346b7b4df31ac66bbe12610ba36b615b89))
- 完善文档部署 ci ([fa3f9e3](https://github.com/Mereithhh/van-blog/commit/fa3f9e31e5d7b900815887b63954e90b58c5d23b))
- 提交 lock 文件 ([bdbb674](https://github.com/Mereithhh/van-blog/commit/bdbb674853a11c43467366a8bf05a765e1efa146))
- 更改超时时间 ([f3ade54](https://github.com/Mereithhh/van-blog/commit/f3ade547fa2028bba58484e2785a452194491a0a))
- 更新 ci ([85fbeea](https://github.com/Mereithhh/van-blog/commit/85fbeea8cbf6df0d236605290735036203c8d6a2))
- 更新发布功能 ([858a1c2](https://github.com/Mereithhh/van-blog/commit/858a1c2dbcdd0f966c11f42a8db1bc99503aad3e))
- 更新文档 dockerfile ([97ec516](https://github.com/Mereithhh/van-blog/commit/97ec51653c4f7edc5061b81c1a0445202d1639c7))
- 更新构建配置 ([c42e998](https://github.com/Mereithhh/van-blog/commit/c42e9989e9df230ce345936cf1f8c14a28e74a51))
- 更新超时时间 ([d3f1e6a](https://github.com/Mereithhh/van-blog/commit/d3f1e6a935b5d686735992f880f6473f0df296bf))
- 更新部署文档的 actions ([403bbf3](https://github.com/Mereithhh/van-blog/commit/403bbf399744d86a35a1a0fc4c3ad5d8f692d1e9))
- 更新默认后端参数 ([662bd09](https://github.com/Mereithhh/van-blog/commit/662bd097918c8d6d1a0e8fd4896f105c04d56601))
- 设置淘宝源 ([d886eca](https://github.com/Mereithhh/van-blog/commit/d886ecad767d0312ef8715d9b9270603ee913f39))
- 调试 ci ([9fdf423](https://github.com/Mereithhh/van-blog/commit/9fdf42337a37df994ed130aa19c133dcaa5a100f))
- 调试 ci ([dec4bb8](https://github.com/Mereithhh/van-blog/commit/dec4bb8180f868aba3f0df76dcca7d0aa6202c35))
- 调试 ci ([c4c5dec](https://github.com/Mereithhh/van-blog/commit/c4c5dec54aa5ae3e53824da76c684350087bc883))
- 验证更新文档脚本 ([34096b3](https://github.com/Mereithhh/van-blog/commit/34096b3523d9bcf5f06d7ba9c6a84c37b430f0bb))
