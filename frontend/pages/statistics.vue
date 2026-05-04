<template>
  <div class="stats-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据统计</h2>
        <p class="page-desc">查看系统数据统计和分析</p>
      </div>
      <div class="header-period">
        <button
          v-for="p in periods"
          :key="p.value"
          class="period-btn"
          :class="{ active: activePeriod === p.value }"
          @click="activePeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="metrics-grid">
      <div v-for="(m, i) in metrics" :key="i" class="metric-card">
        <div class="metric-top">
          <div class="metric-info">
            <span class="metric-label">{{ m.label }}</span>
            <span class="metric-value">{{ m.value }}</span>
          </div>
          <div class="metric-icon-circle" :style="{ background: m.bg }">
            <svg v-if="m.icon === 'users'" width="18" height="18" fill="none" :stroke="m.color" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else-if="m.icon === 'orgs'" width="18" height="18" fill="none" :stroke="m.color" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <svg v-else-if="m.icon === 'sessions'" width="18" height="18" fill="none" :stroke="m.color" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
            <svg v-else width="18" height="18" fill="none" :stroke="m.color" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="metric-bottom">
          <div class="metric-trend" :class="m.trend">
            <svg v-if="m.trend === 'up'" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <svg v-else width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {{ m.change }}
          </div>
          <!-- Sparkline -->
          <svg class="sparkline" viewBox="0 0 80 28" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="'sparkGrad' + i" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="m.color" stop-opacity="0.3" />
                <stop offset="100%" :stop-color="m.color" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="m.sparkArea" :fill="'url(#sparkGrad' + i + ')'" />
            <path :d="m.sparkLine" fill="none" :stroke="m.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- User Growth Chart -->
      <div class="glass-card chart-large">
        <div class="card-header">
          <h2 class="card-title">用户增长趋势</h2>
          <span class="card-subtitle">最近 7 天</span>
        </div>
        <div class="area-chart-container">
          <svg class="area-chart" :viewBox="`0 0 ${chartW} ${chartH}`" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
              </linearGradient>
            </defs>

            <!-- Grid lines -->
            <line
              v-for="(y, idx) in gridYs"
              :key="'g' + idx"
              :x1="padL"
              :y1="y"
              :x2="chartW - padR"
              :y2="y"
              stroke="rgba(0,0,0,0.04)"
              stroke-width="1"
            />

            <!-- Y axis labels -->
            <text
              v-for="(yt, idx) in yTicks"
              :key="'yt' + idx"
              :x="padL - 8"
              :y="yt.y + 4"
              text-anchor="end"
              font-size="11"
              fill="#94a3b8"
              font-family="DM Sans, sans-serif"
            >
              {{ yt.label }}
            </text>

            <!-- Area fill -->
            <path :d="growthArea" fill="url(#areaGrad)" />

            <!-- Line -->
            <path :d="growthLine" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Data points -->
            <circle
              v-for="(pt, idx) in growthPoints"
              :key="'pt' + idx"
              :cx="pt.x"
              :cy="pt.y"
              r="4"
              fill="#fff"
              stroke="#6366f1"
              stroke-width="2"
            />

            <!-- X axis labels -->
            <text
              v-for="(xl, idx) in xLabels"
              :key="'xl' + idx"
              :x="xl.x"
              :y="chartH - 4"
              text-anchor="middle"
              font-size="11"
              fill="#94a3b8"
              font-family="DM Sans, sans-serif"
            >
              {{ xl.label }}
            </text>
          </svg>
        </div>
      </div>

      <!-- Activity Breakdown -->
      <div class="glass-card chart-small">
        <div class="card-header">
          <h2 class="card-title">活动分布</h2>
          <span class="card-subtitle">今日</span>
        </div>
        <div class="bar-chart">
          <div v-for="(bar, idx) in activityBars" :key="idx" class="bar-row">
            <div class="bar-label">{{ bar.label }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: bar.percent + '%', background: bar.color }"
              ></div>
            </div>
            <div class="bar-count">{{ bar.count }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Feed -->
    <div class="glass-card">
      <div class="card-header">
        <h2 class="card-title">最近活动</h2>
        <span class="card-subtitle">最新 5 条</span>
      </div>
      <div class="activity-feed">
        <div v-for="(item, idx) in recentActivities" :key="idx" class="feed-item">
          <div class="feed-dot" :style="{ background: item.color }"></div>
          <div class="feed-content">
            <span class="feed-text" v-html="item.text"></span>
            <span class="feed-time">{{ item.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({ name: 'statistics' })

useHead({ title: '数据统计' })

const activePeriod = ref('7d')
const periods = [
  { label: '今日', value: '1d' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' },
]

// ===== Metric Cards =====
const metricsData = [
  { label: '总用户', value: '2,847', change: '12.5%', trend: 'up', icon: 'users', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', spark: [5, 8, 6, 10, 9, 14, 12] },
  { label: '总组织', value: '156', change: '3.2%', trend: 'up', icon: 'orgs', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', spark: [3, 4, 5, 4, 6, 5, 7] },
  { label: '活跃会话', value: '1,203', change: '5.7%', trend: 'up', icon: 'sessions', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', spark: [8, 10, 7, 12, 11, 9, 13] },
  { label: 'API 调用 (今日)', value: '34.2K', change: '2.1%', trend: 'down', icon: 'api', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', spark: [14, 12, 15, 10, 13, 11, 9] },
]

function buildSparkline(data) {
  const w = 80, h = 28, pad = 2
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return { x, y }
  })
  const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
  const area = line + ` L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`
  return { sparkLine: line, sparkArea: area }
}

const metrics = computed(() => {
  return metricsData.map(m => {
    const { sparkLine, sparkArea } = buildSparkline(m.spark)
    return { ...m, sparkLine, sparkArea }
  })
})

// ===== Growth Chart =====
const chartW = 600, chartH = 220
const padL = 44, padR = 16, padT = 16, padB = 32

const growthData = [120, 145, 132, 168, 155, 190, 210]
const growthLabels = ['04/27', '04/28', '04/29', '04/30', '05/01', '05/02', '05/03']

const gMax = computed(() => Math.ceil(Math.max(...growthData) / 50) * 50)
const gMin = 0

const growthPoints = computed(() => {
  return growthData.map((v, i) => {
    const x = padL + (i / (growthData.length - 1)) * (chartW - padL - padR)
    const y = padT + (1 - (v - gMin) / (gMax.value - gMin)) * (chartH - padT - padB)
    return { x, y }
  })
})

const growthLine = computed(() => {
  return growthPoints.value.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
})

const growthArea = computed(() => {
  const pts = growthPoints.value
  const bottom = chartH - padB
  return growthLine.value + ` L${pts[pts.length - 1].x},${bottom} L${pts[0].x},${bottom} Z`
})

const gridYs = computed(() => {
  const count = 4
  const arr = []
  for (let i = 0; i <= count; i++) {
    arr.push(padT + (i / count) * (chartH - padT - padB))
  }
  return arr
})

const yTicks = computed(() => {
  const count = 4
  const arr = []
  for (let i = 0; i <= count; i++) {
    const val = gMax.value - (i / count) * (gMax.value - gMin)
    arr.push({ y: padT + (i / count) * (chartH - padT - padB), label: Math.round(val) })
  }
  return arr
})

const xLabels = computed(() => {
  return growthLabels.map((label, i) => ({
    x: padL + (i / (growthLabels.length - 1)) * (chartW - padL - padR),
    label,
  }))
})

// ===== Activity Bars =====
const maxBarCount = 480
const activityBars = [
  { label: '登录', count: 480, percent: 100, color: 'linear-gradient(90deg, #6366f1, #818cf8)' },
  { label: '创建用户', count: 125, percent: (125 / 480) * 100, color: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
  { label: '组织变更', count: 67, percent: (67 / 480) * 100, color: 'linear-gradient(90deg, #14b8a6, #2dd4bf)' },
  { label: '角色变更', count: 34, percent: (34 / 480) * 100, color: 'linear-gradient(90deg, #6366f1, #14b8a6)' },
]

// ===== Recent Activity =====
const recentActivities = [
  { color: '#6366f1', text: '<strong>张伟</strong> 创建了新用户 <strong>李明</strong>', time: '3 分钟前' },
  { color: '#22c55e', text: '<strong>王芳</strong> 更新了组织 <strong>技术团队</strong> 的角色', time: '15 分钟前' },
  { color: '#f59e0b', text: '<strong>管理员</strong> 发送了邀请给 <strong>zhang@company.com</strong>', time: '1 小时前' },
  { color: '#8b5cf6', text: '<strong>李娜</strong> 删除了应用 <strong>测试应用</strong>', time: '2 小时前' },
  { color: '#14b8a6', text: '<strong>赵强</strong> 登录了系统，来源: Chrome / macOS', time: '3 小时前' },
]
</script>

<style scoped>
.stats-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1e293b;
}

.page-desc {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.header-period {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 4px;
}

.period-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.period-btn:not(.active):hover {
  color: #1e293b;
  background: rgba(0, 0, 0, 0.04);
}

/* ===== Metrics ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
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
  margin-bottom: 16px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.metric-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1e293b;
  line-height: 1;
}

.metric-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 8px;
}

.metric-trend.up {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.08);
}

.metric-trend.down {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.sparkline {
  width: 80px;
  height: 28px;
  flex-shrink: 0;
}

/* ===== Glass Card (shared) ===== */
.glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.card-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94a3b8;
}

/* ===== Charts Row ===== */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
  margin-bottom: 20px;
}

.area-chart-container {
  width: 100%;
  height: 220px;
}

.area-chart {
  width: 100%;
  height: 100%;
}

/* ===== Bar Chart ===== */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  width: 72px;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 10px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.8s ease;
}

.bar-count {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  width: 48px;
  text-align: right;
  flex-shrink: 0;
}

/* ===== Activity Feed ===== */
.activity-feed {
  display: flex;
  flex-direction: column;
}

.feed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.feed-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feed-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #64748b;
}

.feed-text :deep(strong) {
  color: #1e293b;
  font-weight: 600;
}

.feed-time {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .header-period {
    width: 100%;
  }

  .period-btn {
    flex: 1;
    text-align: center;
  }

  .feed-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .bar-label {
    width: 56px;
    font-size: 12px;
  }
}
</style>
