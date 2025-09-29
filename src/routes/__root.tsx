import type { ReactNode } from 'react';
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';

import '../index.css';

import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import RootComponentWrapper from '../components/RootComponentWrapper';
import AlertProvider from '../components/AlertProvider';

const RootLayout = () => {
  return (
    <AlertProvider>
      <RootComponentWrapper>
        <Outlet />
      </RootComponentWrapper>
    </AlertProvider>
  )
}

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
      {
        name: 'description',
        content:
          'ROBOKOP is an open-source biomedical knowledge graph that integrates and semantically harmonizes important knowledge sources.',
      },
      {
        property: 'og:image',
        content: 'https://robokop.renci.org/opengraph-image.png',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'ROBOKOP' },
      {
        property: 'og:description',
        content:
          'ROBOKOP is an open-source biomedical knowledge graph that integrates and semantically harmonizes important knowledge sources.',
      },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: 'https://robokop.renci.org/opengraph-image.png' },
    ],
  }),
  component: RootLayout,
});

