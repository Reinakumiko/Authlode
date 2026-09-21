#!/usr/bin/env bash
# ============================================================================
# Authlode 一键启动 — Logto + 后端 + 前端
# 用法: ./start.sh
# ============================================================================

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()  { echo -e "${CYAN}[Authlode]${NC} $1"; }
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── 前置检查 ──────────────────────────────────────────────────────────────
command -v node >/dev/null || fail "Node.js 未安装（需要 ≥20）"
NODE_V=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_V" -ge 20 ] || fail "Node.js 版本 $NODE_V < 20，请升级"
command -v pnpm >/dev/null || { npm install -g pnpm; ok "pnpm 已安装"; }

info "Authlode SSO 用户管理平台"

# ── 1. .env ────────────────────────────────────────────────────────────────
if [ ! -f "$ROOT/backend/.env" ]; then
  warn "backend/.env 不存在，使用默认配置"
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
fi
ok "backend/.env 就绪"

# ── 2. 安装依赖（只在 node_modules 不存在时）──────────────────────────────
if [ ! -d "$ROOT/backend/node_modules" ]; then
  info "安装后端依赖..."
  cd "$ROOT/backend" && pnpm install
  npx prisma generate
  ok "后端依赖完成"
else
  ok "后端依赖已安装"
fi

if [ ! -d "$ROOT/frontend/node_modules" ]; then
  info "安装前端依赖..."
  cd "$ROOT/frontend" && pnpm install
  ok "前端依赖完成"
else
  ok "前端依赖已安装"
fi

# ── 3. 数据库迁移（只在 dev.db 不存在时）──────────────────────────────────
if [ ! -f "$ROOT/backend/prisma/dev.db" ]; then
  info "初始化数据库..."
  cd "$ROOT/backend" && npx prisma migrate deploy
  ok "数据库初始化完成"
fi

# ── 4. 启动 Logto（Docker）─────────────────────────────────────────────────
cd "$ROOT/deployment/logto"
if docker compose ps 2>/dev/null | grep -q "logto"; then
  ok "Logto Docker 已在运行"
else
  info "启动 Logto Docker..."
  docker compose up -d
  info "等待 Logto 启动（15s）..."
  sleep 15
fi
# 健康检查
if curl -s -o /dev/null -w "" http://localhost:3003/api/status 2>/dev/null; then
  ok "Logto core :3003 ✓"
else
  warn "Logto core :3003 尚未响应（可能还在启动，等待 10s...）"
  sleep 10
fi

# ── 5. 编译后端（只在 dist 不存在或源码更新时）────────────────────────────
if [ ! -f "$ROOT/backend/dist/main.js" ]; then
  info "编译后端..."
  cd "$ROOT/backend" && npm run build
  ok "后端编译完成"
fi

# ── 6. 启动所有服务 ────────────────────────────────────────────────────────
info "启动服务..."
cd "$ROOT"

# 清理旧进程
pkill -f "dist/main.js" 2>/dev/null || true
pkill -f "nuxt dev" 2>/dev/null || true
sleep 1

# 启动后端
nohup node "$ROOT/backend/dist/main.js" > /tmp/authlode-backend.log 2>&1 &
BACKEND_PID=$!

# 启动前端
cd "$ROOT/frontend"
nohup pnpm dev --port 3000 > /tmp/authlode-frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待启动
info "等待服务启动..."
sleep 8

# 健康检查
BACKEND_OK=false; FRONTEND_OK=false
curl -s -o /dev/null http://localhost:3001/api/users 2>/dev/null && BACKEND_OK=true
curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && FRONTEND_OK=true

if [ "$BACKEND_OK" = true ]; then ok "后端 :3001 ✓"; else warn "后端 :3001 未响应"; fi
if [ "$FRONTEND_OK" = true ]; then ok "前端 :3000 ✓"; else warn "前端 :3000 未响应（等待中...）"; fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "  ${GREEN}Authlode SSO 用户管理平台已启动${NC}"
echo ""
echo -e "  前端:     ${CYAN}http://localhost:3000${NC}"
echo -e "  后端:     ${CYAN}http://localhost:3001${NC}"
echo -e "  Logto:    ${CYAN}http://localhost:3002${NC} (admin)"
echo -e "            ${CYAN}http://localhost:3003${NC} (core)"
echo ""
echo -e "  登录:     alice / P0c-Authlode-2026!"
echo ""
echo -e "  日志:     /tmp/authlode-backend.log"
echo -e "            /tmp/authlode-frontend.log"
echo -e "  停止:     kill $BACKEND_PID $FRONTEND_PID"
echo "═══════════════════════════════════════════════════════"
