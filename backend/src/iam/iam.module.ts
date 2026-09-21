import { Global, Module } from '@nestjs/common';
import { IAM_PROVIDER } from './interfaces';
import { IamConfigService } from './iam.config';
import { LogtoAdapterModule } from './logto-adapter/logto-adapter.module';
import { LogtoAdapter } from './logto-adapter/logto.adapter';
import { MemoryAdapterModule } from './memory-adapter/memory-adapter.module';
import { MemoryAdapter } from './memory-adapter/memory.adapter';

/**
 * IAM 模块 — 按 IAM_PROVIDER 配置装配 Provider
 *
 * - memory（默认）：内置引擎，零外部依赖，SQLite 存用户
 * - logto：LogtoAdapter，对接 Logto Management API
 *
 * 新增 IAM 平台 = 新增 adapter 目录 + 在此注册分支，业务代码零改动。
 */
@Global()
@Module({
  imports: [LogtoAdapterModule, MemoryAdapterModule],
  providers: [
    IamConfigService,
    {
      provide: IAM_PROVIDER,
      useFactory: (configService: IamConfigService, logtoAdapter: LogtoAdapter, memoryAdapter: MemoryAdapter) => {
        const provider = configService.getConfig().provider;
        switch (provider) {
          case 'memory':
            return memoryAdapter;
          case 'logto':
            return logtoAdapter;
          default:
            throw new Error(
              `[IamModule] IAM_PROVIDER="${provider}" 尚无实现（当前支持: memory, logto）`,
            );
        }
      },
      inject: [IamConfigService, LogtoAdapter, MemoryAdapter],
    },
  ],
  exports: [IAM_PROVIDER, IamConfigService],
})
export class IamModule {}
