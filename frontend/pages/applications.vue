<template>
  <div class="page-container">
    <PageHeader title="应用管理" description="管理已注册的应用程序">
      <template #actions>
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索应用名称或 ID..." />
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          创建应用
        </button>
      </template>
    </PageHeader>

    <!-- 应用卡片网格 -->
    <div class="app-grid">
      <div v-for="app in filteredApps" :key="app.id" class="app-card">
        <div class="app-card-header">
          <div class="app-info">
            <div class="app-icon" :style="{ background: app.color }">
              {{ app.name.charAt(0) }}
            </div>
            <div>
              <div class="app-name">{{ app.name }}</div>
              <div class="app-id">{{ app.id.substring(0, 8) }}...</div>
            </div>
          </div>
          <span class="status-badge" :class="app.status === 'active' ? 'status-active' : 'status-inactive'">
            {{ app.status === 'active' ? '活跃' : '停用' }}
          </span>
        </div>

        <div class="app-card-body">
          <div class="app-meta-row">
            <span class="type-badge" :class="'type-' + app.type.toLowerCase()">{{ app.type }}</span>
            <span class="app-date">{{ app.createdAt }}</span>
          </div>
          <div class="app-secret">
            <span class="secret-label">Client Secret</span>
            <span class="secret-value">{{ app.secret.substring(0, 12) }}••••</span>
          </div>
        </div>

        <div class="app-card-actions">
          <button class="action-btn" @click="openEditModal(app)">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            编辑
          </button>
          <button class="action-btn" @click="regenerateSecret(app)">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            重置密钥
          </button>
          <button class="action-btn action-danger" @click="deleteApp(app)">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredApps.length === 0" class="empty-state">
      <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48" class="empty-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
      <p class="empty-text">未找到匹配的应用</p>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditing ? '编辑应用' : '创建应用' }}</h2>
          <button class="modal-close" @click="closeModal">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">应用名称</label>
            <input v-model="formData.name" type="text" placeholder="输入应用名称" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">应用类型</label>
            <div class="select-wrapper">
              <select v-model="formData.type" class="form-select">
                <option value="SPA">SPA (单页应用)</option>
                <option value="Traditional">Traditional (传统 Web)</option>
                <option value="Machine">Machine (机器对机器)</option>
              </select>
              <svg class="select-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">重定向 URI</label>
            <div v-for="(uri, idx) in formData.redirectUris" :key="idx" class="uri-row">
              <input v-model="formData.redirectUris[idx]" type="text" placeholder="https://example.com/callback" class="form-input" />
              <button v-if="formData.redirectUris.length > 1" class="uri-remove" @click="formData.redirectUris.splice(idx, 1)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button class="add-uri-btn" @click="formData.redirectUris.push('')">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              添加 URI
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveApp">{{ isEditing ? '保存更改' : '创建应用' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'applications' })

useHead({ title: '应用管理' })

const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const formData = ref({
  name: '',
  type: 'SPA',
  redirectUris: ['']
})

const apps = ref([
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: '主站前端',
    type: 'SPA',
    status: 'active',
    color: '#6366f1',
    secret: 'app_secret_9f8e7d6c5b4a3210fedcba9876543210',
    redirectUris: ['https://authlode.com/callback'],
    createdAt: '2025-11-20'
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: '管理后台',
    type: 'Traditional',
    status: 'active',
    color: '#8b5cf6',
    secret: 'app_secret_1a2b3c4d5e6f7890abcdef1234567890',
    redirectUris: ['https://admin.authlode.com/callback', 'https://admin.authlode.com/auth'],
    createdAt: '2025-10-15'
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'API 网关',
    type: 'Machine',
    status: 'active',
    color: '#14b8a6',
    secret: 'app_secret_2b3c4d5e6f7890abcdef12345678901a',
    redirectUris: [],
    createdAt: '2025-09-08'
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    name: '移动端 App',
    type: 'SPA',
    status: 'inactive',
    color: '#f59e0b',
    secret: 'app_secret_3c4d5e6f7890abcdef12345678901a2b',
    redirectUris: ['com.authlode.app://callback'],
    createdAt: '2025-12-01'
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    name: '数据同步服务',
    type: 'Machine',
    status: 'active',
    color: '#ec4899',
    secret: 'app_secret_4d5e6f7890abcdef12345678901a2b3c',
    redirectUris: [],
    createdAt: '2025-08-22'
  },
  {
    id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    name: '测试应用',
    type: 'SPA',
    status: 'inactive',
    color: '#64748b',
    secret: 'app_secret_5e6f7890abcdef12345678901a2b3c4d',
    redirectUris: ['http://localhost:3000/callback'],
    createdAt: '2026-01-10'
  }
])

const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const q = searchQuery.value.toLowerCase()
  return apps.value.filter(app =>
    app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q)
  )
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '', type: 'SPA', redirectUris: [''] }
  showModal.value = true
}

function openEditModal(app) {
  isEditing.value = true
  editingId.value = app.id
  formData.value = {
    name: app.name,
    type: app.type,
    redirectUris: [...app.redirectUris]
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveApp() {
  if (!formData.value.name.trim()) return
  if (isEditing.value) {
    const idx = apps.value.findIndex(a => a.id === editingId.value)
    if (idx !== -1) {
      apps.value[idx].name = formData.value.name
      apps.value[idx].type = formData.value.type
      apps.value[idx].redirectUris = formData.value.redirectUris.filter(u => u.trim())
    }
  } else {
    const colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899', '#64748b']
    apps.value.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now(),
      name: formData.value.name,
      type: formData.value.type,
      status: 'active',
      color: colors[Math.floor(Math.random() * colors.length)],
      secret: 'app_secret_' + Math.random().toString(36).substring(2, 34),
      redirectUris: formData.value.redirectUris.filter(u => u.trim()),
      createdAt: new Date().toISOString().split('T')[0]
    })
  }
  closeModal()
}

function regenerateSecret(app) {
  if (confirm(`确定要重置「${app.name}」的密钥吗？旧密钥将立即失效。`)) {
    app.secret = 'app_secret_' + Math.random().toString(36).substring(2, 34)
  }
}

function deleteApp(app) {
  if (confirm(`确定要删除应用「${app.name}」吗？此操作不可恢复。`)) {
    apps.value = apps.value.filter(a => a.id !== app.id)
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== App Grid ===== */
.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.app-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.app-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.app-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.app-id {
  font-size: 12px;
  color: #94a3b8;
  font-family: monospace;
  margin-top: 2px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-active::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}

.status-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.status-inactive::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.app-card-body {
  flex: 1;
  margin-bottom: 16px;
}

.app-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.type-badge {
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-spa {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.type-traditional {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.type-machine {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

.app-date {
  font-size: 12px;
  color: #94a3b8;
}

.app-secret {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.secret-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.secret-value {
  font-size: 12px;
  font-family: monospace;
  color: #64748b;
}

.app-card-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.2);
}

.action-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* ===== Empty State ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px 0;
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

.modal-body {
  padding: 24px 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 10px 14px;
  padding-right: 36px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
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
  color: #94a3b8;
  pointer-events: none;
}

.uri-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.uri-row .form-input {
  flex: 1;
}

.uri-remove {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.uri-remove:hover {
  background: rgba(239, 68, 68, 0.12);
}

.add-uri-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px dashed rgba(99, 102, 241, 0.3);
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-uri-btn:hover {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 28px 24px;
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
}

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .app-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .search-box {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .app-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .search-box {
    min-width: 0;
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .app-card-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: none;
    width: calc(50% - 4px);
  }
}
</style>
