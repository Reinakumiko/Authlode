# Logto 用户中心管理系统

基于 Logto IAM 的企业级用户中心管理系统。

## 📖 项目说明

本项目是一个**独立的用户中心管理应用**,基于 Logto IAM (身份与访问管理) 作为底层数据源,提供企业级的用户、组织、权限、应用管理功能。

### 当前状态

✅ **v1 完整功能已实现** — 前端 8 页面 + 后端 5 Controllers + 55 个单元测试

**已实现**:
- ✅ NestJS 后端基础架构 + Prisma ORM
- ✅ Nuxt 4 前端基础架构 + Vue 3
- ✅ Logto Management API 集成模块
- ✅ SQLite 扩展数据库 (开发环境)
- ✅ Repository 数据访问层
- ✅ 配置管理系统
- ✅ **Soft Glass UI 设计系统** (DESIGN-SYSTEM.md)
- ✅ **通用 PageHeader 组件** — 所有管理页面统一标题区
- ✅ **8 个完整前端页面**:
  - `users.vue` — 用户管理 (CRUD + 搜索 + 分页 + 角色筛选)
  - `organizations.vue` — 组织管理 (卡片网格 + 成员统计)
  - `roles.vue` — 角色权限 (权限标签 + 用户数)
  - `applications.vue` — 应用管理 (卡片布局 + 密钥管理)
  - `invitations.vue` — 邀请管理 (状态筛选 + 发送邀请)
  - `audit-logs.vue` — 审计日志 (日期筛选 + 操作类型 + 导出)
  - `settings.vue` — 系统设置 (通用配置 + 安全设置)
  - `statistics.vue` — 数据统计 (指标卡片 + 图表)
- ✅ **5 个后端 Controllers** (users, organizations, roles, applications, settings)
- ✅ **55 个 Jest 单元测试** — 全部通过
- ✅ Dashboard 仪表板 (Soft Glass 风格)

**待接入**:
- ⏳ Logto 真实 API 凭据 (当前使用 mock 数据)
- ⏳ 用户认证与授权流程
- ⏳ 生产环境数据库切换

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
- **UI**: Soft Glass UI (自定义设计系统) + Tailwind CSS 4.0.0
- **通用组件**: `PageHeader`, `AppSidebar`, `AppHeader`
- **状态**: Pinia
- **图标**: 内联 SVG (Lucide 风格)

#### 数据库
- **开发环境**: SQLite (零配置)
- **生产环境**: MySQL 8.0+ / PostgreSQL 15+
- **缓存**: Redis 7+ (可选)


### 设计系统

项目采用 **Soft Glass UI** 设计语言,详见 [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)。

**设计风格**: 毛玻璃 (Glassmorphism) + 渐变光球 + 大圆角

设计系统涵盖以下方面:
- 🎨 **颜色体系** - 语义化颜色令牌与渐变方案
- ✏️ **字体排版** - 字体族、字号层级与行高
- 📐 **间距系统** - 统一的间距与圆角规范
- 🪟 **毛玻璃效果** - 透明度、模糊、边框与光球渐变
- 📱 **布局规范** - 响应式网格与容器尺寸
- 🧩 **组件库** - 按钮、卡片、表单等基础组件样式

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
│   └── previews/         # UI 预览页面
├── deployment/           # 部署配置
├── DESIGN-SYSTEM.md      # Soft Glass UI 设计系统
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
**项目开始时间**: 2026-03-01
**当前版本**: v1.0.0 (完整功能实现)

