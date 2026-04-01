import request from '@/utils/request'

// Get operation logs list
export function getOperationLogs(params?: any) {
  return request({
    url: '/logs/operation',
    method: 'get',
    params
  })
}

// Get login logs list
export function getLoginLogs(params?: any) {
  return request({
    url: '/logs/login',
    method: 'get',
    params
  })
}

// Record operation log
export function recordOperationLog(data: any) {
  return request({
    url: '/logs/operation',
    method: 'post',
    data
  })
}

// Record login log
export function recordLoginLog(data: any) {
  return request({
    url: '/logs/login',
    method: 'post',
    data
  })
}
