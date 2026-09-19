<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">应用接入</h2><p class="page-desc">接入 SSO 应用，获取 OIDC 配置</p></div>
      <button class="btn-primary" @click="showCreate = true">+ 接入应用</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="apps.length === 0" class="empty-card">
      <p>暂未接入应用</p>
      <p class="hint">接入应用后，用户可通过 SSO 单点登录访问</p>
    </div>
    <div v-else class="apps-grid">
      <div v-for="app in apps" :key="app.id" class="app-card">
        <div class="app-header">
          <div class="app-icon">{{ app.name[0] }}</div>
          <div class="app-info">
            <div class="app-name">{{ app.name }}</div>
            <div class="app-type">{{ app.type === 'spa' ? 'SPA' : '传统 Web' }}</div>
          </div>
          <span class="badge" :class="app.enabled ? 'badge-green' : 'badge-gray'">{{ app.enabled ? '已启用' : '已停用' }}</span>
        </div>
        <div class="app-config">
          <div class="config-row"><span class="config-label">Client ID</span><code class="config-val">{{ app.applicationId }}</code></div>
          <div class="config-row"><span class="config-label">Issuer</span><code class="config-val">{{ app.endpoints?.issuer }}</code></div>
          <div class="config-row"><span class="config-label">回调地址</span><code class="config-val">{{ (app.redirectUris || []).join(', ') || '—' }}</code></div>
        </div>
        <div class="app-actions">
          <button class="btn-sm" @click="toggle(app)">{{ app.enabled ? '停用' : '启用' }}</button>
          <button class="btn-sm btn-red" @click="remove(app)">移除</button>
        </div>
      </div>
    </div>
    <div v-if="showCreate" class="modal-mask" @click.self="showCreate = false">
      <div class="modal">
        <h3>接入新应用</h3>
        <input v-model="form.name" placeholder="应用名称" class="input" />
        <select v-model="form.type" class="input">
          <option value="spa">SPA（单页应用）</option>
          <option value="traditional">传统 Web 应用</option>
        </select>
        <textarea v-model="form.redirectUris" placeholder="回调地址（每行一个 URL）" class="input textarea" rows="3"></textarea>
        <div class="modal-actions">
          <button class="btn-sm" @click="showCreate = false">取消</button>
          <button class="btn-sm btn-primary" @click="createApp" :disabled="creating">{{ creating ? '接入中...' : '接入' }}</button>
        </div>
      </div>
    </div>
    <div v-if="createdApp" class="modal-mask" @click.self="createdApp = null">
      <div class="modal success-modal">
        <h3>✓ 接入成功</h3>
        <p class="success-hint">将以下 OIDC 配置用于你的应用：</p>
        <div class="config-block">
          <div class="config-row"><span class="config-label">Client ID</span><code>{{ createdApp.id }}</code></div>
          <div class="config-row"><span class="config-label">Issuer</span><code>{{ createdApp.endpoints?.issuer }}</code></div>
          <div class="config-row"><span class="config-label">授权端点</span><code>{{ createdApp.endpoints?.authorizationUrl }}</code></div>
          <div class="config-row"><span class="config-label">Token 端点</span><code>{{ createdApp.endpoints?.tokenUrl }}</code></div>
          <div class="config-row"><span class="config-label">JWKS</span><code>{{ createdApp.endpoints?.jwksUri }}</code></div>
        </div>
        <button class="btn-sm btn-primary" @click="createdApp = null; fetchApps()">完成</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '应用接入' })
const api = useApi()
const loading = ref(true)
const apps = ref<any[]>([])
const showCreate = ref(false)
const creating = ref(false)
const createdApp = ref<any>(null)
const form = reactive({ name: '', type: 'spa', redirectUris: '' })

async function fetchApps() {
  loading.value = true
  try { const res = await api('/tenant-applications'); apps.value = res.data }
  catch (e) { console.error(e) } finally { loading.value = false }
}

async function createApp() {
  if (!form.name || !form.redirectUris.trim()) return alert('请填写应用名称和回调地址')
  creating.value = true
  try {
    const uris = form.redirectUris.trim().split('\n').map(s => s.trim()).filter(Boolean)
    const result = await api('/tenant-applications', { method: 'POST', body: { name: form.name, type: form.type, redirectUris: uris } })
    createdApp.value = result
    showCreate.value = false
    Object.assign(form, { name: '', type: 'spa', redirectUris: '' })
  } catch (e: any) { alert(e?.data?.message ?? '接入失败') } finally { creating.value = false }
}

async function toggle(app: any) {
  try { await api(`/tenant-applications/${app.id}`, { method: 'PATCH', body: { enabled: !app.enabled } }); await fetchApps() }
  catch (e: any) { alert(e?.data?.message ?? '操作失败') }
}

async function remove(app: any) {
  if (!confirm(`确定移除应用「${app.name}」？`)) return
  try { await api(`/tenant-applications/${app.id}`, { method: 'DELETE' }); await fetchApps() }
  catch (e: any) { alert(e?.data?.message ?? '移除失败') }
}

onMounted(fetchApps)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; letter-spacing: -0.02em; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 10px 20px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; }
.loading { text-align: center; padding: 40px; color: var(--text3); }
.empty-card { text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; color: var(--text2); }
.hint { font-size: 13px; color: var(--text3); margin-top: 8px; }
.apps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
.app-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 20px; transition: all 0.2s ease; }
.app-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.app-icon { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, var(--indigo), var(--teal)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
.app-info { flex: 1; }
.app-name { font-weight: 600; font-size: 15px; color: var(--text); }
.app-type { font-size: 12px; color: var(--text3); }
.badge { padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 500; }
.badge-green { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-gray { background: rgba(0,0,0,0.06); color: var(--text3); }
.app-config { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.config-row { display: flex; gap: 8px; align-items: baseline; }
.config-label { font-size: 12px; color: var(--text3); min-width: 70px; flex-shrink: 0; }
.config-val { font-size: 12px; color: var(--text); word-break: break-all; }
.app-actions { display: flex; gap: 8px; }
.btn-sm { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; }
.btn-red { color: #dc2626; border-color: rgba(220,38,38,0.2); }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; width: 440px; display: flex; flex-direction: column; gap: 12px; }
.modal h3 { font-size: 18px; color: var(--text); }
.input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); }
.textarea { resize: vertical; font-family: monospace; font-size: 13px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.success-modal { width: 520px; }
.success-hint { font-size: 14px; color: var(--text2); }
.config-block { background: rgba(0,0,0,0.03); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.config-block code { font-size: 12px; color: var(--text); word-break: break-all; }
</style>
