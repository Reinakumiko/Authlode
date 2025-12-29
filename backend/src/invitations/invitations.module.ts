import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationRepository } from './repositories/invitation.repository';

@Module({
  providers: [InvitationsService, InvitationRepository],
  exports: [InvitationsService, InvitationRepository],
})
export class InvitationsModule {}
