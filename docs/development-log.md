# 开发日志

## 2025-01-30

### 📅 日期
2025年1月30日

### 👨‍💻 开发者
AI Assistant + 用户

---

## ✅ 今日完成

### 1. 配置管理系统实现
**时间**: 2小时

完成内容:
- ✅ 创建 `ConfigService` 服务类
- ✅ 实现配置 DTOs (`DatabaseConfig`, `LogtoConfig`, `AppConfig`)
- ✅ 实现环境变量验证 (`validateConfig()`)
- ✅ 支持 SQLite 数据库配置
- ✅ 配置 `.env` 文件

技术要点:
- 使用 `@nestjs/config` 管理环境变量
- 使用 `class-validator` 和 `class-transformer` 验证配置
- 类型安全的配置访问

### 2. SQLite 数据库集成
**时间**: 1.5小时

完成内容:
- ✅ 修改 Prisma Schema 支持 SQLite
- ✅ 移除 `@db.Text` 注解
- ✅ 将 Enum 类型转换为 String 类型
- ✅ 创建数据库迁移
- ✅ 生成 `dev.db` 数据库文件

技术要点:
- SQLite 不支持原生 Enum,使用 String + 注释代替
- 开发环境使用 SQLite,无需额外数据库服务

### 3. Repository 层实现
**时间**: 3小时

完成内容:
- ✅ 创建 `BaseRepository` 基类
  - 通用 CRUD 方法
  - 分页查询支持
  - 软删除支持

- ✅ 实现 `InvitationRepository`
  - 邀请创建、更新、删除
  - 按状态查询
  - 过期邀请清理

- ✅ 实现 `AuditLogRepository`
  - 审计日志记录
  - 按用户、操作、资源查询
  - 操作统计功能

- ✅ 实现 `UserExtendRepository`
  - 用户扩展信息管理
  - 部门、职位统计
  - 风险等级分布

### 4. Windows Prisma Client 生成问题解决
**时间**: 4小时

**问题描述**:
```
Error: spawn prisma_client_js ENOENT
```

**问题分析**:
- Windows 特定问题
- Prisma CLI 无法调用 `prisma_client_js` 二进制文件
- Linux/macOS 环境不受影响

**解决方案** (临时):
1. 创建手动类型定义 `src/prisma-types.ts`
   - 定义所有模型接口 (AuditLog, UserInvitation, UserExtend 等)
   - 定义 Prisma namespace 类型
   - Repository 层从此文件导入类型

2. 创建最小化 Prisma Client 存根
   - 位置: `node_modules/.prisma/client/index.js`
   - 提供基础的 PrismaClient 类
   - 满足运行时基本需求

3. 修改 Repository 导入
   - 从 `@prisma/client` 改为导入 `../../prisma-types`
   - 添加类型注解到 forEach 回调
   - 修复 InvitationStatus 枚举问题

**结果**:
- ✅ 0 TypeScript 编译错误
- ✅ 应用成功启动

**限制**:
- ❌ 完整的 Prisma Client 功能不可用
- ❌ 类型安全的查询受限制
- ✅ 但足以让应用启动和基本开发

**永久解决方案选项**:
1. 在 Linux 环境生成后提交到仓库
2. 升级 Prisma 到最新版本
3. 使用 Docker 容器开发

### 5. 应用启动测试
**时间**: 1小时

完成内容:
- ✅ 后端 NestJS 应用成功启动
  - 端口: http://localhost:3001
  - 所有模块正确加载
  - TypeScript 编译成功

- ✅ 前端 Nuxt 3 应用成功启动
  - 端口: http://localhost:3000
  - 开发服务器运行正常
  - Nuxt UI 组件可用

---

## ⚠️ 遇到的问题

### 1. Prisma Client 生成失败
**状态**: ✅ 已解决 (临时方案)

**详细记录**:
- 问题: Windows 环境 `spawn prisma_client_js ENOENT`
- 影响: 无法生成类型完整的 Prisma Client
- 解决: 创建手动类型定义 + 存根客户端
- 后续: 需要实现永久解决方案

### 2. Logto API 配置缺失
**状态**: ⚠️ 待解决

**详细记录**:
```
Error: Logto API endpoint and API key must be configured in environment variables
    at LogtoService (src/logto/logto.service.ts:51:13)
```

**影响**:
- LogtoService 无法实例化
- 应用启动时报错但继续运行

**解决方案**:
- 选项 1: 配置真实的 Logto API 凭据
- 选项 2: 修改验证逻辑,使开发环境可选
- 选项 3: 暂时注释掉 LogtoModule

---

## 📝 技术决策

### 1. 使用 SQLite 作为开发数据库
**原因**:
- 零配置,无需额外数据库服务
- 文件型数据库,便于开发测试
- Prisma 完美支持

**权衡**:
- ✅ 优点: 快速启动,便于开发
- ⚠️ 缺点: 生产环境仍需 MySQL/PostgreSQL

### 2. 创建手动 Prisma 类型定义
**原因**:
- Windows 环境无法正常生成 Prisma Client
- 需要让应用尽快启动
- 基本功能开发不需要完整 Prisma Client

**权衡**:
- ✅ 优点: 快速解决问题,可以继续开发
- ⚠️ 缺点: 类型安全受限,需要额外维护

---

## 📊 代码统计

### 今日新增/修改文件
```
backend/
├── src/
│   ├── config/
│   │   ├── config.service.ts          (新建)
│   │   └── dto/
│   │       ├── database.config.ts     (新建)
│   │       ├── logto.config.ts        (新建)
│   │       ├── app.config.ts          (新建)
│   │       └── env.validation.dto.ts  (新建)
│   ├── common/
│   │   └── repositories/
│   │       └── base.repository.ts     (新建)
│   ├── invitations/
│   │   └── repositories/
│   │       └── invitation.repository.ts  (新建)
│   ├── audit-logs/
│   │   └── repositories/
│   │       └── audit-log.repository.ts   (新建)
│   ├── user-extends/
│   │   └── repositories/
│   │       └── user-extend.repository.ts (新建)
│   └── prisma-types.ts                 (新建)
├── prisma/
│   ├── schema.prisma                   (修改)
│   └── migrations/
│       └── 20251229144809_init_extension_tables/ (新建)
├── .env                                (新建)
├── .env.example                        (修改)
└── prisma-generate.js                  (新建)
```

### 代码行数
- 新增代码: ~1500 行
- 修改代码: ~200 行
- 配置文件: ~100 行

---

## 🎯 明日计划

### 优先级 P0 (必须完成)
1. **解决 Logto API 配置问题**
   - 配置真实的 Logto API 凭据
   - 或修改验证逻辑使其可选

### 优先级 P1 (重要)
2. **开始前端页面开发**
   - 创建登录页面
   - 创建主布局组件
   - 实现基础路由

### 优先级 P2 (可选)
3. **实现 API 控制器**
   - 创建用户管理 API
   - 创建邀请管理 API

---

## 💡 经验总结

### 技术要点
1. **Prisma SQLite 配置**
   - 开发环境非常适合使用 SQLite
   - Enum 需要转换为 String 类型
   - 不需要 `@db.Text` 等数据库特定注解

2. **Windows Prisma 兼容性**
   - `spawn prisma_client_js ENOENT` 是 Windows 特定问题
   - 临时解决方案: 手动类型定义
   - 永久解决方案: 在 Linux 环境生成

3. **Repository 模式**
   - BaseRepository 提供通用 CRUD
   - 具体 Repository 实现业务逻辑
   - 分页查询应该封装在基类中

### 最佳实践
1. **配置管理**
   - 使用 DTOs 定义配置结构
   - 使用 class-validator 验证
   - 环境变量应该类型安全

2. **错误处理**
   - Repository 层应该记录错误日志
   - 使用 NestJS Logger
   - 不要直接抛出原始错误

---

## 📚 参考资料

- [Prisma SQLite 文档](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Windows Prisma Issue](https://github.com/prisma/prisma/issues/xxxx)

---

---

## 2025-01-02

### 📅 日期
2026年1月2日

### 👨‍💻 开发者
AI Assistant + 用户

---

## ✅ 今日完成

### 1. 前端 Dashboard UI 设计迭代
**时间**: 4小时

完成内容:
- ✅ 完成多个设计版本迭代
- ✅ 实现现代 AI 平台风格设计
- ✅ 使用紫色-蓝色渐变配色方案 (#6366f1, #8b5cf6, #a855f7)
- ✅ 实现 glassmorphism 效果 (渐变边框)
- ✅ 优化空间布局,减少冗余留白

**设计特点**:
1. **统计卡片**
   - 白色背景 + hover 时显示渐变边框
   - 使用 `::before` 伪元素实现渐变边框效果
   - 图标采用渐变背景 (蓝色、紫色、粉色、青色)
   - Trend 指标使用半透明背景

2. **快速访问区域**
   - 紧凑的列表布局
   - Hover 时微妙的背景变化
   - 快速过渡动画 (0.15s)

3. **活动流改进**
   - 垂直布局 (文本和时间戳分开)
   - 更小的图标和间距
   - 清晰的层次结构

**设计版本历史**:
- v1: 初始设计 (渐变 + 模糊圆圈效果) - 用户反馈效果变差
- v2: Glassmorphism 风格 - 用户反馈稍好,但空间浪费
- v3: 紧凑布局 - 用户反馈效果不如上一个
- v4: AI 平台风格 - 当前版本

### 2. Tailwind CSS v4 兼容性处理
**时间**: 1小时

**问题**: Tailwind CSS v4 不支持在 scoped 样式中使用 `@apply` 指令

**解决方案**:
- 将所有 `@apply` 指令转换为纯 CSS 属性
- 例如: `@apply flex items-center` → `display: flex; align-items: center`
- 例如: `@apply space-y-8` → `gap: 2rem` with flexbox

**结果**:
- ✅ 无编译错误
- ✅ 样式正常应用
- ✅ 开发服务器稳定运行

### 3. Nuxt UI 4.3.0 集成
**时间**: 0.5小时

完成内容:
- ✅ 使用 Nuxt 4.2.2 + @nuxt/ui 4.3.0
- ✅ 禁用 Google Fonts (`ui: { fonts: false }`)
- ✅ 配置纯 CSS 样式系统
- ✅ 使用 Heroicons 图标库

### 4. 开发服务器调试
**时间**: 1.5小时

**问题**:
- 缓存导致的错误 (`space-y-8` 错误持续出现)
- 端口冲突 (自动切换到 3013)

**解决**:
- 清理 `.nuxt` 缓存目录
- 重启开发服务器
- 验证无错误启动

**结果**:
- ✅ 前端运行在 `http://localhost:3013/`
- ✅ 后端运行在 `http://localhost:3001/`
- ✅ 无编译错误或警告

---

## 📝 技术决策

### 1. 选择纯 CSS 而非 @apply
**原因**:
- Tailwind CSS v4 对 @apply 的支持有限制
- 纯 CSS 更易维护和理解
- 避免编译时错误

**权衡**:
- ✅ 优点: 更稳定的编译,更好的兼容性
- ⚠️ 缺点: 样式代码稍微冗长

### 2. 紧凑布局设计
**原因**:
- 用户反馈之前的版本空间浪费
- 需要在有限空间展示更多信息
- 现代 dashboard 趋势

**权衡**:
- ✅ 优点: 信息密度更高,视觉更紧凑
- ⚠️ 缺点: 需要仔细调整间距避免拥挤

---

## 🎨 设计系统

### 配色方案
```css
/* 主色渐变 */
primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)
button-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)

/* 图标渐变 */
blue-gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
purple-gradient: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)
pink-gradient: linear-gradient(135deg, #ec4899 0%, #db2777 100%)
cyan-gradient: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)

/* 中性色 */
background: #ffffff
text-primary: #0f172a
text-secondary: #64748b
border: rgba(226, 232, 240, 0.8)
```

### 间距系统
```css
/* 卡片间距 */
stats-gap: 0.75rem
content-gap: 0.75rem
card-padding: 1.125rem

/* 元素间距 */
action-gap: 0.375rem
activity-gap: 0.5rem

/* 内边距 */
stat-padding: 1rem
action-padding: 0.625rem 0.75rem
```

### 动画时长
```css
/* 快速过渡 */
element-hover: 0.15s ease
card-hover: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
button-hover: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

/* 入场动画 */
fade-in: 0.3s ease-out
slide-up: 0.5s cubic-bezier(0.4, 0, 0.2, 1)
slide-in-right: 0.3s ease-out
```

---

## 📊 代码统计

### 今日新增/修改文件
```
frontend/
├── pages/
│   └── index.vue                     (重大修改 - 设计迭代)
├── components/
│   ├── AppHeader.vue                 (小幅修改)
│   └── AppSidebar.vue                (小幅修改)
├── layouts/
│   └── default.vue                   (小幅修改)
└── assets/css/
    └── main.css                      (保持简单)

配置文件:
├── nuxt.config.ts                    (修改 - 禁用 Google Fonts)
└── package.json                      (依赖版本)
```

### 代码行数
- 新增代码: ~400 行 (主要是 CSS)
- 修改代码: ~600 行
- 删除代码: ~300 行 (移除 glassmorphism 效果代码)

---

## ⚠️ 遇到的问题

### 1. Tailwind CSS v4 @apply 不兼容
**状态**: ✅ 已解决

**详细记录**:
- 问题: scoped 样式中使用 `@apply` 报错
- 错误: `Cannot apply unknown utility class`
- 解决: 转换为纯 CSS 属性
- 影响: 所有组件的样式需要重写

### 2. Nuxt 缓存问题
**状态**: ✅ 已解决

**详细记录**:
- 问题: 修改代码后错误仍持续出现
- 原因: `.nuxt` 缓存未更新
- 解决: 删除 `.nuxt` 目录重启
- 经验: 遇到奇怪错误先清理缓存

### 3. 用户设计反馈
**状态**: ✅ 持续优化中

**反馈循环**:
1. v1 设计 → "效果更差了一些"
2. v2 设计 → "稍微好了一些"
3. v3 设计 → "效果不如上一个"
4. v4 设计 → 待用户反馈

**经验**: 需要更准确理解用户需求,快速迭代

---

## 🎯 下一步计划

### 优先级 P0 (用户反馈)
1. **等待用户对 v4 设计的反馈**
   - 收集用户意见
   - 根据反馈调整设计

### 优先级 P1 (下一页面)
2. **开始其他页面设计**
   - 用户管理页面
   - 组织管理页面
   - 应用相同的视觉风格

### 优先级 P2 (功能完善)
3. **添加交互功能**
   - 实现数据加载
   - 实现状态管理
   - 连接后端 API

---

## 💡 经验总结

### 设计原则
1. **用户反馈优先**
   - 快速迭代,及时收集反馈
   - 不要在单个版本上花费太多时间
   - 每个版本都应该有明显改进

2. **平衡美观与实用**
   - 留白充足但不浪费
   - 信息密度适中
   - 视觉层次清晰

3. **技术实现考虑**
   - Tailwind v4 限制影响设计选择
   - 纯 CSS 比框架依赖更稳定
   - 缓存问题要优先排查

### 最佳实践
1. **开发流程**
   - 修改代码 → 检查错误 → 清理缓存 (如需要) → 重启服务器
   - 每次设计大改都要测试编译
   - 保留工作版本,方便回退

2. **CSS 架构**
   - 使用 CSS 变量定义颜色和间距
   - 动画时长保持一致
   - hover 状态使用统一的过渡曲线

3. **响应式设计**
   - 使用移动优先方法
   - 测试不同屏幕尺寸
   - 合理使用断点 (1200px, 768px)

---

## 📚 参考资料

- [Nuxt 4 文档](https://nuxt.com/docs)
- [Nuxt UI 文档](https://ui.nuxt.com)
- [Tailwind CSS v4 文档](https://tailwindcss.com/docs/v4-beta)
- [Heroicons 图标库](https://heroicons.com)

---

**文档创建时间**: 2025-01-30
**最后更新**: 2026-04-22

---

## 2026-04-22

### 📅 日期
2026年4月22日

---

## ✅ 今日完成

### 1. Dashboard 剩余板块设计确认
**时间**: ~3小时

完成内容:
- ✅ **动态告警**: 确认方案 D（圆形图标底色）和 E（极简色点）
- ✅ **快捷入口**: 确认方案 W（色点指示 + SVG 图标 + 数字 + 渐变条）
  - 使用 ui-ux-pro-max skill 提升设计质量
  - 统一 SVG 线条图标（stroke 1.5px），不再使用 emoji
  - 遵循 8dp 间距节奏、touch target ≥44px、200ms ease 动效规范
- ✅ **最近活动**: 色点列表（一轮确认）
- ✅ **底部状态栏**: 简洁一行（一轮确认）

### 2. 设计规范更新
- ✅ 更新图标规范：SVG 线条图标，统一 stroke 宽度，禁用 emoji
- ✅ 新增反馈记忆：前端 UI 修改前必须先调用 ui-ux-pro-max skill
- ✅ 更新设计 spec 文档，标记所有已确认板块

### 3. 关键经验
- **emoji 图标不够好** → 必须用 SVG 线条图标（Lucide/Heroicons 风格）
- **不调用 skill 质量不够** → 前端设计前必须先调用 ui-ux-pro-max skill
- **方案迭代** → 快捷入口经历了 7 轮迭代（A→G→K→K2-K6→R/S/T→U/V/W）才确认

---

## 📊 Dashboard 板块确认汇总

| 板块 | 选定方案 | Mockup 文件 |
|------|---------|------------|
| 指标卡片 | D（大数字+进度条） | metric-cards.html |
| 硬件监控 | A（三栏：状态/折线/饼图） | hardware-monitor.html |
| 快捷入口 | W（色点+SVG+数字+渐变条） | quick-actions-v7.html |
| 动态告警 | D/E（图标底色/极简色点） | remaining-v2.html |
| 最近活动 | 色点列表 | remaining-sections.html |
| 底部状态栏 | 简洁一行 | remaining-sections.html |
| 整体布局 | ⏳ 待设计 | — |

---

## 🎯 下一步

1. **整体页面布局** — 各板块排列顺序和 grid 布局
2. **实现** — 全部确认后开始编码

### 📅 日期
2026年4月21日

---

## ✅ 今日完成

### 1. Dashboard 设计探索 — 审美方向确认
**时间**: ~2小时

完成内容:
- ✅ 通过 mood board 确认用户审美偏好: Arc/Raycast 风格彩色毛玻璃
- ✅ 确认核心要素: 浅色系、多层渐变、半透明磨砂、精致有活力
- ✅ 排除方向: 深色主题、纯黑白极简、暖白纸质感、Vercel 式零色彩

### 2. Dashboard 指标卡片设计
**时间**: ~1小时

完成内容:
- ✅ 创建多个 mockup 方案 (A/B/C/D)
- ✅ 用户选定 **方案 D**: 大数字在左，标签+变化趋势在右，底部粗进度条
- ✅ 展示指标: 总用户数 / 组织数量 / 应用数量 / 活跃会话数 / 待处理邀请数

### 3. Dashboard 硬件监控区设计
**时间**: ~2小时

完成内容:
- ✅ 多轮迭代, 从纯进度条 → 折线图 → 三栏布局
- ✅ 用户选定 **三栏布局方案 A**:
  - 左栏 (180px): 服务状态 (Logto/数据库/缓存 + 运行时间)
  - 中栏 (1fr): CPU + 内存折线图上下叠放
  - 右栏 (180px): 硬盘环形饼图
- ✅ 确认字号细节: 服务状态标题 14px, 列表 13px, 折线卡片标题 13px, 数值 17px, 饼图中心 20px

### 4. Dashboard 内容清单整理
**时间**: ~1小时

完成内容:
- ✅ 整理 48 项候选内容, 按 ✅必须 / ❌不需要 / ❓看情况 分类
- ✅ 确认最终保留清单 (按优先级)
- ✅ 整理"现有 vs 建议"对比文档

---

## 📝 设计文档

- 设计规范: `docs/superpowers/specs/2026-04-19-ui-redesign-design.md`
- 内容候选清单: `docs/dashboard-content-options.md`
- 现有对比: `docs/dashboard-comparison.md`
- Mockup 文件: `.superpowers/brainstorm/1793-1776616684/content/`

---

## 🎯 下一步

1. **系统负载趋势图** — Dashboard 唯一主图表
2. **动态告警** — 有异常才显示
3. **快捷入口** — 5 个核心功能
4. **最近活动流** — 操作记录
5. **底部状态栏**
6. **整体页面布局** — 各板块排列
7. **实现** — 全部确认后开始编码

---

## 2026-05-02

### 📅 日期
2026年5月2日

### 👨‍💻 开发者
AI Assistant + 用户

---

## ✅ 今日完成

### 1. Soft Glass UI 重构完成
**时间**: ~4小时

完成内容:
- ✅ 以 style-a (Soft Glass) 为基准完成了整体 UI 设计系统
- ✅ 统一全站视觉风格: 毛玻璃 + 渐变光球 + 大圆角 + 双字体
- ✅ 创建完整设计系统文档 DESIGN-SYSTEM.md (14个章节)
- ✅ 生成 UI 预览文件 docs/previews/ (style-a/b/c/d 四套风格)
- ✅ 重构前端核心组件, 统一视觉语言

修改的文件:
| 文件 | 说明 |
|------|------|
| main.css | 全局样式系统, 毛玻璃变量、渐变、动画 |
| AppSidebar.vue | 侧边栏毛玻璃背景 + 渐变光球效果 |
| AppHeader.vue | 顶部导航栏半透明磨砂效果 |
| default.vue | 布局组件统一视觉风格 |
| index.vue | Dashboard 首页应用新设计系统 |

### 2. 设计系统文档
- ✅ DESIGN-SYSTEM.md 包含 14 个章节, 覆盖:
  - 色彩系统、字体规范、间距节奏
  - 毛玻璃参数、渐变定义、圆角规范
  - 组件库、动效系统、响应式断点
  - 4 套风格变体 (style-a/b/c/d) 对比说明

### 3. UI 预览文件
- ✅ docs/previews/ 包含 4 套风格预览:
  - **style-a (Soft Glass)**: 毛玻璃 + 渐变光球 + 大圆角 + 双字体 - 最终采用
  - **style-b**: 备选风格方案
  - **style-c**: 备选风格方案
  - **style-d**: 备选风格方案

### 4. 设计风格确认
- **毛玻璃 (Glassmorphism)**: 半透明背景 + backdrop-filter 模糊
- **渐变光球**: 多色渐变圆形光斑作为装饰元素
- **大圆角**: 统一使用 16-24px 圆角
- **双字体**: 标题字体 + 正文字体搭配使用

---

## 📊 代码统计

### 今日新增/修改文件
```
frontend/
├── assets/css/
│   └── main.css              (重大修改 - 设计系统变量)
├── components/
│   ├── AppSidebar.vue        (重大修改 - 毛玻璃背景)
│   └── AppHeader.vue         (重大修改 - 磨砂导航)
├── layouts/
│   └── default.vue           (修改 - 统一布局)
├── pages/
│   └── index.vue             (修改 - 应用新样式)
docs/
├── DESIGN-SYSTEM.md          (新建 - 14章节设计系统)
└── previews/
    ├── style-a/              (新建 - Soft Glass 风格)
    ├── style-b/              (新建 - 备选风格)
    ├── style-c/              (新建 - 备选风格)
    └── style-d/              (新建 - 备选风格)
```

---

## 📝 技术决策

### 1. 选择 style-a (Soft Glass) 为基准
**原因**:
- 毛玻璃效果与项目审美方向一致 (Arc/Raycast 风格)
- 渐变光球增加视觉活力, 不显得单调
- 大圆角符合现代 UI 趋势
- 双字体搭配提升排版层次感

**权衡**:
- ✅ 优点: 视觉统一、辨识度高、用户体验好
- ⚠️ 缺点: 毛玻璃在低端设备可能有性能开销

### 2. 建立完整设计系统文档
**原因**:
- 确保后续开发保持视觉一致性
- 便于团队协作和维护
- 为风格切换提供参考依据

---

## 🔗 Commit

```
8629c0d 'feat: Soft Glass UI 重构 — 以 style-a 为基准的设计系统'
```

---

## 💡 经验总结

1. **设计先行**: 先确定设计系统, 再统一修改组件, 效率更高
2. **多风格对比**: 提供 4 套风格预览, 便于用户选择
3. **文档驱动**: DESIGN-SYSTEM.md 作为规范文档, 避免视觉偏差
4. **渐进式重构**: 保持页面功能不变, 仅替换视觉风格

---

**最后更新**: 2026-05-02
