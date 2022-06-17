import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/index';
import { Article, ArticleSchema } from './scheme/article.schema';
import { Draft, DraftSchema } from './scheme/draft.schema';
import { Meta, MetaSchema } from './scheme/meta.schema';
import { AritcleProvider } from './provider/article/article.provider';
import { CategoryProvider } from './provider/category/category.provider';
import { DraftProvider } from './provider/draft/draft.provider';
import { MetaProvider } from './provider/meta/meta.provider';
import { TagProvider } from './provider/tag/tag.provider';
import { PublicController } from './controller/public/public.controller';
import { AboutMetaController } from './controller/admin/about/about.meta.controller';
import { LinkMetaController } from './controller/admin/link/link.meta.controller';
import { RewardMetaController } from './controller/admin/reward/reward.meta.controller';
import { SiteMetaController } from './controller/admin/site/site.meta.controller';
import { SocialMetaController } from './controller/admin/social/social.meta.controller';
import { TagController } from './controller/admin/tag/tag.controller';
import { ArticleController } from './controller/admin/article/article.controller';
import { DraftController } from './controller/admin/draft/draft.controller';
import { CategoryController } from './controller/admin/category/category.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controller/admin/auth/auth.controller';
import { UserProvider } from './provider/user/user.provider';
import { AuthProvider } from './provider/auth/auth.provider';
import { User, UserSchema } from './scheme/user.schema';
import { LocalStrategy } from './provider/auth/local.strategy';
import { JwtStrategy } from './provider/auth/jwt.strategy';
import { InitController } from './controller/admin/init/init.controller';
import { InitProvider } from './provider/init/init.provider';
import { InitMiddleware } from './provider/auth/init.middleware';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl),
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: Draft.name, schema: DraftSchema },
      { name: Meta.name, schema: MetaSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: {
        expiresIn: 3600 * 24 * 7,
      },
    }),
  ],
  controllers: [
    AppController,
    PublicController,
    AboutMetaController,
    LinkMetaController,
    RewardMetaController,
    SiteMetaController,
    SocialMetaController,
    TagController,
    ArticleController,
    DraftController,
    CategoryController,
    AuthController,
    InitController,
  ],
  providers: [
    AppService,
    AritcleProvider,
    CategoryProvider,
    DraftProvider,
    MetaProvider,
    TagProvider,
    UserProvider,
    AuthProvider,
    LocalStrategy,
    JwtStrategy,
    InitProvider,
    InitMiddleware,
  ],
})
export class AppModule {}
