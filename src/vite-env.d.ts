/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEPLOYMENT: string;
  readonly VITE_BACKEND_API_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_BUILD_DATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
