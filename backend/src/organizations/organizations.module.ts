import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { LogtoModule } from '../logto/logto.module';

@Module({
  imports: [LogtoModule],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
