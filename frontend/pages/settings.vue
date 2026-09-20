<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">系统设置</h2>
        <p class="page-desc">租户级配置与安全策略</p>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="settings-layout">
      <!-- 租户信息 -->
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">租户信息</h3>
          <span class="card-badge">{{ auth.currentTenantName }}</span>
        </div>
        <div class="setting-item">
          <label class="setting-label">显示名称</label>
          <input v-model="tenantSettings.name" class="setting-input" placeholder="系统显示名称" />
        </div>
        <div class="setting-item">
          <label class="setting-label">描述</label>
          <textarea v-model="tenantSettings.description" class="setting-input" rows="3" placeholder="系统描述"></textarea>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">安全策略</h3>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">强制 MFA</span>
            <span class="setting-desc">所有成员登录时需通过多因子认证</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="tenantSettings.requireMfa" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">密码最小长度</span>
            <span class="setting-desc">新密码最少需要的字符数</span>
          </div>
          <input v-model.number="tenantSettings.minPasswordLength" type="number" min="8" max="64" class="setting-input-num" />
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">会话有效期</span>
            <span class="setting-desc">登录会话保持的时间（天）</span>
          </div>
          <input v-model.number="tenantSettings.sessionDays" type="number" min="1" max="30" class="setting-input-num" />
        </div>
      </div>

      <!-- 通知偏好 -->
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">通知偏好</h3>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">邀请通知</span>
            <span class="setting-desc">有新邀请时通知管理员</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="tenantSettings.notifyInvitation" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">安全告警</span>
            <span class="setting-desc">异常登录时发送告警</span>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="tenantSettings.notifySecurity" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- 环境信息 -->
      <div class="settings-card">
        <div class="card-header">
          <h3 class="card-title">环境信息</h3>
        </div>
        <div class="env-item">
          <span class="env-label">IAM 引擎</span>
          <span class="env-val">Logto (OIDC + PKCE)</span>
        </div>
        <div class="env-item">
          <span class="env-label">数据库</span>
          <span class="env-val">SQLite（开发环境）</span>
        </div>
        <div class="env-item">
          <span class="env-label">框架</span>
          <span class="env-val">NestJS 11 + Nuxt 4</span>
        </div>
      </div>

      <!-- 保存 -->
      <button class="btn-primary save-btn" @click="save" :disabled="saving">
        {{ saving ? '保存中...' : '保存所有设置' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '系统设置' })

const api = useApi()
const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)

const tenantSettings = reactive({
  name: '',
  description: '',
  requireMfa: false,
  minPasswordLength: 8,
  sessionDays: 7,
  notifyInvitation: true,
  notifySecurity: true,
})

async function fetchSettings() {
  loading.value = true
  try {
    const res = await api('/settings')
    if (res.tenantSettings) {
      try {
        const settings = typeof res.tenantSettings === 'string'
          ? JSON.parse(res.tenantSettings)
          : res.tenantSettings
        Object.assign(tenantSettings, settings)
      } catch { /* invalid JSON, use defaults */ }
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

async function save() {
  saving.value = true
  try {
    await api('/settings', {
      method: 'PATCH',
      body: { tenantSettings: { ...tenantSettings } },
    })
    alert('设置已保存')
  } catch (e: any) {
    alert(e?.data?.message ?? '保存失败')
  } finally { saving.value = false }
}

onMounted(fetchSettings)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: var(--text, #1e293b); }
.page-desc { font-size: 14px; color: var(--text2, #64748b); margin-top: 4px; }
.loading { text-align: center; padding: 60px; color: var(--text3, #94a3b8); }

.settings-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.settings-card {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 20px;
  padding: 24px;
}

.card-header { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 700; color: var(--text, #1e293b); }
.card-badge {
  font-size: 12px; font-weight: 600;
  color: var(--indigo, #6366f1);
  background: rgba(99,102,241,0.1);
  padding: 4px 12px; border-radius: 8px;
}

.setting-item { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.setting-label { font-size: 13px; font-weight: 600; color: var(--text2, #64748b); }
.setting-input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.1);
  font-size: 14px;
  outline: none;
  background: rgba(255,255,255,0.8);
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
}
.setting-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.setting-input-num { width: 80px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.setting-row:last-child { border-bottom: none; }
.setting-info { display: flex; flex-direction: column; gap: 2px; }
.setting-name { font-size: 14px; font-weight: 600; color: var(--text, #1e293b); }
.setting-desc { font-size: 12px; color: var(--text3, #94a3b8); }

/* Toggle switch */
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; cursor: pointer;
  inset: 0;
  background: rgba(0,0,0,0.12);
  border-radius: 24px;
  transition: 0.2s;
}
.toggle-slider:before {
  content: '';
  position: absolute;
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle input:checked + .toggle-slider {
  background: var(--indigo, #6366f1);
}
.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.env-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.env-item:last-child { border-bottom: none; }
.env-label { font-size: 13px; color: var(--text3, #94a3b8); }
.env-val { font-size: 13px; font-weight: 600; color: var(--text, #1e293b); }

.save-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

@media (max-width: 768px) {
  .settings-layout { grid-template-columns: 1fr; }
}
</style>
