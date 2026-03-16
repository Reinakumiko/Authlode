<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 当前时间
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 核心指标数据
const metrics = ref([
  {
    title: '总用户数',
    value: '12,847',
    change: '+12.5%',
    trend: 'up',
    icon: 'i-heroicons-users',
    color: 'blue'
  },
  {
    title: '组织数量',
    value: '156',
    change: '+3',
    trend: 'up',
    icon: 'i-heroicons-building-office-2',
    color: 'purple'
  },
  {
    title: '应用接入',
    value: '89',
    change: '+5',
    trend: 'up',
    icon: 'i-heroicons-rectangle-stack',
    color: 'emerald'
  },
  {
    title: '活跃会话',
    value: '892',
    change: '+8.3%',
    trend: 'up',
    icon: 'i-heroicons-light-bulb',
    color: 'amber'
  }
])

// 快速操作
const quickActions = [
  { title: '用户管理', description: '查看和管理用户', icon: 'i-heroicons-users', link: '/users', color: 'blue' },
  { title: '邀请用户', description: '发送邀请给新用户', icon: 'i-heroicons-envelope', link: '/invitations', color: 'purple' },
  { title: '组织架构', description: '管理组织结构', icon: 'i-heroicons-building-office-2', link: '/organizations', color: 'emerald' },
  { title: '角色权限', description: '配置角色和权限', icon: 'i-heroicons-shield-check', link: '/roles', color: 'amber' }
]

// 系统监控数据（合并硬件、网络、系统信息）
const systemMonitor = ref({
  // 硬件状态历史数据（用于折线图）
  hardwareHistory: {
    cpu: [42, 45, 48, 43, 41, 44, 45, 47, 46, 45],
    memory: [60, 61, 62, 63, 62, 61, 62, 63, 62, 62],
    disk: [38, 38, 38, 38, 38, 38, 38, 38, 38, 38]
  },
  // 硬件状态
  hardware: {
    cpu: 45,
    memory: 62,
    disk: 38
  },
  // 网络状态
  network: {
    downSpeed: 85.3,
    upSpeed: 12.5,
    latency: 24
  },
  // 系统信息
  info: {
    version: 'v1.15.0',
    database: 'PostgreSQL 15.2',
    redis: 'Redis 7.0.12',
    uptime: '45天 12小时'
  }
})

// 快速提示
const quickTips = ref([
  { icon: '⚡', title: '性能优化', desc: '系统运行流畅', type: 'success' },
  { icon: '🔒', title: '安全状态', desc: '所有安全检查通过', type: 'info' },
  { icon: '📊', title: '数据备份', desc: '上次备份: 2小时前', type: 'info' }
])

// 最近活动
const recentActivities = ref([
  { type: 'user', message: '用户 alice@example.com 登录系统', time: '2分钟前' },
  { type: 'app', message: '应用 MyApp 成功接入', time: '15分钟前' },
  { type: 'system', message: '系统配置已更新', time: '1小时前' },
  { type: 'security', message: '检测到异常登录尝试并阻止', time: '2小时前' },
  { type: 'user', message: '新增用户 bob@example.com', time: '3小时前' },
  { type: 'invite', message: '发送 5 封邀请邮件', time: '5小时前' }
])

// 获取状态颜色
const getStatusColor = (value: number) => {
  if (value >= 80) return '#ef4444'
  if (value >= 60) return '#f59e0b'
  return '#10b981'
}

// 获取网络速度颜色
const getNetworkColor = (type: 'down' | 'up' | 'latency') => {
  if (type === 'down') return '#3b82f6'
  if (type === 'up') return '#8b5cf6'
  return '#10b981'
}

// 生成折线图路径
const generateLinePath = (data: number[], width: number, height: number) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const stepX = width / (data.length - 1)
  let path = ''

  data.forEach((value, index) => {
    const x = index * stepX
    const y = height - ((value - min) / range) * height
    if (index === 0) {
      path = `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  })

  return path
}

// 获取折线图的点位置
const getPointPositions = (data: number[], width: number, height: number) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const stepX = width / (data.length - 1)

  return data.map((value, index) => {
    const x = index * stepX
    const y = height - ((value - min) / range) * height
    return { x, y, value }
  })
}

let timeInterval: any

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎回来 👋</h1>
        <p class="welcome-subtitle">这是您的系统概览，当前时间是 {{ currentTime }}</p>
      </div>
      <div class="welcome-actions">
        <UButton
          icon="i-heroicons-plus"
          size="md"
          class="action-button"
        >
          快速创建
        </UButton>
        <UButton
          icon="i-heroicons-arrow-path"
          size="md"
          color="gray"
          variant="ghost"
          class="action-button"
        >
          刷新数据
        </UButton>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div
        v-for="metric in metrics"
        :key="metric.title"
        class="metric-card"
      >
        <div class="metric-icon" :class="`metric-icon-${metric.color}`">
          <UIcon :name="metric.icon" class="w-5 h-5" />
        </div>
        <div class="metric-content">
          <p class="metric-title">{{ metric.title }}</p>
          <p class="metric-value">{{ metric.value }}</p>
          <div class="metric-change" :class="metric.trend === 'up' ? 'metric-change-up' : 'metric-change-down'">
            <UIcon :name="metric.trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="w-4 h-4" />
            <span>{{ metric.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-grid">
      <!-- 系统监控（合并硬件、网络、系统信息） -->
      <div class="system-monitor-section">
        <div class="section-header">
          <h2 class="section-title">系统监控</h2>
          <p class="section-description">硬件 · 网络 · 系统信息</p>
        </div>
        <div class="system-monitor-card">
          <div class="monitor-grid-layout">
            <!-- 左侧列：网络 + 硬件 -->
            <div class="monitor-left-column">
              <!-- 上层：网络状态（紧凑指标） -->
              <div class="monitor-network-compact">
                <div class="monitor-title">网络状态</div>
                <div class="network-indicators">
                  <div class="network-indicator network-indicator-down">
                    <div class="network-indicator-icon">
                      <UIcon name="i-heroicons-arrow-down" class="w-5 h-5" />
                    </div>
                    <div class="network-indicator-content">
                      <span class="network-indicator-value">{{ systemMonitor.network.downSpeed }}</span>
                      <span class="network-indicator-label">下载</span>
                    </div>
                  </div>

                  <div class="network-indicator network-indicator-up">
                    <div class="network-indicator-icon">
                      <UIcon name="i-heroicons-arrow-up" class="w-5 h-5" />
                    </div>
                    <div class="network-indicator-content">
                      <span class="network-indicator-value">{{ systemMonitor.network.upSpeed }}</span>
                      <span class="network-indicator-label">上传</span>
                    </div>
                  </div>

                  <div class="network-indicator network-indicator-latency">
                    <div class="network-indicator-icon">
                      <UIcon name="i-heroicons-signal" class="w-5 h-5" />
                    </div>
                    <div class="network-indicator-content">
                      <span class="network-indicator-value">{{ systemMonitor.network.latency }}</span>
                      <span class="network-indicator-label">延迟</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 下层：硬件状态（大折线图） -->
              <div class="monitor-hardware-expanded">
                <div class="hardware-title">
                  <span class="hardware-title-text">硬件监控</span>
                  <span class="hardware-time-range">最近10分钟</span>
                </div>

                <div class="hardware-charts-expanded">
                  <!-- CPU 折线图 -->
                  <div class="hardware-chart-expanded">
                    <div class="hardware-chart-header">
                      <UIcon name="i-heroicons-cpu-chip" class="w-4 h-4" :style="{ color: getStatusColor(systemMonitor.hardware.cpu) }" />
                      <span class="hardware-chart-label">CPU</span>
                      <span class="hardware-chart-current" :style="{ color: getStatusColor(systemMonitor.hardware.cpu) }">
                        {{ systemMonitor.hardware.cpu }}%
                      </span>
                    </div>
                    <div class="line-chart-container">
                      <svg class="line-chart" viewBox="0 0 300 60">
                        <defs>
                          <linearGradient :id="`cpu-gradient`" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" :stop-color="getStatusColor(systemMonitor.hardware.cpu)" stop-opacity="0.3"/>
                            <stop offset="50%" :stop-color="getStatusColor(systemMonitor.hardware.cpu)" stop-opacity="0.1"/>
                            <stop offset="100%" :stop-color="getStatusColor(systemMonitor.hardware.cpu)" stop-opacity="0"/>
                          </linearGradient>
                          <filter :id="`cpu-glow`">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <path
                          :d="generateLinePath(systemMonitor.hardwareHistory.cpu, 300, 60)"
                          :fill="`url(#cpu-gradient)`"
                          :stroke="getStatusColor(systemMonitor.hardware.cpu)"
                          stroke-width="2.5"
                          fill-opacity="0.5"
                          filter="url(#cpu-glow)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle
                          v-for="(point, index) in getPointPositions(systemMonitor.hardwareHistory.cpu, 300, 60)"
                          :key="`cpu-${index}`"
                          :cx="point.x"
                          :cy="point.y"
                          r="2.5"
                          :fill="getStatusColor(systemMonitor.hardware.cpu)"
                          class="chart-point"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- 内存折线图 -->
                  <div class="hardware-chart-expanded">
                    <div class="hardware-chart-header">
                      <UIcon name="i-heroicons-server" class="w-4 h-4" :style="{ color: getStatusColor(systemMonitor.hardware.memory) }" />
                      <span class="hardware-chart-label">内存</span>
                      <span class="hardware-chart-current" :style="{ color: getStatusColor(systemMonitor.hardware.memory) }">
                        {{ systemMonitor.hardware.memory }}%
                      </span>
                    </div>
                    <div class="line-chart-container">
                      <svg class="line-chart" viewBox="0 0 300 60">
                        <defs>
                          <linearGradient :id="`memory-gradient`" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" :stop-color="getStatusColor(systemMonitor.hardware.memory)" stop-opacity="0.3"/>
                            <stop offset="50%" :stop-color="getStatusColor(systemMonitor.hardware.memory)" stop-opacity="0.1"/>
                            <stop offset="100%" :stop-color="getStatusColor(systemMonitor.hardware.memory)" stop-opacity="0"/>
                          </linearGradient>
                          <filter :id="`memory-glow`">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <path
                          :d="generateLinePath(systemMonitor.hardwareHistory.memory, 300, 60)"
                          :fill="`url(#memory-gradient)`"
                          :stroke="getStatusColor(systemMonitor.hardware.memory)"
                          stroke-width="2.5"
                          fill-opacity="0.5"
                          filter="url(#memory-glow)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle
                          v-for="(point, index) in getPointPositions(systemMonitor.hardwareHistory.memory, 300, 60)"
                          :key="`memory-${index}`"
                          :cx="point.x"
                          :cy="point.y"
                          r="2.5"
                          :fill="getStatusColor(systemMonitor.hardware.memory)"
                          class="chart-point"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- 硬盘折线图 -->
                  <div class="hardware-chart-expanded">
                    <div class="hardware-chart-header">
                      <UIcon name="i-heroicons-circle-stack" class="w-4 h-4" :style="{ color: getStatusColor(systemMonitor.hardware.disk) }" />
                      <span class="hardware-chart-label">硬盘</span>
                      <span class="hardware-chart-current" :style="{ color: getStatusColor(systemMonitor.hardware.disk) }">
                        {{ systemMonitor.hardware.disk }}%
                      </span>
                    </div>
                    <div class="line-chart-container">
                      <svg class="line-chart" viewBox="0 0 300 60">
                        <defs>
                          <linearGradient :id="`disk-gradient`" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" :stop-color="getStatusColor(systemMonitor.hardware.disk)" stop-opacity="0.3"/>
                            <stop offset="50%" :stop-color="getStatusColor(systemMonitor.hardware.disk)" stop-opacity="0.1"/>
                            <stop offset="100%" :stop-color="getStatusColor(systemMonitor.hardware.disk)" stop-opacity="0"/>
                          </linearGradient>
                          <filter :id="`disk-glow`">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <path
                          :d="generateLinePath(systemMonitor.hardwareHistory.disk, 300, 60)"
                          :fill="`url(#disk-gradient)`"
                          :stroke="getStatusColor(systemMonitor.hardware.disk)"
                          stroke-width="2.5"
                          fill-opacity="0.5"
                          filter="url(#disk-glow)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle
                          v-for="(point, index) in getPointPositions(systemMonitor.hardwareHistory.disk, 300, 60)"
                          :key="`disk-${index}`"
                          :cx="point.x"
                          :cy="point.y"
                          r="2.5"
                          :fill="getStatusColor(systemMonitor.hardware.disk)"
                          class="chart-point"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 垂直分隔线 -->
            <div class="monitor-divider-vertical"></div>

            <!-- 右侧列：系统信息 + 节点信息 -->
            <div class="monitor-right-column">
              <!-- 系统信息 -->
              <div class="monitor-info-section">
                <div class="monitor-title">系统信息</div>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">版本</span>
                    <span class="info-value">{{ systemMonitor.info.version }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">数据库</span>
                    <span class="info-value">{{ systemMonitor.info.database }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">缓存</span>
                    <span class="info-value">{{ systemMonitor.info.redis }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">运行时间</span>
                    <span class="info-value">{{ systemMonitor.info.uptime }}</span>
                  </div>
                </div>
              </div>

              <!-- 水平分隔线 -->
              <div class="monitor-divider-horizontal-small"></div>

              <!-- 节点信息 -->
              <div class="monitor-info-section">
                <div class="monitor-title">节点信息</div>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">主机名</span>
                    <span class="info-value">logto-node-01</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">IP 地址</span>
                    <span class="info-value">192.168.1.100</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">操作系统</span>
                    <span class="info-value">Ubuntu 22.04 LTS</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">状态</span>
                    <span class="info-value status-online">● 在线</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：快速提示 + 快速操作 + 最近活动 -->
    <div class="secondary-grid">
      <!-- 快速提示 -->
      <div class="tips-section">
        <div class="section-header">
          <h2 class="section-title">系统提示</h2>
          <p class="section-description">重要信息提醒</p>
        </div>
        <div class="tips-card">
          <div
            v-for="tip in quickTips"
            :key="tip.title"
            class="tip-item"
            :class="`tip-item-${tip.type}`"
          >
            <span class="tip-icon">{{ tip.icon }}</span>
            <div class="tip-content">
              <p class="tip-title">{{ tip.title }}</p>
              <p class="tip-description">{{ tip.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">快速操作</h2>
          <p class="section-description">常用功能快捷入口</p>
        </div>
        <div class="quick-actions-list">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.title"
            :to="action.link"
            class="quick-action-card-vertical"
          >
            <div class="quick-action-icon" :class="`quick-action-icon-${action.color}`">
              <UIcon :name="action.icon" class="w-5 h-5" />
            </div>
            <div class="quick-action-content">
              <p class="quick-action-title">{{ action.title }}</p>
              <p class="quick-action-description">{{ action.description }}</p>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="quick-action-arrow w-4 h-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="activities-section">
        <div class="section-header">
          <h2 class="section-title">最近活动</h2>
          <p class="section-description">系统动态和操作记录</p>
        </div>
        <div class="activities-list">
          <div
            v-for="activity in recentActivities"
            :key="activity.message"
            class="activity-item"
          >
            <div class="activity-icon" :class="`activity-icon-${activity.type}`">
              <UIcon
                :name="{
                  user: 'i-heroicons-user',
                  app: 'i-heroicons-cube',
                  system: 'i-heroicons-cog-6-tooth',
                  security: 'i-heroicons-shield-exclamation',
                  invite: 'i-heroicons-envelope'
                }[activity.type]"
                class="w-4 h-4"
              />
            </div>
            <div class="activity-content">
              <p class="activity-message">{{ activity.message }}</p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <div class="footer-item">
        <UIcon name="i-heroicons-clock" class="w-4 h-4 text-gray-400" />
        <span class="text-sm text-gray-500">最后更新: {{ currentTime }}</span>
      </div>
      <div class="footer-item">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
        <span class="text-sm text-gray-500">系统运行正常</span>
      </div>
      <div class="footer-item">
        <UIcon name="i-heroicons-server" class="w-4 h-4 text-gray-400" />
        <span class="text-sm text-gray-500">{{ systemMonitor.info.version }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1.5rem;
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.welcome-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
}

.welcome-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

/* 指标卡片网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.metric-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
}

.metric-icon-purple {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #8b5cf6;
}

.metric-icon-emerald {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #10b981;
}

.metric-icon-amber {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #f59e0b;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-title {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.metric-change-up {
  color: #10b981;
}

.metric-change-down {
  color: #ef4444;
}

/* 主要网格 */
.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 次要网格 */
.secondary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 通用区块样式 */
.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.section-description {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
}

/* 快速操作 */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.quick-action-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.625rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.quick-action-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.quick-action-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-action-icon-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
}

.quick-action-icon-purple {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #8b5cf6;
}

.quick-action-icon-emerald {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #10b981;
}

.quick-action-icon-amber {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #f59e0b;
}

.quick-action-content {
  flex: 1;
  min-width: 0;
}

.quick-action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.125rem;
}

.quick-action-description {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-action-arrow {
  color: #d1d5db;
  flex-shrink: 0;
}

.quick-action-card:hover .quick-action-arrow {
  color: #9ca3af;
}

/* 快速操作区域（第二行） */
.quick-actions-section {
  display: flex;
  flex-direction: column;
}

.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-action-card-vertical {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.quick-action-card-vertical:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-action-card-vertical .quick-action-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-action-card-vertical .quick-action-content {
  flex: 1;
  min-width: 0;
}

.quick-action-card-vertical .quick-action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.125rem;
}

.quick-action-card-vertical .quick-action-description {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-action-card-vertical .quick-action-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
}

.quick-action-card-vertical:hover .quick-action-arrow {
  color: #94a3b8;
}

/* 系统监控卡片 */
.system-monitor-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.monitor-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

/* 系统监控网格布局 */
.monitor-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

/* 左侧列：网络 + 硬件 */
.monitor-left-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 网络状态（紧凑指标） */
.monitor-network-compact {
  width: 100%;
}

.network-indicators {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.network-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 0.625rem;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.network-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.15), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.network-indicator:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(203, 213, 225, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.network-indicator:hover::before {
  opacity: 1;
}

.network-indicator-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
  margin-bottom: 0.25rem;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.08);
}

.network-indicator-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.network-indicator-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.network-indicator-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

/* 不同网络状态的颜色主题 */
.network-indicator-down .network-indicator-icon {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.15);
}

.network-indicator-up .network-indicator-icon {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #8b5cf6;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.15);
}

.network-indicator-latency .network-indicator-icon {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #10b981;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15);
}

.network-indicator-unit {
  display: none; /* 隐藏单位，让显示更紧凑 */
}

/* 硬件监控（大折线图） */
.monitor-hardware-expanded {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hardware-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  padding: 0;
}

.hardware-title-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.025em;
}

.hardware-time-range {
  font-size: 0.6875rem;
  color: #94a3b8;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.6);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.hardware-charts-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
}

.hardware-chart-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hardware-chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
}

.hardware-chart-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  flex: 1;
  letter-spacing: 0.025em;
}

.hardware-chart-current {
  font-size: 0.8125rem;
  font-weight: 700;
}

.line-chart-container {
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
}

.line-chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 19px,
    rgba(0, 0, 0, 0.02) 19px,
    rgba(0, 0, 0, 0.02) 20px
  );
  pointer-events: none;
}

.line-chart {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.chart-point {
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.chart-point:hover {
  r: 3.5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 垂直分隔线 */
.monitor-divider-vertical {
  width: 1px;
  background: rgba(241, 245, 249, 0.8);
  align-self: stretch;
}

/* 右侧列：系统信息 + 节点信息 */
.monitor-right-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.monitor-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.monitor-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(248, 250, 252, 0.8);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.info-value.status-online {
  color: #10b981;
}

/* 水平分隔线（小） */
.monitor-divider-horizontal-small {
  height: 1px;
  background: rgba(241, 245, 249, 0.8);
  width: 100%;
}

/* 快速提示 */
.tips-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item-success {
  background: rgba(236, 253, 245, 0.6);
}

.tip-item-info {
  background: rgba(239, 246, 255, 0.6);
}

.tip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.125rem;
}

.tip-description {
  font-size: 0.75rem;
  color: #64748b;
}

/* 最近活动 */
.activities-list {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(241, 245, 249, 0.8);
  transition: background 0.15s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon-user {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
}

.activity-icon-app {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #8b5cf6;
}

.activity-icon-system {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #f59e0b;
}

.activity-icon-security {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #ef4444;
}

.activity-icon-invite {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #10b981;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  font-size: 0.875rem;
  color: #334155;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.activity-time {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 400;
}

/* 底部信息 */
.footer-info {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 响应式 */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .secondary-grid {
    grid-template-columns: 1fr;
  }

  .monitor-grid-layout {
    grid-template-columns: 1fr;
  }

  .monitor-divider-vertical {
    display: none;
  }

  .monitor-right-column {
    border-top: 1px solid rgba(241, 245, 249, 0.8);
    padding-top: 1.25rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .welcome-section {
    flex-direction: column;
  }

  .welcome-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .secondary-grid {
    grid-template-columns: 1fr;
  }

  .network-indicators {
    grid-template-columns: 1fr;
  }

  .network-indicator {
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.75rem;
  }

  .network-indicator-content {
    flex-direction: row;
    gap: 0.5rem;
  }

  .footer-info {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
