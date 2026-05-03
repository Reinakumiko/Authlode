import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { LogtoModule } from '../logto/logto.module';

@Module({
  imports: [LogtoModule],
  controllers: [RolesController],
})
export class RolesModule {}
