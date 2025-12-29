import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogtoModule } from './logto/logto.module';

@Module({
  imports: [LogtoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
