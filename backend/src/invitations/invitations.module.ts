import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationRepository } from './repositories/invitation.repository';
import { InvitationsController } from './invitations.controller';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationRepository],
  exports: [InvitationsService, InvitationRepository],
})
export class InvitationsModule {}
