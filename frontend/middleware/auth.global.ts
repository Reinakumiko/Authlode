/**
 * 全局路由守卫
 *
 * - 公开页白名单：/login（登录页）、/register（邀请注册，token 即凭证）
 * - 首次进入：拉取 /api/auth/me 建立认证态；401 → 跳登录页
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/register') {
    return
  }

  const auth = useAuthStore()
  if (!auth.loaded) {
    try {
      await auth.fetchMe()
    } catch {
      return navigateTo('/login')
    }
  }
})
