<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">组织管理</h2>
        <p class="page-desc">管理本系统内的组织架构（{{ orgs.length }} 个节点）</p>
      </div>
      <button class="btn-primary" @click="openCreate(null)">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        创建组织
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="tree.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
      </div>
      <p class="empty-title">暂无组织</p>
      <p class="empty-desc">创建第一个组织节点来搭建组织架构</p>
    </div>

    <div v-else class="tree-container">
      <template v-for="node in tree" :key="node.id">
        <div class="org-node">
          <div class="org-card">
            <button v-if="(node.children?.length ?? 0) > 0" class="expand-btn" @click="toggle(node.id)">
              <svg :class="{ rotated: expanded.has(node.id) }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
            </button>
            <span v-else class="expand-spacer"></span>
            <div class="org-icon">{{ node.name[0] }}</div>
            <div class="org-info">
              <div class="org-name">{{ node.name }}</div>
              <div class="org-desc">{{ node.description || '—' }}</div>
            </div>
            <div class="org-actions">
              <button class="btn-action" title="添加子组织" @click="openCreate(node.id)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </button>
              <button class="btn-action" title="编辑" @click="openEdit(node)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
              </button>
              <button class="btn-action btn-danger" title="删除" @click="confirmDelete(node)">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <!-- 子节点 -->
          <div v-if="expanded.has(node.id) && node.children?.length" class="org-children">
            <div v-for="child in node.children" :key="child.id" class="org-card child">
              <div class="org-icon sm">{{ child.name[0] }}</div>
              <div class="org-info">
                <div class="org-name">{{ child.name }}</div>
                <div class="org-desc">{{ child.description || '—' }}</div>
              </div>
              <div class="org-actions">
                <button class="btn-action" @click="openEdit(child)">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
                </button>
                <button class="btn-action btn-danger" @click="confirmDelete(child)">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="modal-mask" @click.self="closeModals">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? '编辑组织' : '创建组织' }}</h3>
        <p v-if="createParentId" class="modal-desc">将作为「{{ getParentName(createParentId) }}」的子组织</p>
        <div class="form-group">
          <label class="form-label">名称 <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" placeholder="组织名称" />
        </div>
        <div class="form-group">
          <label class="form-label">描述</label>
          <input v-model="form.description" class="form-input" placeholder="描述（可选）" />
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
        <p class="modal-desc">确定删除组织 <strong>{{ deleteTarget.name }}</strong>？</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button class="btn-danger" @click="deleteOrg" :disabled="submitting">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '组织管理' })

const api = useApi()
const loading = ref(true)
const submitting = ref(false)
const orgs = ref<any[]>([])
const showModal = ref(false)
const editing = ref(false)
const editingId = ref<string | null>(null)
const createParentId = ref<string | null>(null)
const deleteTarget = ref<any>(null)
const expanded = ref(new Set<string>())
const form = reactive({ name: '', description: '' })

interface OrgNode {
  id: string; name: string; description?: string; parentId?: string
  children?: OrgNode[]
}

const tree = computed((): (OrgNode & { children?: OrgNode[]; expandedSet?: Set<string> })[] => {
  const byParent = new Map<string | null, any[]>()
  for (const o of orgs.value) {
    const key = o.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(o)
  }
  const roots = (byParent.get(null) ?? []).map(n => ({
    ...n,
    children: (byParent.get(n.id) ?? []).map(c => ({
      ...c,
      children: (byParent.get(c.id) ?? []).map(gc => ({ ...gc, children: byParent.get(gc.id) ?? [] })),
    })),
  }))
  return roots
})

function toggle(id: string) {
  const s = new Set(expanded.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expanded.value = s
}

function getParentName(id: string) {
  return orgs.value.find(o => o.id === id)?.name ?? id
}

async function fetchOrgs() {
  loading.value = true
  try {
    const res = await api('/tenant-organizations')
    orgs.value = res.data
    expanded.value = new Set(orgs.value.map(o => o.parentId).filter(Boolean))
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function openCreate(parentId: string | null) {
  editing.value = false
  editingId.value = null
  createParentId.value = parentId
  Object.assign(form, { name: '', description: '' })
  showModal.value = true
}

function openEdit(node: any) {
  editing.value = true
  editingId.value = node.id
  Object.assign(form, { name: node.name, description: node.description ?? '' })
  showModal.value = true
}

async function save() {
  if (!form.name) return
  submitting.value = true
  try {
    if (editing.value && editingId.value) {
      await api(`/tenant-organizations/${editingId.value}`, { method: 'PATCH', body: { name: form.name, description: form.description } })
    } else {
      await api('/tenant-organizations', { method: 'POST', body: { name: form.name, description: form.description, parentId: createParentId.value } })
    }
    closeModals()
    await fetchOrgs()
  } catch (e: any) { alert(e?.data?.message ?? '保存失败') } finally { submitting.value = false }
}

function confirmDelete(node: any) { deleteTarget.value = node }

async function deleteOrg() {
  if (!deleteTarget.value) return
  submitting.value = true
  try {
    await api(`/tenant-organizations/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeModals()
    await fetchOrgs()
  } catch (e: any) { alert(e?.data?.message ?? '删除失败') } finally { submitting.value = false }
}

function closeModals() {
  showModal.value = false
  deleteTarget.value = null
  editing.value = false
  createParentId.value = null
  submitting.value = false
}

onMounted(fetchOrgs)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}
.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px; font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}
.page-desc { font-size: 14px; color: var(--text2, #64748b); margin-top: 4px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  padding: 10px 20px; border-radius: 12px; border: none;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.loading, .empty-state {
  text-align: center; padding: 60px 20px;
  background: rgba(255,255,255,0.55); backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7); border-radius: 20px;
  color: var(--text2, #64748b);
}
.empty-icon { color: var(--text3, #94a3b8); margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: var(--text, #1e293b); margin-bottom: 4px; }
.empty-desc { font-size: 14px; color: var(--text3, #94a3b8); }

.tree-container { display: flex; flex-direction: column; gap: 8px; }
.org-node { position: relative; }
.org-card {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.7);
  border-radius: 16px;
  padding: 14px 20px;
  transition: all 0.2s ease;
}
.org-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.org-card.child { margin-left: 24px; border-radius: 12px; padding: 12px 16px; }
.org-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; flex-shrink: 0;
}
.org-icon.sm { width: 28px; height: 28px; font-size: 13px; }
.org-info { flex: 1; min-width: 0; }
.org-name { font-weight: 600; font-size: 14px; color: var(--text, #1e293b); }
.org-desc { font-size: 12px; color: var(--text3, #94a3b8); margin-top: 2px; }
.org-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s ease; }
.org-card:hover .org-actions { opacity: 1; }

.expand-btn {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 6px;
  border: none; background: transparent;
  color: var(--text3, #94a3b8); cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.expand-btn svg { transition: transform 0.2s ease; }
.expand-btn svg.rotated { transform: rotate(180deg); }
.expand-spacer { width: 24px; flex-shrink: 0; }
.org-children { padding-left: 24px; }

.btn-action {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  border: none; background: transparent;
  color: var(--text3, #94a3b8); cursor: pointer;
  transition: all 0.15s ease;
}
.btn-action:hover { background: rgba(99,102,241,0.1); color: var(--indigo, #6366f1); }
.btn-danger:hover { background: rgba(220,38,38,0.1); color: #dc2626; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); border-radius: 20px; padding: 32px; width: 420px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
.modal-danger { border-color: rgba(220,38,38,0.2); }
.modal-title { font-size: 18px; font-weight: 700; color: var(--text, #1e293b); margin-bottom: 4px; }
.modal-desc { font-size: 13px; color: var(--text3, #94a3b8); margin-bottom: 8px; }
.modal-desc strong { color: var(--indigo, #6366f1); }

.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text2, #64748b); margin-bottom: 6px; }
.required { color: #dc2626; }
.form-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); transition: border-color 0.2s, box-shadow 0.2s; }
.form-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn-secondary { padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; }
.btn-danger { padding: 10px 20px; border-radius: 12px; border: none; background: #dc2626; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
