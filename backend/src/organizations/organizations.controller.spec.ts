import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { IAM_PROVIDER } from '../iam/interfaces';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let iamProvider: {
    getOrganizations: jest.Mock;
    getOrganizationById: jest.Mock;
    createOrganization: jest.Mock;
    updateOrganization: jest.Mock;
    deleteOrganization: jest.Mock;
  };

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Org',
    description: '测试组织',
    customData: {},
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockOrganizationList = { data: [mockOrganization], totalCount: 1 };

  beforeEach(async () => {
    iamProvider = {
      getOrganizations: jest.fn(),
      getOrganizationById: jest.fn(),
      createOrganization: jest.fn(),
      updateOrganization: jest.fn(),
      deleteOrganization: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [{ provide: IAM_PROVIDER, useValue: iamProvider }],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrganizations', () => {
    it('应返回组织列表', async () => {
      iamProvider.getOrganizations.mockResolvedValue(mockOrganizationList);

      const result = await controller.getOrganizations();

      expect(result).toEqual(mockOrganizationList);
      expect(iamProvider.getOrganizations).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('应正确传递搜索和分页参数', async () => {
      iamProvider.getOrganizations.mockResolvedValue(mockOrganizationList);

      await controller.getOrganizations('test', 1, 10);

      expect(iamProvider.getOrganizations).toHaveBeenCalledWith({
        search: 'test',
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('getOrganizationById', () => {
    it('应返回指定组织详情', async () => {
      iamProvider.getOrganizationById.mockResolvedValue(mockOrganization);

      const result = await controller.getOrganizationById('org-1');

      expect(result).toEqual(mockOrganization);
      expect(iamProvider.getOrganizationById).toHaveBeenCalledWith('org-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.getOrganizationById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getOrganizationById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      iamProvider.getOrganizationById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getOrganizationById('org-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createOrganization', () => {
    it('应创建并返回新组织', async () => {
      const createDto = { name: 'New Org', description: '新组织' };
      iamProvider.createOrganization.mockResolvedValue(mockOrganization);

      const result = await controller.createOrganization(createDto);

      expect(result).toEqual(mockOrganization);
      expect(iamProvider.createOrganization).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      iamProvider.createOrganization.mockRejectedValue(new Error('创建失败'));

      await expect(controller.createOrganization({ name: 'fail' })).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateOrganization', () => {
    it('应更新并返回组织', async () => {
      const updateDto = { name: 'Updated Org' };
      iamProvider.updateOrganization.mockResolvedValue({
        ...mockOrganization,
        name: 'Updated Org',
      });

      const result = await controller.updateOrganization('org-1', updateDto);

      expect(result.name).toBe('Updated Org');
      expect(iamProvider.updateOrganization).toHaveBeenCalledWith('org-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.updateOrganization.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateOrganization('nonexistent', {})).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('deleteOrganization', () => {
    it('应删除组织并返回成功', async () => {
      iamProvider.deleteOrganization.mockResolvedValue(undefined);

      const result = await controller.deleteOrganization('org-1');

      expect(result).toEqual({ success: true });
      expect(iamProvider.deleteOrganization).toHaveBeenCalledWith('org-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.deleteOrganization.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.deleteOrganization('nonexistent')).rejects.toThrow(
        HttpException,
      );
    });

    it('服务抛出未知异常时应返回 500', async () => {
      iamProvider.deleteOrganization.mockRejectedValue(new Error('unknown'));

      await expect(controller.deleteOrganization('org-1')).rejects.toThrow(HttpException);
    });
  });
});
