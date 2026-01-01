# Logto 用户中心管理系统

基于 Logto IAM 的企业级用户中心管理系统。

## 📖 项目说明

本项目是一个**独立的用户中心管理应用**,基于 Logto IAM (身份与访问管理) 作为底层数据源,提供企业级的用户、组织、权限、应用管理功能。

### 当前状态

✅ **开发中** - 阶段 0-3 已完成 (约 25% 整体进度)

**已实现**:
- ✅ NestJS 后端基础架构
- ✅ Nuxt 3 前端基础架构
- ✅ Logto Management API 集成模块
- ✅ SQLite 扩展数据库 (开发环境)
- ✅ Repository 数据访问层
- ✅ 配置管理系统

**进行中**:
- 🔄 前端页面开发
- ⏳ API 路由和控制器
- ⏳ 用户认证与授权

**已知问题**:
- ⚠️ Windows 环境下 Prisma Client 生成问题 (已实现临时方案)
- ⚠️ Logto API 配置缺失 (需要配置真实凭据或修改验证逻辑)

详细进度请查看 [开发日志](docs/development-log.md) 和 [AI实现步骤方案](AI实现步骤方案.md)。

### 核心特性

- 🔐 **基于 Logto OIDC** 的身份认证
- 🏢 **多层级组织架构** 可视化管理
- 👥 **完整的用户生命周期** 管理
- 🎭 **灵活的 RBAC** 权限配置
- 📱 **应用授权** 与访问管理
- 📧 **用户邀请** 与审批流程
- 📊 **完整的审计日志** 系统
- 📈 **数据统计** 与报表

### 技术栈

#### 后端
- **框架**: NestJS 10.x + TypeScript
- **ORM**: Prisma (仅扩展数据)
- **API**: RESTful + Swagger 文档

#### 前端
- **框架**: Nuxt 4.2.2 + Vue 3.5.13 + TypeScript
- **UI**: Nuxt UI 4.3.0 + Tailwind CSS 4.0.0
- **状态**: Pinia
- **图标**: Heroicons (@iconify-json/heroicons)

#### 数据库
- **开发环境**: SQLite (零配置)
- **生产环境**: MySQL 8.0+ / PostgreSQL 15+
- **缓存**: Redis 7+ (可选)

### 数据架构

```
┌─────────────────────────────────────────┐
│   Logto IAM (数据源)                    │
│  - 用户账户                              │
│  - 组织架构                              │
│  - 角色权限                              │
│  - 应用注册                              │
└─────────────────────────────────────────┘
        ↑ 通过 Management API
        │ 读写操作
┌─────────────────────────────────────────┐
│   你的应用 (NestJS + Nuxt 3)            │
│  - 用户管理界面                          │
│  - 组织管理界面                          │
│  - 角色权限界面                          │
└─────────────────────────────────────────┘
        ↓ 只存储扩展功能数据
┌─────────────────────────────────────────┐
│  扩展数据库 (MySQL/PostgreSQL)           │
│  - 邀请记录                              │
│  - 审计日志                              │
│  - 用户扩展信息                          │
│  - 批量操作记录                          │
└─────────────────────────────────────────┘
```

## 📁 项目结构

```
logto-manager/
├── backend/              # 后端项目 (NestJS)
├── frontend/             # 前端项目 (Nuxt 3)
├── docs/                 # 项目文档
├── deployment/           # 部署配置
├── README.md             # 项目说明
├── 总体技术方案.md        # 技术架构文档
├── 项目文件结构.md        # 文件结构说明
└── AI实现步骤方案.md      # 开发实施计划
```

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- pnpm
- MySQL 8.0+ 或 PostgreSQL 15+
- Redis 7+ (可选)
- Logto 实例

### 环境配置

1. 复制环境变量模板:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. 编辑 `.env` 文件,填入配置信息:
   - Logto Management API 配置
   - 数据库连接信息
   - Redis 连接信息 (可选)

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 📚 文档

- [总体技术方案](总体技术方案.md) - 系统架构设计
- [项目文件结构](项目文件结构.md) - 目录结构说明
- [AI实现步骤方案](AI实现步骤方案.md) - 开发实施计划

## 📝 开发规范

### Git 提交规范

```
feat: 添加用户创建功能
fix: 修复权限检查问题
docs: 更新 API 文档
style: 格式化代码
refactor: 重构用户服务
test: 添加用户服务单元测试
chore: 更新依赖包
```

### 命名规范

- ✅ 使用完整命名,不使用缩写
- ✅ `userOrganization` 而非 `userOrg`
- ✅ `permissionManagement` 而非 `permMgmt`
- ✅ 文件名使用 `kebab-case`
- ✅ 类名使用 `PascalCase`
- ✅ 函数名使用 `camelCase`

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

---

**项目开始时间**: 2025-01-28
**当前版本**: v0.1.0 (开发中)
