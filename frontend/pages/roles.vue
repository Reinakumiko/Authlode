<template>
  <div>
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">角色权限</h2>
        <p class="page-desc">管理 IAM 实例级角色（{{ totalCount }} 个）</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ 创建角色</button>
    </div>

    <!-- 搜索 -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <input v-model="searchInput" type="text" placeholder="搜索角色..." class="search-input" @input="debounceSearch" />
      </div>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="skeleton-wrap">
      <div v-for="i in 4" :key="i" class="skeleton-row">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="roles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="empty-title">暂无角色</p>
      <p class="empty-desc">创建第一个角色来管理权限</p>
      <button class="btn-primary" @click="openCreate">创建角色</button>
    </div>

    <!-- 角色卡片网格 -->
    <div v-else class="roles-grid">
      <div v-for="r in roles" :key="r.id" class="role-card">
        <div class="role-header">
          <div class="role-icon">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="role-info">
            <div class="role-name">{{ r.name }}</div>
            <div class="role-desc">{{ r.description || '—' }}</div>
          </div>
          <span class="badge" :class="r.type === 'User' ? 'badge-user' : 'badge-m2m'">
            {{ r.type === 'User' ? '用户角色' : 'M2M' }}
          </span>
        </div>
        <div class="role-actions">
          <button class="btn-action" title="编辑" @click="openEdit(r)">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
            编辑
          </button>
          <button class="btn-action btn-danger" @click="confirmDelete(r)">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="modal-mask" @click.self="closeModals">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? '编辑角色' : '创建角色' }}</h3>
        <div class="form-group">
          <label class="form-label">角色名称 <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" placeholder="如：editor" />
        </div>
        <div class="form-group">
          <label class="form-label">描述</label>
          <input v-model="form.description" class="form-input" placeholder="角色用途说明" />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button class="btn-primary" @click="save" :disabled="submitting || !form.name">{{ submitting ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="deleteTarget" class="modal-mask" @click.self="closeModals">
      <div class="modal modal-danger">
        <h3 class="modal-title">确认删除</h3>
        <p class="modal-desc">确定删除角色 <strong>{{ deleteTarget.name }}</strong>？已分配的用户将失去该角色权限。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button class="btn-danger" @click="deleteRole" :disabled="submitting">{{ submitting ? '删除中...' : '确认删除' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '角色权限' })

const api = useApi()
const loading = ref(true)
const submitting = ref(false)
const roles = ref<any[]>([])
const totalCount = ref(0)
const searchInput = ref('')
const showModal = ref(false)
const editing = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<any>(null)
const form = reactive({ name: '', description: '' })

let debounceTimer: ReturnType<typeof setTimeout>
function debounceSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchRoles(), 400)
}

async function fetchRoles() {
  loading.value = true
  try {
    const res = await api('/roles', { query: { search: searchInput.value || undefined, pageSize: 50 } })
    roles.value = res.data
    totalCount.value = res.totalCount
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function openCreate() {
  editing.value = false
  editingId.value = null
  Object.assign(form, { name: '', description: '' })
  showModal.value = true
}

function openEdit(r: any) {
  editing.value = true
  editingId.value = r.id
  Object.assign(form, { name: r.name, description: r.description ?? '' })
  showModal.value = true
}

async function save() {
  if (!form.name) return
  submitting.value = true
  try {
    if (editing.value && editingId.value) {
      await api(`/roles/${editingId.value}`, { method: 'PATCH', body: { name: form.name, description: form.description } })
    } else {
      await api('/roles', { method: 'POST', body: { name: form.name, description: form.description } })
    }
    closeModals()
    await fetchRoles()
  } catch (e: any) { alert(e?.data?.message ?? '保存失败') } finally { submitting.value = false }
}

function confirmDelete(r: any) { deleteTarget.value = r }

async function deleteRole() {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await api(`/roles/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeModals()
    await fetchRoles()
  } catch (e: any) { alert(e?.data?.message ?? '删除失败') } finally { submitting.value = false }
}

function closeModals() {
  showModal.value = false
  deleteTarget.value = null
  submitting.value = false
}

onMounted(fetchRoles)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: var(--text, #1e293b); }
.page-desc { font-size: 14px; color: var(--text2, #64748b); margin-top: 4px; }
.btn-primary { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6)); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); padding: 10px 20px; border-radius: 12px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.toolbar { margin-bottom: 20px; }
.search-wrap { position: relative; max-width: 400px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3, #94a3b8); }
.search-input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 14px; outline: none; transition: all 0.2s ease; }
.search-input:focus { background: rgba(255,255,255,0.9); border-color: rgba(99,102,241,0.3); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

.skeleton-wrap { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 20px; }
.skeleton-row { display: flex; align-items: center; gap: 12px; padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.skeleton { background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
.skeleton-icon { width: 36px; height: 36px; border-radius: 10px; }
.skeleton-line { height: 14px; flex: 1; }
.skeleton-line.short { flex: 0.5; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-state { text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; }
.empty-icon { color: var(--text3, #94a3b8); margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text, #1e293b); margin-bottom: 4px; }
.empty-desc { font-size: 14px; color: var(--text3, #94a3b8); margin-bottom: 20px; }

.roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.role-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 20px; transition: all 0.3s ease; }
.role-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.role-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.role-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(99,102,241,0.1); color: var(--indigo, #6366f1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.role-info { flex: 1; min-width: 0; }
.role-name { font-size: 15px; font-weight: 700; color: var(--text, #1e293b); }
.role-desc { font-size: 12px; color: var(--text3, #94a3b8); margin-top: 2px; }
.badge { padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 500; flex-shrink: 0; }
.badge-user { background: rgba(99,102,241,0.1); color: var(--indigo, #6366f1); }
.badge-m2m { background: rgba(20,184,166,0.1); color: var(--teal, #14b8a6); }
.role-actions { display: flex; gap: 8px; }
.btn-action { display: inline-flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.15s ease; color: var(--text2, #64748b); }
.btn-action:hover { background: rgba(99,102,241,0.08); color: var(--indigo, #6366f1); border-color: rgba(99,102,241,0.2); }
.btn-danger:hover { background: rgba(220,38,38,0.08); color: #dc2626; border-color: rgba(220,38,38,0.2); }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); border-radius: 20px; padding: 32px; width: 420px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
.modal-danger { border-color: rgba(220,38,38,0.2); }
.modal-title { font-size: 18px; font-weight: 700; color: var(--text, #1e293b); margin-bottom: 4px; }
.modal-desc { font-size: 13px; color: var(--text3, #94a3b8); margin-bottom: 8px; }
.modal-desc strong { color: #dc2626; }

.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2, #64748b); margin-bottom: 6px; }
.required { color: #dc2626; }
.form-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); transition: border-color 0.2s, box-shadow 0.2s; }
.form-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn-secondary { padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; }
.btn-danger { padding: 10px 20px; border-radius: 12px; border: none; background: #dc2626; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-danger:hover { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
