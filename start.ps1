# Authlode Windows 启动脚本 (PowerShell)
# 用法: 右键 → 使用 PowerShell 运行
#       或 .\start.ps1

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Authlode SSO 用户管理平台 — Windows 启动" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── 前置检查 ──────────────────────────────────────────

# Node
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js 未安装。请从 https://nodejs.org 安装 ≥20" -ForegroundColor Red
    exit 1
}
$nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*','$1')
if ($nodeMajor -lt 20) {
    Write-Host "❌ Node.js 版本 $nodeVersion < 20，请升级" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion"

# pnpm
$pnpmVersion = pnpm -v 2>$null
if (-not $pnpmVersion) {
    Write-Host "安装 pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "✓ pnpm $pnpmVersion"

$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }

# ── 后端依赖 ──────────────────────────────────────────
Write-Host ""
Write-Host "── 后端依赖 ──" -ForegroundColor Cyan
Set-Location "$root\backend"
if (-not (Test-Path "node_modules")) {
    pnpm install
}
# Prisma generate（每次运行确保 client 与 schema 匹配）
npx prisma generate

# 环境配置
if (-not (Test-Path ".env")) {
    Write-Host "创建 backend/.env（默认开发配置）..." -ForegroundColor Yellow
    # 从 .env.example 复制
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  请编辑 backend/.env 填入实际的 Logto 连接信息"
}

# 数据库迁移
npx prisma migrate deploy

# 编译
Write-Host "编译后端..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端编译失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 后端编译完成"

# ── 前端依赖 ──────────────────────────────────────────
Write-Host ""
Write-Host "── 前端依赖 ──" -ForegroundColor Cyan
Set-Location "$root\frontend"
if (-not (Test-Path "node_modules")) {
    pnpm install
}
Write-Host "✓ 前端依赖已安装"

# ── 启动服务 ──────────────────────────────────────────
Write-Host ""
Write-Host "── 启动服务 ──" -ForegroundColor Cyan

# 启动后端（新窗口）
Set-Location "$root\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; node dist/main.js" -WindowStyle Normal

Start-Sleep -Seconds 5

# 启动前端（新窗口）
Set-Location "$root\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; pnpm dev" -WindowStyle Normal

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Authlode 已启动" -ForegroundColor Green
Write-Host ""
Write-Host "  前端: http://localhost:3000" -ForegroundColor White
Write-Host "  后端: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "  停止: 关闭弹出的 PowerShell 窗口即可" -ForegroundColor Gray
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
