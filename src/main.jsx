import { createRoot } from 'react-dom/client';
import './index.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import AlertProvider from './components/AlertProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

createRoot(document.getElementById('root')).render(
  <AlertProvider>
    <RouterProvider router={router} />
  </AlertProvider>
);
