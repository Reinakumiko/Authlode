<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">A</div>
      <div class="logo-text">Authlode</div>
    </div>

    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-section">
        <div class="nav-section-label">主要功能</div>
        <NuxtLink
          v-for="item in mainMenu"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'active': isActiveRoute(item.name) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </NuxtLink>
      </div>

      <div class="nav-section">
        <div class="nav-section-label">管理</div>
        <NuxtLink
          v-for="item in managementMenu"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'active': isActiveRoute(item.name) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </div>

      <div class="nav-section">
        <div class="nav-section-label">系统</div>
        <NuxtLink
          v-for="item in systemMenu"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'active': isActiveRoute(item.name) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Tenant Switcher（多租户用户切换系统） -->
    <TenantSwitcher />

    <!-- User Section（真实身份 + 登出） -->
    <div class="user-section">
      <div class="avatar">{{ avatarChar }}</div>
      <div class="user-info">
        <div class="user-name">{{ displayName }}</div>
        <div class="user-role">{{ auth.isTenantAdmin ? '租户管理员' : '成员' }}</div>
      </div>
      <button class="logout-btn" title="登出" @click="auth.logout()">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()

const displayName = computed(
  () => auth.user?.name || auth.user?.username || auth.user?.primaryEmail || '用户',
)
const avatarChar = computed(() => displayName.value.charAt(0).toUpperCase())

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}

// 主要功能菜单
const mainMenu = [
  { name: 'index', label: '仪表板', icon: 'i-heroicons-squares-2x2', to: { name: 'index' } },
  { name: 'users', label: '用户管理', icon: 'i-heroicons-users', to: { name: 'users' } },
  { name: 'organizations', label: '组织管理', icon: 'i-heroicons-building-office-2', to: { name: 'organizations' } },
  { name: 'roles', label: '角色权限', icon: 'i-heroicons-shield-check', to: { name: 'roles' } },
  { name: 'applications', label: '应用接入', icon: 'i-heroicons-rectangle-stack', to: { name: 'applications' } }
]

// 管理功能菜单
const managementMenu = [
  { name: 'invitations', label: '邀请管理', icon: 'i-heroicons-envelope', to: { name: 'invitations' } },
  { name: 'audit-logs', label: '审计日志', icon: 'i-heroicons-clipboard-document-list', to: { name: 'audit-logs' } },
  { name: 'statistics', label: '数据统计', icon: 'i-heroicons-chart-bar', to: { name: 'statistics' } }
]

// 系统菜单
const systemMenu = [
  { name: 'me', label: '个人中心', icon: 'i-heroicons-user-circle', to: { name: 'me' } },
  { name: 'settings', label: '系统设置', icon: 'i-heroicons-cog-6-tooth', to: { name: 'settings' } }
]
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: relative;
  z-index: 2;
  height: 100vh;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 16px;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--text, #1e293b);
}

/* Navigation */
.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 16px;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 12px;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--text2, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.7);
  color: var(--text, #1e293b);
}

.nav-item.active {
  background: #fff;
  color: var(--indigo, #6366f1);
  font-weight: 600;
  border-left-color: var(--indigo, #6366f1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text2, #64748b);
  border-radius: 6px;
}

.nav-item.active .nav-badge {
  background: rgba(99, 102, 241, 0.1);
  color: var(--indigo, #6366f1);
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--teal, #14b8a6));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #1e293b);
}

.user-role {
  font-size: 11px;
  color: var(--text3, #94a3b8);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text3, #94a3b8);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
}

/* Scrollbar */
.nav::-webkit-scrollbar {
  width: 3px;
}

.nav::-webkit-scrollbar-track {
  background: transparent;
}

.nav::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 2px;
}
</style>
