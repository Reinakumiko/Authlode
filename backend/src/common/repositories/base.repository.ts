import { PrismaService } from '../../prisma/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';

/**
 * 基础 Repository 类
 * 提供通用的 CRUD 操作
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected readonly logger: Logger;
  protected readonly modelName: string;

  constructor(protected prisma: PrismaService, modelName: string) {
    this.modelName = modelName;
    this.logger = new Logger(`${modelName}Repository`);
  }

  /**
   * 根据 ID 查找记录
   */
  async findById(id: string): Promise<T | null> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.findUnique({
        where: { id },
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
    where?: any;
    orderBy?: any;
  }): Promise<T[]> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.findMany({
        skip: params?.skip,
        take: params?.take,
        where: params?.where,
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
    where?: any;
    orderBy?: any;
  }): Promise<{ data: T[]; total: number }> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    try {
      const model = (this.prisma as any)[this.modelName];
      const [data, total] = await Promise.all([
        model.findMany({
          skip,
          take: pageSize,
          where: params?.where,
          orderBy: params?.orderBy,
        }),
        model.count({ where: params?.where }),
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
        data,
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
        data,
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
    where: any,
    create: CreateInput,
    update: UpdateInput,
  ): Promise<T> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.upsert({
        where,
        create,
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
  async deleteMany(where: any): Promise<{ count: number }> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.deleteMany({
        where,
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
  async count(where?: any): Promise<number> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.count({
        where,
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
  async existsWhere(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }
}
