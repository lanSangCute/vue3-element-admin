import type { User, LoginRequest, LoginResponse } from '@/types/user'
import request from '@/utils/request'

export const userApi = {
  login: (data: LoginRequest) =>
    request.post<LoginResponse>('/auth/login', data),

  register: (data: Partial<User>) =>
    request.post('/auth/register', data),

  getUsers: () =>
    request.get<{ users: User[] }>('/users'),

  getUser: (id: number) =>
    request.get<{ user: User }>(`/users/${id}`),

  createUser: (data: Partial<User>) =>
    request.post('/users', data),

  updateUser: (id: number, data: Partial<User>) =>
    request.put(`/users/${id}`, data),

  deleteUser: (id: number) =>
    request.delete(`/users/${id}`),

  getProfile: () =>
    request.get<{ user: User }>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    request.put('/users/profile', data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    request.post('/users/change-password', data),
}

export default userApi
