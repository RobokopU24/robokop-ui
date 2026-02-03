import React from "react";
import { useFeatureAccess } from "./useFeatureAccess";

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
