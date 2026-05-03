import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { LogtoModule } from '../logto/logto.module';

@Module({
  imports: [LogtoModule],
  controllers: [UsersController],
})
export class UsersModule {}
