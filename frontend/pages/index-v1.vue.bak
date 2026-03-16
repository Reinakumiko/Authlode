<template>
  <div class="dashboard">
    <!-- 顶部标题 -->
    <div class="header">
      <div>
        <h1 class="header-title">Dashboard</h1>
        <p class="header-subtitle">欢迎回来,管理员</p>
      </div>
      <UButton icon="i-heroicons-plus" size="lg" class="header-btn">
        新建项目
      </UButton>
    </div>

    <!-- 统计卡片 -->
    <section class="stats">
      <div class="stat-card" v-for="(stat, i) in stats" :key="i" :style="{ '--delay': `${i * 50}ms` }" :class="`stat-card-${stat.gradient}`">
        <div class="stat-icon" :class="`stat-${stat.gradient}`">
          <UIcon :name="stat.icon" class="w-5 h-5" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-trend" :class="`trend-${stat.type}`">
          <UIcon :name="stat.trendIcon" class="w-3 h-3" />
          <span>{{ stat.trend }}</span>
        </div>
      </div>
    </section>

    <!-- 内容区域 -->
    <div class="content-grid">
      <!-- 快速访问 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">快速访问</h2>
        </div>
        <div class="quick-actions">
          <NuxtLink
            v-for="(action, i) in actions"
            :key="i"
            :to="{ name: action.route }"
            class="action-item"
            :style="{ '--delay': `${i * 30}ms` }"
          >
            <div class="action-icon" :class="`action-${action.gradient}`">
              <UIcon :name="action.icon" class="w-4 h-4" />
            </div>
            <span class="action-label">{{ action.label }}</span>
            <UIcon name="i-heroicons-arrow-right" class="action-arrow w-4 h-4" />
          </NuxtLink>
        </div>
      </div>

      <!-- 活动流 -->
      <div class="card">
        <div class="card-header-group">
          <h2 class="card-title">活动流</h2>
          <UButton
            :to="{ name: 'audit-logs' }"
            variant="ghost"
            size="sm"
            icon="i-heroicons-arrow-right"
            trailing
          >
            查看全部
          </UButton>
        </div>
        <div class="activity-flow">
          <div
            v-for="(log, i) in logs"
            :key="i"
            class="activity-item"
            :style="{ '--delay': `${i * 30}ms` }"
          >
            <div class="activity-icon" :class="`activity-${log.type}`">
              <UIcon :name="log.icon" class="w-3.5 h-3.5" />
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ log.text }}</div>
              <div class="activity-time">{{ log.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = [
  {
    label: '总用户数',
    value: '1,234',
    trend: '+12%',
    type: 'up',
    trendIcon: 'i-heroicons-arrow-trending-up',
    icon: 'i-heroicons-users',
    gradient: 'blue'
  },
  {
    label: '组织数',
    value: '48',
    trend: '+5%',
    type: 'up',
    trendIcon: 'i-heroicons-arrow-trending-up',
    icon: 'i-heroicons-building-office-2',
    gradient: 'purple'
  },
  {
    label: '待处理',
    value: '23',
    trend: '审核',
    type: 'neutral',
    trendIcon: 'i-heroicons-clock',
    icon: 'i-heroicons-envelope',
    gradient: 'pink'
  },
  {
    label: '今日活跃',
    value: '89',
    trend: '+8%',
    type: 'up',
    trendIcon: 'i-heroicons-arrow-trending-up',
    icon: 'i-heroicons-bolt',
    gradient: 'cyan'
  }
]

const actions = [
  { label: '用户管理', icon: 'i-heroicons-user-group', route: 'users', gradient: 'blue' },
  { label: '邀请管理', icon: 'i-heroicons-envelope-open', route: 'invitations', gradient: 'purple' },
  { label: '组织架构', icon: 'i-heroicons-building-office', route: 'organizations', gradient: 'pink' },
  { label: '角色权限', icon: 'i-heroicons-shield-check', route: 'roles', gradient: 'cyan' }
]

const logs = [
  { text: '创建了新用户 "张三"', time: '5分钟前', type: 'success', icon: 'i-heroicons-check' },
  { text: '更新了 "研发部" 组织信息', time: '15分钟前', type: 'info', icon: 'i-heroicons-pencil' },
  { text: '批量发送 5 封邀请邮件', time: '1小时前', type: 'warning', icon: 'i-heroicons-envelope' },
  { text: '完成系统安全配置', time: '2小时前', type: 'success', icon: 'i-heroicons-shield-check' },
  { text: '清理过期访问令牌', time: '3小时前', type: 'info', icon: 'i-heroicons-trash' },
  { text: '更新配置参数', time: '4小时前', type: 'info', icon: 'i-heroicons-adjustments' }
]

useHead({ title: 'Dashboard' })
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

/* 顶部标题 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 2rem;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.header-subtitle {
  font-size: 0.9375rem;
  color: #64748b;
  font-weight: 500;
}

.header-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-btn:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

/* 统计卡片 */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  position: relative;
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  animation-delay: var(--delay);
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  padding: 1px;
  background: linear-gradient(135deg, var(--border-color), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
}

.stat-card-blue {
  --border-color: rgba(59, 130, 246, 0.5);
}

.stat-card-purple {
  --border-color: rgba(139, 92, 246, 0.5);
}

.stat-card-pink {
  --border-color: rgba(236, 72, 153, 0.5);
}

.stat-card-cyan {
  --border-color: rgba(6, 182, 212, 0.5);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.stat-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-pink {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.stat-cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.trend-up {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.trend-neutral {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

/* 内容区域 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.125rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08);
}

.card-header,
.card-header-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.875rem;
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

/* 快速访问 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.15s ease;
  animation: slideInRight 0.3s ease-out backwards;
  animation-delay: var(--delay);
}

.action-item:hover {
  background: rgba(99, 102, 241, 0.05);
  transform: translateX(2px);
}

.action-icon {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.action-purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.action-pink {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.action-cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.action-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.action-arrow {
  color: #cbd5e1;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.action-item:hover .action-arrow {
  color: #6366f1;
  transform: translateX(2px);
}

/* 活动流 */
.activity-flow {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.625rem;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  animation: fadeIn 0.3s ease-out backwards;
  animation-delay: var(--delay);
}

.activity-item:hover {
  background: rgba(99, 102, 241, 0.04);
}

.activity-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.activity-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.activity-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.activity-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.activity-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.activity-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.6875rem;
  color: #94a3b8;
  font-weight: 500;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-title {
    font-size: 1.875rem;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
