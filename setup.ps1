# Authlode 开发环境初始化 (PowerShell) — Windows
# 用法: .\setup.ps1
# 自动检查依赖、安装包、初始化数据库、编译

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Authlode 开发环境初始化                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }

# ── Node 检查 ──────────────────────────────────────────
$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js 未安装。请从 https://nodejs.org 安装 ≥20" -ForegroundColor Red
    exit 1
}
$nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*','$1')
if ($nodeMajor -lt 20) {
    Write-Host "❌ Node.js $nodeVersion < 20，请升级" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion"

# ── pnpm ───────────────────────────────────────────────
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "安装 pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "✓ pnpm $(pnpm -v)"

# ── 后端依赖 ───────────────────────────────────────────
Write-Host "安装后端依赖..." -ForegroundColor Cyan
Set-Location "$root\backend"
pnpm install
if ($LASTEXITCODE -ne 0) { Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red; exit 1 }

# ── 环境配置 ───────────────────────────────────────────
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ backend/.env 已创建（请编辑填入实际配置）" -ForegroundColor Yellow
}

# ── Prisma ─────────────────────────────────────────────
Write-Host "生成 Prisma Client..." -ForegroundColor Cyan
npx prisma generate
Write-Host "初始化数据库..." -ForegroundColor Cyan
npx prisma migrate deploy

# ── 后端编译 ───────────────────────────────────────────
Write-Host "编译后端..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端编译失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 后端编译完成"

# ── 前端依赖 ───────────────────────────────────────────
Write-Host "安装前端依赖..." -ForegroundColor Cyan
Set-Location "$root\frontend"
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 前端依赖安装完成"

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  开发环境初始化完成" -ForegroundColor Green
Write-Host ""
Write-Host "  启动: .\start.ps1" -ForegroundColor White
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
