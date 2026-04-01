export interface UserInfo {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  createdAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
  message?: string
}

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
}
