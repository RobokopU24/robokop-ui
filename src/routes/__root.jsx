import { createRootRoute, Outlet } from '@tanstack/react-router';

import RootComponentWrapper from '../components/RootComponentWrapper.jsx';

export const Route = createRootRoute({
  component: () => {
    return (
      <RootComponentWrapper>
        <Outlet />
      </RootComponentWrapper>
    );
  },
});
