import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { LogtoModule } from '../logto/logto.module';

@Module({
  imports: [LogtoModule],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
