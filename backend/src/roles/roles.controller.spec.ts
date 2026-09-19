import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { IAM_PROVIDER } from '../iam/interfaces';

describe('RolesController', () => {
  let controller: RolesController;
  let iamProvider: {
    getRoles: jest.Mock;
    getRoleById: jest.Mock;
    createRole: jest.Mock;
    updateRole: jest.Mock;
    deleteRole: jest.Mock;
  };

  const mockRole = {
    id: 'role-1',
    name: 'admin',
    description: 'Administrator',
    type: 'User',
  };

  const mockRoleList = { data: [mockRole], totalCount: 1 };

  beforeEach(async () => {
    iamProvider = {
      getRoles: jest.fn(),
      getRoleById: jest.fn(),
      createRole: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: IAM_PROVIDER, useValue: iamProvider }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoles', () => {
    it('应返回角色列表', async () => {
      iamProvider.getRoles.mockResolvedValue(mockRoleList);

      const result = await controller.getRoles();

      expect(result).toEqual(mockRoleList);
      expect(iamProvider.getRoles).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('应正确传递搜索和分页参数', async () => {
      iamProvider.getRoles.mockResolvedValue(mockRoleList);

      await controller.getRoles('admin', 1, 10);

      expect(iamProvider.getRoles).toHaveBeenCalledWith({
        search: 'admin',
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('getRoleById', () => {
    it('应返回指定角色详情', async () => {
      iamProvider.getRoleById.mockResolvedValue(mockRole);

      const result = await controller.getRoleById('role-1');

      expect(result).toEqual(mockRole);
      expect(iamProvider.getRoleById).toHaveBeenCalledWith('role-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.getRoleById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getRoleById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      iamProvider.getRoleById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getRoleById('role-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createRole', () => {
    it('应创建并返回新角色', async () => {
      const createDto = { name: 'editor', description: '编辑者' };
      iamProvider.createRole.mockResolvedValue(mockRole);

      const result = await controller.createRole(createDto);

      expect(result).toEqual(mockRole);
      expect(iamProvider.createRole).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      iamProvider.createRole.mockRejectedValue(new Error('创建失败'));

      await expect(controller.createRole({ name: 'fail' })).rejects.toThrow(HttpException);
    });
  });

  describe('updateRole', () => {
    it('应更新并返回角色', async () => {
      const updateDto = { name: 'Updated Role' };
      iamProvider.updateRole.mockResolvedValue({ ...mockRole, name: 'Updated Role' });

      const result = await controller.updateRole('role-1', updateDto);

      expect(result.name).toBe('Updated Role');
      expect(iamProvider.updateRole).toHaveBeenCalledWith('role-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.updateRole.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateRole('nonexistent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteRole', () => {
    it('应删除角色并返回成功', async () => {
      iamProvider.deleteRole.mockResolvedValue(undefined);

      const result = await controller.deleteRole('role-1');

      expect(result).toEqual({ success: true });
      expect(iamProvider.deleteRole).toHaveBeenCalledWith('role-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      iamProvider.deleteRole.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.deleteRole('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      iamProvider.deleteRole.mockRejectedValue(new Error('unknown'));

      await expect(controller.deleteRole('role-1')).rejects.toThrow(HttpException);
    });
  });
});
