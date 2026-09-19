import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { IAM_PROVIDER } from '../iam/interfaces';
import { TenantContextService } from '../tenant/tenant-context.service';

describe('UsersController', () => {
  let controller: UsersController;
  let iamProvider: Record<string, jest.Mock>;
  let tenantContext: { get: jest.Mock };

  const mockCtx = { tenantId: 'org-1', userId: 'user-1', organizationRoles: ['tenant-admin'] };
  const mockUser = { id: 'user-1', username: 'testuser', primaryEmail: 'test@example.com', name: 'Test User', isSuspended: false };

  beforeEach(async () => {
    iamProvider = {
      getOrganizationUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      addOrganizationUsers: jest.fn(),
    };
    tenantContext = { get: jest.fn().mockReturnValue(mockCtx) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: IAM_PROVIDER, useValue: iamProvider },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('getUsers（租户作用域）', () => {
    it('应返回组织成员列表（映射 userId → id）', async () => {
      iamProvider.getOrganizationUsers.mockResolvedValue({
        data: [{ userId: 'u1', username: 'alice', primaryEmail: 'a@b.c', name: 'Alice', joinedAt: '2024-01-01' }],
        totalCount: 1,
      });
      const result = await controller.getUsers();
      expect(result.data[0].id).toBe('u1');
      expect(iamProvider.getOrganizationUsers).toHaveBeenCalledWith('org-1', { search: undefined, page: undefined, pageSize: undefined });
    });

    it('无租户上下文应 403', async () => {
      tenantContext.get.mockReturnValue(undefined);
      await expect(controller.getUsers()).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createUser（建号 + 入租户）', () => {
    it('应创建用户并加入当前租户', async () => {
      iamProvider.createUser.mockResolvedValue({ ...mockUser, id: 'new-user' });
      iamProvider.addOrganizationUsers.mockResolvedValue(undefined);
      const result = await controller.createUser({ primaryEmail: 'new@test.com', password: 'pass123', name: 'New' });
      expect(result.id).toBe('new-user');
      expect(iamProvider.addOrganizationUsers).toHaveBeenCalledWith('org-1', ['new-user']);
    });

    it('服务异常应 500', async () => {
      iamProvider.createUser.mockRejectedValue(new Error('fail'));
      await expect(controller.createUser({ primaryEmail: 'x@y.z' })).rejects.toThrow(HttpException);
    });
  });

  describe('getUserById / updateUser / deleteUser', () => {
    it('详情', async () => {
      iamProvider.getUserById.mockResolvedValue(mockUser);
      const result = await controller.getUserById('user-1');
      expect(result).toEqual(mockUser);
    });

    it('HttpException 原样抛出', async () => {
      iamProvider.getUserById.mockRejectedValue(new HttpException('Not found', HttpStatus.NOT_FOUND));
      await expect(controller.getUserById('x')).rejects.toThrow(HttpException);
    });

    it('更新', async () => {
      iamProvider.updateUser.mockResolvedValue({ ...mockUser, name: 'Updated' });
      const result = await controller.updateUser('user-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('删除返回成功', async () => {
      iamProvider.deleteUser.mockResolvedValue(undefined);
      const result = await controller.deleteUser('user-1');
      expect(result).toEqual({ success: true });
    });
  });
});
