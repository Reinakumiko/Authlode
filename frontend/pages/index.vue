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
    label: '总用户',
    value: '2,847',
    change: '↑ 12.5%',
    trend: 'up',
    icon: 'i-heroicons-users',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.1)',
    barClass: 'bar-1',
    barWidth: '75%'
  },
  {
    label: '组织数量',
    value: '156',
    change: '↑ 3.2%',
    trend: 'up',
    icon: 'i-heroicons-building-office-2',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.1)',
    barClass: 'bar-2',
    barWidth: '62%'
  },
  {
    label: '应用数量',
    value: '42',
    change: '↑ 8.1%',
    trend: 'up',
    icon: 'i-heroicons-rectangle-stack',
    color: '#14b8a6',
    bgColor: 'rgba(20,184,166,0.1)',
    barClass: 'bar-3',
    barWidth: '42%'
  },
  {
    label: '活跃会话',
    value: '1,203',
    change: '↑ 5.7%',
    trend: 'up',
    icon: 'i-heroicons-signal',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.08)',
    barClass: 'bar-4',
    barWidth: '88%'
  },
  {
    label: '待处理邀请',
    value: '23',
    change: '↓ 4.2%',
    trend: 'down',
    icon: 'i-heroicons-envelope',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.08)',
    barClass: 'bar-5',
    barWidth: '30%'
  }
])

// 服务状态
const services = ref([
  { name: 'Logto', status: '运行中' },
  { name: 'PostgreSQL', status: '运行中' },
  { name: 'Redis', status: '运行中' }
])
const uptime = ref('14天 7小时 32分钟')

// CPU / Memory
const cpuUsage = ref(34.2)
const memoryUsage = ref(67.8)

// 磁盘使用率
const diskUsage = ref(70)
const diskUsed = '350 GB'
const diskTotal = '500 GB'

// 快捷操作
const quickActions = ref([
  { title: '用户管理', count: '2,847 用户', icon: 'i-heroicons-users', color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)', link: '/users' },
  { title: '邀请用户', count: '23 待处理', icon: 'i-heroicons-envelope', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', link: '/invitations' },
  { title: '组织管理', count: '156 组织', icon: 'i-heroicons-building-office-2', color: '#14b8a6', bgColor: 'rgba(20,184,166,0.1)', link: '/organizations' },
  { title: '角色权限', count: '12 角色', icon: 'i-heroicons-shield-check', color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)', link: '/roles' },
  { title: '应用管理', count: '42 应用', icon: 'i-heroicons-rectangle-stack', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)', link: '/applications' }
])

// 最近活动
const recentActivities = ref([
  { dotColor: '#6366f1', text: '<strong>张伟</strong> 创建了新用户 <strong>李明</strong>', time: '3 分钟前' },
  { dotColor: '#22c55e', text: '<strong>王芳</strong> 更新了组织 <strong>技术团队</strong> 的角色', time: '15 分钟前' },
  { dotColor: '#f59e0b', text: '<strong>管理员</strong> 发送了邀请给 <strong>zhang@company.com</strong>', time: '1 小时前' },
  { dotColor: '#8b5cf6', text: '<strong>李娜</strong> 删除了应用 <strong>测试应用</strong>', time: '2 小时前' },
  { dotColor: '#14b8a6', text: '<strong>赵强</strong> 登录了系统，来源: Chrome / macOS', time: '3 小时前' }
])

// 系统日志
const systemLogs = ref([
  { dotColor: '#22c55e', text: '<strong>系统</strong> 自动备份完成，数据库大小: 2.3 GB', time: '5 分钟前' },
  { dotColor: '#f59e0b', text: '<strong>安全</strong> 检测到异常登录尝试，来源: 192.168.1.105', time: '22 分钟前' },
  { dotColor: '#6366f1', text: '<strong>部署</strong> Logto v1.2.0 更新完成', time: '1 小时前' },
  { dotColor: '#22c55e', text: '<strong>系统</strong> SSL 证书续期成功，有效期至 2027-05-01', time: '3 小时前' },
  { dotColor: '#14b8a6', text: '<strong>监控</strong> CPU 峰值告警已恢复，当前负载正常', time: '4 小时前' }
])

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
  <div class="dashboard">
    <!-- Header -->
    <AppHeader />

    <!-- Metrics Row -->
    <div class="metrics">
      <div
        v-for="(metric, idx) in metrics"
        :key="idx"
        class="metric-card"
      >
        <div class="metric-top">
          <div class="metric-left">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">{{ metric.value }}</div>
          </div>
          <div class="metric-right">
            <div class="metric-icon-circle" :style="{ background: metric.bgColor }">
              <UIcon :name="metric.icon" class="icon-sm" :style="{ color: metric.color }" />
            </div>
            <div class="metric-change" :class="metric.trend === 'up' ? 'up' : 'down'">
              {{ metric.change }}
            </div>
          </div>
        </div>
        <div class="metric-bar">
          <div class="metric-bar-fill" :class="metric.barClass" :style="{ width: metric.barWidth }"></div>
        </div>
      </div>
    </div>

    <!-- Monitoring Row -->
    <div class="monitoring">
      <!-- 服务状态 -->
      <div class="mon-card service-card">
        <div class="mon-title">
          <UIcon name="i-heroicons-server-stack" class="icon-md" />
          服务状态
        </div>
        <div class="service-list">
          <div v-for="service in services" :key="service.name" class="service-item">
            <span class="service-name">
              <span class="status-dot"></span>
              {{ service.name }}
            </span>
            <span class="status-text">{{ service.status }}</span>
          </div>
        </div>
        <div class="uptime">运行时间: {{ uptime }}</div>
      </div>

      <!-- CPU + Memory -->
      <div class="mon-card cpu-memory-card">
        <!-- CPU -->
        <div class="cpu-memory-row">
          <div class="cpu-memory-info">
            <div class="mon-title sm">
              <UIcon name="i-heroicons-cpu-chip" class="icon-md" />
              CPU 使用率
            </div>
            <div class="mon-val">{{ cpuUsage }}%</div>
          </div>
          <div class="cpu-memory-chart">
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 40">
              <path d="M0 30 Q10 28 20 25 T40 20 T60 22 T80 18 T100 15 T120 17 T140 12 T160 14 T180 10 T200 8" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" />
              <path d="M0 30 Q10 28 20 25 T40 20 T60 22 T80 18 T100 15 T120 17 T140 12 T160 14 T180 10 T200 8 V40 H0Z" fill="url(#g1)" opacity="0.15" />
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="200" y2="0">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="100%" stop-color="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <!-- Memory -->
        <div class="cpu-memory-row">
          <div class="cpu-memory-info">
            <div class="mon-title sm">
              <UIcon name="i-heroicons-server" class="icon-md" />
              内存使用率
            </div>
            <div class="mon-val">{{ memoryUsage }}%</div>
          </div>
          <div class="cpu-memory-chart">
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 40">
              <path d="M0 35 Q15 30 30 28 T60 25 T90 22 T120 20 T150 18 T180 16 T200 12" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" />
              <path d="M0 35 Q15 30 30 28 T60 25 T90 22 T120 20 T150 18 T180 16 T200 12 V40 H0Z" fill="url(#g2)" opacity="0.15" />
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="200" y2="0">
                  <stop offset="0%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <!-- 磁盘使用率 -->
      <div class="mon-card disk-card">
        <div class="mon-title">
          <UIcon name="i-heroicons-circle-stack" class="icon-md" />
          磁盘使用率
        </div>
        <div class="disk-chart-wrapper">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="12" />
            <circle
              cx="60" cy="60" r="48"
              fill="none"
              stroke="url(#diskGrad)"
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="`${(diskUsage / 100) * 301.6} 301.6`"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="56" text-anchor="middle" font-family="Space Grotesk" font-size="20" font-weight="800" fill="#1e293b">
              {{ diskUsage }}%
            </text>
            <text x="60" y="72" text-anchor="middle" font-size="10" fill="#94a3b8">磁盘空间</text>
            <defs>
              <linearGradient id="diskGrad">
                <stop offset="0%" stop-color="#14b8a6" />
                <stop offset="100%" stop-color="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="disk-info">已用 {{ diskUsed }} / {{ diskTotal }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-title">快捷操作</div>
    <div class="quick-actions">
      <NuxtLink
        v-for="(action, idx) in quickActions"
        :key="idx"
        :to="action.link"
        class="qa-card"
      >
        <div class="qa-icon" :style="{ background: action.bgColor }">
          <UIcon :name="action.icon" class="icon-lg" :style="{ color: action.color }" />
        </div>
        <div class="qa-card-title">{{ action.title }}</div>
        <div class="qa-card-count">{{ action.count }}</div>
      </NuxtLink>
    </div>

    <!-- Activity Grid -->
    <div class="activity-grid">
      <!-- 最近活动 -->
      <div>
        <div class="section-title">最近活动</div>
        <div class="activity">
          <div
            v-for="(item, idx) in recentActivities"
            :key="idx"
            class="activity-item"
          >
            <div class="activity-dot" :style="{ background: item.dotColor }"></div>
            <div class="activity-text" v-html="item.text"></div>
            <div class="activity-time">{{ item.time }}</div>
          </div>
        </div>
      </div>

      <!-- 系统日志 -->
      <div>
        <div class="section-title">系统日志</div>
        <div class="activity">
          <div
            v-for="(item, idx) in systemLogs"
            :key="idx"
            class="activity-item"
          >
            <div class="activity-dot" :style="{ background: item.dotColor }"></div>
            <div class="activity-text" v-html="item.text"></div>
            <div class="activity-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Icons ===== */
.icon-sm {
  width: 18px;
  height: 18px;
}

.icon-md {
  width: 18px;
  height: 18px;
  color: var(--indigo, #6366f1);
}

.icon-lg {
  width: 22px;
  height: 22px;
}

/* ===== Metrics ===== */
.metrics {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.metric-left {
  flex: 1;
}

.metric-label {
  font-size: 12px;
  color: var(--text2, #64748b);
  margin-bottom: 6px;
  font-weight: 500;
}

.metric-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
  line-height: 1;
}

.metric-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.metric-change {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
}

.metric-change.up {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.08);
}

.metric-change.down {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.metric-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-bar {
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
  margin-top: 14px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease;
}

.bar-1 {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}

.bar-2 {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.bar-3 {
  background: linear-gradient(90deg, #14b8a6, #2dd4bf);
}

.bar-4 {
  background: linear-gradient(90deg, #6366f1, #14b8a6);
}

.bar-5 {
  background: linear-gradient(90deg, #8b5cf6, #14b8a6);
}

/* ===== Monitoring ===== */
.monitoring {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}

.mon-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.mon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.mon-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--text, #1e293b);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mon-title.sm {
  margin-bottom: 4px;
}

/* Service Status */
.service-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-list {
  flex: 1;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.service-item:last-child {
  border-bottom: none;
}

.service-name {
  font-size: 13px;
  color: var(--text2, #64748b);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
  flex-shrink: 0;
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  color: #22c55e;
}

.uptime {
  font-size: 12px;
  color: var(--text3, #94a3b8);
  margin-top: 8px;
}

/* CPU + Memory */
.cpu-memory-card {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.cpu-memory-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cpu-memory-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 90px;
}

.mon-val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}

.cpu-memory-chart {
  flex: 1;
  height: 80px;
  overflow: hidden;
}

/* Disk */
.disk-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.disk-chart-wrapper {
  margin: 8px 0;
}

.disk-info {
  font-size: 12px;
  color: var(--text3, #94a3b8);
  margin-top: 8px;
}

/* ===== Quick Actions ===== */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.qa-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 18px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.qa-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.qa-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.qa-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #1e293b);
}

.qa-card-count {
  font-size: 12px;
  color: var(--text3, #94a3b8);
  margin-top: 2px;
}

/* ===== Activity Grid ===== */
.activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.activity {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-text {
  flex: 1;
  font-size: 13px;
  color: var(--text2, #64748b);
}

.activity-text :deep(strong) {
  color: var(--text, #1e293b);
  font-weight: 600;
}

.activity-time {
  font-size: 12px;
  color: var(--text3, #94a3b8);
  white-space: nowrap;
}

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .metrics {
    grid-template-columns: repeat(3, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .monitoring {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
