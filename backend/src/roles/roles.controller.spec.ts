import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { LogtoService } from '../logto/logto.service';

describe('RolesController', () => {
  let controller: RolesController;
  let logtoService: jest.Mocked<LogtoService>;

  const mockRole = {
    id: 'role-1',
    name: 'admin',
    description: '管理员角色',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockRoleList = {
    totalCount: 1,
    data: [mockRole],
  };

  beforeEach(async () => {
    const mockLogtoService = {
      getRoles: jest.fn(),
      getRoleById: jest.fn(),
      createRole: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: LogtoService, useValue: mockLogtoService },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    logtoService = module.get(LogtoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoles', () => {
    it('应返回角色列表', async () => {
      logtoService.getRoles.mockResolvedValue(mockRoleList as any);

      const result = await controller.getRoles();

      expect(result).toEqual(mockRoleList);
      expect(logtoService.getRoles).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
      });
    });

    it('应正确传递搜索和分页参数', async () => {
      logtoService.getRoles.mockResolvedValue(mockRoleList as any);

      await controller.getRoles('admin', 1, 10);

      expect(logtoService.getRoles).toHaveBeenCalledWith({
        search: 'admin',
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('getRoleById', () => {
    it('应返回指定角色详情', async () => {
      logtoService.getRoleById.mockResolvedValue(mockRole as any);

      const result = await controller.getRoleById('role-1');

      expect(result).toEqual(mockRole);
      expect(logtoService.getRoleById).toHaveBeenCalledWith('role-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.getRoleById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getRoleById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.getRoleById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getRoleById('role-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createRole', () => {
    it('应创建并返回新角色', async () => {
      const createDto = { name: 'editor', description: '编辑者' };
      logtoService.createRole.mockResolvedValue(mockRole as any);

      const result = await controller.createRole(createDto);

      expect(result).toEqual(mockRole);
      expect(logtoService.createRole).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      logtoService.createRole.mockRejectedValue(new Error('创建失败'));

      await expect(
        controller.createRole({ name: 'fail' }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateRole', () => {
    it('应更新并返回角色', async () => {
      const updateDto = { name: 'super-admin' };
      logtoService.updateRole.mockResolvedValue({ ...mockRole, name: 'super-admin' } as any);

      const result = await controller.updateRole('role-1', updateDto);

      expect(result.name).toBe('super-admin');
      expect(logtoService.updateRole).toHaveBeenCalledWith('role-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.updateRole.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateRole('nonexistent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteRole', () => {
    it('应删除角色并返回成功', async () => {
      logtoService.deleteRole.mockResolvedValue(undefined);

      const result = await controller.deleteRole('role-1');

      expect(result).toEqual({ success: true });
      expect(logtoService.deleteRole).toHaveBeenCalledWith('role-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.deleteRole.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.deleteRole('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.deleteRole.mockRejectedValue(new Error('unknown'));

      await expect(controller.deleteRole('role-1')).rejects.toThrow(HttpException);
    });
  });
});
