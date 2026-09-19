<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">角色权限</h2><p class="page-desc">管理 IAM 实例级角色</p></div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead><tr><th>角色名</th><th>描述</th><th>类型</th></tr></thead>
        <tbody>
          <tr v-for="r in roles" :key="r.id">
            <td><strong>{{ r.name }}</strong></td>
            <td>{{ r.description || '—' }}</td>
            <td><span class="badge">{{ r.type || 'User' }}</span></td>
          </tr>
          <tr v-if="roles.length === 0"><td colspan="3" class="empty">暂无角色</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '角色权限' })
const api = useApi()
const loading = ref(true)
const roles = ref<any[]>([])

onMounted(async () => {
  try { const res = await api('/roles', { query: { pageSize: 50 } }); roles.value = res.data }
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
.data-table th { text-align: left; padding: 14px 20px; font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.06); }
.data-table td { padding: 14px 20px; font-size: 14px; color: var(--text); border-bottom: 1px solid rgba(0,0,0,0.04); }
.badge { padding: 3px 10px; border-radius: 8px; font-size: 12px; background: rgba(99,102,241,0.1); color: var(--indigo); }
</style>
