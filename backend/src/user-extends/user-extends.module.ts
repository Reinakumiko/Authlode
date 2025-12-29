import { Module } from '@nestjs/common';
import { UserExtendsService } from './user-extends.service';
import { UserExtendRepository } from './repositories/user-extend.repository';

@Module({
  providers: [UserExtendsService, UserExtendRepository],
  exports: [UserExtendsService, UserExtendRepository],
})
export class UserExtendsModule {}
