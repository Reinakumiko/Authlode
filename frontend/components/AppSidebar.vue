<template>
  <aside class="app-sidebar">
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <!-- 主要功能 -->
      <div class="nav-section">
        <div class="nav-section-title">主要功能</div>
        <NuxtLink
          v-for="item in mainMenu"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'nav-item-active': isActiveRoute(item.name) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </NuxtLink>
      </div>

      <!-- 管理功能 -->
      <div class="nav-section">
        <div class="nav-section-title">管理</div>
        <NuxtLink
          v-for="item in managementMenu"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'nav-item-active': isActiveRoute(item.name) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </div>

      <!-- 系统 -->
      <div class="nav-section">
        <div class="nav-section-title">系统</div>
        <NuxtLink
          v-for="item in systemMenu"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'nav-item-active': isActiveRoute(item.name) }"
        >
          <UIcon :name="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- 底部用户信息 -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <UIcon name="i-heroicons-user-circle" class="w-8 h-8" />
        </div>
        <div class="user-details">
          <p class="user-name">管理员</p>
          <p class="user-email">admin@example.com</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}

// 主要功能菜单
const mainMenu = [
  { name: 'index', label: '仪表板', icon: 'i-heroicons-squares-2x2', to: { name: 'index' } },
  { name: 'users', label: '用户管理', icon: 'i-heroicons-users', to: { name: 'users' }, badge: '12.4K' },
  { name: 'organizations', label: '组织管理', icon: 'i-heroicons-building-office-2', to: { name: 'organizations' } },
  { name: 'roles', label: '角色权限', icon: 'i-heroicons-shield-check', to: { name: 'roles' } },
  { name: 'applications', label: '应用管理', icon: 'i-heroicons-rectangle-stack', to: { name: 'applications' } }
]

// 管理功能菜单
const managementMenu = [
  { name: 'invitations', label: '邀请管理', icon: 'i-heroicons-envelope', to: { name: 'invitations' } },
  { name: 'audit-logs', label: '审计日志', icon: 'i-heroicons-clipboard-document-list', to: { name: 'audit-logs' } },
  { name: 'statistics', label: '数据统计', icon: 'i-heroicons-chart-bar', to: { name: 'statistics' } }
]

// 系统菜单
const systemMenu = [
  { name: 'settings', label: '系统设置', icon: 'i-heroicons-cog-6-tooth', to: { name: 'settings' } }
]
</script>

<style scoped>
.app-sidebar {
  width: 16rem;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-right: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 65px);
  position: sticky;
  top: 65px;
  box-shadow:
    0 0 15px rgba(0, 0, 0, 0.03),
    inset 1px 0 0 rgba(255, 255, 255, 0.9);
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 0.75rem 0.5rem;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: all 0.15s ease;
  margin-bottom: 0.125rem;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.7);
  color: #334155;
}

.nav-item-active {
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(245, 243, 255, 0.8) 100%);
  color: #3b82f6;
  border: 1px solid rgba(219, 234, 254, 0.5);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  background: rgba(226, 232, 240, 0.6);
  color: #475569;
  border-radius: 0.25rem;
}

.nav-item-active .nav-badge {
  background: rgba(219, 234, 254, 0.8);
  color: #3b82f6;
}

/* 底部用户信息 */
.sidebar-footer {
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid rgba(241, 245, 249, 0.8);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.125rem;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 0.25rem;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 0.125rem;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 213, 225, 0.8);
}
</style>
