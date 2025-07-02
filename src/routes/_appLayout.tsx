import { createFileRoute, Outlet } from '@tanstack/react-router';
import RootComponentWrapper from '../components/RootComponentWrapper';
import AlertProvider from '../components/AlertProvider';

export const Route = createFileRoute('/_appLayout')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return (
    <AlertProvider>
      <RootComponentWrapper>
        <Outlet />
      </RootComponentWrapper>
    </AlertProvider>
  );
}
