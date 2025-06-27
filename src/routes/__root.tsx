import { createRootRoute, Outlet } from '@tanstack/react-router';

import RootComponentWrapper from '../components/RootComponentWrapper';

export const Route = createRootRoute({
  component: () => {
    return (
      <RootComponentWrapper>
        <Outlet />
      </RootComponentWrapper>
    );
  },
});
