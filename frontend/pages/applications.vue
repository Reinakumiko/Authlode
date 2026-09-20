<template>
  <div>
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">应用接入</h2>
        <p class="page-desc">接入 SSO 应用，获取 OIDC 配置（{{ apps.length }} 个）</p>
      </div>
      <button class="btn-primary" @click="startWizard">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        接入应用
      </button>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="skeleton-wrap">
      <div v-for="i in 3" :key="i" class="skeleton-row">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="apps.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 003-3m-3 3c-1.657 0-3 1.343-3 3s1.343 3 3 3m0-6a3 3 0 013-3m13.5 6a3 3 0 013-3m-3 3a3 3 0 013 3m-3-6v6m3-3a3 3 0 01-3-3m3 3a3 3 0 00-3 3m-13.5-9V4.5c0-1.242 1.008-2.25 2.25-2.25h9.75c1.242 0 2.25 1.008 2.25 2.25v15M13.5 4.5h3"/></svg>
      </div>
      <p class="empty-title">暂未接入应用</p>
      <p class="empty-desc">接入应用后，用户可通过 SSO 单点登录访问</p>
      <button class="btn-primary" @click="startWizard">接入第一个应用</button>
    </div>

    <!-- 应用卡片列表 -->
    <div v-else class="apps-grid">
      <div v-for="app in apps" :key="app.id" class="app-card">
        <div class="app-header">
          <div class="app-icon">{{ app.name[0] }}</div>
          <div class="app-info">
            <div class="app-name">{{ app.name }}</div>
            <div class="app-type">{{ typeLabel(app.type) }}</div>
          </div>
          <button class="toggle-btn" :class="{ on: app.enabled }" @click="toggle(app)">
            <span class="toggle-circle"></span>
          </button>
        </div>
        <div class="app-config">
          <div class="config-row">
            <span class="config-label">Client ID</span>
            <code class="config-val" @click="copyText(app.applicationId)">{{ app.applicationId }}</code>
          </div>
          <div class="config-row">
            <span class="config-label">Issuer</span>
            <code class="config-val">{{ app.endpoints?.issuer }}</code>
          </div>
          <div class="config-row">
            <span class="config-label">回调地址</span>
            <code class="config-val">{{ (app.redirectUris || []).join(', ') || '—' }}</code>
          </div>
        </div>
        <div class="app-actions">
          <button class="btn-sm" @click="viewConfig(app)">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            查看
          </button>
          <button class="btn-sm" @click="openEdit(app)">编辑</button>
          <button class="btn-sm btn-danger" @click="confirmDelete(app)">移除</button>
        </div>
      </div>
    </div>

    <!-- 分步向导 -->
    <div v-if="wizardStep > 0" class="modal-mask" @click.self="closeWizard">
      <div class="modal wizard">
        <!-- 步骤指示器 -->
        <div class="steps">
          <div class="step" :class="{ active: wizardStep >= 1, done: wizardStep > 1 }">
            <div class="step-num">1</div><span>填写信息</span>
          </div>
          <div class="step-line"></div>
          <div class="step" :class="{ active: wizardStep >= 2 }">
            <div class="step-num">2</div><span>获取配置</span>
          </div>
        </div>

        <!-- Step 1: 填写信息 -->
        <template v-if="wizardStep === 1">
          <div class="form-group">
            <label class="form-label">应用名称 <span class="required">*</span></label>
            <input v-model="form.name" class="form-input" placeholder="如：客户门户" />
          </div>
          <div class="form-group">
            <label class="form-label">应用类型</label>
            <select v-model="form.type" class="form-input">
              <option value="spa">SPA（单页应用）</option>
              <option value="traditional">传统 Web 应用</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">回调地址 <span class="required">*</span></label>
            <textarea v-model="form.redirectUris" class="form-input textarea" rows="3" placeholder="每行一个 URL&#10;如：https://your-app.com/callback"></textarea>
          </div>
          <div class="wizard-actions">
            <button class="btn-secondary" @click="closeWizard">取消</button>
            <button class="btn-primary" @click="createApp" :disabled="creating || !form.name || !form.redirectUris.trim()">
              {{ creating ? '接入中...' : '接入' }}
            </button>
          </div>
        </template>

        <!-- Step 2: OIDC 配置 -->
        <template v-if="wizardStep === 2 && createdResult">
          <div class="success-banner">
            <span class="success-check">✓</span>
            应用「{{ createdResult.name }}」接入成功
          </div>
          <p class="config-hint">将以下配置用于你的应用：</p>
          <div class="config-block">
            <div class="config-row" v-for="item in createdConfig" :key="item.label">
              <span class="config-label">{{ item.label }}</span>
              <code class="config-val" @click="copyText(item.value)">{{ item.value }}</code>
              <button class="copy-btn" @click="copyText(item.value)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.76"/></svg>
              </button>
            </div>
          </div>
          <div class="config-hint small">提示：非成员用户无法获取该应用的组织 Token（"没资格用不了"由 IAM 强制）</div>
          <div class="wizard-actions">
            <button class="btn-primary" @click="finishWizard">完成</button>
          </div>
        </template>
      </div>
    </div>

    <!-- OIDC 配置查看 -->
    <div v-if="viewingApp" class="modal-mask" @click.self="viewingApp = null">
      <div class="modal">
        <h3 class="modal-title">{{ viewingApp.name }} — OIDC 配置</h3>
        <div class="config-block">
          <div class="config-row" v-for="item in appConfigItems(viewingApp)" :key="item.label">
            <span class="config-label">{{ item.label }}</span>
            <code class="config-val">{{ item.value }}</code>
            <button class="copy-btn" @click="copyText(item.value)">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.76"/></svg>
            </button>
          </div>
        </div>
        <button class="btn-secondary" @click="viewingApp = null">关闭</button>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editTarget" class="modal-mask" @click.self="editTarget = null">
      <div class="modal">
        <h3 class="modal-title">编辑应用</h3>
        <div class="form-group">
          <label class="form-label">应用名称</label>
          <input v-model="editForm.name" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">回调地址（每行一个）</label>
          <textarea v-model="editForm.redirectUris" class="form-input textarea" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="editTarget = null">取消</button>
          <button class="btn-primary" @click="saveEdit" :disabled="submitting">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="deleteTarget" class="modal-mask" @click.self="deleteTarget = null">
      <div class="modal modal-danger">
        <h3 class="modal-title">确认移除</h3>
        <p class="modal-desc">确定移除应用 <strong>{{ deleteTarget.name }}</strong>？用户的 SSO 登录将立即中断。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteTarget = null">取消</button>
          <button class="btn-danger" @click="removeApp" :disabled="submitting">确认移除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '应用接入' })

const api = useApi()
const loading = ref(true)
const submitting = ref(false)
const creating = ref(false)
const apps = ref<any[]>([])
const wizardStep = ref(0)
const createdResult = ref<any>(null)
const viewingApp = ref<any>(null)
const editTarget = ref<any>(null)
const deleteTarget = ref<any>(null)
const form = reactive({ name: '', description: '', type: 'spa', redirectUris: '' })
const editForm = reactive({ name: '', redirectUris: '' })

function startWizard() {
  wizardStep.value = 1
  Object.assign(form, { name: '', description: '', type: 'spa', redirectUris: '' })
  createdResult.value = null
}

function closeWizard() {
  wizardStep.value = 0
  createdResult.value = null
}

function typeLabel(type: string) {
  return { spa: 'SPA', traditional: '传统 Web', native: 'Native', m2m: 'M2M' }[type] ?? type
}

function appConfigItems(app: any) {
  const config = app.endpoints ?? {}
  return [
    { label: 'Client ID', value: app.applicationId },
    { label: 'Issuer', value: config.issuer ?? '' },
    { label: '授权端点', value: config.authorizationUrl ?? '' },
    { label: 'Token 端点', value: config.tokenUrl ?? '' },
    { label: 'JWKS', value: config.jwksUri ?? '' },
    { label: 'Userinfo', value: config.userinfoUrl ?? '' },
  ]
}

const createdConfig = computed(() => {
  if (!createdResult.value) return []
  const app = createdResult.value
  const endpoints = app.endpoints ?? {}
  return [
    { label: 'Client ID', value: app.id },
    { label: 'Issuer', value: endpoints.issuer ?? '' },
    { label: '授权端点', value: endpoints.authorizationUrl ?? '' },
    { label: 'Token 端点', value: endpoints.tokenUrl ?? '' },
    { label: 'JWKS', value: endpoints.jwksUri ?? '' },
    { label: 'Userinfo', value: endpoints.userinfoUrl ?? '' },
  ]
})

async function createApp() {
  if (!form.name || !form.redirectUris.trim()) return
  creating.value = true
  try {
    const uris = form.redirectUris.trim().split('\n').map(s => s.trim()).filter(Boolean)
    const result = await api('/tenant-applications', {
      method: 'POST',
      body: { name: form.name, description: form.description || undefined, type: form.type, redirectUris: uris },
    })
    createdResult.value = result
    wizardStep.value = 2
    await fetchApps()
  } catch (e: any) {
    alert(e?.data?.message ?? '接入失败')
  } finally {
    creating.value = false
  }
}

async function toggle(app: any) {
  try {
    await api(`/tenant-applications/${app.id}`, { method: 'PATCH', body: { enabled: !app.enabled } })
    await fetchApps()
  } catch (e: any) { alert(e?.data?.message ?? '操作失败') }
}

function openEdit(app: any) {
  editTarget.value = app
  Object.assign(editForm, { name: app.name, redirectUris: (app.redirectUris ?? []).join('\n') })
}

async function saveEdit() {
  if (!editTarget.value) return
  submitting.value = true
  try {
    await api(`/tenant-applications/${editTarget.value.id}`, {
      method: 'PATCH',
      body: { name: editForm.name },
    })
    editTarget.value = null
    await fetchApps()
  } catch (e: any) { alert(e?.data?.message ?? '保存失败') } finally { submitting.value = false }
}

function confirmDelete(app: any) { deleteTarget.value = app }

async function removeApp() {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await api(`/tenant-applications/${deleteTarget.value.id}`, { method: 'DELETE' })
    deleteTarget.value = null
    await fetchApps()
  } catch (e: any) { alert(e?.data?.message ?? '移除失败') } finally { submitting.value = false }
}

function viewConfig(app: any) { viewingApp.value = app }

function copyText(text: string) {
  navigator.clipboard?.writeText(text)
  alert('已复制')
}

async function fetchApps() {
  loading.value = true
  try {
    const res = await api('/tenant-applications')
    apps.value = res.data
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function finishWizard() {
  closeWizard()
  fetchApps()
}

onMounted(async () => {
  await fetchApps()
  loading.value = false
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
  font-size: 24px; font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}
.page-desc { font-size: 14px; color: var(--text2, #64748b); margin-top: 4px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  padding: 10px 20px; border-radius: 12px; border: none;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.skeleton-wrap {
  background: rgba(255,255,255,0.55); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 20px;
}
.skeleton-row { display: flex; align-items: center; gap: 12px; padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.skeleton { background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
.skeleton-icon { width: 40px; height: 40px; border-radius: 12px; }
.skeleton-line { height: 14px; flex: 1; }
.skeleton-line.short { flex: 0.5; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-state {
  text-align: center; padding: 60px 20px;
  background: rgba(255,255,255,0.55); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7); border-radius: 20px;
}
.empty-icon { color: var(--text3, #94a3b8); margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text, #1e293b); margin-bottom: 4px; }
.empty-desc { font-size: 14px; color: var(--text3, #94a3b8); margin-bottom: 20px; }

.apps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
.app-card {
  background: rgba(255,255,255,0.55); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7); border-radius: 20px;
  padding: 20px; transition: all 0.3s ease;
}
.app-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.app-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--teal, #14b8a6));
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; flex-shrink: 0;
}
.app-info { flex: 1; min-width: 0; }
.app-name { font-weight: 600; font-size: 15px; color: var(--text, #1e293b); }
.app-type { font-size: 12px; color: var(--text3, #94a3b8); }

.toggle-btn {
  width: 44px; height: 24px;
  border-radius: 24px;
  border: none; cursor: pointer;
  background: rgba(0,0,0,0.12);
  transition: background 0.2s ease;
  position: relative;
  flex-shrink: 0;
}
.toggle-btn.on { background: var(--indigo, #6366f1); }
.toggle-circle {
  position: absolute;
  width: 18px; height: 18px;
  left: 3px; top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-btn.on .toggle-circle { transform: translateX(20px); }

.app-config { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.config-row { display: flex; gap: 8px; align-items: baseline; }
.config-label { font-size: 12px; color: var(--text3, #94a3b8); min-width: 70px; flex-shrink: 0; }
.config-val { font-size: 12px; color: var(--text, #1e293b); word-break: break-all; }
.app-actions { display: flex; gap: 8px; }
.btn-sm {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 14px; border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.6); font-size: 13px;
  cursor: pointer; transition: all 0.15s ease;
  color: var(--text2, #64748b);
}
.btn-sm:hover { background: rgba(99,102,241,0.08); color: var(--indigo, #6366f1); border-color: rgba(99,102,241,0.2); }
.btn-danger:hover { background: rgba(220,38,38,0.08); color: #dc2626; border-color: rgba(220,38,38,0.2); }

.modal-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 20px; padding: 32px;
  width: 520px; max-width: 90vw; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
.modal-danger { border-color: rgba(220,38,38,0.2); }
.modal-title { font-size: 18px; font-weight: 700; color: var(--text, #1e293b); margin-bottom: 4px; }
.modal-desc { font-size: 13px; color: var(--text3, #94a3b8); margin-bottom: 8px; }
.modal-desc strong { color: #dc2626; }

/* 分步指示器 */
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}
.step {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text3, #94a3b8);
}
.step.active { color: var(--indigo, #6366f1); font-weight: 600; }
.step.done { color: var(--teal, #14b8a6); }
.step-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.08); color: var(--text3, #94a3b8);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.step.active .step-num { background: var(--indigo, #6366f1); color: #fff; }
.step.done .step-num { background: var(--teal, #14b8a6); color: #fff; }
.step-line { width: 40px; height: 2px; background: rgba(0,0,0,0.08); }

.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2, #64748b); margin-bottom: 6px; }
.required { color: #dc2626; }
.form-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); transition: border-color 0.2s, box-shadow 0.2s; }
.form-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.textarea { resize: vertical; font-family: monospace; font-size: 13px; }

.wizard-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn-secondary { padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; }

.success-banner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(34,197,94,0.08); color: #16a34a;
  padding: 12px 16px; border-radius: 12px;
  font-size: 14px; font-weight: 600;
  margin-bottom: 8px;
}
.success-check { font-size: 16px; }
.config-hint { font-size: 13px; color: var(--text2, #64748b); margin-bottom: 8px; }
.config-hint.small { font-size: 12px; color: var(--text3, #94a3b8); margin-top: 8px; }
.config-block {
  background: rgba(0,0,0,0.03);
  border-radius: 12px;
  padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 8px;
}
.config-val { font-size: 12px; color: var(--text, #1e293b); word-break: break-all; flex: 1; }
.copy-btn {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 6px;
  border: none; background: transparent;
  color: var(--text3, #94a3b8); cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.copy-btn:hover { background: rgba(99,102,241,0.1); color: var(--indigo, #6366f1); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
