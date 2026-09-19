/**
 * API 客户端 — 统一封装
 *
 * - 同源代理（/api → 后端 :3001），cookie 自动携带
 * - 自动附加 x-tenant-id（当前租户上下文，TenantContextMiddleware 消费）
 * - 401 → 跳转登录（会话过期/未登录）
 *
 * 用法：const api = useApi(); const users = await api('/users', { query: { page: 1 } })
 */
export function useApi() {
  const auth = useAuthStore()

  return $fetch.create({
    baseURL: '/api',
    credentials: 'include',
    onRequest({ options }) {
      if (auth.currentTenantId) {
        options.headers.set('x-tenant-id', auth.currentTenantId)
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        window.location.href = '/api/auth/login'
      }
    },
  })
}
