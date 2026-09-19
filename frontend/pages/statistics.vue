<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">数据统计</h2><p class="page-desc">本系统的关键指标</p></div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">总用户</div>
        <div class="stat-value">{{ overview.totalUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">组织数量</div>
        <div class="stat-value">{{ overview.totalOrganizations }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">活跃会话</div>
        <div class="stat-value">{{ overview.activeSessions }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '数据统计' })
const api = useApi()
const loading = ref(true)
const overview = ref({ totalUsers: 0, totalOrganizations: 0, activeSessions: 0 })

onMounted(async () => {
  try { overview.value = await api('/statistics/overview') }
  catch (e) { console.error(e) } finally { loading.value = false }
})
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.loading { text-align: center; padding: 40px; color: var(--text3); }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 32px; text-align: center; }
.stat-label { font-size: 14px; color: var(--text2); margin-bottom: 8px; }
.stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }
</style>
