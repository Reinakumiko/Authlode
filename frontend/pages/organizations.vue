<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">组织管理</h2>
        <p class="page-desc">管理组织架构和组织成员</p>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索组织名称..." />
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          创建组织
        </button>
      </div>
    </div>

    <div class="org-grid">
      <div v-for="org in filteredOrgs" :key="org.id" class="org-card">
        <div class="org-card-header">
          <div class="org-avatar" :style="{ background: org.gradient }">
            {{ org.name.charAt(0) }}
          </div>
          <div class="org-info">
            <h3 class="org-name">{{ org.name }}</h3>
            <span class="org-status" :class="org.status === '活跃' ? 'status-active' : 'status-inactive'">
              {{ org.status }}
            </span>
          </div>
        </div>
        <p class="org-desc">{{ org.description }}</p>
        <div class="org-stats">
          <div class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span class="stat-value">{{ org.members }}</span>
            <span class="stat-label">成员</span>
          </div>
          <div class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span class="stat-value">{{ org.roles }}</span>
            <span class="stat-label">角色</span>
          </div>
          <div class="stat-item">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span class="stat-value">{{ org.created }}</span>
          </div>
        </div>
        <div class="org-actions">
          <button class="btn-action btn-edit" @click="openEditModal(org)">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            编辑
          </button>
          <button class="btn-action btn-view">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            成员
          </button>
          <button class="btn-action btn-delete" @click="confirmDelete(org)">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? '编辑组织' : '创建组织' }}</h3>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">组织名称</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入组织名称" />
          </div>
          <div class="form-group">
            <label class="form-label">组织描述</label>
            <textarea v-model="form.description" class="form-textarea" placeholder="请输入组织描述" rows="4"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveOrg">{{ isEditing ? '保存修改' : '创建' }}</button>
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
          <p class="delete-text">确定要删除组织 <strong>{{ deleteTarget?.name }}</strong> 吗？此操作不可撤销。</p>
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
defineOptions({ name: 'organizations' })

useHead({ title: '组织管理' })

const searchQuery = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const form = ref({ name: '', description: '' })

const gradients = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
  'linear-gradient(135deg, #6366f1, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #3b82f6, #6366f1)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
]

const organizations = ref([
  { id: 1, name: '技术研发中心', description: '负责公司核心产品的技术研发和架构设计，包含前端、后端、移动端等多个技术方向。', members: 128, roles: 6, created: '2024-01-15', status: '活跃', gradient: gradients[0] },
  { id: 2, name: '产品设计部', description: '负责产品规划、用户体验设计和交互原型，推动产品从概念到落地的全流程。', members: 45, roles: 4, created: '2024-02-20', status: '活跃', gradient: gradients[1] },
  { id: 3, name: '市场营销团队', description: '负责品牌推广、市场调研和营销策略制定，提升公司市场影响力。', members: 32, roles: 3, created: '2024-03-10', status: '活跃', gradient: gradients[2] },
  { id: 4, name: '客户成功部', description: '负责客户关系维护、售后服务和客户满意度提升，确保客户长期价值。', members: 67, roles: 5, created: '2024-04-05', status: '活跃', gradient: gradients[3] },
  { id: 5, name: '人力资源部', description: '负责招聘、培训、绩效管理和企业文化建设，打造高效团队。', members: 23, roles: 3, created: '2024-05-12', status: '活跃', gradient: gradients[4] },
  { id: 6, name: '财务管理中心', description: '负责财务核算、预算管理和资金运营，保障公司财务健康运转。', members: 18, roles: 4, created: '2024-06-01', status: '非活跃', gradient: gradients[5] },
  { id: 7, name: '安全合规团队', description: '负责信息安全、数据合规和风险管控，确保业务安全稳定运行。', members: 15, roles: 3, created: '2024-07-20', status: '活跃', gradient: gradients[6] },
  { id: 8, name: '数据分析组', description: '负责数据采集、分析和可视化，为业务决策提供数据支持和洞察。', members: 28, roles: 4, created: '2024-08-08', status: '活跃', gradient: gradients[7] },
])

const filteredOrgs = computed(() => {
  if (!searchQuery.value) return organizations.value
  const q = searchQuery.value.toLowerCase()
  return organizations.value.filter(o => o.name.toLowerCase().includes(q))
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', description: '' }
  showModal.value = true
}

function openEditModal(org) {
  isEditing.value = true
  editingId.value = org.id
  form.value = { name: org.name, description: org.description }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveOrg() {
  if (!form.value.name.trim()) return
  if (isEditing.value) {
    const idx = organizations.value.findIndex(o => o.id === editingId.value)
    if (idx !== -1) {
      organizations.value[idx].name = form.value.name
      organizations.value[idx].description = form.value.description
    }
  } else {
    organizations.value.push({
      id: Date.now(),
      name: form.value.name,
      description: form.value.description,
      members: 0,
      roles: 0,
      created: new Date().toISOString().slice(0, 10),
      status: '活跃',
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    })
  }
  closeModal()
}

function confirmDelete(org) {
  deleteTarget.value = org
  showDeleteModal.value = true
}

function doDelete() {
  organizations.value = organizations.value.filter(o => o.id !== deleteTarget.value.id)
  showDeleteModal.value = false
  deleteTarget.value = null
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== Search ===== */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 0 14px;
  height: 42px;
  min-width: 240px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
  width: 100%;
  font-family: 'DM Sans', sans-serif;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* ===== Buttons ===== */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: 42px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* ===== Grid ===== */
.org-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* ===== Card ===== */
.org-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.org-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.org-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.org-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
  flex-shrink: 0;
}

.org-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.org-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 50px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.org-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.org-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

/* ===== Card Actions ===== */
.org-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 14px;
  height: 34px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.6);
  font-family: 'DM Sans', sans-serif;
}

.action-icon {
  width: 15px;
  height: 15px;
}

.btn-edit {
  color: #6366f1;
}

.btn-edit:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
}

.btn-view {
  color: #14b8a6;
}

.btn-view:hover {
  background: rgba(20, 184, 166, 0.08);
  border-color: rgba(20, 184, 166, 0.2);
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

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
  max-width: 480px;
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
  min-height: 100px;
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
@media (max-width: 1400px) {
  .org-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

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
}

@media (max-width: 768px) {
  .org-grid {
    grid-template-columns: 1fr;
  }

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
}
</style>
