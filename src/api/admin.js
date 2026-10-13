import request from './request'

// 用户管理
export function getUserPage(params) {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: '/api/admin/users',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/api/admin/users',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'delete'
  })
}

export function resetUserPassword(id, newPassword) {
  return request({
    url: `/api/admin/users/${id}/reset-password`,
    method: 'post',
    data: { newPassword }
  })
}

export function updateUserStatus(id, status) {
  return request({
    url: `/api/admin/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 公司管理
export function getCompanyPage(params) {
  return request({
    url: '/api/admin/companies',
    method: 'get',
    params
  })
}

export function getAllCompanies() {
  return request({
    url: '/api/admin/companies/all',
    method: 'get'
  })
}

export function createCompany(data) {
  return request({
    url: '/api/admin/companies',
    method: 'post',
    data
  })
}

export function updateCompany(data) {
  return request({
    url: '/api/admin/companies',
    method: 'put',
    data
  })
}

export function deleteCompany(id) {
  return request({
    url: `/api/admin/companies/${id}`,
    method: 'delete'
  })
}

// 部门管理
export function getDeptTree(companyId) {
  return request({
    url: '/api/admin/departments/tree',
    method: 'get',
    params: { companyId }
  })
}

export function getDeptFlatList() {
  return request({
    url: '/api/admin/departments/list',
    method: 'get'
  })
}

export function createDept(data) {
  return request({
    url: '/api/admin/departments',
    method: 'post',
    data
  })
}

export function updateDept(data) {
  return request({
    url: '/api/admin/departments',
    method: 'put',
    data
  })
}

export function deleteDept(id) {
  return request({
    url: `/api/admin/departments/${id}`,
    method: 'delete'
  })
}

// 应用管理 (OIDC Client App)
export function getAppPage(params) {
  return request({
    url: '/api/admin/apps',
    method: 'get',
    params
  })
}

export function createApp(data) {
  return request({
    url: '/api/admin/apps',
    method: 'post',
    data
  })
}

export function updateApp(data) {
  return request({
    url: '/api/admin/apps',
    method: 'put',
    data
  })
}

export function deleteApp(id) {
  return request({
    url: `/api/admin/apps/${id}`,
    method: 'delete'
  })
}

export function resetAppSecret(id) {
  return request({
    url: `/api/admin/apps/${id}/reset-secret`,
    method: 'post'
  })
}

// 登录日志与大盘看板
export function getLogPage(params) {
  return request({
    url: '/api/admin/logs',
    method: 'get',
    params
  })
}

export function getOverviewStats() {
  return request({
    url: '/api/admin/stats',
    method: 'get'
  })
}

// 账户风控与流式架构
export function getRiskEngineStatus() {
  return request({
    url: '/api/admin/risk/status',
    method: 'get'
  })
}

export function simulateRisk(data) {
  return request({
    url: '/api/admin/risk/simulate',
    method: 'post',
    data
  })
}
