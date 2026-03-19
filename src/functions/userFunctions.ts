import API from '../API/routes'
import { authApi } from '../API/baseUrlProxy'

export interface Features {
  id: number
  featureId: string
  featureName: string
  description: string
}
export interface User {
  id: string
  email: string
  createdAt: string
  name?: string
  profilePicture?: string
  role: {
    description: string
    features: Features[]
    id: number
    roleName: string
  }
  _count?: {
    WebAuthnCredential: number
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedUsers {
  users: User[]
  pagination: PaginationMeta
}

export interface GetUsersParams {
  search?: string
  roleId?: number
  page?: number
  limit?: number
}

export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedUsers> => {
  const queryParams = new URLSearchParams()

  if (params.search) queryParams.append('search', params.search)
  if (params.roleId) queryParams.append('roleId', params.roleId.toString())
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())

  const queryString = queryParams.toString()
  const url = queryString ? `${API.adminRoutes.users}?${queryString}` : API.adminRoutes.users

  const res = await authApi.get(url)
  return res.data
}

export const updateUsersRole = async (
  userIds: string[],
  newRoleId: number,
): Promise<{ count: number }> => {
  const res = await authApi.put(`${API.adminRoutes.userRole}`, { userIds, newRoleId })
  return res.data
}

export const deleteUsers = async (userIds: string[]): Promise<{ count: number }> => {
  const res = await authApi.delete(`${API.adminRoutes.users}`, { data: { userIds } })
  return res.data
}
