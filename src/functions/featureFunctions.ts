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

export interface CreateFeaturePayload {
  featureId: string;
  featureName: string;
  description: string;
  roleIds: number[];
}

export const createFeature = async (payload: CreateFeaturePayload): Promise<Feature> => {
  const res = await authApi.post(API.featuresRoutes.base, payload);
  return res.data;
};

export const deleteFeatures = async (featureIds: number[]): Promise<void> => {
  await authApi.delete(API.featuresRoutes.base, { data: { featureIds } });
};
