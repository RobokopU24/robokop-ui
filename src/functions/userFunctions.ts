import API from '../API/routes';
import { authApi } from '../API/baseUrlProxy';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  name?: string;
  profilePicture?: string;
  role: 'user' | 'admin' | 'premium';
  _count?: {
    WebAuthnCredential: number;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  users: User[];
  pagination: PaginationMeta;
}

export interface GetUsersParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedUsers> => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `${API.adminRoutes.users}?${queryString}` : API.adminRoutes.users;

  const res = await authApi.get(url);
  return res.data;
};

export const updateUsersRole = async (userIds: string[], newRole: User['role']): Promise<{ count: number }> => {
  const res = await authApi.put(`${API.adminRoutes.userRole}`, { userIds, newRole });
  return res.data;
};

export const deleteUsers = async (userIds: string[]): Promise<{ count: number }> => {
  const res = await authApi.delete(`${API.adminRoutes.users}`, { data: { userIds } });
  return res.data;
};
