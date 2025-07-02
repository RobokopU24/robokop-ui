// import { createRootRoute, Outlet } from '@tanstack/react-router';

// import RootComponentWrapper from '../components/RootComponentWrapper';

// export const Route = createRootRoute({
//   component: () => {
//     return (
//       <RootComponentWrapper>
//         <Outlet />
//       </RootComponentWrapper>
//     );
//   },
// });

// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import RootComponentWrapper from '../components/RootComponentWrapper';
import AlertProvider from '../components/AlertProvider';

import '../index.css';

import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ROBOKOP',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
