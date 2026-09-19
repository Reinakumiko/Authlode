# Authlode SSO 用户管理平台 — 实施方案（落地版）

> **版本**: v1.0（2026-09-19）
> **依据**: [SSO平台功能目标与实现方案.md](SSO平台功能目标与实现方案.md) v4.1（总纲）
> **性质**: 执行层文档 — 批次/任务/接口草案/Schema/验收标准。理论已闭环，本文只讲"怎么做"。

---

## 总览：批次与依赖

```
批次 0  环境与可行性验证 (Logto 实际运行 + V1-V5)      ← 本次执行
  ↓
批次 1  P0 地基: Provider 抽象 + OIDC 认证 + Tenant 模型
  ↓
批次 2  P1 核心价值: 用户租户化 + SSO 应用接入 + 前端接真
  ↓
批次 3  P2 自管理闭环: 邀请注册 + 邮件 + 公开注册页
  ↓
批次 4  P3 增值: 组织树/批量/通知/统计/自助中心
```

---

## 批次 0：环境与可行性验证

### 0.1 Logto Docker 环境

仓库根目录 `deployment/logto/docker-compose.yml`：

```yaml
services:
  logto-db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: logto
      POSTGRES_PASSWORD: logto
      POSTGRES_DB: logto
    volumes:
      - logto_db_data:/var/lib/postgresql/data

  logto:
    image: svhd/logto:latest
    depends_on: [logto-db]
    entrypoint: ["sh", "-c", "npm run cli db seed -- --dapc && npm start"]
    environment:
      TRUST_PROXY: "1"
      DB_URL: postgres://logto:logto@logto-db:5432/logto
      ENDPOINT: http://localhost:3003        # OIDC 核心（宿主 3003 → 容器 3001）
      ADMIN_ENDPOINT: http://localhost:3002   # 管理控制台
    ports:
      - "3003:3001"   # core（避开本平台后端 3001）
      - "3002:3002"   # admin console

volumes:
  logto_db_data:
```

### 0.2 首次配置（实测路径）

**POC 实测路径（零浏览器）**：seed 已内置 Management API 的 M2M 应用 `m-default`（位于 **admin 租户**），secret 可从数据库读取：

```bash
# secret（仅开发环境）
docker exec logto-logto-db-1 psql -U logto -d logto -t -A \
  -c "SELECT secret FROM applications WHERE id='m-default';"

# token 交换 —— 注意：必须走 admin 租户端点 :3002（不是 :3003）
curl -X POST http://localhost:3002/oidc/token \
  -d "grant_type=client_credentials&client_id=m-default&client_secret=<secret>&resource=https://default.logto.app/api&scope=all"
```

**生产路径**：运营方在 `http://localhost:3002` 注册 admin → 创建专用 M2M 应用 → 授予 Management API（资源 `https://default.logto.app/api`，权限 `all`）→ `App ID/Secret` 写入 `backend/.env`。（admin 控制台首次注册需浏览器；本环境 Playwright 因 Node 18 < 20 暂不可用，POC 用 m-default 绕过）

### 0.3 验证清单 V1-V5 — ✅ 全部通过（2026-09-19 执行）

| # | 验证项 | 结果 | 证据 |
|---|---|---|---|
| V1 | Management API 全链路 | ✅ 12 PASS | 建组织/建号(带密码)/入组/org 角色/授予/多归属查询（用户属 2 组织，各组织角色可见）；脚本 `poc-v1-v5.sh` 可复跑 |
| V5 | 邀请 3 步幂等 | ✅ 10 PASS | 重复 email 建号 → 422 拒绝（先查后建必需）；重复入组/授权 → 幂等；同 email 用户数恒为 1 |
| V2 | **组织 Token 强制（载荷假设）** | ✅ 11 PASS | 成员: refresh+organization_id → 200，token aud=`urn:logto:organization:{id}`；**移出后 → 403 "user is not a member of the organization"**；同 RT 纯 refresh 仍 200（证明 403 确系组织成员检查）；恢复入组后 → 200；脚本 `poc-v2-v4.sh` 可复跑 |
| V3 | OIDC 授权码流程 | ✅ | PKCE + 登录 + consent + code→token；id_token sub 正确 |
| V4 | SSO 会话共享 | ✅ | 已有会话发起新授权 → **直接 303 回调拿 code**（零重新登录、零重复 consent） |

### 0.4 实测发现（修正设计假设）

| # | 发现 | 影响 |
|---|------|------|
| F1 | **现有 `LogtoService` 静态 API key 假设错误**（实测确认）：Logto 要求 M2M client credentials 动态换 token（约 1h 过期） | LogtoAdapter 必须内置 token 管理器（获取/缓存/过期刷新） |
| F2 | **`offline_access` 需要 `prompt=consent`**：授权请求不带此参数时 scope 被静默丢弃，永远拿不到 refresh token（Logto SDK 内部自动携带） | 批次 1 认证模块的授权 URL 必须带 `prompt=consent` |
| F3 | **refresh token 每次轮换**：每次 refresh 授权返回新 RT，旧 RT 立即失效，必须保存响应中的新 RT | 会话管理设计需处理 RT 轮换链 |
| F4 | **组织 Token 的正确获取路径**：正常登录拿 RT → refresh 授权 + `organization_id` 参数 → 组织 Token（JWT，aud=`urn:logto:organization:{id}`）。**不是**在初始授权请求里带 organization_id（那只触发组织 consent，不直接产出组织 Token） | 批次 2 应用接入指引 + TenantContext 设计 |
| F5 | **m-default 位于 admin 租户**：token 交换必须走 `:3002/oidc/token`（admin 端点），Management API 调用走 `:3003/api`（default 租户） | LogtoAdapter 端点配置 |
| F6 | 本版本 interaction API：`PUT /api/interaction`（非 PATCH）、event 枚举 PascalCase（`SignIn`）、consent 走 `POST /api/interaction/consent` | 仅影响自动化测试（平台自身走标准 OIDC） |
| F7 | SPA 应用强制 PKCE；Traditional 应用创建时 `tokenEndpointAuthMethod:"none"` 被静默丢弃（产生"要认证却无密钥"的坏应用），且 `postLogoutRedirectUris` 必填 | 批次 2 应用接入的创建逻辑需规避 |
| F8 | Docker 部署：官方 compose 需 entrypoint 覆盖 `npm run cli db seed -- --dapc && npm start`（`--swo` 在此版本不存在；`--dapc` 避免离线环境 pwned-passwords 检查卡死首次 admin 创建） | 已落入 0.1 compose |
| F9 | 本机 Node 18.19.1 < 20：阻塞 Playwright MCP **且** backend 项目要求 Node ≥ 20 | 批次 1 前需升级 Node |

### 0.5 结论

**"租户 = Logto Organization + 软隔离 + 组织 Token 强制"架构全线验证通过**。产品核心承诺"没资格就不能用"由 IAM 在令牌签发层强制执行（403），接入系统零检查代码。批次 1 可直接在真环境上开发（Logto 已运行，测试数据就绪：组织 Acme/Beta、用户 alice@authlode.dev、org 角色 tenant-admin、测试应用 poc-spa-app）。

---

## 批次 1（P0）：地基 — Provider 抽象 + OIDC 认证 + Tenant 模型

### 1.1 IAM Provider 抽象层

**目录结构**：

```
backend/src/iam/
├── interfaces/
│   ├── iam-provider.interface.ts    # 契约（业务模块唯一依赖）
│   ├── iam-models.ts               # IamUser/IamOrganization/IamOrgRole/IamApplication...
│   └── iam-capabilities.ts          # 能力探测
├── logto-adapter/
│   ├── logto.adapter.ts            # 由 logto/logto.service.ts 改造
│   ├── logto-token.manager.ts      # M2M token 获取/缓存/刷新（0.4 修正）
│   └── logto.module.ts
├── iam.module.ts                   # 按 IAM_PROVIDER 提供注入
└── iam.config.ts                   # IAM_PROVIDER / endpoint / credentials
```

**IamProviderInterface 草案**（实现时定稿）：

```typescript
export const IAM_PROVIDER = Symbol('IAM_PROVIDER');

export interface IamProviderInterface {
  getCapabilities(): IamCapabilities;

  // ── 用户 ─────────────────────────────
  getUsers(query: IamUserQuery): Promise<IamPagedResult<IamUser>>;
  getUserById(userId: string): Promise<IamUser>;
  createUser(data: IamCreateUser): Promise<IamUser>;          // 含 password（邀请注册用）
  updateUser(userId: string, data: IamUpdateUser): Promise<IamUser>;
  deleteUser(userId: string): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;
  getUserOrganizations(userId: string): Promise<IamUserOrganization[]>;  // 多归属+各组织角色

  // ── 租户（Organization）──────────────
  createOrganization(data: IamCreateOrganization): Promise<IamOrganization>;
  getOrganization(orgId: string): Promise<IamOrganization>;
  updateOrganization(orgId: string, data: IamUpdateOrganization): Promise<IamOrganization>;
  deleteOrganization(orgId: string): Promise<void>;
  getOrganizationUsers(orgId: string, query: IamPageQuery): Promise<IamPagedResult<IamOrganizationUser>>;
  addOrganizationUsers(orgId: string, userIds: string[], organizationRoleIds?: string[]): Promise<void>;
  removeOrganizationUser(orgId: string, userId: string): Promise<void>;

  // ── 组织角色 ─────────────────────────
  getOrganizationRoles(): Promise<IamOrgRole[]>;
  createOrganizationRole(data: IamCreateOrgRole): Promise<IamOrgRole>;
  getUserOrganizationRoles(orgId: string, userId: string): Promise<IamOrgRole[]>;
  assignUserOrganizationRoles(orgId: string, userId: string, roleIds: string[]): Promise<void>;
  removeUserOrganizationRole(orgId: string, userId: string, roleId: string): Promise<void>;

  // ── 应用（系统接入）─────────────────
  getApplications(query: IamPageQuery): Promise<IamPagedResult<IamApplication>>;
  createApplication(data: IamCreateApplication): Promise<IamApplication>;
  updateApplication(appId: string, data: IamUpdateApplication): Promise<IamApplication>;
  deleteApplication(appId: string): Promise<void>;

  // ── OIDC 配置（认证模块消费）───────
  getOidcConfig(): { authorizationUrl: string; tokenUrl: string; jwksUri: string; clientId: string; clientSecret: string; };
}
```

**改造要点**：
- 现有 `LogtoService` 方法签名基本可平移为 Adapter 实现；新增缺口方法（getUserOrganizations / org roles / token manager）
- 业务模块（users/organizations/roles/applications controllers）改注入 `IAM_PROVIDER` token
- `IAM_PROVIDER=logto`（.env），后续 keycloak/authentik 各加一个 adapter 目录

### 1.2 Tenant 模型与 tenantId 迁移

**Prisma schema 变更**：

```prisma
model Tenant {
  id        String   @id                    // = Logto Organization ID
  name      String
  status    String   @default("ACTIVE")     // ACTIVE / SUSPENDED
  settings  String?                          // JSON：租户级配置
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("tenants")
}
```

- 既有 6 模型（UserInvitation/AuditLog/UserExtend/BatchOperation/UserNotification/StatisticsCache）**全部加** `tenantId String` + `@@index([tenantId])`
- `BaseRepository` 增加租户过滤钩子：所有查询强制 `where: { tenantId }`
- 迁移策略：新迁移文件，SQLite dev 库直接重建（无生产数据）

### 1.3 OIDC 认证（平台自身作为 client）

**时序**：

```
浏览器 → GET /api/auth/login?tenant=<orgId>
       ← 302 Logto /oidc/auth?client_id&redirect_uri=/api/auth/callback&scope=openid profile email offline_access&state&code_challenge
浏览器 → Logto 登录页（输入凭证）
       ← 302 /api/auth/callback?code&state
后端   → POST /oidc/token（code + code_verifier）→ id_token/access_token/refresh_token
后端   → 验证 id_token（JWKS）→ 建立会话（httpOnly cookie）
       ← 302 前端 /
每请求 → AuthGuard（会话）→ TenantContext（用户组织列表 → 当前租户 → JIT Tenant 记录）
```

> **批次 0 实测校准（见 0.4 发现 F2-F5）**：
> - 授权 URL 必须带 **`prompt=consent`**，否则 `offline_access` 被静默丢弃（拿不到 refresh token）
> - **refresh token 每次使用后轮换**——会话管理必须保存每次响应中的新 RT
> - TenantContext 组织数据源：`GET /api/users/{id}/organizations`（经 Provider，含各组织 org 角色）
> - 组织 Token（批次 2 应用接入用）：**refresh 授权 + `organization_id` 参数**获取，不是初始授权请求带 organization_id

**新增模块**：

| 文件 | 职责 |
|---|---|
| `src/auth/auth.module.ts` | 认证模块 |
| `src/auth/auth.controller.ts` | /api/auth/login · /api/auth/callback · /api/auth/logout · /api/auth/me |
| `src/auth/session.guard.ts` | 会话校验（全 API 默认启用，白名单：登录/回调/公开注册） |
| `src/auth/tenant-context.middleware.ts` | 解析当前租户（header `x-tenant-id` 或 query），校验成员关系，JIT 创建 Tenant |
| `src/auth/tenant-admin.guard.ts` | 管理操作守卫（org role = tenant-admin） |
| `src/auth/break-glass.ts` | 本地应急管理员（env 配置，仅 IAM 故障时） |

**验收标准（批次 1）**：
1. 未登录访问任何业务 API → 401
2. OIDC 登录 → 会话建立 → `/api/auth/me` 返回身份 + 所属组织 + 各组织角色
3. 带 `x-tenant-id` 请求 → TenantContext 生效；首次访问自动创建 Tenant 记录（JIT）
4. 非成员传他人 tenantId → 403
5. 既有 55+ 单元测试不回归；新增 auth/tenant 测试

### 1.4 前置技术债（批次 1 开工前）

- **Prisma Client 重新生成**（Linux 环境直接 `prisma generate`，删除手写 `prisma-types.ts` 存根方案）

---

## 批次 2（P1）：核心价值 — 用户租户化 + SSO 应用接入 + 前端接真

### 2.1 用户管理租户化

- `users.controller` 查询改走 `getOrganizationUsers(tenantId)`（org 作用域），不再全实例查询
- 用户详情合并 UserExtend（带 tenantId 过滤）
- 创建用户 = Provider 建号 + 入当前租户（3 步调用，幂等：先查 email）

### 2.2 SSO 应用接入（G5 核心）

**新模型**：

```prisma
model TenantApplication {
  id            String   @id @default(cuid())
  tenantId      String                              // 所属系统
  applicationId String                              // Logto Application ID
  accessPolicy  String   @default("MEMBERS")       // MEMBERS / ROLES / CUSTOM
  enabled       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@unique([tenantId, applicationId])
  @@map("tenant_applications")
}
```

**接入流程（系统管理员视角）**：
1. 平台"应用接入"页 → 填应用名/回调 URI → 后端经 Provider 在 Logto 创建 Application（type=Traditional）
2. 平台展示 client_id / secret / OIDC 端点（issuer/authorize/token/JWKS）+ **组织 Token 接入指引**（默认约定：授权请求带 `organization_id`）
3. 写入 TenantApplication 映射
4. 用户访问该应用 → Logto 强制组织成员关系（V2 验证的机制）

### 2.3 前端接真 + 租户切换器

- 8 页面去 mock：全部改 `$fetch('/api/...')`，错误处理 + loading 态
- AppHeader 加**租户切换器**（/api/auth/me 的组织列表，多租户时显示）
- 新增登录跳转逻辑（401 → /auth/login）

**验收标准（批次 2）**：
1. 端到端演示主线：登录 → 管用户 → 接入应用 → 拿到 client 配置
2. A 系统管理员看不到 B 系统用户（隔离验证）
3. 同一用户切换租户，数据视图随租户变化

---

## 批次 3（P2）：自管理闭环 — 邀请注册 + 邮件 + 公开注册页

### 3.1 邀请双语义流程（幂等设计）

```
管理员创建邀请（email+角色）→ 邮件链接 /register?token=xxx
  → 公开页（免登录）验证 token（未过期/未接受）
  → 提交（email 匹配）:
      ① 先查用户是否存在（Provider getUserByEmail）
      ② 不存在 → createUser(password) → 入组 → 授角色
      ③ 已存在 → 直接入组 → 授角色（复用账号）
  → 更新邀请状态 ACCEPTED（事务性：状态更新失败则补偿回滚入组？→ 记录+重试）
```

- 幂等锚点：email 查重（不重复建号）+ 入组幂等（Logto addOrganizationUsers 对已有成员幂等，V5 验证）
- `UserInvitation` 加 tenantId；新增 `acceptedUserId`

### 3.2 邮件服务

- SMTP 发送（`mail.config.ts` DTO 已有）；开发环境用 MailHog（docker compose 加一个服务）
- 邮件模板：邀请邮件（链接 + 有效期 + 系统名）

### 3.3 公开注册页

- 前端独立路由 `/register`（不走管理台布局，免登录）
- Token 校验 API：`POST /api/public/invitation/verify`、`POST /api/public/invitation/accept`

**验收标准（批次 3）**：
1. 新 email 邀请 → 注册 → 建号入组授权 → 能登录平台且只见该租户
2. 已有 email 邀请 → 登录后直接入组（不重复建号）
3. 过期/已用 token → 拒绝
4. 全流程重放（网络重试）不产生脏数据

---

## 批次 4（P3）：增值

| 模块 | 要点 |
|---|---|
| 租户内组织树 | TenantOrganization 模型（parentId 自关联）+ 树查询 |
| 批量操作 | CSV 导入用户（复用邀请 3 步幂等逻辑） |
| 通知/统计/设置租户化 | 加 tenantId + 按租户过滤 |
| **自助中心**（路线图内） | /me 页面：改密/改资料/我的系统/我的应用 |
| 可选：企业 SSO 入站 / 组织 Token 指引增强 | 见总纲 T1 |

---

## 任务级执行计划（前端 / 后端分工）

> 2026-09-19 补齐。任务编号规则：`B`=后端、`F`=前端；编号即建议执行顺序（同批次内）。依赖关系见末尾并行策略。

### 后端部分（Backend）

#### B0 前置（0.5 天，阻塞全部）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| B0.1 | Node ≥ 20 升级 | 环境就绪 | `node -v` ≥ 20；backend `npm install` + 测试可跑 |
| B0.2 | Prisma Client 重新生成 | 移除 `prisma-types.ts` 存根方案 | `prisma generate` 成功；类型来自真实 client |
| B0.3 | `.env` 更新 | M2M 凭据（m-default）+ `IAM_PROVIDER=logto` | POC 脚本思路的后端版冒烟通过 |

#### B1 地基（3-5 天）— Provider + 认证 + Tenant

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| B1.1 | IAM 接口定稿 | `src/iam/interfaces/`（interface + models + capabilities） | 编译通过 + 单测 |
| B1.2 | LogtoAdapter + TokenManager | `src/iam/logto-adapter/`（LogtoService 平移 + M2M token 交换/缓存/刷新，F1/F5） | 对真实 Logto 冒烟：建组织/建号/查组织列表 |
| B1.3 | 业务模块切换注入 | users/orgs/roles/applications controllers 改注入 `IAM_PROVIDER` | 既有 API 行为不变 |
| B1.4 | Tenant 模型 + tenantId 迁移 | schema（Tenant + 6 模型加 tenantId）+ 迁移 + BaseRepository 租户过滤钩子 | 迁移成功；Repository 查询强制带 tenantId |
| B1.5 | OIDC 认证模块 | `src/auth/`：login（302 授权码+PKCE+**prompt=consent**）/callback（JWKS 验证+会话）/logout/me | 浏览器完整登录闭环；未登录 API → 401 |
| B1.6 | TenantContext + 守卫 | 中间件（组织列表→当前租户→**JIT Tenant**）+ SessionGuard + TenantAdminGuard | `/api/auth/me` 返回身份+组织+角色；跨租户访问 → 403 |
| B1.7 | 测试补齐 | auth/tenant 单测 + 全量回归 | 新增测试通过；既有 55+ 不回归 |

#### B2 核心（3-4 天）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| B2.1 | 用户管理租户化 | users API 走 `getOrganizationUsers(tenantId)`；详情合并 UserExtend | A 租户看不到 B 租户用户 |
| B2.2 | 应用接入 API | TenantApplication 模型 + 接入/列表/启停 + client 配置下发（规避 F7：SPA 类型或正确 secret 处理） | 经平台建应用 → 拿到 client_id/端点 |
| B2.3 | 组织树 API | TenantOrganization（parentId）+ 树查询 | 层级正确 |
| B2.4 | 审计接认证上下文 | 真实 userId/tenantId 落库 | 操作后审计可查 |

#### B3 自管理闭环（2-3 天）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| B3.1 | 邀请双语义 API | 创建邀请（token）+ 公开验证 + accept（先查后建幂等） | 新 email 建号入组；已有 email 直接入组；重放无脏数据 |
| B3.2 | 邮件服务 | SMTP 发送 + 邀请模板（mail.config DTO 已有） | 邀请邮件可达（MailHog 开发验证） |
| B3.3 | 设置租户化 | 租户级设置存取 | 隔离验证 |

#### B4 增值（3 天）

| # | 任务 | 交付物 |
|---|------|--------|
| B4.1 | 批量操作 | CSV 导入（复用 B3.1 幂等逻辑） |
| B4.2 | 通知 API | UserNotification 激活 |
| B4.3 | 统计租户化 | 按租户过滤 + 会话数据 |

### 前端部分（Frontend）

#### F0 前置设计（1-2 天，可与 B0/B1 并行）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| F0.1 | UI 规格补齐：公开注册页布局 | 独立无侧边栏布局 spec（DESIGN-SYSTEM 增补章节） | 过设计系统检查清单 |
| F0.2 | UI 规格补齐：租户切换器 | AppHeader 内组件 spec | 同上 |
| F0.3 | 组件化策略 | 从 8 页面抽取共享组件清单（表格/卡片/表单/按钮/弹窗）+ 命名 | 清单评审通过 |
| F0.4 | 清理实验文件 | 删除 design-*.vue / test.vue / *.bak | pages/ 只剩业务页面 |

#### F1 认证接入（1-2 天，依赖 B1.5）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| F1.1 | 登录流程 | 登录跳转 + 回调处理 + 401 全局拦截 | 未登录访问 → 跳登录；登录后回原页 |
| F1.2 | auth store | Pinia：/api/auth/me → 用户/组织列表/当前租户 | 多租户用户数据正确 |

#### F2 接真 + 核心界面（4-5 天，依赖 B1 全部 + B2.1/B2.2）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| F2.1 | API 客户端基建 | $fetch 封装（错误/loading/类型） | — |
| F2.2 | 共享组件库 | F0.3 清单落地（按设计系统） | 组件复用，页面瘦身 |
| F2.3 | 8 页面去 mock | users/orgs/roles/apps/invitations/audit-logs/settings/statistics 全接真 | 端到端演示主线：登录→管用户→接应用 |
| F2.4 | 租户切换器 | AppHeader 集成 | 切换租户数据视图随变 |
| F2.5 | 应用接入页 | 接入向导 + client 配置展示 + 组织 Token 接入指引 | 新页面交付 |

#### F3 公开页（1-2 天，依赖 B3）

| # | 任务 | 交付物 | 验收 |
|---|------|--------|------|
| F3.1 | 公开注册页 | 独立布局 + token 验证 + 双语义表单 | 免登录完成注册/入组 |

#### F4 增值（2-3 天，依赖 B4）

| # | 任务 | 交付物 |
|---|------|--------|
| F4.1 | 自助中心 /me | 改密/资料/我的系统/我的应用 |
| F4.2 | 组织树 UI | 树形组件 |
| F4.3 | 批量/通知/统计接真 | 对应页面 |

### 并行策略与总工期

```
后端线:  B0(0.5d) → B1(4d) → B2(3.5d) → B3(2.5d) → B4(3d)          ≈ 13.5 天
前端线:     F0(1.5d, 与B1并行) → [等B1.5] → F1(1.5d) → F2(4.5d) → F3(1.5d) → F4(2.5d)  ≈ 11.5 天
                                    ↑ F2 还需 B2.1/B2.2
双线并行总工期 ≈ 3 周（单人串行 ≈ 4-5 周）
```

**关键依赖**：F1 等 B1.5（auth API）；F2 等 B1 全部 + B2.1/B2.2；F3 等 B3；F4 等 B4。F0 无依赖可立即开始。

---

## 风险与回退

| 风险 | 缓解 |
|---|---|
| V2 组织 Token 强制不成立 | 退回执行点 B（平台鉴权 API）——总纲 3.3.2 已备案 |
| Logto OSS 与 Cloud 文档偏差 | 以实例 `/api/swagger.json` 为准（调研已注明） |
| 前端 8 页面重写量大 | 批次 2 拆两半：先 users+organizations 打样，再复制模式 |

---

**文档版本**: v1.2
**最后更新**: 2026-09-19（补齐任务级执行计划——前端/后端分工，双线并行总工期约 3 周）
**状态**: 批次 0 ✅ 完成 → 实施就绪（前置：Node ≥ 20 升级，即任务 B0.1）
