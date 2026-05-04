<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">系统设置</h2>
        <p class="page-desc">管理系统配置和参数</p>
      </div>
    </div>

    <!-- General Settings -->
    <div class="glass-card">
      <div class="card-header">
        <div class="card-icon" style="background: rgba(99,102,241,0.1)">
          <svg width="18" height="18" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 class="card-title">通用设置</h2>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">应用名称</label>
          <input
            v-model="form.appName"
            type="text"
            class="form-input"
            placeholder="输入应用名称"
          />
        </div>

        <div class="form-group">
          <label class="form-label">默认语言</label>
          <div class="select-wrapper">
            <select v-model="form.language" class="form-select">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
            <svg class="select-arrow" width="14" height="14" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">应用 Logo</label>
          <div class="upload-area" @click="triggerUpload">
            <input ref="logoInput" type="file" accept="image/*" class="upload-hidden" @change="handleLogoUpload" />
            <div v-if="!form.logoPreview" class="upload-placeholder">
              <svg width="32" height="32" fill="none" stroke="#94a3b8" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>点击上传 Logo</span>
              <span class="upload-hint">支持 PNG, JPG, SVG, 最大 2MB</span>
            </div>
            <div v-else class="upload-preview">
              <img :src="form.logoPreview" alt="Logo preview" />
              <span>点击更换</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div class="glass-card">
      <div class="card-header">
        <div class="card-icon" style="background: rgba(139,92,246,0.1)">
          <svg width="18" height="18" fill="none" stroke="#8b5cf6" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="card-title">安全设置</h2>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">密码最小长度</label>
          <input
            v-model.number="form.minPasswordLength"
            type="number"
            class="form-input"
            min="6"
            max="32"
            placeholder="8"
          />
        </div>

        <div class="form-group">
          <label class="form-label">会话超时时间</label>
          <div class="select-wrapper">
            <select v-model="form.sessionTimeout" class="form-select">
              <option value="30">30 分钟</option>
              <option value="60">1 小时</option>
              <option value="240">4 小时</option>
              <option value="1440">24 小时</option>
            </select>
            <svg class="select-arrow" width="14" height="14" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">密码策略</label>
          <div class="checkbox-group">
            <label class="checkbox-item" @click="form.requireUppercase = !form.requireUppercase">
              <div class="checkbox-box" :class="{ checked: form.requireUppercase }">
                <svg v-if="form.requireUppercase" width="12" height="12" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>要求大写字母</span>
            </label>
            <label class="checkbox-item" @click="form.requireNumber = !form.requireNumber">
              <div class="checkbox-box" :class="{ checked: form.requireNumber }">
                <svg v-if="form.requireNumber" width="12" height="12" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>要求数字</span>
            </label>
          </div>
        </div>

        <div class="form-group full-width">
          <label class="form-label">双因素认证 (2FA)</label>
          <div class="toggle-row">
            <span class="toggle-desc">强制所有用户启用双因素认证</span>
            <div
              class="toggle-switch"
              :class="{ active: form.enforce2FA }"
              @click="form.enforce2FA = !form.enforce2FA"
            >
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Settings -->
    <div class="glass-card">
      <div class="card-header">
        <div class="card-icon" style="background: rgba(20,184,166,0.1)">
          <svg width="18" height="18" fill="none" stroke="#14b8a6" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="card-title">邮件设置</h2>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">SMTP 服务器</label>
          <input
            v-model="form.smtpHost"
            type="text"
            class="form-input"
            placeholder="smtp.example.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">端口</label>
          <input
            v-model.number="form.smtpPort"
            type="number"
            class="form-input"
            placeholder="587"
          />
        </div>

        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.smtpUser"
            type="text"
            class="form-input"
            placeholder="username@example.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="password-wrapper">
            <input
              v-model="form.smtpPassword"
              :type="showSmtpPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="输入密码"
            />
            <button class="password-toggle" @click="showSmtpPassword = !showSmtpPassword">
              <svg v-if="!showSmtpPassword" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-group full-width">
          <button class="btn-secondary" @click="sendTestEmail">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            发送测试邮件
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="glass-card">
      <div class="card-header">
        <div class="card-icon" style="background: rgba(99,102,241,0.1)">
          <svg width="18" height="18" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h2 class="card-title">通知设置</h2>
      </div>

      <div class="notification-list">
        <div class="notification-item">
          <div class="notification-info">
            <span class="notification-name">邮件通知</span>
            <span class="notification-desc">接收系统事件的邮件通知</span>
          </div>
          <div
            class="toggle-switch"
            :class="{ active: form.emailNotification }"
            @click="form.emailNotification = !form.emailNotification"
          >
            <div class="toggle-knob"></div>
          </div>
        </div>

        <div class="notification-item">
          <div class="notification-info">
            <span class="notification-name">登录告警</span>
            <span class="notification-desc">当账户在新设备或异地登录时通知</span>
          </div>
          <div
            class="toggle-switch"
            :class="{ active: form.loginAlert }"
            @click="form.loginAlert = !form.loginAlert"
          >
            <div class="toggle-knob"></div>
          </div>
        </div>

        <div class="notification-item">
          <div class="notification-info">
            <span class="notification-name">系统告警</span>
            <span class="notification-desc">接收系统异常和安全事件通知</span>
          </div>
          <div
            class="toggle-switch"
            :class="{ active: form.systemAlert }"
            @click="form.systemAlert = !form.systemAlert"
          >
            <div class="toggle-knob"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="save-bar">
      <button class="btn-primary" @click="saveSettings">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        保存设置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

defineOptions({ name: 'settings' })

useHead({ title: '系统设置' })

const logoInput = ref(null)
const showSmtpPassword = ref(false)

const form = reactive({
  appName: 'Authlode',
  language: 'zh',
  logoPreview: '',
  minPasswordLength: 8,
  sessionTimeout: '60',
  requireUppercase: true,
  requireNumber: true,
  enforce2FA: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  emailNotification: true,
  loginAlert: true,
  systemAlert: false,
})

function triggerUpload() {
  logoInput.value?.click()
}

function handleLogoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('文件大小不能超过 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.logoPreview = ev.target.result
  }
  reader.readAsDataURL(file)
}

function sendTestEmail() {
  if (!form.smtpHost || !form.smtpUser) {
    alert('请先填写 SMTP 服务器和用户名')
    return
  }
  alert('测试邮件已发送，请检查收件箱')
}

function saveSettings() {
  alert('设置已保存')
}
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.page-desc {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* ===== Glass Card ===== */
.glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

/* ===== Form ===== */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-input {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.form-input::placeholder {
  color: #94a3b8;
}

/* Select */
.select-wrapper {
  position: relative;
}

.form-select {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  padding: 10px 36px 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  color: #1e293b;
  outline: none;
  appearance: none;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Upload */
.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.03);
}

.upload-hidden {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #94a3b8;
}

.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.upload-preview img {
  max-height: 64px;
  max-width: 160px;
  object-fit: contain;
  border-radius: 8px;
}

/* Password */
.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

/* Checkbox */
.checkbox-group {
  display: flex;
  gap: 24px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #475569;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-box.checked {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
}

/* Toggle Switch */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748b;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.12);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.toggle-switch.active .toggle-knob {
  left: 22px;
}

/* Notification List */
.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.notification-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #94a3b8;
}

/* ===== Buttons ===== */
.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  padding: 12px 28px;
  border-radius: 14px;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #475569;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.15);
}

.save-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  margin-bottom: 32px;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .settings-page {
    max-width: 100%;
  }

  .glass-card {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
