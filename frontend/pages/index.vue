<template>
  <div class="dashboard">
    <!-- 核心指标 -->
    <div class="metrics-grid">
      <div v-for="m in metrics" :key="m.label" class="metric-card">
        <div class="metric-header">
          <span class="metric-label">{{ m.label }}</span>
          <UIcon :name="m.icon" class="metric-icon" :style="{ color: m.color, background: m.bgColor }" />
        </div>
        <div class="metric-body">
          <span class="metric-value">{{ m.value }}</span>
        </div>
        <div class="metric-bar" :class="m.barClass" :style="{ width: m.barWidth }"></div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="section">
      <h2 class="section-title">快捷操作</h2>
      <div class="actions-grid">
        <NuxtLink v-for="a in quickActions" :key="a.label" :to="a.to" class="action-card">
          <UIcon :name="a.icon" class="action-icon" :style="{ color: a.color, background: a.bgColor }" />
          <span class="action-label">{{ a.label }}</span>
          <span class="action-desc">{{ a.desc }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 最近活动 + 系统状态 -->
    <div class="bottom-grid">
      <div class="panel-card">
        <h3 class="panel-title">最近活动</h3>
        <div v-if="loading" class="loading-text">加载中...</div>
        <div v-else-if="recentActivities.length === 0" class="empty-text">暂无活动记录</div>
        <div v-else class="activity-list">
          <div v-for="act in recentActivities" :key="act.id" class="activity-item">
            <span class="activity-dot" :class="act.success ? 'dot-success' : 'dot-error'"></span>
            <div class="activity-content">
              <span class="activity-text">
                <strong>{{ act.userName || act.userId || '未知用户' }}</strong>
                {{ act.action }}
              </span>
              <span class="activity-time">{{ formatTime(act.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <h3 class="panel-title">系统状态</h3>
        <div class="status-list">
          <div class="status-item">
            <span class="status-dot dot-success"></span>
            <span class="status-label">身份服务</span>
            <span class="status-value">运行中</span>
          </div>
          <div class="status-item">
            <span class="status-dot dot-success"></span>
            <span class="status-label">数据库</span>
            <span class="status-value">已连接</span>
          </div>
          <div class="status-item">
            <span class="status-dot" :class="auth.isTenantAdmin ? 'dot-success' : 'dot-warning'"></span>
            <span class="status-label">当前角色</span>
            <span class="status-value">{{ auth.isTenantAdmin ? '租户管理员' : '成员' }}</span>
          </div>
          <div class="status-item">
            <span class="status-dot dot-success"></span>
            <span class="status-label">当前租户</span>
            <span class="status-value">{{ auth.currentTenantName || '未选择' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const api = useApi()

useHead({ title: '仪表板' })

const loading = ref(true)
const overview = ref({ totalUsers: 0, totalOrganizations: 0, activeSessions: 0 })
const recentActivities = ref<Array<{
  id: string
  userId?: string
  userName?: string
  action: string
  success: boolean
  createdAt: string
}>>([])

const metrics = computed(() => [
  {
    label: '总用户',
    value: overview.value.totalUsers.toLocaleString(),
    icon: 'i-heroicons-users',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.1)',
    barClass: 'bar-1',
    barWidth: '75%',
  },
  {
    label: '组织数量',
    value: overview.value.totalOrganizations.toLocaleString(),
    icon: 'i-heroicons-building-office-2',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.1)',
    barClass: 'bar-2',
    barWidth: '62%',
  },
  {
    label: '活跃会话',
    value: overview.value.activeSessions.toLocaleString(),
    icon: 'i-heroicons-bolt',
    color: '#14b8a6',
    bgColor: 'rgba(20,184,166,0.1)',
    barClass: 'bar-3',
    barWidth: '42%',
  },
])

const quickActions = [
  { label: '用户管理', desc: '查看和管理用户', icon: 'i-heroicons-users', to: '/users', color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)' },
  { label: '邀请用户', desc: '发送注册邀请', icon: 'i-heroicons-envelope', to: '/invitations', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)' },
  { label: '应用接入', desc: '接入新应用', icon: 'i-heroicons-rectangle-stack', to: '/applications', color: '#14b8a6', bgColor: 'rgba(20,184,166,0.1)' },
  { label: '个人中心', desc: '修改密码和资料', icon: 'i-heroicons-user-circle', to: '/me', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
]

function formatTime(ts: string | number) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  try {
    const [ov, acts] = await Promise.all([
      api('/statistics/overview'),
      api('/audit-logs', { query: { page: 1, pageSize: 8 } }),
    ])
    overview.value = ov
    recentActivities.value = acts.data ?? []
  } catch (err) {
    console.error('Dashboard data fetch failed:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2, #64748b);
}

.metric-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.metric-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}

.metric-bar {
  height: 6px;
  border-radius: 3px;
  margin-top: 16px;
}

.bar-1 { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.bar-2 { background: linear-gradient(90deg, #8b5cf6, #a855f7); }
.bar-3 { background: linear-gradient(90deg, #14b8a6, #06b6d4); }

/* 快捷操作 */
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text, #1e293b);
  margin-bottom: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #1e293b);
}

.action-desc {
  font-size: 12px;
  color: var(--text3, #94a3b8);
}

/* 底部双栏 */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text, #1e293b);
  margin-bottom: 16px;
}

.loading-text,
.empty-text {
  font-size: 13px;
  color: var(--text3, #94a3b8);
  text-align: center;
  padding: 24px 0;
}

/* 活动列表 */
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.dot-success {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}

.dot-error {
  background: #dc2626;
  box-shadow: 0 0 6px rgba(220, 38, 38, 0.4);
}

.dot-warning {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.activity-text {
  font-size: 13px;
  color: var(--text, #1e293b);
}

.activity-text strong {
  font-weight: 600;
}

.activity-time {
  font-size: 11px;
  color: var(--text3, #94a3b8);
}

/* 系统状态 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-label {
  font-size: 13px;
  color: var(--text2, #64748b);
  flex: 1;
}

.status-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #1e293b);
}

/* 响应式 */
@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: 1fr 1fr; }
  .actions-grid { grid-template-columns: 1fr 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr 1fr; }
}
</style>
