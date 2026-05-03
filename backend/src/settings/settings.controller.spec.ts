import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { ConfigService } from '../config/config.service';

describe('SettingsController', () => {
  let controller: SettingsController;

  const mockConfigService = {
    app: {
      name: 'Logto User Center',
      port: 3001,
      nodeEnv: 'development',
      frontendUrl: 'http://localhost:3000',
    },
    logto: {
      apiEndpoint: 'https://logto.example.com/api',
      apiKey: 'secret-key',
      appId: 'app-123',
      appSecret: 'app-secret',
      endpoint: 'https://logto.example.com',
    },
    database: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      name: 'authlode',
      username: 'admin',
      password: 'password',
    },
    isRedisEnabled: true,
    redis: {
      host: 'localhost',
      port: 6379,
      db: 0,
      password: 'redis-pass',
    },
    isMailEnabled: true,
    mail: {
      host: 'smtp.example.com',
      port: 587,
      from: 'noreply@example.com',
      password: 'mail-pass',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSettings', () => {
    it('应返回脱敏后的系统配置', async () => {
      const result = await controller.getSettings();

      // 应包含应用配置
      expect(result.app).toEqual({
        name: 'Logto User Center',
        port: 3001,
        nodeEnv: 'development',
        frontendUrl: 'http://localhost:3000',
      });

      // Logto 配置不应包含 apiKey 和 appSecret
      expect(result.logto).toEqual({
        apiEndpoint: 'https://logto.example.com/api',
        appId: 'app-123',
        endpoint: 'https://logto.example.com',
      });
      expect(result.logto).not.toHaveProperty('apiKey');
      expect(result.logto).not.toHaveProperty('appSecret');

      // 数据库配置不应包含用户名和密码
      expect(result.database).toEqual({
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        name: 'authlode',
      });
      expect(result.database).not.toHaveProperty('username');
      expect(result.database).not.toHaveProperty('password');

      // Redis 配置不应包含密码
      expect(result.redis).toEqual({
        host: 'localhost',
        port: 6379,
        db: 0,
      });
      expect(result.redis).not.toHaveProperty('password');

      // 邮件配置不应包含密码
      expect(result.mail).toEqual({
        host: 'smtp.example.com',
        port: 587,
        from: 'noreply@example.com',
      });
      expect(result.mail).not.toHaveProperty('password');
    });

    it('Redis 未启用时应返回 null', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SettingsController],
        providers: [
          {
            provide: ConfigService,
            useValue: { ...mockConfigService, isRedisEnabled: false, redis: null },
          },
        ],
      }).compile();
      const ctrl = module.get<SettingsController>(SettingsController);

      const result = await ctrl.getSettings();

      expect(result.redis).toBeNull();
    });

    it('邮件未启用时应返回 null', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SettingsController],
        providers: [
          {
            provide: ConfigService,
            useValue: { ...mockConfigService, isMailEnabled: false, mail: null },
          },
        ],
      }).compile();
      const ctrl = module.get<SettingsController>(SettingsController);

      const result = await ctrl.getSettings();

      expect(result.mail).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('应返回更新成功信息', async () => {
      const updateData = {
        app: { name: 'New Name' },
      };

      const result = await controller.updateSettings(updateData);

      expect(result.message).toBe('配置更新成功');
      expect(result.updated).toEqual(updateData);
      expect(result.note).toContain('重启');
    });
  });
});
