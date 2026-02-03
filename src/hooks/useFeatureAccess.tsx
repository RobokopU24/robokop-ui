import React from "react";
import { useAuth } from "../context/AuthContext";

export function useFeatureAccess() {
  const { user, loading } = useAuth();

  const canAccess = React.useCallback(
    (featureId: string): boolean => {
      if (!user?.role?.features) return false;
      return user.role.features.some((feature) => feature.featureId === featureId);
    },
    [user?.role?.features],
  );

  const hasRole = React.useCallback(
    (roleName: string): boolean => {
      if (!user?.role) return false;
      return user.role.roleName.toLowerCase() === roleName.toLowerCase();
    },
    [user?.role],
  );

  return { canAccess, hasRole, isLoading: loading };
}
