export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  PREMIUM: 'premium',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_OPTIONS = [ROLES.USER, ROLES.ADMIN, ROLES.PREMIUM] as const;

export const isPremiumOrAdmin = (role: Role): boolean => {
  return role === ROLES.ADMIN || role === ROLES.PREMIUM;
};

export const isAdmin = (role: Role): boolean => {
  return role === ROLES.ADMIN;
};
