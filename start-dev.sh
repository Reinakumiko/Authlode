# Authlode 启动脚本（无 Docker，直接 Node.js 运行）
#
# 前置：已完成 setup-dev.sh + 配置了 backend/.env（含正确的 Logto 连接）
#
# 用法: bash start-dev.sh
#       或 ./start-dev.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "[Authlode] 启动服务..."

# 清理旧进程
pkill -f "dist/main.js" 2>/dev/null || true
pkill -f "nuxt dev" 2>/dev/null || true
sleep 1

# 启动后端
cd "$ROOT/backend"
nohup node dist/main.js > /tmp/authlode-backend.log 2>&1 &
BACKEND_PID=$!
echo "[✓] 后端启动中 (PID: $BACKEND_PID) → http://localhost:3001"

# 启动前端
cd "$ROOT/frontend"
nohup pnpm dev --port 3000 > /tmp/authlode-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[✓] 前端启动中 (PID: $FRONTEND_PID) → http://localhost:3000"

# 等待启动
sleep 8

# 健康检查
BACKEND_OK=false; FRONTEND_OK=false
curl -s -o /dev/null http://localhost:3001/api/users 2>/dev/null && BACKEND_OK=true
curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && FRONTEND_OK=true

echo ""
if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
  echo "✅ Authlode 已启动"
else
  echo "⚠️ 部分服务未响应，检查日志："
  [ "$BACKEND_OK" != true ] && echo "  后端日志: /tmp/authlode-backend.log"
  [ "$FRONTEND_OK" != true ] && echo "  前端日志: /tmp/authlode-frontend.log"
fi

echo ""
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo "  后端日志: /tmp/authlode-backend.log"
echo "  前端日志: /tmp/authlode-frontend.log"
echo "  停止: kill $BACKEND_PID $FRONTEND_PID"
echo ""
