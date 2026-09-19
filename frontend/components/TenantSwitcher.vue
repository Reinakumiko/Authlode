<template>
  <div v-if="auth.organizations.length > 0" class="tenant-switcher">
    <button class="switcher-btn" @click="open = !open">
      <span class="tenant-dot"></span>
      <span class="tenant-name">{{ auth.currentTenantName || '选择租户' }}</span>
      <svg
        class="chevron"
        :class="{ rotated: open }"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="14"
        height="14"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <Transition name="menu">
      <div v-if="open" class="switcher-menu">
        <div class="menu-label">切换系统</div>
        <button
          v-for="org in auth.organizations"
          :key="org.id"
          class="menu-item"
          :class="{ active: org.id === auth.currentTenantId }"
          @click="select(org.id)"
        >
          <span class="item-dot" :class="{ on: org.id === auth.currentTenantId }"></span>
          <span class="item-name">{{ org.name }}</span>
          <span v-if="org.roles.includes('tenant-admin')" class="item-role">管理员</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const open = ref(false)

function select(tenantId: string) {
  auth.switchTenant(tenantId)
  open.value = false
  // 刷新当前页数据（租户上下文变化）
  window.location.reload()
}
</script>

<style scoped>
.tenant-switcher {
  position: relative;
  margin: 0 16px 12px;
}

.switcher-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.switcher-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tenant-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--teal, #14b8a6);
  box-shadow: 0 0 6px rgba(20, 184, 166, 0.4);
  flex-shrink: 0;
}

.tenant-name {
  flex: 1;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: var(--text3, #94a3b8);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.switcher-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.menu-label {
  font-size: 11px;
  color: var(--text3, #94a3b8);
  padding: 6px 10px 4px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: 'DM Sans', sans-serif;
}

.menu-item:hover {
  background: rgba(99, 102, 241, 0.06);
}

.menu-item.active {
  background: rgba(99, 102, 241, 0.1);
}

.item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.item-dot.on {
  background: var(--indigo, #6366f1);
}

.item-name {
  flex: 1;
  text-align: left;
  font-size: 13px;
  color: var(--text, #1e293b);
}

.item-role {
  font-size: 10px;
  color: var(--indigo, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
}

.menu-enter-active,
.menu-leave-active {
  transition: all 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
