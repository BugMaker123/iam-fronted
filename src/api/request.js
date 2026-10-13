import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('iam_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 如果是标准 Result 包装
    if (res && typeof res.code !== 'undefined') {
      if (res.code === 200) {
        return res.data
      } else if (res.code === 401) {
        localStorage.removeItem('iam_token')
        localStorage.removeItem('iam_user')
        ElMessage.error(res.message || '登录会话已过期，请重新登录')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(new Error(res.message || '未授权'))
      } else {
        ElMessage.error(res.message || '系统处理异常')
        return Promise.reject(new Error(res.message || '错误'))
      }
    }
    return res
  },
  (error) => {
    const status = error.response ? error.response.status : null
    if (status === 401) {
      localStorage.removeItem('iam_token')
      localStorage.removeItem('iam_user')
      ElMessage.error('认证过期，请重新登录')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else {
      const msg = error.response?.data?.message || error.message || '网络连接超时或服务器异常'
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  }
)

export default service
