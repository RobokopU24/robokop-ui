import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Role } from "../utils/roles";
import { hasFeatureAccess, DEFAULT_FEATURE_ROLES } from "../utils/features";
import { getFeatureAccess } from "../functions/featureFunctions";

export function useFeatureAccess() {
  const { user } = useAuth();

  const { data: featureAccessList, isLoading } = useQuery({
    queryKey: ["featureAccess"],
    queryFn: getFeatureAccess,
    staleTime: 5 * 60 * 1000,
  });

  const featureAccessMap = React.useMemo(() => {
    const map: Record<string, Role[]> = { ...DEFAULT_FEATURE_ROLES };
    if (featureAccessList) {
      featureAccessList.forEach((f) => {
        map[f.featureId] = f.roles;
      });
    }
    return map;
  }, [featureAccessList]);

  const canAccess = React.useCallback(
    (featureId: string): boolean => {
      if (!user?.role) return false;
      return hasFeatureAccess(featureId, user.role, featureAccessMap);
    },
    [user?.role, featureAccessMap],
  );

  return { canAccess, isLoading };
}

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { canAccess, isLoading } = useFeatureAccess();

  if (isLoading) return null;
  if (!canAccess(feature)) return <>{fallback}</>;
  return <>{children}</>;
}

export default useFeatureAccess;
