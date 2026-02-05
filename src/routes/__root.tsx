import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router';

import '../index.css';

import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import RootComponentWrapper from '../components/RootComponentWrapper';
import AlertProvider from '../components/AlertProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../utils/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <AlertProvider>
        <RootComponentWrapper>
          <Outlet />
        </RootComponentWrapper>
      </AlertProvider>
      {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

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
