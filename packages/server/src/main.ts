import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MetaProvider } from './provider/meta/meta.provider';
// import { ArticleProvider } from './provider/article/article.provider';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config as globalConfig } from './config/index';
import { checkOrCreate } from './utils/checkFolder';
import * as path from 'path';
import { activeISR } from './utils/activeISR';
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

  const config = new DocumentBuilder()
    .setTitle('VanBlog API Reference')
    .setDescription('The VanBlog API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);
  console.log('应用已启动，端口: 3000');
  console.log('API 端点地址: http://localhost:3000/api');
  console.log('swagger 地址: http://localhost:3000/swagger');
  const metaProvider = app.get(MetaProvider);
  await metaProvider.updateTotalWords();

  // 触发增量渲染生成静态页面，防止升级后内容为空
  console.log('INFO', '首次启动会尝试触发两次增量渲染！');
  await activeISR();

  setTimeout(() => {
    activeISR();
  }, 5000);
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
