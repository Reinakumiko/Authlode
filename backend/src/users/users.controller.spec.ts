import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller';
import { LogtoService } from '../logto/logto.service';

describe('UsersController', () => {
  let controller: UsersController;
  let logtoService: jest.Mocked<LogtoService>;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    primaryEmail: 'test@example.com',
    name: 'Test User',
    hasPassword: true,
    phoneVerified: false,
    emailVerified: true,
    isSuspended: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockUserList = {
    totalCount: 1,
    data: [mockUser],
  };

  beforeEach(async () => {
    const mockLogtoService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: LogtoService, useValue: mockLogtoService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    logtoService = module.get(LogtoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('应返回用户列表', async () => {
      logtoService.getUsers.mockResolvedValue(mockUserList as any);

      const result = await controller.getUsers();

      expect(result).toEqual(mockUserList);
      expect(logtoService.getUsers).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
        emailVerified: undefined,
        phoneVerified: undefined,
        isSuspended: undefined,
      });
    });

    it('应正确传递搜索和分页参数', async () => {
      logtoService.getUsers.mockResolvedValue(mockUserList as any);

      await controller.getUsers('test', 1, 10);

      expect(logtoService.getUsers).toHaveBeenCalledWith({
        search: 'test',
        page: 1,
        pageSize: 10,
        emailVerified: undefined,
        phoneVerified: undefined,
        isSuspended: undefined,
      });
    });

    it('应正确解析布尔筛选参数', async () => {
      logtoService.getUsers.mockResolvedValue(mockUserList as any);

      await controller.getUsers(undefined, undefined, undefined, 'true', 'false', 'true');

      expect(logtoService.getUsers).toHaveBeenCalledWith({
        search: undefined,
        page: undefined,
        pageSize: undefined,
        emailVerified: true,
        phoneVerified: false,
        isSuspended: true,
      });
    });
  });

  describe('getUserById', () => {
    it('应返回指定用户详情', async () => {
      logtoService.getUserById.mockResolvedValue(mockUser as any);

      const result = await controller.getUserById('user-1');

      expect(result).toEqual(mockUser);
      expect(logtoService.getUserById).toHaveBeenCalledWith('user-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.getUserById.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.getUserById('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.getUserById.mockRejectedValue(new Error('unknown'));

      await expect(controller.getUserById('user-1')).rejects.toThrow(HttpException);
    });
  });

  describe('createUser', () => {
    it('应创建并返回新用户', async () => {
      const createDto = { username: 'newuser', password: 'pass123', primaryEmail: 'new@example.com' };
      logtoService.createUser.mockResolvedValue(mockUser as any);

      const result = await controller.createUser(createDto);

      expect(result).toEqual(mockUser);
      expect(logtoService.createUser).toHaveBeenCalledWith(createDto);
    });

    it('服务抛出异常时应正确处理', async () => {
      logtoService.createUser.mockRejectedValue(new Error('创建失败'));

      await expect(
        controller.createUser({ username: 'fail', password: 'pass' }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateUser', () => {
    it('应更新并返回用户', async () => {
      const updateDto = { name: 'Updated Name' };
      logtoService.updateUser.mockResolvedValue({ ...mockUser, name: 'Updated Name' } as any);

      const result = await controller.updateUser('user-1', updateDto);

      expect(result.name).toBe('Updated Name');
      expect(logtoService.updateUser).toHaveBeenCalledWith('user-1', updateDto);
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.updateUser.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.updateUser('nonexistent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteUser', () => {
    it('应删除用户并返回成功', async () => {
      logtoService.deleteUser.mockResolvedValue(undefined);

      const result = await controller.deleteUser('user-1');

      expect(result).toEqual({ success: true });
      expect(logtoService.deleteUser).toHaveBeenCalledWith('user-1');
    });

    it('服务抛出 HttpException 时应原样抛出', async () => {
      logtoService.deleteUser.mockRejectedValue(
        new HttpException('Not found', HttpStatus.NOT_FOUND),
      );

      await expect(controller.deleteUser('nonexistent')).rejects.toThrow(HttpException);
    });

    it('服务抛出未知异常时应返回 500', async () => {
      logtoService.deleteUser.mockRejectedValue(new Error('unknown'));

      await expect(controller.deleteUser('user-1')).rejects.toThrow(HttpException);
    });
  });
});
