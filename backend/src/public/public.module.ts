import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [InvitationsModule],
  controllers: [PublicController],
})
export class PublicModule {}
