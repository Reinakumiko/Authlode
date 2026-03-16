<script setup lang="ts">
import { ref, computed } from 'vue'

// 系统监控数据
const systemMonitor = ref({
  hardware: {
    cpu: 45,
    memory: 62,
    disk: 38
  },
  network: {
    downSpeed: 85.3,
    upSpeed: 12.5,
    latency: 24
  },
  trend: {
    cpu: [42, 45, 48, 43, 41, 44, 45, 47, 46, 45],
    memory: [60, 61, 62, 63, 62, 61, 62, 63, 62, 62],
    network: [78, 82, 85, 88, 84, 86, 85, 83, 85, 85]
  }
})

// 核心指标
const metrics = ref([
  { title: '总用户数', value: '12,847', change: '+12.5%', icon: 'users' },
  { title: '组织数量', value: '156', change: '+3', icon: 'building' },
  { title: '应用接入', value: '89', change: '+5', icon: 'apps' },
  { title: '活跃会话', value: '892', change: '+8.3%', icon: 'session' }
])

// 快速操作
const quickActions = ref([
  { title: '用户管理', icon: 'users', color: '#3b82f6' },
  { title: '邀请用户', icon: 'invite', color: '#8b5cf6' },
  { title: '组织架构', icon: 'building', color: '#10b981' },
  { title: '角色权限', icon: 'shield', color: '#f59e0b' }
])

// 快速提示
const quickTips = ref([
  { icon: '⚡', title: '性能优化', desc: '系统运行流畅' },
  { icon: '🔒', title: '安全状态', desc: '所有安全检查通过' },
  { icon: '📊', title: '数据备份', desc: '上次备份: 2小时前' }
])

// 最近活动
const recentActivities = ref([
  { type: 'user', message: '用户 alice@example.com 登录系统', time: '2分钟前' },
  { type: 'app', message: '应用 MyApp 成功接入', time: '15分钟前' },
  { type: 'system', message: '系统配置已更新', time: '1小时前' },
  { type: 'security', message: '检测到异常登录尝试并阻止', time: '2小时前' }
])

// 计算环形进度条路径
const getCirclePath = (percentage: number) => {
  const radius = 40
  const centerX = 50
  const centerY = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return {
    circumference,
    offset
  }
}

// 生成平滑曲线路径
const generateSmoothPath = (data: number[], width: number, height: number) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  let path = ''
  data.forEach((value, index) => {
    const x = index * stepX
    const y = height - ((value - min) / range) * height * 0.8 - height * 0.1

    if (index === 0) {
      path = `M ${x} ${y}`
    } else {
      // 使用贝塞尔曲线创建平滑效果
      const prevX = (index - 1) * stepX
      const prevValue = data[index - 1]
      const prevY = height - ((prevValue - min) / range) * height * 0.8 - height * 0.1
      const cpX = (prevX + x) / 2
      path += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`
    }
  })

  return path
}

// 图标 SVG 路径
const icons: Record<string, string> = {
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M16 3.13a4 4 0 0 1 0 7.75 M23 21v-2a4 4 0 0 0-3-3.87 M9 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  building: 'M3 21h18 M5 21V7l8-4 8 4v14 M8 21v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9',
  apps: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z M9 12h6 M12 9v6',
  session: 'M12 2a10 10 0 1 0 10 10M12 12 9 9 0 0 1 9-9',
  invite: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
}
</script>

<template>
  <div class="airy-order-dashboard">
    <!-- 流体渐变背景 -->
    <div class="fluid-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="gradient-orb orb-4"></div>
    </div>

    <!-- 主容器 - 底座毛玻璃层 -->
    <div class="main-container base-glass">
      <div class="dashboard-header">
        <h1 class="page-title">Logto 用户中心</h1>
        <div class="header-meta">
          <span class="last-update">最后更新: 刚刚</span>
        </div>
      </div>

      <!-- 核心指标 - 浮层毛玻璃 -->
      <div class="metrics-grid">
        <div
          v-for="metric in metrics"
          :key="metric.title"
          class="metric-card float-glass"
        >
          <div class="metric-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path :d="icons[metric.icon]"></path>
            </svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.title }}</div>
            <div class="metric-change">{{ metric.change }}</div>
          </div>
        </div>
      </div>

      <!-- 三列布局 -->
      <div class="three-column-layout">
        <!-- 左列 - 快速提示 + 最近活动 -->
        <div class="left-column">
          <!-- 快速提示 -->
          <div class="panel float-glass">
            <h3 class="panel-title">快速提示</h3>
            <div class="tips-list">
              <div v-for="tip in quickTips" :key="tip.title" class="tip-item">
                <span class="tip-icon">{{ tip.icon }}</span>
                <div class="tip-content">
                  <div class="tip-title">{{ tip.title }}</div>
                  <div class="tip-desc">{{ tip.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="panel float-glass">
            <h3 class="panel-title">最近活动</h3>
            <div class="activities-list">
              <div v-for="activity in recentActivities" :key="activity.message" class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-message">{{ activity.message }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中列 - 快速操作 -->
        <div class="middle-column">
          <div class="panel float-glass">
            <h3 class="panel-title">快速操作</h3>
            <div class="actions-grid">
              <div
                v-for="action in quickActions"
                :key="action.title"
                class="action-card"
                :style="{ '--accent-color': action.color }"
              >
                <div class="action-icon-wrapper">
                  <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path :d="icons[action.icon]"></path>
                  </svg>
                </div>
                <div class="action-title">{{ action.title }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右列 - 系统监控 -->
        <div class="right-column">
          <div class="panel float-glass monitor-panel">
            <h3 class="panel-title">系统监控</h3>

            <!-- 硬件状态 - 环形进度条 -->
            <div class="hardware-section">
              <div class="section-label">硬件状态</div>
              <div class="circular-charts">
                <div v-for="(value, key) in systemMonitor.hardware" :key="key" class="circular-chart">
                  <svg viewBox="0 0 100 100" class="circular-svg">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(203, 213, 225, 0.3)"
                      stroke-width="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      :stroke="key === 'cpu' ? '#3b82f6' : key === 'memory' ? '#8b5cf6' : '#10b981'"
                      stroke-width="8"
                      stroke-linecap="round"
                      :stroke-dasharray="getCirclePath(value).circumference"
                      :stroke-dashoffset="getCirclePath(value).offset"
                      transform="rotate(-90 50 50)"
                      class="progress-circle"
                    />
                    <text x="50" y="50" text-anchor="middle" dy="0.3em" class="chart-value">
                      {{ value }}%
                    </text>
                  </svg>
                  <div class="chart-label">{{ key === 'cpu' ? 'CPU' : key === 'memory' ? '内存' : '硬盘' }}</div>
                </div>
              </div>
            </div>

            <!-- 实时趋势 - 平滑曲线 -->
            <div class="trend-section">
              <div class="section-label">实时趋势</div>
              <div class="trend-charts">
                <div class="trend-chart">
                  <div class="trend-header">
                    <span class="trend-title">CPU</span>
                    <span class="trend-value">{{ systemMonitor.hardware.cpu }}%</span>
                  </div>
                  <svg viewBox="0 0 300 60" class="trend-svg">
                    <defs>
                      <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.9" />
                        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.9" />
                      </linearGradient>
                    </defs>
                    <path
                      :d="generateSmoothPath(systemMonitor.trend.cpu, 300, 60)"
                      fill="none"
                      stroke="url(#cpuGradient)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="trend-line"
                    />
                  </svg>
                </div>

                <div class="trend-chart">
                  <div class="trend-header">
                    <span class="trend-title">内存</span>
                    <span class="trend-value">{{ systemMonitor.hardware.memory }}%</span>
                  </div>
                  <svg viewBox="0 0 300 60" class="trend-svg">
                    <defs>
                      <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.9" />
                        <stop offset="100%" stop-color="#a855f7" stop-opacity="0.9" />
                      </linearGradient>
                    </defs>
                    <path
                      :d="generateSmoothPath(systemMonitor.trend.memory, 300, 60)"
                      fill="none"
                      stroke="url(#memoryGradient)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="trend-line"
                    />
                  </svg>
                </div>

                <div class="trend-chart">
                  <div class="trend-header">
                    <span class="trend-title">网络</span>
                    <span class="trend-value">{{ systemMonitor.network.downSpeed }} MB/s</span>
                  </div>
                  <svg viewBox="0 0 300 60" class="trend-svg">
                    <defs>
                      <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.9" />
                        <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.9" />
                      </linearGradient>
                    </defs>
                    <path
                      :d="generateSmoothPath(systemMonitor.trend.network, 300, 60)"
                      fill="none"
                      stroke="url(#networkGradient)"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="trend-line"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- 网络状态 - 迷你进度条 -->
            <div class="network-section">
              <div class="section-label">网络状态</div>
              <div class="network-metrics">
                <div class="network-metric">
                  <div class="network-header">
                    <div class="network-icon-wrapper">
                      <div class="network-icon download">↓</div>
                      <span class="network-label">下载</span>
                    </div>
                    <span class="network-value">{{ systemMonitor.network.downSpeed }}</span>
                  </div>
                  <div class="network-bar-bg">
                    <div class="network-bar-fill download" :style="{ width: (systemMonitor.network.downSpeed / 100 * 100) + '%' }"></div>
                  </div>
                </div>

                <div class="network-metric">
                  <div class="network-header">
                    <div class="network-icon-wrapper">
                      <div class="network-icon upload">↑</div>
                      <span class="network-label">上传</span>
                    </div>
                    <span class="network-value">{{ systemMonitor.network.upSpeed }}</span>
                  </div>
                  <div class="network-bar-bg">
                    <div class="network-bar-fill upload" :style="{ width: (systemMonitor.network.upSpeed / 100 * 100) + '%' }"></div>
                  </div>
                </div>

                <div class="network-metric">
                  <div class="network-header">
                    <div class="network-icon-wrapper">
                      <div class="network-icon latency">⟳</div>
                      <span class="network-label">延迟</span>
                    </div>
                    <span class="network-value">{{ systemMonitor.network.latency }}</span>
                  </div>
                  <div class="network-bar-bg">
                    <div class="network-bar-fill latency" :style="{ width: (systemMonitor.network.latency / 100 * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn primary" @click="$router.push('/')">
          应用此风格到 Dashboard
        </button>
        <button class="action-btn secondary" @click="$router.push('/design-showcase')">
          返回查看其他风格
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 流体渐变背景 ===== */
.airy-order-dashboard {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.fluid-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 70%);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(217, 70, 239, 0.12) 50%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation-delay: 5s;
}

.orb-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.22) 0%, rgba(20, 184, 166, 0.13) 50%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

.orb-4 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.18) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 70%);
  bottom: 20%;
  right: 10%;
  animation-delay: 15s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

/* ===== 底座毛玻璃层 ===== */
.base-glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* ===== 浮层毛玻璃 ===== */
.float-glass {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.float-glass:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

/* ===== 主容器布局 ===== */
.main-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem;
  border-radius: 32px;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

/* ===== 头部 ===== */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.02em;
}

.header-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.last-update {
  font-size: 0.875rem;
  color: #64748b;
}

/* ===== 核心指标网格 ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 24px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border-radius: 16px;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.metric-icon svg {
  width: 28px;
  height: 28px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.125rem;
}

.metric-change {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

/* ===== 三列布局 ===== */
.three-column-layout {
  display: grid;
  grid-template-columns: 1fr 280px 320px;
  gap: 1.5rem;
}

/* ===== 面板通用样式 ===== */
.panel {
  padding: 1.75rem;
  border-radius: 24px;
  margin-bottom: 1.5rem;
}

.panel:last-child {
  margin-bottom: 0;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.25rem 0;
}

/* ===== 快速提示 ===== */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.tip-item:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.9);
}

.tip-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.25rem;
}

.tip-desc {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

/* ===== 最近活动 ===== */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.9);
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  margin-top: 0.375rem;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-size: 0.875rem;
  color: #334155;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.75rem;
  color: #64748b;
}

/* ===== 快速操作 ===== */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 12px;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.action-card:hover .action-icon-wrapper {
  opacity: 1;
  box-shadow: 0 4px 16px var(--accent-color);
}

.action-icon {
  width: 24px;
  height: 24px;
  color: #ffffff;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  text-align: center;
}

/* ===== 系统监控 ===== */
.monitor-panel {
  position: sticky;
  top: 2rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.875rem;
}

/* 环形图 */
.hardware-section {
  margin-bottom: 1.5rem;
}

.circular-charts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.circular-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.circular-svg {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
}

.progress-circle {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-value {
  font-size: 0.875rem;
  font-weight: 700;
  fill: #1e293b;
}

.chart-label {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

/* 趋势图 */
.trend-section {
  margin-bottom: 1.5rem;
}

.trend-charts {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.trend-chart {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.trend-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}

.trend-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.trend-svg {
  width: 100%;
  height: 60px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
}

.trend-line {
  animation: drawLine 1.5s ease-out;
}

@keyframes drawLine {
  from {
    stroke-dasharray: 0 1000;
  }
  to {
    stroke-dasharray: 1000 1000;
  }
}

/* 网络状态 */
.network-section {
  margin-bottom: 0;
}

.network-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.network-metric {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.network-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.network-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.network-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
}

.network-icon.download {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.network-icon.upload {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.network-icon.latency {
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
}

.network-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.network-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.network-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.network-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.network-bar-fill.download {
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
}

.network-bar-fill.upload {
  background: linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%);
}

.network-bar-fill.latency {
  background: linear-gradient(90deg, #10b981 0%, #14b8a6 100%);
}

/* ===== 操作按钮 ===== */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  justify-content: center;
}

.action-btn {
  padding: 0.875rem 1.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.35);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: #334155;
  border: 1px solid rgba(203, 213, 225, 0.8);
  backdrop-filter: blur(10px);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(203, 213, 225, 1);
}

/* ===== 响应式设计 ===== */
@media (max-width: 1200px) {
  .three-column-layout {
    grid-template-columns: 1fr 280px;
  }

  .right-column {
    grid-column: 1 / -1;
  }

  .monitor-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 1.5rem;
    border-radius: 24px;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .three-column-layout {
    grid-template-columns: 1fr;
  }

  .right-column {
    grid-column: 1;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .circular-charts {
    grid-template-columns: repeat(3, 1fr);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
