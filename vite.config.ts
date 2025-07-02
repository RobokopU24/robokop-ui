// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';
// import { tanstackRouter } from '@tanstack/router-plugin/vite';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     tanstackRouter({
//       target: 'react',
//       autoCodeSplitting: true,
//     }),
//     visualizer({ filename: 'vite-report.html', open: false }),
//     react(),
//   ],
//   server: {
//     proxy: {
//       '/api': 'http://localhost:7080',
//     },
//   },
//   resolve: {
//     alias: {
//       '@': '/src',
//       '@components': '/src/components',
//       '@context': '/src/context',
//       '@pages': '/src/pages',
//       '@API': '/src/API',
//       '@hooks': '/src/hooks',
//       '@stores': '/src/stores',
//       '@utils': '/src/utils',
//     },
//   },
// });

// vite.config.ts
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      defaultRouteOptions: {
        ssr: false,
      },
    }),
  ],
});
