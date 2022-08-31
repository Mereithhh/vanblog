import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MetaProvider } from './provider/meta/meta.provider';
// import { ArticleProvider } from './provider/article/article.provider';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config as globalConfig } from './config/index';
import { checkOrCreate } from './utils/checkFolder';
import * as path from 'path';
import { ISRProvider } from './provider/isr/isr.provider';
import { WalineProvider } from './provider/waline/waline.provider';
import { InitProvider } from './provider/init/init.provider';
// import { LogProvider } from './provider/log/log.provider';
// import { EventType } from './provider/log/types';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(globalConfig.staticPath, {
    prefix: '/static/',
  });
  // 查看文件夹是否存在 并创建.
  checkOrCreate(globalConfig.staticPath);
  checkOrCreate(path.join(globalConfig.staticPath, 'img'));
  checkOrCreate(path.join(globalConfig.staticPath, 'tmp'));
  checkOrCreate(path.join(globalConfig.staticPath, 'export'));

  const config = new DocumentBuilder()
    .setTitle('VanBlog API Reference')
    .setDescription('The VanBlog API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);

  const initProvider = app.get(InitProvider);
  if (await initProvider.checkHasInited()) {
    const metaProvider = app.get(MetaProvider);
    metaProvider.updateTotalWords('首次启动');
    const walineProvider = app.get(WalineProvider);
    walineProvider.init();
    // 触发增量渲染生成静态页面，防止升级后内容为空
    const isrProvider = app.get(ISRProvider);
    isrProvider.activeAll();
  }
  setTimeout(() => {
    console.log('应用已启动，端口: 3000');
    console.log('API 端点地址: http://<domain>/api');
    console.log('swagger 地址: http://<domain>/swagger');
    console.log('项目主页: https://vanblog.mereith.com');
    console.log('开源地址: https://github.mereith/mereithhh/van-blog');
  }, 3000);
  // 测试用的
  // const logProvider = app.get(LogProvider);
  // logProvider.searchLog(1, 1, EventType.LOGIN);
  // const articleProvider = app.get(ArticleProvider);
  // await articleProvider.washViewerInfoToVisitProvider();
  // console.log('done');
  // const res = await articleProvider.getAllImageLinks();
  // console.log(res);
}
bootstrap();
