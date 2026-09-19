<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">审计日志</h2><p class="page-desc">操作审计记录</p></div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead><tr><th>时间</th><th>用户</th><th>操作</th><th>资源</th><th>状态</th></tr></thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ fmtTime(log.createdAt) }}</td>
            <td>{{ log.userName || log.userId || '—' }}</td>
            <td>{{ log.action }}</td>
            <td>{{ log.resourceName || log.resource }}</td>
            <td><span class="badge" :class="log.success ? 'badge-green' : 'badge-red'">{{ log.success ? '成功' : '失败' }}</span></td>
          </tr>
          <tr v-if="logs.length === 0"><td colspan="5" class="empty">暂无日志</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '审计日志' })
const api = useApi()
const loading = ref(true)
const logs = ref<any[]>([])

function fmtTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try { const res = await api('/audit-logs', { query: { page: 1, pageSize: 50 } }); logs.value = res.data ?? [] }
  catch (e) { console.error(e) } finally { loading.value = false }
})
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.loading, .empty { text-align: center; padding: 40px; color: var(--text3); }
.table-wrap { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 12px 20px; font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.06); }
.data-table td { padding: 12px 20px; font-size: 13px; color: var(--text); border-bottom: 1px solid rgba(0,0,0,0.04); }
.badge { padding: 2px 8px; border-radius: 6px; font-size: 11px; }
.badge-green { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-red { background: rgba(220,38,38,0.1); color: #dc2626; }
</style>
