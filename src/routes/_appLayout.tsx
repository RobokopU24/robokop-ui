import { createFileRoute, Outlet } from "@tanstack/react-router";
import RootComponentWrapper from "../components/RootComponentWrapper";
import AlertProvider from "../components/AlertProvider";
import useQueryBuilder from "../pages/queryBuilder/useQueryBuilder";
import QueryBuilderContext from "../context/queryBuilder";

export const Route = createFileRoute("/_appLayout")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return (
    <AlertProvider>
      <RootComponentWrapper>
        <AppContent />
      </RootComponentWrapper>
    </AlertProvider>
  );
}

function AppContent() {
  const queryBuilder = useQueryBuilder();

  return (
    <QueryBuilderContext.Provider value={queryBuilder}>
      <Outlet />
    </QueryBuilderContext.Provider>
  );
}
