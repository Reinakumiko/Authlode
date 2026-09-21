import { defineStore } from 'pinia'

/** /api/auth/me 响应中的组织条目 */
export interface AuthOrganization {
  id: string
  name: string
  roles: string[]
}

/** /api/auth/me 响应 */
export interface AuthUser {
  id: string
  username?: string | null
  primaryEmail?: string | null
  name?: string | null
  organizations: AuthOrganization[]
}

/**
 * 认证状态（Pinia）
 *
 * - fetchMe：拉取当前身份 + 所属组织（401 抛出，由路由守卫处理）
 * - switchTenant：切换当前租户（仅成员组织，localStorage 持久化）
 * - logout：跳后端 end_session（终结 IdP 会话）
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loaded = ref(false)
  const currentTenantId = ref<string | null>(null)

  const organizations = computed<AuthOrganization[]>(
    () => user.value?.organizations ?? [],
  )

  /** 恢复上次选择的租户（校验仍为成员），否则首个组织 */
  async function fetchMe() {
    user.value = await $fetch<AuthUser>('/api/auth/me')
    const saved = localStorage.getItem('auth.tenantId')
    currentTenantId.value = organizations.value.some((o) => o.id === saved)
      ? saved
      : organizations.value[0]?.id ?? null
    loaded.value = true
  }

  function switchTenant(tenantId: string) {
    if (organizations.value.some((o) => o.id === tenantId)) {
      currentTenantId.value = tenantId
      localStorage.setItem('auth.tenantId', tenantId)
    }
  }

  const currentTenantName = computed(
    () =>
      organizations.value.find((o) => o.id === currentTenantId.value)?.name ??
      '',
  )

  /** 当前租户内是否管理员（TenantAdminGuard 对应） */
  const isTenantAdmin = computed(
    () =>
      organizations.value
        .find((o) => o.id === currentTenantId.value)
        ?.roles.includes('tenant-admin') ?? false,
  )

  /** 登出：经代理跳后端（memory 模式回 /login；logto 模式跳 end_session） */
  function logout() {
    window.location.href = '/api/auth/logout'
  }

  return {
    user,
    organizations,
    currentTenantId,
    currentTenantName,
    isTenantAdmin,
    loaded,
    fetchMe,
    switchTenant,
    logout,
  }
})
