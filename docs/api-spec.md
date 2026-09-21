# API 规格说明书

> **版本**: v1.0（2026-09-19）
> **认证方式**: httpOnly cookie `auth_session`（JWT，7 天有效期）
> **租户上下文**: 请求头 `x-tenant-id: <Organization ID>`（管理操作必须携带）

---

## 认证端点

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/api/auth/login` | ❌ | 发起 OIDC 登录（302 → Logto 授权页） |
| GET | `/api/auth/callback` | ❌ | OIDC 回调（code 换 token → 签发会话） |
| GET | `/api/auth/me` | ✅ | 当前身份 + 所属组织 + 各组织角色 |
| GET | `/api/auth/logout` | ❌ | 登出（清会话 + Logto end_session） |
| POST | `/api/auth/change-password` | ✅ | 修改密码 |

### GET /api/auth/me

**响应示例**:
```json
{
  "id": "48mk61ngajpl",
  "username": "alice",
  "primaryEmail": "alice@authlode.dev",
  "name": "Alice",
  "organizations": [
    { "id": "sh8ftxnr0gs3", "name": "Acme", "roles": ["tenant-admin"] },
    { "id": "ppxseon22r2s", "name": "Beta", "roles": [] }
  ]
}
```

### POST /api/auth/change-password

**请求**: `{ "newPassword": "string (min 8)" }`
**响应**: `{ "success": true }`

---

## 用户管理（租户作用域）

| 方法 | 路径 | 认证 | 租户上下文 | 描述 |
|------|------|------|-----------|------|
| GET | `/api/users` | ✅ | ✅ | 组织成员列表（分页+搜索） |
| GET | `/api/users/:id` | ✅ | ✅ | 用户详情 |
| POST | `/api/users` | ✅ | ✅ | 创建用户（自动入租户） |
| PATCH | `/api/users/:id` | ✅ | ✅ | 更新用户 |
| DELETE | `/api/users/:id` | ✅ | ✅ | 删除用户 |

### GET /api/users

**查询参数**: `search`, `page`, `pageSize`
**响应**: `{ "data": [{ "id", "username", "primaryEmail", "name", "joinedAt" }], "totalCount": number }`

### POST /api/users

**请求**: `{ "primaryEmail": "user@example.com", "password": "min8chars", "name": "姓名", "username": "可选" }`
**响应**: IamUser 对象（创建后自动加入当前租户）

---

## 应用接入（TenantApplication）

| 方法 | 路径 | 认证 | 租户上下文 | 管理员 | 描述 |
|------|------|------|-----------|--------|------|
| GET | `/api/tenant-applications` | ✅ | ✅ | ✅ | 租户已接入应用列表 |
| POST | `/api/tenant-applications` | ✅ | ✅ | ✅ | 接入新应用（创建 IAM Application + 映射） |
| PATCH | `/api/tenant-applications/:id` | ✅ | ✅ | ✅ | 更新启停/访问策略 |
| DELETE | `/api/tenant-applications/:id` | ✅ | ✅ | ✅ | 移除映射（不删 IAM 应用） |

### GET /api/tenant-applications

**响应**:
```json
{
  "data": [{
    "id": "mapping-id",
    "applicationId": "logto-app-id",
    "name": "应用名",
    "type": "spa",
    "enabled": true,
    "accessPolicy": "MEMBERS",
    "redirectUris": ["https://app.example.com/callback"],
    "secret": null,
    "endpoints": {
      "issuer": "http://localhost:3003/oidc",
      "authorizationUrl": "http://localhost:3003/oidc/auth",
      "tokenUrl": "http://localhost:3003/oidc/token",
      "jwksUri": "http://localhost:3003/oidc/jwks",
      "userinfoUrl": "http://localhost:3003/oidc/me",
      "endSessionUrl": "http://localhost:3003/oidc/session/end"
    }
  }],
  "totalCount": 1
}
```

### POST /api/tenant-applications

**请求**: `{ "name": "应用名", "description": "可选", "type": "spa|traditional", "redirectUris": ["https://..."] }`
**响应**: 同 GET 单项 + `endpoints`

---

## 组织树（TenantOrganization）

| 方法 | 路径 | 认证 | 租户上下文 | 管理员 |
|------|------|------|-----------|--------|
| GET | `/api/tenant-organizations` | ✅ | ✅ | ❌ |
| POST | `/api/tenant-organizations` | ✅ | ✅ | ✅ |
| PATCH | `/api/tenant-organizations/:id` | ✅ | ✅ | ✅ |
| DELETE | `/api/tenant-organizations/:id` | ✅ | ✅ | ✅ |

**GET 响应**: `{ "data": [{ "id", "name", "description", "parentId" }], "totalCount" }`
**POST 请求**: `{ "name": "技术部", "description": "可选", "parentId": "父节点ID或null" }`

---

## 角色权限（实例级 IAM 角色）

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/api/roles` | ✅ | 角色列表 |
| GET | `/api/roles/:id` | ✅ | 角色详情 |
| POST | `/api/roles` | ✅ | 创建角色 |
| PATCH | `/api/roles/:id` | ✅ | 更新角色 |
| DELETE | `/api/roles/:id` | ✅ | 删除角色 |

**GET 响应**: `{ "data": [{ "id", "name", "description", "type" }], "totalCount" }`

---

## 邀请系统

| 方法 | 路径 | 认证 | 租户上下文 | 管理员 | 描述 |
|------|------|------|-----------|--------|------|
| GET | `/api/invitations` | ✅ | ✅ | ❌ | 邀请列表 |
| POST | `/api/invitations` | ✅ | ✅ | ✅ | 创建邀请 |
| PATCH | `/api/invitations/:id/cancel` | ✅ | ✅ | ✅ | 取消邀请 |
| POST | `/api/public/invitations/verify` | ❌ | ❌ | — | 验证邀请 token |
| POST | `/api/public/invitations/accept` | ❌ | ❌ | — | 接受邀请（注册/入组） |

### POST /api/invitations

**请求**: `{ "email": "user@example.com", "roleIds": ["可选"], "message": "可选" }`
**响应**: `{ "id", "email", "status": "PENDING", "expiresAt", "link": "http://frontend/register?token=..." }`

### POST /api/public/invitations/verify

**请求**: `{ "token": "xxx" }`
**响应**: `{ "email", "organizationName", "expiresAt" }`

### POST /api/public/invitations/accept

**请求**: `{ "token": "xxx", "password": "min8chars", "name": "可选" }`
**响应**: `{ "success": true, "mode": "created|joined|already-accepted", "userId": "..." }`

---

## 统计

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/api/statistics/overview` | ✅ | 总览 |
| GET | `/api/statistics/growth` | ✅ | 用户增长（30 天） |
| GET | `/api/statistics/activity` | ✅ | 活动分布 |

---

## 设置

| 方法 | 路径 | 认证 | 描述 |
|------|------|------|------|
| GET | `/api/settings` | ✅ | 环境配置 + 租户设置 |
| PATCH | `/api/settings` | ✅ | 更新租户设置 |

---

## 错误码

| HTTP | 含义 |
|------|------|
| 400 | 参数错误 / 邀请无效 |
| 401 | 未认证 |
| 403 | 无权限（非管理员/非成员/无租户上下文） |
| 404 | 资源不存在 |
| 422 | 业务规则冲突（如 email 已存在） |
| 500 | 服务器内部错误 |
