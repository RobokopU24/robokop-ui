import API from "../API/routes";
import { authApi } from "../API/baseUrlProxy";
import { Role } from "../utils/roles";
import { DEFAULT_FEATURE_ROLES } from "../utils/features";

export interface FeatureAccessConfig {
  featureId: string;
  roles: Role[];
}

export const getFeatureAccess = async (): Promise<FeatureAccessConfig[]> => {
  try {
    const res = await authApi.get(`${API.adminRoutes.featureAccess}`);
    return res.data;
  } catch (error) {
    return Object.entries(DEFAULT_FEATURE_ROLES).map(([featureId, roles]) => ({
      featureId,
      roles,
    }));
  }
};

export const updateFeatureAccess = async (featureId: string, roles: Role[]): Promise<FeatureAccessConfig> => {
  const res = await authApi.put(`${API.adminRoutes.featureAccess}/${featureId}`, { roles });
  return res.data;
};
