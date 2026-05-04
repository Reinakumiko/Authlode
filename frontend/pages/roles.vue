<template>
  <div class="page-container">
    <PageHeader title="角色权限" description="管理用户角色和权限配置">
      <template #actions>
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索角色名称..." />
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          创建角色
        </button>
      </template>
    </PageHeader>

    <!-- Table Card -->
    <div class="table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-name">角色名称</th>
              <th class="th-desc">描述</th>
              <th class="th-count">用户数</th>
              <th class="th-perms">权限</th>
              <th class="th-date">创建时间</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.id">
              <td>
                <div class="role-name-cell">
                  <div class="role-icon-circle" :style="{ background: role.gradient }">
                    {{ role.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="role-name">{{ role.name }}</div>
                    <div class="role-key">{{ role.key }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-desc-text">{{ role.description }}</span>
              </td>
              <td>
                <span class="user-count">{{ role.userCount }}</span>
              </td>
              <td>
                <div class="perm-tags">
                  <span
                    v-for="(perm, pi) in role.permissions.slice(0, 3)"
                    :key="pi"
                    class="perm-tag"
                    :class="permColors[pi % permColors.length]"
                  >
                    {{ perm }}
                  </span>
                  <span v-if="role.permissions.length > 3" class="perm-more">
                    +{{ role.permissions.length - 3 }}
                  </span>
                </div>
              </td>
              <td>
                <span class="date-text">{{ role.created }}</span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="icon-btn icon-btn-indigo" title="编辑" @click="openEditModal(role)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button class="icon-btn icon-btn-teal" title="查看权限" @click="openPermModal(role)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </button>
                  <button class="icon-btn icon-btn-red" title="删除" @click="confirmDelete(role)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Role Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? '编辑角色' : '创建角色' }}</h3>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">角色名称</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入角色名称" />
          </div>
          <div class="form-group">
            <label class="form-label">角色标识</label>
            <input v-model="form.key" type="text" class="form-input" placeholder="例如: admin, editor" />
          </div>
          <div class="form-group">
            <label class="form-label">角色描述</label>
            <textarea v-model="form.description" class="form-textarea" placeholder="请输入角色描述" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">权限配置</label>
            <div class="perm-grid">
              <label v-for="perm in allPermissions" :key="perm" class="perm-checkbox">
                <input type="checkbox" :value="perm" v-model="form.permissions" />
                <span class="checkmark"></span>
                <span class="perm-label">{{ perm }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveRole">{{ isEditing ? '保存修改' : '创建' }}</button>
        </div>
      </div>
    </div>

    <!-- View Permissions Modal -->
    <div v-if="showPermModal" class="modal-overlay" @click.self="showPermModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">{{ permTarget?.name }} — 权限列表</h3>
          <button class="modal-close" @click="showPermModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="perm-list-modal">
            <span
              v-for="(perm, pi) in permTarget?.permissions"
              :key="pi"
              class="perm-tag-lg"
              :class="permColors[pi % permColors.length]"
            >
              {{ perm }}
            </span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showPermModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-card modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">确认删除</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="delete-text">确定要删除角色 <strong>{{ deleteTarget?.name }}</strong> 吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">取消</button>
          <button class="btn-danger" @click="doDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'roles' })

useHead({ title: '角色权限' })

const searchQuery = ref('')
const showModal = ref(false)
const showPermModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const permTarget = ref(null)
const deleteTarget = ref(null)

const form = ref({ name: '', key: '', description: '', permissions: [] })

const allPermissions = [
  '用户管理', '组织管理', '角色管理', '应用管理',
  '邀请管理', '审计日志', '数据统计', '系统设置',
  '文件管理', 'API 访问', '通知管理', '安全策略',
]

const permColors = ['perm-indigo', 'perm-purple', 'perm-teal', 'perm-blue', 'perm-amber', 'perm-rose']

const gradients = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
]

const roles = ref([
  {
    id: 1, name: '超级管理员', key: 'super_admin',
    description: '拥有系统全部权限，可管理所有模块和配置',
    userCount: 2, permissions: ['用户管理', '组织管理', '角色管理', '应用管理', '邀请管理', '审计日志', '数据统计', '系统设置', '安全策略'],
    created: '2024-01-01', gradient: gradients[0],
  },
  {
    id: 2, name: '管理员', key: 'admin',
    description: '管理用户和组织，配置应用和角色',
    userCount: 5, permissions: ['用户管理', '组织管理', '角色管理', '应用管理', '邀请管理'],
    created: '2024-01-15', gradient: gradients[1],
  },
  {
    id: 3, name: '经理', key: 'manager',
    description: '管理团队成员，查看数据统计',
    userCount: 12, permissions: ['用户管理', '组织管理', '数据统计'],
    created: '2024-02-10', gradient: gradients[2],
  },
  {
    id: 4, name: '开发者', key: 'developer',
    description: '访问 API 和开发工具，管理应用配置',
    userCount: 38, permissions: ['应用管理', 'API 访问', '文件管理'],
    created: '2024-03-05', gradient: gradients[3],
  },
  {
    id: 5, name: '观察者', key: 'viewer',
    description: '只读权限，查看基础数据和报表',
    userCount: 86, permissions: ['数据统计'],
    created: '2024-04-20', gradient: gradients[4],
  },
  {
    id: 6, name: '审计员', key: 'auditor',
    description: '查看审计日志和安全事件，监控系统安全',
    userCount: 4, permissions: ['审计日志', '安全策略', '数据统计'],
    created: '2024-05-08', gradient: gradients[5],
  },
])

const filteredRoles = computed(() => {
  if (!searchQuery.value) return roles.value
  const q = searchQuery.value.toLowerCase()
  return roles.value.filter(r => r.name.toLowerCase().includes(q) || r.key.toLowerCase().includes(q))
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', key: '', description: '', permissions: [] }
  showModal.value = true
}

function openEditModal(role) {
  isEditing.value = true
  editingId.value = role.id
  form.value = { name: role.name, key: role.key, description: role.description, permissions: [...role.permissions] }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveRole() {
  if (!form.value.name.trim()) return
  if (isEditing.value) {
    const idx = roles.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) {
      roles.value[idx].name = form.value.name
      roles.value[idx].key = form.value.key
      roles.value[idx].description = form.value.description
      roles.value[idx].permissions = [...form.value.permissions]
    }
  } else {
    roles.value.push({
      id: Date.now(),
      name: form.value.name,
      key: form.value.key,
      description: form.value.description,
      userCount: 0,
      permissions: [...form.value.permissions],
      created: new Date().toISOString().slice(0, 10),
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    })
  }
  closeModal()
}

function openPermModal(role) {
  permTarget.value = role
  showPermModal.value = true
}

function confirmDelete(role) {
  deleteTarget.value = role
  showDeleteModal.value = true
}

function doDelete() {
  roles.value = roles.value.filter(r => r.id !== deleteTarget.value.id)
  showDeleteModal.value = false
  deleteTarget.value = null
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Table Card ===== */
.table-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: rgba(0, 0, 0, 0.02);
}

.data-table th {
  padding: 14px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

.data-table tbody tr {
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: rgba(99, 102, 241, 0.03);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.th-name { min-width: 160px; }
.th-desc { min-width: 200px; }
.th-count { min-width: 80px; text-align: center; }
.th-perms { min-width: 240px; }
.th-date { min-width: 110px; }
.th-actions { min-width: 130px; text-align: center; }

/* ===== Role Name Cell ===== */
.role-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
  flex-shrink: 0;
}

.role-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.role-key {
  font-size: 12px;
  color: #94a3b8;
  font-family: 'DM Sans', monospace;
  margin-top: 2px;
}

.role-desc-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.user-count {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  display: inline-block;
  text-align: center;
  width: 100%;
}

.date-text {
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
}

/* ===== Permission Tags ===== */
.perm-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.perm-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 50px;
  white-space: nowrap;
}

.perm-indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.perm-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.perm-teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
.perm-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.perm-amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.perm-rose { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

.perm-more {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.05);
  padding: 3px 10px;
  border-radius: 50px;
}

/* ===== Table Actions ===== */
.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.6);
}

.icon-btn-indigo { color: #6366f1; }
.icon-btn-indigo:hover { background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.2); }

.icon-btn-teal { color: #14b8a6; }
.icon-btn-teal:hover { background: rgba(20, 184, 166, 0.08); border-color: rgba(20, 184, 166, 0.2); }

.icon-btn-red { color: #ef4444; }
.icon-btn-red:hover { background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); }

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
  animation: modalIn 0.2s ease;
}

.modal-sm {
  max-width: 400px;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 24px;
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* ===== Permission Checkboxes ===== */
.perm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.perm-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.perm-checkbox:hover {
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.04);
}

.perm-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s;
}

.perm-checkbox input:checked + .checkmark {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
}

.perm-checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.perm-label {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

/* ===== Permission Modal List ===== */
.perm-list-modal {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.perm-tag-lg {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 50px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 24px 24px;
}

.btn-cancel {
  padding: 0 18px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.9);
}

.btn-danger {
  padding: 0 18px;
  height: 40px;
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.btn-danger:hover {
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
}

.delete-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

.delete-text strong {
  color: #1e293b;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .search-box {
    flex: 1;
    min-width: 0;
  }

  .perm-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .perm-grid {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    margin: 0 -20px;
    width: calc(100% + 40px);
  }
}
</style>
