<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">用户管理</h2><p class="page-desc">管理本系统的用户账号</p></div>
      <button class="btn-primary" @click="showCreate = true">+ 创建用户</button>
    </div>
    <div class="toolbar">
      <input v-model="search" type="text" placeholder="搜索用户..." class="search-input" @keyup.enter="fetchUsers" />
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead><tr><th>用户</th><th>邮箱</th><th>状态</th><th>加入时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td><div class="user-cell"><div class="avatar-sm">{{ (u.name||u.username||'?')[0] }}</div><div><div class="u-name">{{ u.name || u.username || '未命名' }}</div><div class="u-id">{{ u.username || u.id }}</div></div></div></td>
            <td>{{ u.primaryEmail || '—' }}</td>
            <td><span class="badge" :class="u.isSuspended ? 'badge-red' : 'badge-green'">{{ u.isSuspended ? '已停用' : '正常' }}</span></td>
            <td>{{ fmtDate(u.joinedAt) }}</td>
            <td><button class="btn-sm btn-red" @click="delUser(u)">删除</button></td>
          </tr>
          <tr v-if="users.length === 0"><td colspan="5" class="empty">暂无用户</td></tr>
        </tbody>
      </table>
    </div>
    <div v-if="showCreate" class="modal-mask" @click.self="showCreate = false">
      <div class="modal">
        <h3>创建用户</h3>
        <input v-model="form.name" placeholder="姓名" class="input" />
        <input v-model="form.primaryEmail" placeholder="邮箱" class="input" />
        <input v-model="form.password" type="password" placeholder="初始密码（≥8位）" class="input" />
        <div class="modal-actions">
          <button class="btn-sm" @click="showCreate = false">取消</button>
          <button class="btn-sm btn-primary" @click="createUser" :disabled="creating">{{ creating ? '创建中...' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '用户管理' })
const api = useApi()
const loading = ref(true)
const users = ref<any[]>([])
const search = ref('')
const showCreate = ref(false)
const creating = ref(false)
const form = reactive({ name: '', primaryEmail: '', password: '' })

async function fetchUsers() {
  loading.value = true
  try {
    const res = await api('/users', { query: { search: search.value || undefined, page: 1, pageSize: 50 } })
    users.value = res.data
  } catch (e) { console.error(e) } finally { loading.value = false }
}

async function createUser() {
  if (!form.primaryEmail || !form.password || form.password.length < 8) return alert('请填写邮箱和至少 8 位密码')
  creating.value = true
  try {
    await api('/users', { method: 'POST', body: { ...form } })
    showCreate.value = false
    Object.assign(form, { name: '', primaryEmail: '', password: '' })
    await fetchUsers()
  } catch (e: any) { alert(e?.data?.message ?? '创建失败') } finally { creating.value = false }
}

async function delUser(u: any) {
  if (!confirm(`确定删除用户 ${u.name || u.primaryEmail}？`)) return
  try { await api(`/users/${u.id}`, { method: 'DELETE' }); await fetchUsers() }
  catch (e: any) { alert(e?.data?.message ?? '删除失败') }
}

function fmtDate(ts: any) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(fetchUsers)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; letter-spacing: -0.02em; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 10px 20px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; }
.toolbar { margin-bottom: 16px; }
.search-input { width: 100%; max-width: 400px; padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 14px; outline: none; }
.loading, .empty { text-align: center; padding: 40px; color: var(--text3); font-size: 14px; }
.table-wrap { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 20px; font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.06); }
.data-table td { padding: 14px 20px; font-size: 14px; color: var(--text); border-bottom: 1px solid rgba(0,0,0,0.04); }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-sm { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, var(--indigo), var(--teal)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.u-name { font-weight: 600; }
.u-id { font-size: 12px; color: var(--text3); }
.badge { padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }
.badge-green { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-red { background: rgba(220,38,38,0.1); color: #dc2626; }
.btn-sm { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; }
.btn-red { color: #dc2626; border-color: rgba(220,38,38,0.2); }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; width: 400px; display: flex; flex-direction: column; gap: 12px; }
.modal h3 { font-size: 18px; color: var(--text); margin-bottom: 8px; }
.input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
</style>
