<template>
  <div class="users-page">
    <AppHeader />

    <!-- Top Bar -->
    <div class="top-bar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索用户名、邮箱..."
        >
      </div>
      <div class="filter-select-wrapper">
        <select v-model="roleFilter" class="filter-select">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="editor">编辑者</option>
          <option value="viewer">观察者</option>
        </select>
        <svg class="select-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
        创建用户
      </button>
    </div>

    <!-- Data Table Card -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">用户列表</div>
          <div class="table-subtitle">共 {{ filteredUsers.length }} 位用户</div>
        </div>
      </div>

      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>邮箱</th>
              <th>组织</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="avatar" :style="{ background: user.avatarColor }">{{ user.name[0] }}</div>
                  <div>
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-account">@{{ user.account }}</div>
                  </div>
                </div>
              </td>
              <td class="td-email">{{ user.email }}</td>
              <td>{{ user.organization }}</td>
              <td>
                <span class="role-tag" :class="'role-' + user.role">{{ roleLabels[user.role] }}</span>
              </td>
              <td>
                <span class="status-pill" :class="user.status === 'active' ? 'status-active' : 'status-disabled'">
                  <span class="status-dot" :class="user.status === 'active' ? 'dot-active' : 'dot-disabled'"></span>
                  {{ user.status === 'active' ? '活跃' : '已禁用' }}
                </span>
              </td>
              <td class="td-date">{{ user.createdAt }}</td>
              <td class="td-actions">
                <button class="action-btn edit" @click="openEditModal(user)">编辑</button>
                <button class="action-btn disable" @click="toggleStatus(user)">{{ user.status === 'active' ? '禁用' : '启用' }}</button>
                <button class="action-btn delete" @click="deleteUser(user.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <span class="pagination-info">显示 {{ paginationStart }}-{{ paginationEnd }} 条，共 {{ filteredUsers.length }} 条</span>
        <div class="pagination-btns">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            上一页
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="page-num"
            :class="{ active: p === currentPage }"
            @click="currentPage = p"
          >{{ p }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            下一页
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ editingUser ? '编辑用户' : '创建用户' }}</h3>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="请输入邮箱">
          </div>
          <div class="form-group">
            <label>组织</label>
            <select v-model="form.organization" class="form-input">
              <option value="">请选择组织</option>
              <option value="技术部">技术部</option>
              <option value="产品部">产品部</option>
              <option value="设计部">设计部</option>
              <option value="市场部">市场部</option>
              <option value="运营部">运营部</option>
              <option value="财务部">财务部</option>
            </select>
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="form.role" class="form-input">
              <option value="">请选择角色</option>
              <option value="admin">管理员</option>
              <option value="editor">编辑者</option>
              <option value="viewer">观察者</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveUser">{{ editingUser ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({ name: 'users' })

useHead({ title: '用户管理' })

const avatarColors = [
  '#6366f1', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

const roleLabels = { admin: '管理员', editor: '编辑者', viewer: '观察者' }

const users = ref([
  { id: 1, name: '张伟', account: 'zhangwei', email: 'zhangwei@company.com', organization: '技术部', role: 'admin', status: 'active', createdAt: '2025-01-05', avatarColor: avatarColors[0] },
  { id: 2, name: '李娜', account: 'lina', email: 'lina@company.com', organization: '产品部', role: 'editor', status: 'active', createdAt: '2025-01-08', avatarColor: avatarColors[1] },
  { id: 3, name: '王磊', account: 'wanglei', email: 'wanglei@company.com', organization: '技术部', role: 'editor', status: 'active', createdAt: '2025-01-10', avatarColor: avatarColors[2] },
  { id: 4, name: '赵敏', account: 'zhaomin', email: 'zhaomin@company.com', organization: '设计部', role: 'viewer', status: 'disabled', createdAt: '2025-01-12', avatarColor: avatarColors[3] },
  { id: 5, name: '刘洋', account: 'liuyang', email: 'liuyang@company.com', organization: '市场部', role: 'editor', status: 'active', createdAt: '2025-01-15', avatarColor: avatarColors[4] },
  { id: 6, name: '陈静', account: 'chenjing', email: 'chenjing@company.com', organization: '运营部', role: 'viewer', status: 'active', createdAt: '2025-01-18', avatarColor: avatarColors[5] },
  { id: 7, name: '杨帆', account: 'yangfan', email: 'yangfan@company.com', organization: '技术部', role: 'admin', status: 'active', createdAt: '2025-02-01', avatarColor: avatarColors[6] },
  { id: 8, name: '周婷', account: 'zhouting', email: 'zhouting@company.com', organization: '财务部', role: 'viewer', status: 'active', createdAt: '2025-02-05', avatarColor: avatarColors[7] },
  { id: 9, name: '吴昊', account: 'wuhao', email: 'wuhao@company.com', organization: '技术部', role: 'editor', status: 'disabled', createdAt: '2025-02-08', avatarColor: avatarColors[8] },
  { id: 10, name: '郑雪', account: 'zhengxue', email: 'zhengxue@company.com', organization: '产品部', role: 'editor', status: 'active', createdAt: '2025-02-10', avatarColor: avatarColors[9] },
  { id: 11, name: '孙浩', account: 'sunhao', email: 'sunhao@company.com', organization: '技术部', role: 'admin', status: 'active', createdAt: '2025-02-15', avatarColor: avatarColors[0] },
  { id: 12, name: '马丽', account: 'mali', email: 'mali@company.com', organization: '市场部', role: 'viewer', status: 'active', createdAt: '2025-02-18', avatarColor: avatarColors[1] },
  { id: 13, name: '朱军', account: 'zhujun', email: 'zhujun@company.com', organization: '运营部', role: 'editor', status: 'disabled', createdAt: '2025-03-01', avatarColor: avatarColors[2] },
  { id: 14, name: '何琳', account: 'helin', email: 'helin@company.com', organization: '设计部', role: 'editor', status: 'active', createdAt: '2025-03-05', avatarColor: avatarColors[3] },
  { id: 15, name: '高峰', account: 'gaofeng', email: 'gaofeng@company.com', organization: '技术部', role: 'viewer', status: 'active', createdAt: '2025-03-08', avatarColor: avatarColors[4] },
  { id: 16, name: '罗丹', account: 'luodan', email: 'luodan@company.com', organization: '产品部', role: 'admin', status: 'active', createdAt: '2025-03-10', avatarColor: avatarColors[5] },
  { id: 17, name: '韩冰', account: 'hanbing', email: 'hanbing@company.com', organization: '财务部', role: 'viewer', status: 'disabled', createdAt: '2025-03-12', avatarColor: avatarColors[6] },
  { id: 18, name: '唐杰', account: 'tangjie', email: 'tangjie@company.com', organization: '技术部', role: 'editor', status: 'active', createdAt: '2025-03-15', avatarColor: avatarColors[7] },
  { id: 19, name: '冯颖', account: 'fengying', email: 'fengying@company.com', organization: '市场部', role: 'viewer', status: 'active', createdAt: '2025-03-18', avatarColor: avatarColors[8] },
  { id: 20, name: '曹鹏', account: 'caopeng', email: 'caopeng@company.com', organization: '运营部', role: 'admin', status: 'active', createdAt: '2025-03-20', avatarColor: avatarColors[9] }
])

const searchQuery = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
const showModal = ref(false)
const editingUser = ref(null)
const form = ref({ name: '', email: '', organization: '', role: '' })

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !searchQuery.value ||
      u.name.includes(searchQuery.value) ||
      u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchRole = !roleFilter.value || u.role === roleFilter.value
    return matchSearch && matchRole
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

const paginationStart = computed(() => filteredUsers.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize, filteredUsers.value.length))

function openCreateModal() {
  editingUser.value = null
  form.value = { name: '', email: '', organization: '', role: '' }
  showModal.value = true
}

function openEditModal(user) {
  editingUser.value = user
  form.value = { name: user.name, email: user.email, organization: user.organization, role: user.role }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

function saveUser() {
  if (!form.value.name || !form.value.email || !form.value.organization || !form.value.role) return
  if (editingUser.value) {
    Object.assign(editingUser.value, {
      name: form.value.name,
      email: form.value.email,
      organization: form.value.organization,
      role: form.value.role
    })
  } else {
    const id = Math.max(...users.value.map(u => u.id)) + 1
    users.value.push({
      id,
      name: form.value.name,
      account: form.value.name.toLowerCase().replace(/\s/g, ''),
      email: form.value.email,
      organization: form.value.organization,
      role: form.value.role,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      avatarColor: avatarColors[id % avatarColors.length]
    })
  }
  closeModal()
}

function toggleStatus(user) {
  user.status = user.status === 'active' ? 'disabled' : 'active'
}

function deleteUser(id) {
  users.value = users.value.filter(u => u.id !== id)
}
</script>

<style scoped>
.users-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Top Bar ===== */
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 220px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 14px 0 38px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-family: 'DM Sans', sans-serif;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.filter-select-wrapper {
  position: relative;
}

.filter-select {
  appearance: none;
  height: 42px;
  padding: 0 36px 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-size: 13px;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-family: 'DM Sans', sans-serif;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
  pointer-events: none;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-icon {
  width: 16px;
  height: 16px;
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

.table-header {
  padding: 20px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.table-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.table-scroll {
  overflow-x: auto;
  padding: 16px 0 0;
}

/* ===== Data Table ===== */
.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.data-table thead th {
  padding: 0 24px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  white-space: nowrap;
}

.th-actions {
  text-align: right;
}

.data-table tbody tr {
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: rgba(99, 102, 241, 0.03);
}

.data-table tbody td {
  padding: 14px 24px;
  font-size: 13px;
  color: #1e293b;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
}

.user-account {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}

.td-email {
  color: #64748b;
}

.td-date {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}

/* Role Tags */
.role-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.role-admin {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.role-editor {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.role-viewer {
  background: rgba(20, 184, 166, 0.1);
  color: #0d9488;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-disabled {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-active {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}

.dot-disabled {
  background: #94a3b8;
}

/* Action Buttons */
.td-actions {
  text-align: right;
  white-space: nowrap;
}

.action-btn {
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}

.action-btn.edit {
  color: #6366f1;
}

.action-btn.edit:hover {
  background: rgba(99, 102, 241, 0.08);
}

.action-btn.disable {
  color: #f59e0b;
}

.action-btn.disable:hover {
  background: rgba(245, 158, 11, 0.08);
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* ===== Pagination ===== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.pagination-info {
  font-size: 12px;
  color: #94a3b8;
}

.pagination-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}

.page-btn:hover:not(:disabled) {
  border-color: #6366f1;
  color: #6366f1;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn svg {
  width: 14px;
  height: 14px;
}

.page-num {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}

.page-num:hover {
  background: rgba(99, 102, 241, 0.06);
}

.page-num.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.modal-header h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.08);
}

.modal-close svg {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.form-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 24px 20px;
}

.btn-cancel {
  height: 38px;
  padding: 0 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
}

.btn-cancel:hover {
  border-color: rgba(0, 0, 0, 0.15);
}

.modal-footer .btn-primary {
  height: 38px;
  padding: 0 22px;
  border-radius: 10px;
}

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .top-bar {
    gap: 10px;
  }
}

@media (max-width: 1024px) {
  .data-table {
    min-width: 800px;
  }

  .td-email {
    display: none;
  }

  .data-table thead th:nth-child(2) {
    display: none;
  }
}

@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: unset;
  }

  .filter-select-wrapper {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .table-header {
    padding: 16px 16px 0;
  }

  .data-table thead th {
    padding: 0 16px 12px;
  }

  .data-table tbody td {
    padding: 12px 16px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
  }

  .modal-card {
    max-width: 100%;
    border-radius: 16px;
  }
}
</style>
