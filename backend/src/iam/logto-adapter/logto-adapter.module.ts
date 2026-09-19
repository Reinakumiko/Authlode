import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IamConfigService } from '../iam.config';
import { LogtoTokenManager } from './logto-token.manager';
import { LogtoAdapter } from './logto.adapter';

/**
 * Logto Adapter 模块 — Global（TokenManager/Adapter 被业务模块广泛消费）
 */
@Global()
@Module({
  imports: [HttpModule],
  providers: [IamConfigService, LogtoTokenManager, LogtoAdapter],
  exports: [LogtoAdapter, LogtoTokenManager, IamConfigService],
})
export class LogtoAdapterModule {}
