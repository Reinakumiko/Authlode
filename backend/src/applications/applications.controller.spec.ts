import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { IAM_PROVIDER } from '../iam/interfaces';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let iamProvider: {
    getApplications: jest.Mock;
    getApplicationById: jest.Mock;
    createApplication: jest.Mock;
    updateApplication: jest.Mock;
  };

  const mockApplication = {
    id: 'app-1',
    name: 'Test App',
    description: '测试应用',
    type: 'spa',
    secret: null,
    oidcClientMetadata: {
      redirectUris: ['http://localhost:9999/callback'],
      postLogoutRedirectUris: [],
    },
  };

  const mockApplicationList = { data: [mockApplication], totalCount: 1 };

  beforeEach(async () => {
    iamProvider = {
      getApplications: jest.fn(),
      getApplicationById: jest.fn(),
      createApplication: jest.fn(),
      updateApplication: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [{ provide: IAM_PROVIDER, useValue: iamProvider }],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApplications', () => {
    it('应返回应用列表', async () => {
      iamProvider.getApplications.mockResolvedValue(mockApplicationList);

      const result = await controller.getApplications();

      expect(result).toEqual(mockApplicationList);
      expect(iamProvider.getApplications).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('应正确传递搜索和分页参数', async () => {
      iamProvider.getApplications.mockResolvedValue(mockApplicationList);

      await controller.getApplications('test', 1, 10);

      expect(iamProvider.getApplications).toHaveBeenCalledWith({
        search: 'test',
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('getApplicationById', () => {
    it('应返回指定应用详情', async () => {
      iamProvider.getApplicationById.mockResolvedValue(mockApplication);

      const result = await controller.getApplicationById('app-1');

      expect(result).toEqual(mockApplication);
      expect(iamProvider.getApplicationById).toHaveBeenCalledWith('app-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.getApplicationById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getApplicationById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      iamProvider.getApplicationById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getApplicationById('app-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createApplication', () => {
    it('应创建并返回新应用', async () => {
      const createDto = {
        name: 'New App',
        type: 'spa',
        redirectUris: ['http://localhost:9999/callback'],
      };
      iamProvider.createApplication.mockResolvedValue(mockApplication);

      const result = await controller.createApplication(createDto);

      expect(result).toEqual(mockApplication);
      expect(iamProvider.createApplication).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      iamProvider.createApplication.mockRejectedValue(new Error('创建失败'));

      await expect(
        controller.createApplication({ name: 'fail', type: 'spa', redirectUris: [] }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateApplication', () => {
    it('应更新并返回应用', async () => {
      const updateDto = { name: 'Updated App' };
      iamProvider.updateApplication.mockResolvedValue({
        ...mockApplication,
        name: 'Updated App',
      });

      const result = await controller.updateApplication('app-1', updateDto);

      expect(result.name).toBe('Updated App');
      expect(iamProvider.updateApplication).toHaveBeenCalledWith('app-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.updateApplication.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateApplication('nonexistent', {})).rejects.toThrow(
        HttpException,
      );
    });

    it('服务抛出未知异常时应返回 500', async () => {
      iamProvider.updateApplication.mockRejectedValue(new Error('unknown'));

      await expect(controller.updateApplication('app-1', {})).rejects.toThrow(HttpException);
    });
  });
});
