<template>
  <div>
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">审计日志</h2>
        <p class="page-desc">操作审计记录（{{ totalCount }} 条）</p>
      </div>
      <button class="btn-secondary" @click="exportCsv">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
        导出 CSV
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <input v-model="searchInput" type="text" placeholder="搜索用户、操作..." class="search-input" @input="debounceSearch" />
      </div>
      <select v-model="actionFilter" class="filter-select" @change="fetchLogs">
        <option value="">全部操作</option>
        <option value="user.create">用户创建</option>
        <option value="user.update">用户更新</option>
        <option value="user.delete">用户删除</option>
        <option value="org.create">组织创建</option>
        <option value="org.update">组织更新</option>
        <option value="app.create">应用接入</option>
      </select>
      <select v-model="statusFilter" class="filter-select" @change="fetchLogs">
        <option value="">全部状态</option>
        <option value="true">成功</option>
        <option value="false">失败</option>
      </select>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="skeleton-wrap">
      <div v-for="i in 6" :key="i" class="skeleton-row">
        <div class="skeleton skeleton-dot"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>

    <!-- 数据表 -->
    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>时间</th><th>用户</th><th>操作</th><th>资源</th><th>IP</th><th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="table-row">
            <td class="time-cell">{{ fmtTime(log.createdAt) }}</td>
            <td><strong>{{ log.userName || log.userId || '—' }}</strong></td>
            <td><code class="action-code">{{ log.action }}</code></td>
            <td>{{ log.resourceName || log.resource }}</td>
            <td class="ip-cell">{{ log.ipAddress || '—' }}</td>
            <td>
              <span class="badge" :class="log.success ? 'badge-green' : 'badge-red'">
                <span class="badge-dot" :class="log.success ? 'dot-green' : 'dot-red'"></span>
                {{ log.success ? '成功' : '失败' }}
              </span>
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="6" class="empty">暂无审计记录</td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '审计日志' })

const api = useApi()
const loading = ref(true)
const logs = ref<any[]>([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = 20
const searchInput = ref('')
const actionFilter = ref('')
const statusFilter = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))

let debounceTimer: ReturnType<typeof setTimeout>
function debounceSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchLogs() }, 400)
}

async function fetchLogs() {
  loading.value = true
  try {
    const query: Record<string, unknown> = {
      page: page.value,
      pageSize,
    }
    if (searchInput.value) query.search = searchInput.value
    if (actionFilter.value) query.action = actionFilter.value
    if (statusFilter.value) query.success = statusFilter.value === 'true'

    const res = await api('/audit-logs', { query })
    logs.value = res.data ?? []
    totalCount.value = res.total ?? res.data?.length ?? 0
  } catch (e) {
    console.error('Failed to fetch audit logs:', e)
  } finally {
    loading.value = false
  }
}

function goPage(p: number) {
  page.value = p
  fetchLogs()
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function exportCsv() {
  const headers = ['时间', '用户', '操作', '资源', '资源ID', 'IP', '状态', '错误信息']
  const rows = logs.value.map(log => [
    fmtTime(log.createdAt),
    log.userName ?? log.userId ?? '',
    log.action,
    log.resourceName ?? log.resource ?? '',
    log.resourceId ?? '',
    log.ipAddress ?? '',
    log.success ? '成功' : '失败',
    log.errorMessage ?? '',
  ])
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(fetchLogs)
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
  font-size: 24px; font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}
.page-desc { font-size: 14px; color: var(--text2, #64748b); margin-top: 4px; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.search-wrap { position: relative; flex: 1; max-width: 320px; }
.search-icon {
  position: absolute;
  left: 14px; top: 50%;
  transform: translateY(-50%);
  color: var(--text3, #94a3b8);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}
.search-input:focus {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.filter-select {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--text, #1e293b);
  outline: none;
  cursor: pointer;
}

.skeleton-wrap {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
}
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.skeleton {
  background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
.skeleton-dot { width: 8px; height: 8px; border-radius: 50%; }
.skeleton-line { height: 14px; flex: 1; }
.skeleton-line.short { flex: 0.4; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.table-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  overflow: hidden;
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left;
  padding: 12px 20px;
  font-size: 11px; font-weight: 600;
  color: var(--text3, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.3);
}
.data-table td {
  padding: 12px 20px;
  font-size: 13px;
  color: var(--text, #1e293b);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.table-row { transition: background 0.15s ease; }
.table-row:hover { background: rgba(255, 255, 255, 0.4); }
.time-cell { font-size: 12px; color: var(--text2, #64748b); }
.ip-cell { font-size: 12px; color: var(--text3, #94a3b8); font-family: monospace; }
.action-code {
  font-size: 12px;
  color: var(--indigo, #6366f1);
  background: rgba(99, 102, 241, 0.06);
  padding: 2px 8px;
  border-radius: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-green { background: #22c55e; }
.dot-red { background: #dc2626; }
.badge-green { background: rgba(34, 197, 94, 0.08); color: #16a34a; }
.badge-red { background: rgba(220, 38, 38, 0.08); color: #dc2626; }

.empty { text-align: center; padding: 40px; color: var(--text3, #94a3b8); }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}
.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px; height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text2, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}
.page-btn:hover:not(:disabled) { background: rgba(99, 102, 241, 0.08); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: var(--text2, #64748b); }

@media (max-width: 768px) {
  .toolbar { flex-direction: column; }
  .search-wrap { max-width: 100%; }
  .data-table th:nth-child(5), .data-table td:nth-child(5) { display: none; }
}
</style>
