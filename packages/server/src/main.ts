import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MetaProvider } from './provider/meta/meta.provider';
import { ArticleProvider } from './provider/article/article.provider';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  // 测试用的
  // const articleProvider = app.get(ArticleProvider);
  // await articleProvider.washViewerInfoByVisitProvider();
}
bootstrap();
