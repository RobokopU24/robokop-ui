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

export const getUsers = async (): Promise<User[]> => {
  const res = await authApi.get(API.adminRoutes.users);
  return res.data;
};

export const updateUserRole = async (userId: string, newRole: User['role']): Promise<void> => {
  await authApi.put(`${API.adminRoutes.userRole}`, { userId, newRole });
};
