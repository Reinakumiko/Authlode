# Authlode — SSO 用户管理平台

基于 IAM 底座的多租户 SSO 用户管理平台，Logto 为第一实现平台。

## 📖 项目说明

Authlode 是一个 **SSO 用户管理平台**：以 IAM 为身份底座（Logto 为第一实现平台），面向多租户提供**用户全生命周期管理**与 **SSO 应用接入管理**。租户管理员在平台上自助管理用户、组织、权限，并接入应用；用户**一次登录，通行租户内所有已接入应用与平台本身**。

**定位要点**（演进：Logto 专用用户中心 → 多租户 IAM 用户管理系统 → **SSO 用户管理平台**，总纲见 [SSO平台功能目标与实现方案.md](docs/SSO平台功能目标与实现方案.md)）：

- 👤 **一套账号体系** — 账号池唯一全局（同 email 同账号，一份凭证走遍所有系统）；系统只是账号的**访问范围**而非独立账户体系；两级门禁：没账号无法认证、非系统成员拿不到该系统令牌（组织 Token 强制）
- 🏢 **多系统接入（多租户）** — "租户" = 接入的系统；系统管理员管理本系统的用户、组织、权限、应用接入，数据按系统隔离
- 🔌 **IAM 平台无关** — 系统不绑定特定身份平台，通过 **IAM Provider 抽象层**对接底层身份基础设施
- 🥇 **Logto 为第一实现平台** — 首个 Provider Adapter 基于 Logto Management API 实现，后续可扩展 Keycloak、Authentik 等其他 IAM
- 📧 **系统邀请用户** — 邀请链接 → 自助注册（新 email 建号 / 已有 email 直接授权）→ 自动入组
- 💾 **数据分层** — 身份数据（用户/角色/权限）存储于 IAM 平台，通过 Provider 接口读写；**租户是平台自有概念**，租户配置、租户内组织、应用接入、邀请等存扩展库，按租户隔离

**关键架构决策**（2026-09-18 确认）：

- **软隔离** — 单 Logto 实例，**Logto Organization 映射为租户**；同一 email 跨租户为同一账号（视为 SSO 特性），租户间数据靠查询隔离（强制 tenantId 过滤）
- **管理界面分工** — 系统级管理用 IAM 自带后台（Logto Admin Console），**Authlode 只做租户后台**；运营方在 Logto 后台创建租户（Organization）并任命首个租户管理员（org role），Tenant 记录首次登录时 JIT 自动创建；不含自助开通租户流程，无平台端
- **租户内组织树存扩展库** — Logto Organizations 为扁平结构且已用作租户，租户内组织/部门为平台自有数据
- **邀请注册双语义** — 新 email = 注册新账号并入租户；已有 email = 邀请加入租户（复用既有账号）
- **访问控制（已决）** — 组织 Token 强制约定：非系统成员无法从 IAM 获得该系统令牌，"没资格用不了"由 IAM 执行，接入系统零检查代码

### 当前状态

✅ **v1 完整功能已实现** — 前端 8 页面 + 后端 5 Controllers + 55 个单元测试

**已实现**:
- ✅ NestJS 后端基础架构 + Prisma ORM
- ✅ Nuxt 4 前端基础架构 + Vue 3
- ✅ Logto Management API 集成模块 (定位变更后将演进为 IAM Provider 抽象层的 Logto Adapter)
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

**待接入** (按新定位):
- ⏳ IAM Provider 抽象层 — 将现有 LogtoService 重构为 Provider 接口 + Logto Adapter
- ⏳ 多租户模型 — Tenant 实体 (映射 Logto Organization)、扩展表 tenantId 隔离、TenantContext 中间件、租户管理员角色
- ⏳ 邀请自助注册流程 — 公开注册页 + 邀请 Token 验证 + 自动入组
- ⏳ Logto 真实 API 凭据 (当前使用 mock 数据)
- ⏳ 用户认证与授权流程
- ⏳ 生产环境数据库切换

详细进度请查看 [开发日志](docs/development-log.md) 和 [SSO平台实施方案](docs/SSO平台实施方案.md)。

### 核心特性

- 🔐 **基于 IAM OIDC** 的身份认证 (Logto 为第一平台)
- 🏢 **多租户租户自管理** — 租户级数据隔离，租户管理员自助管理
- 🏬 **多层级组织架构** 可视化管理 (租户内组织/部门)
- 👥 **完整的用户生命周期** 管理
- 🎭 **灵活的 RBAC** 权限配置
- 📱 **SSO 应用接入** — 租户接入应用，用户一次登录通行所有应用（租户级接入配置）
- 📧 **租户邀请用户注册** 与审批流程
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
┌───────────────────────────────────────────────────┐
│  IAM 平台 (身份数据源, 平台无关)                    │
│  - 用户账户 / 角色权限 / 应用注册                    │
│  - 租户身份分组 (Logto Organization = 租户)         │
└───────────────────────────────────────────────────┘
        ↑ 通过 IAM Provider 抽象层
        │ (统一接口: 用户/租户/角色/应用/认证)
┌───────────────────────────────────────────────────┐
│  IAM Provider 抽象层 (IamProviderInterface)        │
│  ├── Logto Adapter — 第一实现平台 ✅               │
│  ├── Keycloak Adapter — 规划中                     │
│  └── 其他 IAM Adapter — 可扩展                     │
└───────────────────────────────────────────────────┘
        ↑ 读写操作
┌───────────────────────────────────────────────────┐
│  Authlode 租户自管理平台 (NestJS + Nuxt)           │
│  - 租户管理员自助管理 (用户/组织/权限/应用接入)      │
│  - 邀请注册流程 (邀请链接 → 自助注册)               │
└───────────────────────────────────────────────────┘
        ↓ 只存储平台自有数据 (按租户隔离)
┌───────────────────────────────────────────────────┐
│  扩展数据库 (SQLite 开发 / MySQL·PostgreSQL 生产)  │
│  - Tenant 记录与配置 / 租户内组织树                 │
│  - 应用接入 / 邀请 / 审计 / 用户扩展信息            │
└───────────────────────────────────────────────────┘
```

## 📁 项目结构

```
authlode/
├── backend/              # 后端项目 (NestJS)
├── frontend/             # 前端项目 (Nuxt 4)
├── deployment/
│   └── logto/            # Logto Docker 环境 + POC 验证脚本
├── docs/                 # 项目文档（地图见 docs/README.md）
│   ├── SSO平台功能目标与实现方案.md   # 总纲（当前权威）
│   ├── SSO平台实施方案.md            # 落地方案（批次 0-4）
│   ├── 总体技术方案.md               # 架构细节
│   ├── 功能模块集成与实现规划.md     # 模块拆分 + Logto 调研
│   ├── 项目文件结构.md               # 目录结构说明
│   ├── 环境配置说明.md               # 环境变量配置
│   ├── development-log.md            # 开发日志
│   └── archive/                     # 历史文档归档
├── DESIGN-SYSTEM.md      # Soft Glass UI 设计系统
└── README.md             # 项目说明
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

> 完整文档地图见 [docs/README.md](docs/README.md)，历史文档归档于 `docs/archive/`。

- [SSO平台功能目标与实现方案](docs/SSO平台功能目标与实现方案.md) - **定位与功能/实现总纲（当前权威）**
- [SSO平台实施方案](docs/SSO平台实施方案.md) - 落地实施方案（批次 0-4 + 实测结果）
- [总体技术方案](docs/总体技术方案.md) - 系统架构设计
- [功能模块集成与实现规划](docs/功能模块集成与实现规划.md) - 模块级集成/实现拆分 + Logto 调研结论
- [项目文件结构](docs/项目文件结构.md) - 目录结构说明
- [环境配置说明](docs/环境配置说明.md) - 环境变量与 Logto 环境
- [开发日志](docs/development-log.md) - 开发过程记录
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - Soft Glass UI 设计系统

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
**定位演进**: 2026-09-18 Logto 专用 → 多租户 IAM 用户管理系统；2026-09-19 → **SSO 用户管理平台**（当前）

