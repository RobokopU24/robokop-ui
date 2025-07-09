import { createFileRoute, Outlet } from '@tanstack/react-router';
import RootComponentWrapper from '../components/RootComponentWrapper';
import AlertProvider from '../components/AlertProvider';
import { QueryBuilderProvider } from '../context/queryBuilder';

export const Route = createFileRoute('/_appLayout')({
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
  return (
    <QueryBuilderProvider>
      <Outlet />
    </QueryBuilderProvider>
  );
}
