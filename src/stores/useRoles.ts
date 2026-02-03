import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import routes from "../API/routes";
import { RolesApiResponse, RoleWithFeatures, RoleFeature } from "../utils/roles";

const ROLES_QUERY_KEY = ["roles"] as const;

const fetchRoles = async (): Promise<RolesApiResponse> => {
  const response = await axios.get<RolesApiResponse>(routes.rolesRoutes.base);
  return response.data;
};

export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: fetchRoles,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const getRoleByName = (roles: RolesApiResponse | undefined, roleName: string): RoleWithFeatures | undefined => {
  return roles?.find((role) => role.roleName.toLowerCase() === roleName.toLowerCase());
};

export const hasFeatureInRole = (roles: RolesApiResponse | undefined, roleName: string, featureId: string): boolean => {
  const role = getRoleByName(roles, roleName);
  return role?.features.some((feature) => feature.featureId === featureId) ?? false;
};

export const getFeaturesForRole = (roles: RolesApiResponse | undefined, roleName: string): RoleFeature[] => {
  const role = getRoleByName(roles, roleName);
  return role?.features ?? [];
};

export const getAllFeatureIds = (roles: RolesApiResponse | undefined): string[] => {
  if (!roles) return [];
  const featureIds = new Set<string>();
  roles.forEach((role) => {
    role.features.forEach((feature) => {
      featureIds.add(feature.featureId);
    });
  });
  return Array.from(featureIds);
};
