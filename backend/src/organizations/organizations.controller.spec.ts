import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { LogtoService } from '../logto/logto.service';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let logtoService: jest.Mocked<LogtoService>;

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Org',
    description: 'A test organization',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    const mockLogtoService = {
      getOrganizations: jest.fn(),
      getOrganizationById: jest.fn(),
      createOrganization: jest.fn(),
      updateOrganization: jest.fn(),
      deleteOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        { provide: LogtoService, useValue: mockLogtoService },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    logtoService = module.get(LogtoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrganizations', () => {
    it('应返回组织列表', async () => {
      logtoService.getOrganizations.mockResolvedValue([mockOrganization] as any);

      const result = await controller.getOrganizations();

      expect(result).toEqual([mockOrganization]);
      expect(logtoService.getOrganizations).toHaveBeenCalled();
    });
  });

  describe('getOrganizationById', () => {
    it('应返回指定组织详情', async () => {
      logtoService.getOrganizationById.mockResolvedValue(mockOrganization as any);

      const result = await controller.getOrganizationById('org-1');

      expect(result).toEqual(mockOrganization);
      expect(logtoService.getOrganizationById).toHaveBeenCalledWith('org-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.getOrganizationById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getOrganizationById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.getOrganizationById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getOrganizationById('org-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createOrganization', () => {
    it('应创建并返回新组织', async () => {
      const createDto = { name: 'New Org', description: 'desc' };
      logtoService.createOrganization.mockResolvedValue(mockOrganization as any);

      const result = await controller.createOrganization(createDto);

      expect(result).toEqual(mockOrganization);
      expect(logtoService.createOrganization).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      logtoService.createOrganization.mockRejectedValue(new Error('创建失败'));

      await expect(
        controller.createOrganization({ name: 'fail' }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateOrganization', () => {
    it('应更新并返回组织', async () => {
      const updateDto = { name: 'Updated Org' };
      logtoService.updateOrganization.mockResolvedValue({ ...mockOrganization, name: 'Updated Org' } as any);

      const result = await controller.updateOrganization('org-1', updateDto);

      expect(result.name).toBe('Updated Org');
      expect(logtoService.updateOrganization).toHaveBeenCalledWith('org-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.updateOrganization.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateOrganization('nonexistent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteOrganization', () => {
    it('应删除组织并返回成功', async () => {
      logtoService.deleteOrganization.mockResolvedValue(undefined);

      const result = await controller.deleteOrganization('org-1');

      expect(result).toEqual({ success: true });
      expect(logtoService.deleteOrganization).toHaveBeenCalledWith('org-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.deleteOrganization.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.deleteOrganization('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.deleteOrganization.mockRejectedValue(new Error('unknown'));

      await expect(controller.deleteOrganization('org-1')).rejects.toThrow(HttpException);
    });
  });
});
