import API from "../API/routes";
import { authApi } from "../API/baseUrlProxy";

export interface RoleAllowed {
  id: number;
  roleName: string;
  description: string;
}

export interface Feature {
  id: number;
  featureId: string;
  featureName: string;
  description: string;
  rolesAllowed: RoleAllowed[];
}

export type FeaturesApiResponse = Feature[];

export const getFeatures = async (): Promise<FeaturesApiResponse> => {
  const res = await authApi.get(API.featuresRoutes.base);
  return res.data;
};

export const updateFeatureRoles = async (featureId: number, roleIds: number[]): Promise<Feature> => {
  const res = await authApi.put(`${API.featuresRoutes.base}/${featureId}`, { roleIds });
  return res.data;
};
