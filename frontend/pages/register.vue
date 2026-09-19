<template>
  <div class="register-page">
    <div class="register-card">
      <div class="logo-icon">A</div>
      <h1 class="title">加入组织</h1>

      <template v-if="verifying">
        <p class="hint">正在验证邀请...</p>
      </template>

      <template v-else-if="verifyError">
        <div class="error-state">
          <p class="error-icon">✕</p>
          <p class="error-text">{{ verifyError }}</p>
          <NuxtLink to="/login" class="btn-secondary">去登录</NuxtLink>
        </div>
      </template>

      <template v-else-if="accepted">
        <div class="success-state">
          <p class="success-icon">✓</p>
          <p class="success-text">
            {{ acceptedMode === 'created' ? '账号创建成功！' : '已加入组织！' }}
          </p>
          <p class="hint">现在可以登录了</p>
          <NuxtLink to="/login" class="btn-primary">去登录</NuxtLink>
        </div>
      </template>

      <template v-else>
        <div class="invite-info">
          <p>邮箱：<strong>{{ inviteInfo?.email }}</strong></p>
          <p>组织：<strong>{{ inviteInfo?.organizationName }}</strong></p>
        </div>

        <form @submit.prevent="accept">
          <input v-model="form.name" placeholder="你的名字（可选）" class="input" />
          <input v-model="form.password" type="password" placeholder="设置密码（≥8位）" class="input" required />
          <input v-model="form.confirmPassword" type="password" placeholder="确认密码" class="input" required />
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '接受邀请并注册' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: '注册' })

const route = useRoute()
const verifying = ref(true)
const verifyError = ref<string | null>(null)
const inviteInfo = ref<{ email: string; organizationName: string } | null>(null)
const accepted = ref(false)
const acceptedMode = ref('')
const submitting = ref(false)
const form = reactive({ name: '', password: '', confirmPassword: '' })

onMounted(async () => {
  const token = route.query.token as string
  if (!token) { verifyError.value = '缺少邀请令牌'; verifying.value = false; return }
  try {
    inviteInfo.value = await $fetch('/api/public/invitations/verify', {
      method: 'POST', body: { token },
    })
  } catch (e: any) {
    verifyError.value = e?.data?.message ?? '邀请验证失败'
  } finally { verifying.value = false }
})

async function accept() {
  if (form.password.length < 8) return alert('密码至少 8 位')
  if (form.password !== form.confirmPassword) return alert('两次密码不一致')
  submitting.value = true
  try {
    const result = await $fetch('/api/public/invitations/accept', {
      method: 'POST',
      body: { token: route.query.token, password: form.password, name: form.name || undefined },
    })
    accepted.value = true
    acceptedMode.value = (result as any).mode
  } catch (e: any) {
    alert(e?.data?.message ?? '注册失败')
  } finally { submitting.value = false }
}
</script>

<style scoped>
.register-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.register-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 20px; padding: 48px 56px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04); max-width: 420px; width: 100%; }
.logo-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.title { font-family: 'Space Grotesk', sans-serif; font-size: 28px; color: var(--text); margin-bottom: 24px; }
.hint { font-size: 14px; color: var(--text3); margin-top: 12px; }
.invite-info { background: rgba(99,102,241,0.06); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; }
.invite-info p { font-size: 14px; color: var(--text2); margin: 4px 0; }
.invite-info strong { color: var(--text); }
form { display: flex; flex-direction: column; gap: 12px; }
.input { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); font-size: 14px; outline: none; background: rgba(255,255,255,0.8); }
.btn-primary { background: linear-gradient(135deg, var(--indigo), var(--purple)); color: #fff; padding: 12px 24px; border-radius: 12px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.btn-secondary { display: inline-block; padding: 10px 24px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.6); color: var(--text); font-size: 14px; text-decoration: none; }
.error-state, .success-state { padding: 20px 0; }
.error-icon { font-size: 40px; color: #dc2626; margin-bottom: 12px; }
.success-icon { font-size: 40px; color: #22c55e; margin-bottom: 12px; }
.error-text, .success-text { font-size: 16px; color: var(--text); margin-bottom: 8px; }
</style>
