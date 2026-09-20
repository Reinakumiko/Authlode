<template>
  <div>
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">数据统计</h2>
        <p class="page-desc">本系统的关键指标</p>
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="skeleton-wrap">
      <div class="skeleton-grid">
        <div v-for="i in 3" :key="i" class="skeleton skeleton-card"></div>
      </div>
      <div class="skeleton skeleton-chart"></div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div v-for="s in statCards" :key="s.label" class="stat-card">
        <div class="stat-icon" :style="{ background: s.bgColor }">
          <UIcon :name="s.icon" class="icon" :style="{ color: s.color }" />
        </div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- 用户增长折线图 -->
    <div class="chart-card">
      <h3 class="chart-title">用户增长（最近 30 天）</h3>
      <div v-if="growthData.length === 0" class="chart-empty">暂无增长数据</div>
      <svg v-else class="line-chart" viewBox="0 0 600 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <!-- 折线 -->
        <path :d="linePath" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- 填充 -->
        <path :d="areaPath" fill="url(#lineGrad)" stroke="none"/>
        <!-- 数据点 -->
        <circle
          v-for="(point, i) in linePoints"
          :key="i"
          :cx="point.x" :cy="point.y" r="3"
          fill="#6366f1"
          opacity="0.6"
        />
      </svg>
      <div class="chart-x-labels" v-if="growthData.length > 0">
        <span>{{ growthData[0]?.date }}</span>
        <span>{{ growthData[growthData.length - 1]?.date }}</span>
      </div>
    </div>

    <!-- 活动分布柱状图 -->
    <div class="chart-card">
      <h3 class="chart-title">活动分布</h3>
      <div v-if="activityData.length === 0" class="chart-empty">暂无活动数据</div>
      <div v-else class="bar-chart">
        <div v-for="item in activityData" :key="item.action" class="bar-row">
          <span class="bar-label">{{ item.action }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: barWidth(item.count) + '%' }"></div>
          </div>
          <span class="bar-count">{{ item.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '数据统计' })

const api = useApi()
const loading = ref(true)
const overview = ref({ totalUsers: 0, totalOrganizations: 0, activeSessions: 0 })
const growthData = ref<Array<{ date: string; count: number }>>([])
const activityData = ref<Array<{ action: string; count: number }>>([])

const statCards = computed(() => [
  {
    label: '总用户', value: overview.value.totalUsers,
    icon: 'i-heroicons-users', color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)',
  },
  {
    label: '组织数量', value: overview.value.totalOrganizations,
    icon: 'i-heroicons-building-office-2', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)',
  },
  {
    label: '活跃会话', value: overview.value.activeSessions,
    icon: 'i-heroicons-bolt', color: '#14b8a6', bgColor: 'rgba(20,184,166,0.1)',
  },
])

// 折线图坐标计算
const linePoints = computed(() => {
  if (growthData.value.length === 0) return []
  const maxCount = Math.max(...growthData.value.map(d => d.count), 1)
  const step = 600 / Math.max(growthData.value.length - 1, 1)
  return growthData.value.map((d, i) => ({
    x: i * step,
    y: 180 - (d.count / maxCount) * 160,
  }))
})

const linePath = computed(() => {
  const points = linePoints.value
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const points = linePoints.value
  if (points.length === 0) return ''
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  return `${path} L600,200 L0,200 Z`
})

// 柱状图宽度
const maxActivity = computed(() => Math.max(...activityData.value.map(a => a.count), 1))
function barWidth(count: number) {
  return (count / maxActivity.value) * 100
}

onMounted(async () => {
  try {
    const [ov, growth, activity] = await Promise.all([
      api('/statistics/overview'),
      api('/statistics/growth'),
      api('/statistics/activity'),
    ])
    overview.value = ov
    growthData.value = growth
    activityData.value = activity
  } catch (e) {
    console.error('Failed to fetch statistics:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}
.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}
.page-desc { font-size: 14px; color: var(--text2, #64748b); margin-top: 4px; }

/* 骨架屏 */
.skeleton-wrap { margin-bottom: 28px; }
.skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.skeleton {
  background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}
.skeleton-card { height: 100px; }
.skeleton-chart { height: 250px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.icon { width: 24px; height: 24px; }
.stat-label { font-size: 13px; color: var(--text2, #64748b); }
.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px; font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}

/* 图表卡片 */
.chart-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
}
.chart-title {
  font-size: 14px; font-weight: 700;
  color: var(--text, #1e293b);
  margin-bottom: 16px;
}
.chart-empty {
  text-align: center; padding: 40px;
  color: var(--text3, #94a3b8); font-size: 13px;
}

/* 折线图 */
.line-chart { width: 100%; height: 200px; }
.chart-x-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text3, #94a3b8);
  margin-top: 4px;
}

/* 柱状图 */
.bar-chart { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label {
  width: 140px;
  font-size: 13px;
  color: var(--text2, #64748b);
  text-align: right;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar-track {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.04);
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.5s ease;
  min-width: 2px;
}
.bar-count {
  width: 40px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #1e293b);
  text-align: right;
  font-family: 'Space Grotesk', sans-serif;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .bar-label { width: 80px; }
}
</style>
