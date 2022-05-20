import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/index';

@Module({
  imports: [MongooseModule.forRoot(config.mongoUrl)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
