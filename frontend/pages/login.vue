<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-icon">A</div>
      <h1 class="title">Authlode</h1>
      <p class="desc">SSO 用户管理平台</p>
      <button class="btn-login" @click="login">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        使用账号登录
      </button>
      <p class="hint">将通过统一认证服务跳转登录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({ title: '登录' })

function login() {
  // 经代理跳后端 /api/auth/login → Logto 授权页（PKCE + prompt=consent）
  window.location.href = 'http://localhost:3001/api/auth/login'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 48px 56px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
}

.logo-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
  margin-bottom: 4px;
}

.desc {
  font-size: 14px;
  color: var(--text2, #64748b);
  margin-bottom: 32px;
}

.btn-login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.hint {
  font-size: 12px;
  color: var(--text3, #94a3b8);
  margin-top: 20px;
}
</style>
