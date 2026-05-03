import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { LogtoService } from '../logto/logto.service';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let logtoService: jest.Mocked<LogtoService>;

  const mockApplication = {
    id: 'app-1',
    name: 'Test App',
    description: 'A test application',
    type: 'SPA',
    secret: 'secret-123',
    appId: 'app-id-123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockApplicationList = {
    totalCount: 1,
    data: [mockApplication],
  };

  beforeEach(async () => {
    const mockLogtoService = {
      getApplications: jest.fn(),
      getApplicationById: jest.fn(),
      createApplication: jest.fn(),
      updateApplication: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: LogtoService, useValue: mockLogtoService },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    logtoService = module.get(LogtoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApplications', () => {
    it('应返回应用列表', async () => {
      logtoService.getApplications.mockResolvedValue(mockApplicationList as any);

      const result = await controller.getApplications();

      expect(result).toEqual(mockApplicationList);
      expect(logtoService.getApplications).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('应正确传递搜索和分页参数', async () => {
      logtoService.getApplications.mockResolvedValue(mockApplicationList as any);

      await controller.getApplications('test', 1, 10);

      expect(logtoService.getApplications).toHaveBeenCalledWith({
        search: 'test',
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('getApplicationById', () => {
    it('应返回指定应用详情', async () => {
      logtoService.getApplicationById.mockResolvedValue(mockApplication as any);

      const result = await controller.getApplicationById('app-1');

      expect(result).toEqual(mockApplication);
      expect(logtoService.getApplicationById).toHaveBeenCalledWith('app-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.getApplicationById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getApplicationById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.getApplicationById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getApplicationById('app-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createApplication', () => {
    it('应创建并返回新应用', async () => {
      const createDto = { name: 'New App', type: 'SPA' as any };
      logtoService.createApplication.mockResolvedValue(mockApplication as any);

      const result = await controller.createApplication(createDto);

      expect(result).toEqual(mockApplication);
      expect(logtoService.createApplication).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      logtoService.createApplication.mockRejectedValue(new Error('创建失败'));

      await expect(
        controller.createApplication({ name: 'fail', type: 'SPA' as any }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateApplication', () => {
    it('应更新并返回应用', async () => {
      const updateDto = { name: 'Updated App' };
      logtoService.updateApplication.mockResolvedValue({ ...mockApplication, name: 'Updated App' } as any);

      const result = await controller.updateApplication('app-1', updateDto);

      expect(result.name).toBe('Updated App');
      expect(logtoService.updateApplication).toHaveBeenCalledWith('app-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.updateApplication.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateApplication('nonexistent', {})).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.updateApplication.mockRejectedValue(new Error('unknown'));

      await expect(controller.updateApplication('app-1', {})).rejects.toThrow(HttpException);
    });
  });
});
