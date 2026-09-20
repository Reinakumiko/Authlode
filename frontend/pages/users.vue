<template>
  <div>
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-desc">管理本系统的用户账号（{{ totalCount }} 人）</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        创建用户
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <input v-model="searchInput" type="text" placeholder="搜索用户名、邮箱..." class="search-input" @input="debounceSearch" />
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="skeleton-wrap">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="users.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
      </div>
      <p class="empty-title">暂无用户</p>
      <p class="empty-desc">创建第一个用户，或发送邀请让用户自行注册</p>
      <button class="btn-primary" @click="openCreate">创建用户</button>
    </div>

    <!-- 数据表 -->
    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>用户</th><th>邮箱</th><th>状态</th><th>加入时间</th><th style="text-align:right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="table-row">
            <td>
              <div class="user-cell">
                <div class="avatar-sm" :class="'avatar-' + avatarColor(u.id)">{{ (u.name||u.username||'?')[0] }}</div>
                <div>
                  <div class="u-name">{{ u.name || u.username || '未命名' }}</div>
                  <div class="u-username">{{ u.username || u.id }}</div>
                </div>
              </div>
            </td>
            <td>{{ u.primaryEmail || '—' }}</td>
            <td>
              <span class="badge" :class="u.isSuspended ? 'badge-red' : 'badge-green'">
                <span class="badge-dot" :class="u.isSuspended ? 'dot-red' : 'dot-green'"></span>
                {{ u.isSuspended ? '已停用' : '正常' }}
              </span>
            </td>
            <td>{{ fmtDate(u.joinedAt) }}</td>
            <td class="actions-cell">
              <button class="btn-action" title="编辑" @click="openEdit(u)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
              </button>
              <button class="btn-action btn-danger" title="删除" @click="confirmDelete(u)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <button v-for="p in pageNumbers" :key="p" class="page-btn" :class="{ active: p === page }" @click="goPage(p)">{{ p }}</button>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
    </div>

    <!-- 创建弹窗 -->
    <div v-if="showCreate" class="modal-mask" @click.self="closeModals">
      <div class="modal">
        <h3 class="modal-title">创建用户</h3>
        <p class="modal-desc">创建后用户自动加入当前系统</p>
        <div class="form-group">
          <label class="form-label">姓名</label>
          <input v-model="createForm.name" class="form-input" placeholder="如：张三" />
        </div>
        <div class="form-group">
          <label class="form-label">邮箱 <span class="required">*</span></label>
          <input v-model="createForm.primaryEmail" type="email" class="form-input" placeholder="user@example.com" />
        </div>
        <div class="form-group">
          <label class="form-label">初始密码 <span class="required">*</span></label>
          <input v-model="createForm.password" type="password" class="form-input" placeholder="至少 8 位" />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button class="btn-primary" @click="createUser" :disabled="submitting || !createForm.primaryEmail || !createForm.password">
            {{ submitting ? '创建中...' : '创建用户' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editUser" class="modal-mask" @click.self="closeModals">
      <div class="modal">
        <h3 class="modal-title">编辑用户</h3>
        <div class="form-group">
          <label class="form-label">姓名</label>
          <input v-model="editForm.name" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">状态</label>
          <label class="toggle-row">
            <input type="checkbox" v-model="editForm.isSuspended" class="toggle-input" />
            <span class="toggle-label">{{ editForm.isSuspended ? '已停用' : '正常' }}</span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button class="btn-primary" @click="saveEdit" :disabled="submitting">{{ submitting ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="deleteTarget" class="modal-mask" @click.self="closeModals">
      <div class="modal modal-danger">
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-desc">确定删除用户 <strong>{{ deleteTarget.name || deleteTarget.primaryEmail }}</strong>？此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button class="btn-danger" @click="deleteUser" :disabled="submitting">{{ submitting ? '删除中...' : '确认删除' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '用户管理' })

const api = useApi()
const loading = ref(true)
const submitting = ref(false)
const users = ref<any[]>([])
const totalCount = ref(0)
const page = ref(1)
const pageSize = 20
const searchInput = ref('')
const searchQuery = ref('')
const showCreate = ref(false)
const editUser = ref<any>(null)
const deleteTarget = ref<any>(null)
const editForm = reactive({ name: '', isSuspended: false })
const createForm = reactive({ name: '', primaryEmail: '', password: '' })

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))
const pageNumbers = computed(() => {
  const start = Math.max(1, page.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 搜索防抖
let debounceTimer: ReturnType<typeof setTimeout>
function debounceSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = searchInput.value
    page.value = 1
    fetchUsers()
  }, 400)
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await api('/users', {
      query: {
        search: searchQuery.value || undefined,
        page: page.value,
        pageSize,
      },
    })
    users.value = res.data
    totalCount.value = res.totalCount
  } catch (e) {
    console.error('Failed to fetch users:', e)
  } finally {
    loading.value = false
  }
}

function goPage(p: number) {
  page.value = p
  fetchUsers()
}

function openCreate() {
  Object.assign(createForm, { name: '', primaryEmail: '', password: '' })
  showCreate.value = true
}

async function createUser() {
  if (!createForm.primaryEmail || !createForm.password) return
  submitting.value = true
  try {
    await api('/users', { method: 'POST', body: { ...createForm } })
    closeModals()
    await fetchUsers()
  } catch (e: any) {
    alert(e?.data?.message ?? '创建失败')
  } finally {
    submitting.value = false
  }
}

function openEdit(u: any) {
  editUser.value = u
  Object.assign(editForm, { name: u.name ?? '', isSuspended: u.isSuspended ?? false })
}

async function saveEdit() {
  if (!editUser.value) return
  submitting.value = true
  try {
    await api(`/users/${editUser.value.id}`, { method: 'PATCH', body: { name: editForm.name, isSuspended: editForm.isSuspended } })
    closeModals()
    await fetchUsers()
  } catch (e: any) {
    alert(e?.data?.message ?? '保存失败')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(u: any) {
  deleteTarget.value = u
}

async function deleteUser() {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await api(`/users/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeModals()
    await fetchUsers()
  } catch (e: any) {
    alert(e?.data?.message ?? '删除失败')
  } finally {
    submitting.value = false
  }
}

function closeModals() {
  showCreate.value = false
  editUser.value = null
  deleteTarget.value = null
  submitting.value = false
}

function fmtDate(ts: any) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function avatarColor(id: string) {
  const colors = ['indigo', 'purple', 'teal']
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

onMounted(fetchUsers)
</script>

<style scoped>
/* ═══ 页头 ═══ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}
.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}
.page-desc {
  font-size: 14px;
  color: var(--text2, #64748b);
  margin-top: 4px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ═══ 搜索栏 ═══ */
.toolbar { margin-bottom: 20px; }
.search-wrap { position: relative; max-width: 400px; }
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text3, #94a3b8);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: all 0.2s ease;
}
.search-input:focus {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* ═══ 骨架屏 ═══ */
.skeleton-wrap {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 20px;
}
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.skeleton {
  background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
.skeleton-avatar { width: 36px; height: 36px; border-radius: 10px; }
.skeleton-line { height: 14px; flex: 1; }
.skeleton-line.short { flex: 0.5; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ═══ 空状态 ═══ */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
}
.empty-icon { color: var(--text3, #94a3b8); margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text, #1e293b); margin-bottom: 4px; }
.empty-desc { font-size: 14px; color: var(--text3, #94a3b8); margin-bottom: 20px; }

/* ═══ 数据表 ═══ */
.table-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  overflow: hidden;
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left;
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text3, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.3);
}
.data-table td {
  padding: 14px 20px;
  font-size: 14px;
  color: var(--text, #1e293b);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}
.table-row { transition: background 0.15s ease; }
.table-row:hover { background: rgba(255, 255, 255, 0.4); }

.user-cell { display: flex; align-items: center; gap: 12px; }
.avatar-sm {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 13px; font-weight: 700; flex-shrink: 0;
}
.avatar-indigo { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.avatar-purple { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
.avatar-teal { background: linear-gradient(135deg, #14b8a6, #06b6d4); }
.u-name { font-weight: 600; font-size: 14px; }
.u-username { font-size: 12px; color: var(--text3, #94a3b8); }

/* 徽章 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-green { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.dot-red { background: #dc2626; box-shadow: 0 0 6px rgba(220, 38, 38, 0.4); }
.badge-green { background: rgba(34, 197, 94, 0.08); color: #16a34a; }
.badge-red { background: rgba(220, 38, 38, 0.08); color: #dc2626; }

/* 操作按钮 */
.actions-cell { text-align: right; }
.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text3, #94a3b8);
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: 4px;
}
.btn-action:hover { background: rgba(99, 102, 241, 0.1); color: var(--indigo, #6366f1); }
.btn-danger:hover { background: rgba(220, 38, 38, 0.1); color: #dc2626; }

/* ═══ 分页 ═══ */
.pagination {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}
.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text2, #64748b);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.page-btn:hover:not(:disabled) { background: rgba(99, 102, 241, 0.08); }
.page-btn.active { background: var(--indigo, #6366f1); color: #fff; font-weight: 600; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ═══ 弹窗 ═══ */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 32px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.modal-danger { border-color: rgba(220, 38, 38, 0.2); }
.modal-title { font-size: 18px; font-weight: 700; color: var(--text, #1e293b); margin-bottom: 4px; }
.modal-desc { font-size: 13px; color: var(--text3, #94a3b8); margin-bottom: 8px; }
.modal-desc strong { color: #dc2626; }

.form-group { margin-bottom: 16px; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2, #64748b);
  margin-bottom: 6px;
}
.required { color: #dc2626; }
.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  background: rgba(255, 255, 255, 0.8);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-input:focus {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.toggle-input { accent-color: var(--indigo, #6366f1); width: 16px; height: 16px; }
.toggle-label { font-size: 14px; color: var(--text, #1e293b); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.btn-secondary {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-danger {
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: #dc2626;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-danger:hover { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .search-wrap { max-width: 100%; }
  .actions-cell { display: flex; gap: 4px; }
  .data-table th:nth-child(3), .data-table td:nth-child(3) { display: none; }
}
</style>
