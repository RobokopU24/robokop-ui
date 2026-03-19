import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import routes from '../API/routes'
import { RolesApiResponse, RoleWithFeatures, RoleFeature } from '../utils/roles'
import { authApi } from '../API/baseUrlProxy'

const ROLES_QUERY_KEY = ['roles'] as const

const fetchRoles = async (): Promise<RolesApiResponse> => {
  const response = await axios.get<RolesApiResponse>(routes.rolesRoutes.base)
  return response.data
}

export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: fetchRoles,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export const getRoleByName = (
  roles: RolesApiResponse | undefined,
  roleName: string,
): RoleWithFeatures | undefined => {
  return roles?.find((role) => role.roleName.toLowerCase() === roleName.toLowerCase())
}

export const hasFeatureInRole = (
  roles: RolesApiResponse | undefined,
  roleName: string,
  featureId: string,
): boolean => {
  const role = getRoleByName(roles, roleName)
  return role?.features.some((feature) => feature.featureId === featureId) ?? false
}

export const getFeaturesForRole = (
  roles: RolesApiResponse | undefined,
  roleName: string,
): RoleFeature[] => {
  const role = getRoleByName(roles, roleName)
  return role?.features ?? []
}

export const getAllFeatureIds = (roles: RolesApiResponse | undefined): string[] => {
  if (!roles) return []
  const featureIds = new Set<string>()
  roles.forEach((role) => {
    role.features.forEach((feature) => {
      featureIds.add(feature.featureId)
    })
  })
  return Array.from(featureIds)
}

export const deleteRoles = async (roleIds: number[]): Promise<void> => {
  await authApi.delete(routes.rolesRoutes.base, { data: { roleIds } })
}

export interface CreateRolePayload {
  roleName: string
  description: string
  featureIds: number[]
}

export const createRole = async (payload: CreateRolePayload): Promise<RoleWithFeatures> => {
  const res = await authApi.post(routes.rolesRoutes.base, payload)
  return res.data
}

export interface UpdateRolePayload {
  roleName: string
  description: string
  featureIds: number[]
}

export const updateRole = async (
  roleId: number,
  payload: UpdateRolePayload,
): Promise<RoleWithFeatures> => {
  const res = await authApi.put(`${routes.rolesRoutes.base}/${roleId}`, payload)
  return res.data
}
