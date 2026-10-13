import request from './request'

export function getCaptcha() {
  return request({
    url: '/api/auth/captcha',
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function getCurrentUser() {
  return request({
    url: '/api/auth/me',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

export function getOidcConfig() {
  return request({
    url: '/.well-known/openid-configuration',
    method: 'get'
  })
}
