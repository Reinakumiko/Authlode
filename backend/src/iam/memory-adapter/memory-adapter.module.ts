import { Global, Module } from '@nestjs/common';
import { MemoryAdapter } from './memory.adapter';

@Global()
@Module({
  providers: [MemoryAdapter],
  exports: [MemoryAdapter],
})
export class MemoryAdapterModule {}
