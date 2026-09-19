import { PrismaService } from '../../prisma/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * 基础 Repository 类
 * 提供通用的 CRUD 操作
 *
 * B1.4 租户隔离钩子：
 * - 读查询（findById/findAll/findPaginated/count/deleteMany）经 scopeWhere 强制合并 tenantId
 * - 创建（create/createMany/upsert）经 scopeCreate 自动注入 tenantId
 * - 上下文由 TenantContextService（AsyncLocalStorage，请求级隔离）提供；
 *   B1.6 的 TenantContext 中间件负责填充
 * - 无租户上下文时（未登录/公开接口/单测）不追加过滤，行为与之前一致
 * - update/delete 按 id 走唯一键定位：读路径已隔离，跨租户 id 不可获得
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected readonly logger: Logger;
  protected readonly modelName: string;

  constructor(
    protected prisma: PrismaService,
    modelName: string,
    protected readonly tenantContext?: TenantContextService,
  ) {
    this.modelName = modelName;
    this.logger = new Logger(`${modelName}Repository`);
  }

  /**
   * 租户过滤钩子 — 所有查询的强制隔离点
   * 有租户上下文时合并 tenantId；无则原样返回
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected scopeWhere(where?: any): any {
    const tenantId = this.tenantContext?.tenantId;
    if (!tenantId) {
      return where ?? {};
    }
    return { ...where, tenantId };
  }

  /**
   * 租户注入钩子 — 创建数据自动携带 tenantId
   */
  protected scopeCreate(data: CreateInput): CreateInput {
    const tenantId = this.tenantContext?.tenantId;
    if (!tenantId) {
      return data;
    }
    return { ...(data as Record<string, unknown>), tenantId } as CreateInput;
  }

  /**
   * 根据 ID 查找记录
   * 使用 findFirst（而非 findUnique）：可叠加租户过滤，强制隔离
   */
  async findById(id: string): Promise<T | null> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.findFirst({
        where: this.scopeWhere({ id }),
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to find ${this.modelName} by id: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据 ID 查找记录,不存在则抛出异常
   */
  async findByIdOrFail(id: string): Promise<T> {
    const result = await this.findById(id);
    if (!result) {
      throw new NotFoundException(`${this.modelName} with id ${id} not found`);
    }
    return result;
  }

  /**
   * 查找所有记录
   */
  async findAll(params?: {
    skip?: number;
    take?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy?: any;
  }): Promise<T[]> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.findMany({
        skip: params?.skip,
        take: params?.take,
        where: this.scopeWhere(params?.where),
        orderBy: params?.orderBy,
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to find all ${this.modelName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分页查询
   */
  async findPaginated(params?: {
    page?: number;
    pageSize?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy?: any;
  }): Promise<{ data: T[]; total: number }> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    try {
      const model = (this.prisma as any)[this.modelName];
      const scopedWhere = this.scopeWhere(params?.where);
      const [data, total] = await Promise.all([
        model.findMany({
          skip,
          take: pageSize,
          where: scopedWhere,
          orderBy: params?.orderBy,
        }),
        model.count({ where: scopedWhere }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error(
        `Failed to find paginated ${this.modelName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 创建记录
   */
  async create(data: CreateInput): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.create({
        data: this.scopeCreate(data),
      });
      this.logger.log(`Created ${this.modelName} with id: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create ${this.modelName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量创建记录
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.createMany({
        data: data.map((item) => this.scopeCreate(item)),
      });
      this.logger.log(`Created ${result.count} ${this.modelName} records`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create many ${this.modelName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 更新记录
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.update({
        where: { id },
        data,
      });
      this.logger.log(`Updated ${this.modelName} with id: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update ${this.modelName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新或创建记录 (Upsert)
   */
  async upsert(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: any,
    create: CreateInput,
    update: UpdateInput,
  ): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.upsert({
        where,
        create: this.scopeCreate(create),
        update,
      });
      this.logger.log(`Upserted ${this.modelName} with id: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to upsert ${this.modelName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除记录
   */
  async delete(id: string): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.delete({
        where: { id },
      });
      this.logger.log(`Deleted ${this.modelName} with id: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete ${this.modelName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量删除记录
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async deleteMany(where: any): Promise<{ count: number }> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.deleteMany({
        where: this.scopeWhere(where),
      });
      this.logger.log(`Deleted ${result.count} ${this.modelName} records`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete many ${this.modelName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 统计记录数
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async count(where?: any): Promise<number> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.count({
        where: this.scopeWhere(where),
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to count ${this.modelName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result !== null;
  }

  /**
   * 检查记录是否存在(根据条件)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async existsWhere(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }
}
