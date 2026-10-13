import { defineStore } from 'pinia'
import { getCurrentUser, logout as apiLogout } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('iam_token') || '',
    userInfo: JSON.parse(localStorage.getItem('iam_user') || 'null')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'ADMIN',
    username: (state) => state.userInfo?.username || '未登录',
    realName: (state) => state.userInfo?.realName || '用户'
  },
  actions: {
    setAuth(token, userInfo) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem('iam_token', token)
      localStorage.setItem('iam_user', JSON.stringify(userInfo))
    },
    async fetchProfile() {
      if (!this.token) return null
      try {
        const user = await getCurrentUser()
        this.userInfo = user
        localStorage.setItem('iam_user', JSON.stringify(user))
        return user
      } catch (err) {
        this.clearAuth()
        return null
      }
    },
    async logout() {
      try {
        await apiLogout()
      } catch (e) {
        // ignore
      }
      this.clearAuth()
    },
    clearAuth() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('iam_token')
      localStorage.removeItem('iam_user')
    }
  }
})
