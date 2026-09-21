#!/usr/bin/env bash
# ============================================================================
# Authlode 开发环境一键初始化（无 Docker）
#
# 用法: bash setup-dev.sh
#
# 自动完成：
#   1. 检查 Node ≥ 20 + pnpm
#   2. 安装后端 + 前端依赖
#   3. 初始化 SQLite 数据库
#   4. 构建后端
#   5. 输出后续步骤（Logto 连接配置）
# ============================================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

info()  { echo -e "${CYAN}[Authlode]${NC} $1"; }
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Authlode 开发环境初始化（无 Docker）        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Node.js 检查 ────────────────────────────────────────────────────────
info "检查 Node.js..."
command -v node >/dev/null || fail "Node.js 未安装。请从 https://nodejs.org 安装 ≥20"
NODE_V=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_V" -ge 20 ] || fail "Node.js 版本 $(node -v) < 20，请升级到 ≥20"
ok "Node.js $(node -v)"

# ── 2. pnpm 检查/安装 ──────────────────────────────────────────────────────
info "检查 pnpm..."
if ! command -v pnpm >/dev/null; then
  info "安装 pnpm..."
  npm install -g pnpm
fi
ok "pnpm $(pnpm -v)"

# ── 3. 后端依赖 ────────────────────────────────────────────────────────────
info "安装后端依赖..."
cd "$ROOT/backend"
pnpm install
ok "后端依赖安装完成"

# ── 4. 环境配置 ────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  info "创建 backend/.env（默认开发配置）..."
  cat > .env << 'ENVEOF'
# Authlode 后端环境配置（开发环境默认值）

# Logto Management API（本地 Logto 实例）
LOGTO_MANAGEMENT_API_ENDPOINT=http://localhost:3003/api
LOGTO_MANAGEMENT_API_KEY=placeholder-replaced-by-m2m-credentials

# M2M 应用凭据（seed 内置 m-default）
LOGTO_M2M_APP_ID=m-default
LOGTO_M2M_APP_SECRET=FROM_LOGTO_DB

# Logto 端点
LOGTO_ADMIN_OIDC_ENDPOINT=http://localhost:3002
LOGTO_ENDPOINT=http://localhost:3003
LOGTO_MANAGEMENT_API_RESOURCE=https://default.logto.app/api

# 平台自身 OIDC（登录用）
LOGTO_APP_ID=REPLACE_WITH_YOUR_APP_ID
LOGTO_REDIRECT_URI=http://localhost:3001/api/auth/callback

# IAM Provider
IAM_PROVIDER=logto

# 扩展数据库（SQLite 零配置）
DATABASE_TYPE=sqlite
DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=dev-secret-change-in-production

# 应用
APP_PORT=3001
APP_NAME=Authlode
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ENVEOF
  ok "backend/.env 已创建"
else
  ok "backend/.env 已存在（跳过）"
fi

# ── 5. Prisma Client + 数据库 ──────────────────────────────────────────────
info "生成 Prisma Client..."
npx prisma generate 2>&1 | grep -q "Generated" && ok "Prisma Client 生成完成"

info "初始化 SQLite 数据库..."
npx prisma migrate deploy 2>&1 | tail -1
ok "数据库迁移完成"

# ── 6. 后端编译 ────────────────────────────────────────────────────────────
info "编译后端..."
npm run build 2>&1 | grep -q "error" && fail "后端编译失败" || ok "后端编译完成"

# ── 7. 前端依赖 ────────────────────────────────────────────────────────────
info "安装前端依赖..."
cd "$ROOT/frontend"
pnpm install
ok "前端依赖安装完成"

# ── 8. 清理实验文件 ────────────────────────────────────────────────────────
cd "$ROOT/frontend/pages"
rm -f design-*.vue test.vue *.bak inline-test.vue simple-test.vue 2>/dev/null
ok "实验文件已清理"

# ── 完成 ───────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}开发环境初始化完成${NC}"
echo ""
echo -e "  接下来你需要一个 ${CYAN}Logto 实例${NC}（两种方式选一）："
echo ""
echo -e "  ${YELLOW}方式 A：Docker（推荐，一条命令）${NC}"
echo -e "    cd deployment/logto && docker compose up -d"
echo ""
echo -e "  ${YELLOW}方式 B：不用 Docker，手动安装 Logto OSS${NC}"
echo -e "    参考 https://docs.logto.io/logto-oss"
echo ""
echo -e "  Logto 启动后："
echo -e "    1. 打开 admin console (:3002) 注册 admin"
echo -e "    2. 从 Logto DB 读取 m-default secret："
echo -e "       docker exec <logto-db-container> psql -U logto -d logto \\"
echo -e "         -t -A -c \"SELECT secret FROM applications WHERE id='m-default';\""
echo -e "    3. 把 secret 写入 backend/.env 的 LOGTO_M2M_APP_SECRET"
echo -e "    4. 在 Logto console 创建一个 SPA 应用，\\"
echo -e "       把 redirect_uri 设为 http://localhost:3001/api/auth/callback"
echo -e "    5. 把 App ID 写入 backend/.env 的 LOGTO_APP_ID"
echo ""
echo -e "  然后启动："
echo -e "    cd backend && node dist/main.js        # 后端 :3001"
echo -e "    cd frontend && pnpm dev                # 前端 :3000"
echo ""
echo -e "  打开 ${CYAN}http://localhost:3000${NC} 即可使用"
echo "════════════════════════════════════════════════════════════"
