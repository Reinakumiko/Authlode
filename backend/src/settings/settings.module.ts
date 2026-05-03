import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [SettingsController],
})
export class SettingsModule {}
