<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">组织管理</h2><p class="page-desc">管理本系统内的组织架构</p></div>
      <button class="btn-primary" @click="showCreate = true">+ 创建组织</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="org-tree">
      <div v-for="node in tree" :key="node.id" class="org-node" :style="{ marginLeft: (node.depth || 0) * 24 + 'px' }">
        <div class="org-card">
          <div class="org-icon">{{ node.name[0] }}</div>
          <div class="org-info">
            <div class="org-name">{{ node.name }}</div>
            <div class="org-desc">{{ node.description || '—' }}</div>
          </div>
          <button class="btn-sm btn-red" @click="removeOrg(node)">删除</button>
        </div>
        <div v-for="child in node.children || []" :key="child.id" class="org-node" :style="{ marginLeft: '24px' }">
          <div class="org-card child">
            <div class="org-icon sm">{{ child.name[0] }}</div>
            <div class="org-info">
              <div class="org-name">{{ child.name }}</div>
              <div class="org-desc">{{ child.description || '—' }}</div>
            </div>
            <button class="btn-sm btn-red" @click="removeOrg(child)">删除</button>
          </div>
        </div>
      </div>
      <div v-if="tree.length === 0" class="empty">暂无组织，点击上方按钮创建</div>
    </div>
    <div v-if="showCreate" class="modal-mask" @click.self="showCreate = false">
      <div class="modal">
        <h3>创建组织</h3>
        <input v-model="form.name" placeholder="组织名称" class="input" />
        <input v-model="form.description" placeholder="描述（可选）" class="input" />
        <div class="modal-actions">
          <button class="btn-sm" @click="showCreate = false">取消</button>
          <button class="btn-sm btn-primary" @click="createOrg">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '组织管理' })
const api = useApi()
const loading = ref(true)
const orgs = ref<any[]>([])
const showCreate = ref(false)
const form = reactive({ name: '', description: '' })

const tree = computed(() => {
  const byParent = new Map<string | null, any[]>()
  for (const o of orgs.value) {
    const key = o.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(o)
  }
  const roots = byParent.get(null) ?? []
  for (const r of roots) r.children = byParent.get(r.id) ?? []
  return roots
})

async function fetchOrgs() {
  loading.value = true
  try { const res = await api('/tenant-organizations'); orgs.value = res.data }
  catch (e) { console.error(e) } finally { loading.value = false }
}

async function createOrg() {
  if (!form.name) return alert('请填写组织名称')
  try {
    await api('/tenant-organizations', { method: 'POST', body: { ...form } })
    showCreate.value = false
    Object.assign(form, { name: '', description: '' })
    await fetchOrgs()
  } catch (e: any) { alert(e?.data?.message ?? '创建失败') }
}

async function removeOrg(org: any) {
  if (!confirm(`确定删除组织「${org.name}」？`)) return
  try { await api(`/tenant-organizations/${org.id}`, { method: 'DELETE' }); await fetchOrgs() }
  catch (e: any) { alert(e?.data?.message ?? '删除失败') }
}

onMounted(fetchOrgs)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 10px 20px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: var(--text3); font-size: 14px; }
.org-tree { display: flex; flex-direction: column; gap: 8px; }
.org-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 16px; padding: 14px 20px; }
.org-card.child { margin-top: 8px; margin-left: 24px; }
.org-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.org-icon.sm { width: 28px; height: 28px; font-size: 13px; }
.org-info { flex: 1; }
.org-name { font-weight: 600; font-size: 14px; color: var(--text); }
.org-desc { font-size: 12px; color: var(--text3); }
.btn-sm { padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.6); font-size: 12px; cursor: pointer; }
.btn-red { color: #dc2626; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; padding: 32px; width: 400px; display: flex; flex-direction: column; gap: 12px; }
.modal h3 { font-size: 18px; }
.input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
