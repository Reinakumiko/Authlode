<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 左侧 Logo -->
      <div class="header-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.9"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 7V17" stroke="currentColor" stroke-width="2"/>
            <path d="M22 7V17" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span class="logo-text">Logto 用户中心</span>
      </div>

      <!-- 右侧操作区 -->
      <div class="header-actions">
        <!-- 搜索框 -->
        <div class="search-box">
          <UIcon name="i-heroicons-magnifying-glass" class="search-icon w-4 h-4" />
          <input
            type="text"
            placeholder="搜索..."
            class="search-input"
          />
        </div>

        <!-- 分隔线 -->
        <div class="header-divider"></div>

        <!-- 通知 -->
        <UButton
          icon="i-heroicons-bell"
          color="gray"
          variant="ghost"
          size="md"
          class="header-button"
          :ui="{ rounded: 'rounded-full' }"
        >
          <UBadge
            color="red"
            variant="solid"
            size="sm"
            class="notification-badge"
          >
            3
          </UBadge>
        </UButton>

        <!-- 帮助 -->
        <UButton
          icon="i-heroicons-question-mark-circle"
          color="gray"
          variant="ghost"
          size="md"
          class="header-button"
          :ui="{ rounded: 'rounded-full' }"
        />

        <!-- 分隔线 -->
        <div class="header-divider"></div>

        <!-- 用户菜单 -->
        <div class="user-menu">
          <div class="user-avatar">
            <UIcon name="i-heroicons-user-circle" class="w-8 h-8" />
          </div>
          <div class="user-info">
            <p class="user-name">管理员</p>
            <p class="user-email">admin@example.com</p>
          </div>
          <UIcon name="i-heroicons-chevron-down" class="user-dropdown-icon w-4 h-4" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 用户信息后续从认证状态获取
const currentUser = {
  name: '管理员',
  email: 'admin@example.com'
}
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.85);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

.header-container {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  gap: 1.5rem;
}

/* Logo */
.header-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

/* 右侧操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 0.5rem;
  min-width: 16rem;
  transition: all 0.2s ease;
}

.search-box:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(203, 213, 225, 1);
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.95);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 400;
}

.search-input::placeholder {
  color: #94a3b8;
}

/* 分隔线 */
.header-divider {
  width: 1px;
  height: 1.5rem;
  background: rgba(226, 232, 240, 0.8);
  flex-shrink: 0;
}

/* 按钮样式 */
.header-button {
  position: relative;
  color: #64748b;
  transition: all 0.15s ease;
}

.header-button:hover {
  color: #334155;
  background: rgba(255, 255, 255, 0.7);
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
}

/* 用户菜单 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.5rem 0.375rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.7);
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

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.2;
}

.user-email {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.2;
}

.user-dropdown-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.user-menu:hover .user-dropdown-icon {
  color: #64748b;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-box {
    display: none;
  }

  .user-info {
    display: none;
  }
}
</style>
