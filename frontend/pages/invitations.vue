<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">邀请管理</h2><p class="page-desc">邀请新用户注册加入本系统</p></div>
      <button class="btn-primary" @click="showCreate = true">+ 发送邀请</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead><tr><th>邮箱</th><th>状态</th><th>过期时间</th><th>邀请链接</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="inv in invitations" :key="inv.id">
            <td>{{ inv.email }}</td>
            <td><span class="badge" :class="statusClass(inv.status)">{{ statusText(inv.status) }}</span></td>
            <td>{{ fmtDate(inv.expiresAt) }}</td>
            <td><code class="link" @click="copyLink(inv)">{{ inv.link?.slice(0, 50) }}...</code></td>
            <td>
              <button v-if="inv.status === 'PENDING'" class="btn-sm btn-red" @click="cancelInv(inv)">取消</button>
            </td>
          </tr>
          <tr v-if="invitations.length === 0"><td colspan="5" class="empty">暂无邀请</td></tr>
        </tbody>
      </table>
    </div>
    <div v-if="showCreate" class="modal-mask" @click.self="showCreate = false">
      <div class="modal">
        <h3>发送邀请</h3>
        <input v-model="form.email" placeholder="对方邮箱地址" class="input" type="email" />
        <div class="modal-actions">
          <button class="btn-sm" @click="showCreate = false">取消</button>
          <button class="btn-sm btn-primary" @click="createInv" :disabled="creating">{{ creating ? '发送中...' : '发送' }}</button>
        </div>
      </div>
    </div>
    <div v-if="createdLink" class="modal-mask" @click.self="createdLink = null">
      <div class="modal">
        <h3>✓ 邀请已创建</h3>
        <p class="hint">将以下链接发送给对方（也可直接复制）：</p>
        <div class="link-block"><code>{{ createdLink }}</code></div>
        <button class="btn-sm" @click="copyToClipboard(createdLink)">复制链接</button>
        <button class="btn-sm btn-primary" @click="createdLink = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '邀请管理' })
const api = useApi()
const loading = ref(true)
const invitations = ref<any[]>([])
const showCreate = ref(false)
const creating = ref(false)
const createdLink = ref<string | null>(null)
const form = reactive({ email: '' })

async function fetchInvitations() {
  loading.value = true
  try { const res = await api('/invitations'); invitations.value = res.data }
  catch (e) { console.error(e) } finally { loading.value = false }
}

async function createInv() {
  if (!form.email) return alert('请填写邮箱')
  creating.value = true
  try {
    const result = await api('/invitations', { method: 'POST', body: { email: form.email } })
    createdLink.value = result.link
    showCreate.value = false
    form.email = ''
    await fetchInvitations()
  } catch (e: any) { alert(e?.data?.message ?? '创建失败') } finally { creating.value = false }
}

async function cancelInv(inv: any) {
  if (!confirm(`确定取消对 ${inv.email} 的邀请？`)) return
  try { await api(`/invitations/${inv.id}/cancel`, { method: 'PATCH' }); await fetchInvitations() }
  catch (e: any) { alert(e?.data?.message ?? '取消失败') }
}

function copyLink(inv: any) { copyToClipboard(inv.link) }
function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text)
  alert('已复制到剪贴板')
}

function statusClass(s: string) {
  return { PENDING: 'badge-yellow', ACCEPTED: 'badge-green', EXPIRED: 'badge-gray', CANCELLED: 'badge-red' }[s] ?? 'badge-gray'
}
function statusText(s: string) {
  return { PENDING: '待接受', ACCEPTED: '已接受', EXPIRED: '已过期', CANCELLED: '已取消' }[s] ?? s
}
function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(fetchInvitations)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; letter-spacing: -0.02em; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 10px 20px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: var(--text3); font-size: 14px; }
.table-wrap { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 20px; font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.06); }
.data-table td { padding: 14px 20px; font-size: 14px; color: var(--text); border-bottom: 1px solid rgba(0,0,0,0.04); }
.badge { padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }
.badge-green { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-yellow { background: rgba(245,158,11,0.1); color: #d97706; }
.badge-gray { background: rgba(0,0,0,0.06); color: var(--text3); }
.badge-red { background: rgba(220,38,38,0.1); color: #dc2626; }
.link { font-size: 12px; color: var(--indigo); cursor: pointer; text-decoration: underline; }
.btn-sm { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; }
.btn-red { color: #dc2626; border-color: rgba(220,38,38,0.2); }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; width: 440px; display: flex; flex-direction: column; gap: 12px; }
.modal h3 { font-size: 18px; color: var(--text); }
.input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.hint { font-size: 14px; color: var(--text2); }
.link-block { background: rgba(0,0,0,0.03); border-radius: 12px; padding: 14px; }
.link-block code { font-size: 12px; word-break: break-all; color: var(--text); }
</style>
