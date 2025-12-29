import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LogtoService } from './logto.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [LogtoService],
  exports: [LogtoService],
})
export class LogtoModule {}
