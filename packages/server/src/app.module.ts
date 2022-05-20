import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/index';
import { Article, ArticleSchema } from './scheme/article.schema';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
