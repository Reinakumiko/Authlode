<template>
  <div>
    <div class="page-header">
      <div><h2 class="page-title">个人中心</h2><p class="page-desc">管理你的账号信息</p></div>
    </div>

    <div class="me-grid">
      <div class="me-card">
        <h3>基本信息</h3>
        <div class="info-row"><span class="info-label">姓名</span><span class="info-val">{{ auth.user?.name || '—' }}</span></div>
        <div class="info-row"><span class="info-label">用户名</span><span class="info-val">{{ auth.user?.username || '—' }}</span></div>
        <div class="info-row"><span class="info-label">邮箱</span><span class="info-val">{{ auth.user?.primaryEmail || '—' }}</span></div>
      </div>

      <div class="me-card">
        <h3>所属组织</h3>
        <div v-for="org in auth.organizations" :key="org.id" class="org-item">
          <span class="org-name">{{ org.name }}</span>
          <span v-if="org.roles.length > 0" class="org-roles">{{ org.roles.join(', ') }}</span>
          <span v-else class="org-roles muted">成员</span>
        </div>
      </div>

      <div class="me-card">
        <h3>修改密码</h3>
        <form @submit.prevent="changePassword" class="pw-form">
          <input v-model="pwForm.newPassword" type="password" placeholder="新密码（≥8位）" class="input" required />
          <input v-model="pwForm.confirm" type="password" placeholder="确认新密码" class="input" required />
          <button type="submit" class="btn-primary" :disabled="changing">
            {{ changing ? '修改中...' : '修改密码' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '个人中心' })
const auth = useAuthStore()
const api = useApi()
const changing = ref(false)
const pwForm = reactive({ newPassword: '', confirm: '' })

async function changePassword() {
  if (pwForm.newPassword.length < 8) return alert('密码至少 8 位')
  if (pwForm.newPassword !== pwForm.confirm) return alert('两次密码不一致')
  changing.value = true
  try {
    await api('/auth/change-password', { method: 'POST', body: { newPassword: pwForm.newPassword } })
    alert('密码修改成功')
    Object.assign(pwForm, { newPassword: '', confirm: '' })
  } catch (e: any) { alert(e?.data?.message ?? '修改失败') } finally { changing.value = false }
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: var(--text); }
.page-desc { font-size: 14px; color: var(--text2); margin-top: 4px; }
.me-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.me-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 24px; }
.me-card h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 16px; }
.info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.info-label { font-size: 13px; color: var(--text3); }
.info-val { font-size: 13px; font-weight: 600; color: var(--text); }
.org-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.org-name { font-size: 14px; font-weight: 600; color: var(--text); }
.org-roles { font-size: 12px; color: var(--indigo); background: rgba(99,102,241,0.1); padding: 2px 8px; border-radius: 6px; }
.org-roles.muted { color: var(--text3); background: rgba(0,0,0,0.04); }
.pw-form { display: flex; flex-direction: column; gap: 12px; }
.input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 10px 24px; border-radius: 12px; border: none; font-size: 14px; cursor: pointer; }
</style>
