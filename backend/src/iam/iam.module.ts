import { Global, Module } from '@nestjs/common';
import { IAM_PROVIDER } from './interfaces';
import { IamConfigService } from './iam.config';
import { LogtoAdapterModule } from './logto-adapter/logto-adapter.module';
import { LogtoAdapter } from './logto-adapter/logto.adapter';

/**
 * IAM 模块 — 按 IAM_PROVIDER 配置装配 Provider
 *
 * 当前唯一实现：LogtoAdapter（第一实现平台）。
 * 新增 IAM 平台 = 新增 adapter 目录 + 在此注册分支，业务代码零改动。
 */
@Global()
@Module({
  imports: [LogtoAdapterModule],
  providers: [
    IamConfigService,
    {
      provide: IAM_PROVIDER,
      useFactory: (configService: IamConfigService, logtoAdapter: LogtoAdapter) => {
        const provider = configService.getConfig().provider;
        if (provider !== 'logto') {
          throw new Error(
            `[IamModule] IAM_PROVIDER="${provider}" 尚无实现（当前支持: logto）`,
          );
        }
        return logtoAdapter;
      },
      inject: [IamConfigService, LogtoAdapter],
    },
  ],
  exports: [IAM_PROVIDER, IamConfigService],
})
export class IamModule {}
