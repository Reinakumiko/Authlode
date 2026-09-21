# 测试用例文档

> **版本**: v1.0（2026-09-19）
> **测试环境**: Logto Docker + NestJS 后端 + SQLite dev.db + Nuxt 前端
> **测试用户**: alice@authlode.dev（Acme tenant-admin, Beta member）

---

## 一、单元测试（Jest，83/83 全绿）

### 已覆盖模块

| 模块 | 测试文件 | 用例数 | 覆盖范围 |
|---|---|---|---|
| UsersController | users.controller.spec.ts | 7 | 租户作用域列表、无上下文 403、创建+入租户、详情/更新/删除、异常处理 |
| OrganizationsController | organizations.controller.spec.ts | 13 | CRUD + 分页/搜索 + 异常处理 |
| RolesController | roles.controller.spec.ts | 13 | CRUD + 异常处理 |
| ApplicationsController | applications.controller.spec.ts | 11 | CRUD + 异常处理 |
| SettingsController | settings.controller.spec.ts | 12 | 配置读取 |
| AuthController | auth.controller.spec.ts | 11 | login 重定向、callback 全流程、me 身份+组织、logout、change-password、401 场景 |
| SessionGuard | guards.spec.ts | 3 | 白名单放行、无会话 401、有效会话附加 |
| TenantAdminGuard | guards.spec.ts | 3 | 无上下文 403、无角色 403、有角色放行 |
| TenantContextMiddleware | tenant-context.middleware.spec.ts | 6 | 无会话放行、默认首组织、x-tenant-id 切换、非成员 403、无组织放行、IAM 故障降级 |
| InvitationsService | invitations.service.spec.ts | 1 | 模块定义 |
| AuditLogsService | audit-logs.service.spec.ts | 1 | 模块定义 |
| AppController | app.controller.spec.ts | 1 | 模块定义 |
| LogtoAdapter（集成） | logto.adapter.integ.spec.ts | 5 | M2M token、邮箱精确查、多归属+角色、组织角色列表、OIDC 端点 |

---

## 二、集成测试（E2E，对真实 Logto）

### 已通过的 E2E 验证（批次 0 + 批次 1 验收）

| # | 场景 | 验证方法 | 结果 |
|---|---|---|---|
| E2E-1 | Management API 全链路 | poc-v1-v5.sh | ✅ 12 PASS |
| E2E-2 | 邀请 3 步幂等 | poc-v1-v5.sh（重跑） | ✅ 10 PASS |
| E2E-3 | 组织 Token 强制 | poc-v2-v4.sh | ✅ 11 PASS |
| E2E-4 | OIDC 授权码流程 | poc-v2-v4.sh | ✅ |
| E2E-5 | SSO 会话共享 | poc-v2-v4.sh | ✅ |

### 批次 1 验收测试（浏览器模拟，curl + cookie jar）

| # | 场景 | 步骤 | 预期结果 | 结果 |
|---|---|---|---|---|
| B1-1 | 未登录访问业务 API | GET /api/users（无 cookie） | 401 | ✅ |
| B1-2 | 完整登录 → me 返回身份+组织+角色 | login → Logto → callback → me | 身份 + 2 组织 + 各组织角色 | ✅ |
| B1-3 | 带会话访问业务 API | GET /api/users（带 cookie） | 200 + 租户作用域数据 | ✅ |
| B1-4 | 非成员 x-tenant-id → 403 | GET /api/users + x-tenant-id: Gamma | 403 "Not a member" | ✅ |
| B1-5 | 成员组织切换 | GET /api/users + x-tenant-id: Beta | 200 | ✅ |
| B1-6 | 组织 Token 强制 | 移出组织后 refresh+org → 403 | "user is not a member" | ✅ |
| B1-7 | JIT Tenant 创建 | 首登后查 dev.db tenants 表 | 记录自动创建 | ✅ |

### 批次 2 验收测试（经前端代理的完整链路）

| # | 场景 | 步骤 | 预期结果 | 结果 |
|---|---|---|---|---|
| B2-1 | 经前端代理登录 | GET :3000/api/auth/login → Logto → callback | auth_session cookie | ✅ |
| B2-2 | 经代理获取身份 | GET :3000/api/auth/me（带 session） | 身份 + 组织 + 角色 | ✅ |
| B2-3 | 经代理获取用户列表 | GET :3000/api/users（带 session） | 200 + 租户数据 | ✅ |
| B2-4 | 经代理租户切换 | GET :3000/api/users + x-tenant-id: Beta | 200 | ✅ |
| B2-5 | 经代理非成员 403 | GET :3000/api/users + x-tenant-id: Gamma | 403 | ✅ |
| B2-6 | 经代理管理员访问 | GET :3000/api/tenant-applications + x-tenant-id: Acme | 200 | ✅ |
| B2-7 | 经代理非管理员 403 | GET :3000/api/tenant-applications + x-tenant-id: Beta | 403 | ✅ |
| B2-8 | 经代理邀请列表 | GET :3000/api/invitations | 200 | ✅ |
| B2-9 | 经代理统计 | GET :3000/api/statistics/overview | 200 + 数据 | ✅ |

---

## 三、手动测试用例（浏览器）

### TC-01: 登录流程
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | 打开 http://localhost:3000 | 跳转到 /login 页 |
| 2 | 点击"使用账号登录" | 跳转到 Logto 登录页 |
| 3 | 输入 alice 密码并提交 | 回调 → 302 → Dashboard |
| 4 | 侧边栏显示用户名"alice"和租户"Acme"或"Beta" | ✓ |

### TC-02: 用户管理
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | 点击"用户管理" | 显示当前租户的用户列表 |
| 2 | 搜索框输入关键词 | 400ms 后自动搜索 |
| 3 | 点击"创建用户" | 弹出创建表单 |
| 4 | 填写 email + password + name → 提交 | 用户出现在列表 |
| 5 | 点击编辑图标 | 弹出编辑表单（姓名 + 状态开关） |
| 6 | 修改姓名 → 保存 | 列表刷新显示新姓名 |
| 7 | 点击删除 → 确认 | 用户从列表消失 |

### TC-03: SSO 应用接入
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | 点击"应用接入" | 显示已接入应用列表 |
| 2 | 点击"接入应用" | 弹出向导步骤 1（填写信息） |
| 3 | 填写名称 + 选择类型 + 填写回调地址 → 提交 | 进入步骤 2（OIDC 配置展示） |
| 4 | 查看配置并复制 Client ID | 复制成功 |
| 5 | 点击"完成" | 回到列表，新应用可见 |
| 6 | 点击 Toggle 启停 | 状态切换 |
| 7 | 切换到 Beta 租户 | 应用列表为空（租户隔离）|

### TC-04: 邀请注册完整流程
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | 点击"邀请管理" → "发送邀请" | 弹出发送表单 |
| 2 | 输入新用户邮箱 → 提交 | 显示邀请链接（可复制）|
| 3 | 复制链接，在隐身窗口打开 | 显示公开注册页（邮箱 + 组织名）|
| 4 | 设置密码 → 提交 | "账号创建成功！" |
| 5 | 用新密码登录 | 成功进入 Dashboard |
| 6 | 验证新用户只看到邀请方租户的数据 | 租户隔离生效 |
| 7 | 已有用户邮箱再邀请 → 隐身窗口打开 → 直接登录 | "已加入组织"（复用账号）|

### TC-05: 租户切换
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | 侧边栏底部点击当前租户名 | 展开切换菜单 |
| 2 | 选择另一个组织 | 页面刷新，数据切换 |
| 3 | 验证用户列表只显示新租户的成员 | 隔离确认 |

### TC-06: 修改密码
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | 侧边栏 → 个人中心 | 显示 /me 页面 |
| 2 | 输入新密码（≥8位）+ 确认 → 提交 | "密码修改成功" |
| 3 | 登出 → 用新密码登录 | 成功 |

### TC-07: 权限边界
| 步骤 | 操作 | 预期 |
|---|---|---|
| 1 | alice 切换到 Beta（非管理员）| 侧边栏角色显示"成员" |
| 2 | 尝试访问应用接入 | 403 "Tenant admin role required" |
| 3 | 切换回 Acme（管理员） | 应用接入可用 |

---

## 四、通过标准

- **单元测试**: 100% 通过（当前 83/83）
- **集成测试**: 全部 E2E 场景通过（当前 12/12）
- **手动测试**: 上述 TC-01 至 TC-07 全部通过
- **回归**: 任何代码变更后运行 `npx jest --silent` 确认 0 失败

---

**文档版本**: v1.0
**最后更新**: 2026-09-19
