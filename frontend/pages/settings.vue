<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">系统设置</h2><p class="page-desc">租户级配置</p></div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="settings-grid">
      <div class="settings-card">
        <h3>租户设置</h3>
        <div class="setting-item">
          <label>租户名称</label>
          <input v-model="tenantSettings.name" class="input" placeholder="显示名称" />
        </div>
        <div class="setting-item">
          <label>描述</label>
          <textarea v-model="tenantSettings.description" class="input" rows="3" placeholder="租户描述"></textarea>
        </div>
        <button class="btn-primary" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存设置' }}</button>
      </div>
      <div class="settings-card">
        <h3>环境信息</h3>
        <div class="env-item"><span class="env-label">IAM 平台</span><span class="env-val">Logto</span></div>
        <div class="env-item"><span class="env-label">认证方式</span><span class="env-val">OIDC (PKCE)</span></div>
        <div class="env-item"><span class="env-label">数据库</span><span class="env-val">SQLite (开发)</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '系统设置' })
const api = useApi()
const loading = ref(true)
const saving = ref(false)
const tenantSettings = reactive({ name: '', description: '' })

async function fetchSettings() {
  loading.value = true
  try {
    const res = await api('/settings')
    if (res.tenantSettings) Object.assign(tenantSettings, res.tenantSettings)
  } catch (e) { console.error(e) } finally { loading.value = false }
}

async function save() {
  saving.value = true
  try {
    await api('/settings', { method: 'PATCH', body: { tenantSettings: { ...tenantSettings } } })
    alert('保存成功')
  } catch (e: any) { alert(e?.data?.message ?? '保存失败') } finally { saving.value = false }
}

onMounted(fetchSettings)
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.loading { text-align: center; padding: 40px; color: var(--text3); }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.settings-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 24px; }
.settings-card h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 16px; }
.setting-item { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.setting-item label { font-size: 13px; font-weight: 600; color: var(--text2); }
.input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); resize: vertical; }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 10px 24px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; margin-top: 8px; }
.env-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.env-label { font-size: 13px; color: var(--text3); }
.env-val { font-size: 13px; font-weight: 600; color: var(--text); }
</style>
