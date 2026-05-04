<template>
  <div class="page-container">
    <PageHeader title="邀请管理" description="管理用户邀请和审批流程">
      <template #actions>
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="搜索邮箱..." />
        </div>
        <div class="filter-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: statusFilter === tab.value }"
            @click="statusFilter = tab.value"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <button class="btn-primary" @click="openSendModal">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          发送邀请
        </button>
      </template>
    </PageHeader>

    <!-- 邀请表格 -->
    <div class="glass-table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>邀请邮箱</th>
              <th>组织</th>
              <th>角色</th>
              <th>状态</th>
              <th>发送时间</th>
              <th>过期时间</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filteredInvitations" :key="inv.id">
              <td>
                <div class="invitee-cell">
                  <div class="invitee-avatar" :style="{ background: inv.color }">
                    {{ inv.email.charAt(0).toUpperCase() }}
                  </div>
                  <span class="invitee-email">{{ inv.email }}</span>
                </div>
              </td>
              <td>
                <span class="org-name">{{ inv.organization }}</span>
              </td>
              <td>
                <span class="role-badge" :class="'role-' + inv.roleClass">{{ inv.role }}</span>
              </td>
              <td>
                <span class="status-tag" :class="'status-' + inv.status">
                  <span class="status-dot"></span>
                  {{ statusLabel(inv.status) }}
                </span>
              </td>
              <td>
                <span class="cell-text">{{ inv.sentAt }}</span>
              </td>
              <td>
                <span class="cell-text" :class="{ 'text-expired': inv.status === 'expired' }">{{ inv.expiresAt }}</span>
              </td>
              <td>
                <div class="row-actions">
                  <button v-if="inv.status === 'pending'" class="icon-btn" title="重发邀请" @click="resendInvitation(inv)">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="15" height="15">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                  <button v-if="inv.status === 'pending'" class="icon-btn icon-btn-danger" title="撤销邀请" @click="revokeInvitation(inv)">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="15" height="15">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span v-if="inv.status !== 'pending'" class="cell-muted">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="table-footer">
        <span class="footer-info">共 {{ filteredInvitations.length }} 条邀请</span>
        <div class="pagination">
          <button class="page-btn" disabled>
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredInvitations.length === 0" class="empty-state">
      <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48" class="empty-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
      <p class="empty-text">未找到匹配的邀请</p>
    </div>

    <!-- 发送邀请弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">发送邀请</h2>
          <button class="modal-close" @click="closeModal">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">邀请邮箱</label>
            <input v-model="formData.email" type="email" placeholder="user@example.com" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">所属组织</label>
            <div class="select-wrapper">
              <select v-model="formData.organization" class="form-select">
                <option value="" disabled>选择组织</option>
                <option value="技术团队">技术团队</option>
                <option value="产品部门">产品部门</option>
                <option value="设计中心">设计中心</option>
                <option value="运营部">运营部</option>
                <option value="管理层">管理层</option>
              </select>
              <svg class="select-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">角色</label>
            <div class="select-wrapper">
              <select v-model="formData.role" class="form-select">
                <option value="" disabled>选择角色</option>
                <option value="admin">管理员</option>
                <option value="editor">编辑者</option>
                <option value="viewer">查看者</option>
              </select>
              <svg class="select-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div class="form-note">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span>邀请链接将在 7 天后过期</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="sendInvitation">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            发送邀请
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'invitations' })

useHead({ title: '邀请管理' })

const searchQuery = ref('')
const statusFilter = ref('all')
const showModal = ref(false)

const formData = ref({
  email: '',
  organization: '',
  role: ''
})

const invitations = ref([
  { id: 1, email: 'zhangwei@company.com', organization: '技术团队', role: '管理员', roleClass: 'admin', status: 'pending', sentAt: '2026-04-28', expiresAt: '2026-05-05', color: '#6366f1' },
  { id: 2, email: 'lihua@startup.io', organization: '产品部门', role: '编辑者', roleClass: 'editor', status: 'accepted', sentAt: '2026-04-20', expiresAt: '2026-04-27', color: '#8b5cf6' },
  { id: 3, email: 'wangfang@tech.co', organization: '设计中心', role: '查看者', roleClass: 'viewer', status: 'expired', sentAt: '2026-03-15', expiresAt: '2026-03-22', color: '#14b8a6' },
  { id: 4, email: 'chenming@corp.cn', organization: '技术团队', role: '管理员', roleClass: 'admin', status: 'pending', sentAt: '2026-05-01', expiresAt: '2026-05-08', color: '#f59e0b' },
  { id: 5, email: 'zhaoli@dev.org', organization: '运营部', role: '编辑者', roleClass: 'editor', status: 'accepted', sentAt: '2026-04-10', expiresAt: '2026-04-17', color: '#ec4899' },
  { id: 6, email: 'sunqiang@cloud.net', organization: '技术团队', role: '查看者', roleClass: 'viewer', status: 'pending', sentAt: '2026-05-02', expiresAt: '2026-05-09', color: '#6366f1' },
  { id: 7, email: 'huangping@data.io', organization: '产品部门', role: '管理员', roleClass: 'admin', status: 'accepted', sentAt: '2026-04-05', expiresAt: '2026-04-12', color: '#8b5cf6' },
  { id: 8, email: 'zhouyan@design.co', organization: '设计中心', role: '编辑者', roleClass: 'editor', status: 'expired', sentAt: '2026-03-01', expiresAt: '2026-03-08', color: '#14b8a6' },
  { id: 9, email: 'wulei@ops.cn', organization: '运营部', role: '查看者', roleClass: 'viewer', status: 'pending', sentAt: '2026-04-30', expiresAt: '2026-05-07', color: '#f59e0b' },
  { id: 10, email: 'zhengxin@mgmt.org', organization: '管理层', role: '管理员', roleClass: 'admin', status: 'accepted', sentAt: '2026-04-18', expiresAt: '2026-04-25', color: '#ec4899' },
  { id: 11, email: 'linjia@tech.net', organization: '技术团队', role: '编辑者', roleClass: 'editor', status: 'pending', sentAt: '2026-05-01', expiresAt: '2026-05-08', color: '#6366f1' },
  { id: 12, email: 'hexuan@prod.io', organization: '产品部门', role: '查看者', roleClass: 'viewer', status: 'expired', sentAt: '2026-02-20', expiresAt: '2026-02-27', color: '#8b5cf6' },
  { id: 13, email: 'guomei@art.co', organization: '设计中心', role: '管理员', roleClass: 'admin', status: 'accepted', sentAt: '2026-04-12', expiresAt: '2026-04-19', color: '#14b8a6' },
  { id: 14, email: 'xujun@market.cn', organization: '运营部', role: '编辑者', roleClass: 'editor', status: 'pending', sentAt: '2026-04-29', expiresAt: '2026-05-06', color: '#f59e0b' },
  { id: 15, email: 'fangyi@lead.org', organization: '管理层', role: '管理员', roleClass: 'admin', status: 'pending', sentAt: '2026-05-03', expiresAt: '2026-05-10', color: '#ec4899' }
])

const statusTabs = computed(() => [
  { label: '全部', value: 'all', count: invitations.value.length },
  { label: '待接受', value: 'pending', count: invitations.value.filter(i => i.status === 'pending').length },
  { label: '已接受', value: 'accepted', count: invitations.value.filter(i => i.status === 'accepted').length },
  { label: '已过期', value: 'expired', count: invitations.value.filter(i => i.status === 'expired').length }
])

const filteredInvitations = computed(() => {
  let list = invitations.value
  if (statusFilter.value !== 'all') {
    list = list.filter(i => i.status === statusFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i => i.email.toLowerCase().includes(q))
  }
  return list
})

function statusLabel(status) {
  const map = { pending: '待接受', accepted: '已接受', expired: '已过期' }
  return map[status] || status
}

function openSendModal() {
  formData.value = { email: '', organization: '', role: '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function sendInvitation() {
  if (!formData.value.email || !formData.value.organization || !formData.value.role) return
  const roleMap = { admin: ['管理员', 'admin'], editor: ['编辑者', 'editor'], viewer: ['查看者', 'viewer'] }
  const [roleLabel, roleClass] = roleMap[formData.value.role] || ['查看者', 'viewer']
  const colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#ec4899']
  const now = new Date()
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  invitations.value.unshift({
    id: Date.now(),
    email: formData.value.email,
    organization: formData.value.organization,
    role: roleLabel,
    roleClass,
    status: 'pending',
    sentAt: now.toISOString().split('T')[0],
    expiresAt: expires.toISOString().split('T')[0],
    color: colors[Math.floor(Math.random() * colors.length)]
  })
  closeModal()
}

function resendInvitation(inv) {
  const now = new Date()
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  inv.sentAt = now.toISOString().split('T')[0]
  inv.expiresAt = expires.toISOString().split('T')[0]
}

function revokeInvitation(inv) {
  if (confirm(`确定要撤销对 ${inv.email} 的邀请吗？`)) {
    invitations.value = invitations.value.filter(i => i.id !== inv.id)
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  color: #1e293b;
  background: rgba(0, 0, 0, 0.04);
}

.filter-tab.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.tab-count {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.08);
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

/* ===== Table Card ===== */
.glass-table-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
}

.data-table thead {
  background: rgba(0, 0, 0, 0.02);
}

.data-table th {
  padding: 14px 18px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

.th-actions {
  text-align: center;
}

.data-table td {
  padding: 14px 18px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.data-table tbody tr {
  transition: background 0.15s ease;
}

.data-table tbody tr:hover {
  background: rgba(99, 102, 241, 0.03);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* Invitee cell */
.invitee-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.invitee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.invitee-email {
  font-weight: 500;
}

.org-name {
  color: #1e293b;
}

/* Role badge */
.role-badge {
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.role-admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.role-editor {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.role-viewer {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

/* Status */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-pending .status-dot {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
}

.status-accepted {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-accepted .status-dot {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}

.status-expired {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.status-expired .status-dot {
  background: #94a3b8;
}

.cell-text {
  font-size: 13px;
  color: #64748b;
}

.text-expired {
  color: #cbd5e1;
  text-decoration: line-through;
}

/* Row actions */
.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.2);
}

.icon-btn-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.cell-muted {
  color: #cbd5e1;
  font-size: 13px;
}

/* Table footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.footer-info {
  font-size: 13px;
  color: #94a3b8;
}

.pagination {
  display: flex;
  gap: 4px;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}

.page-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  width: 480px;
  max-width: 90vw;
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
  margin-bottom: 18px;
}

.form-group:last-of-type {
  margin-bottom: 12px;
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

.form-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(99, 102, 241, 0.06);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
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
  .filter-tabs {
    order: 3;
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .filter-tabs {
    width: 100%;
    overflow-x: auto;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
    font-size: 12px;
  }

  .table-footer {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
