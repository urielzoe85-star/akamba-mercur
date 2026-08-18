import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const appBasePlugin = (appBase: string): Plugin => ({
  name: 'akamba-app-base',
  enforce: 'post',
  config: () => ({
    base: appBase,
    define: {
      __BASE__: JSON.stringify(appBase),
    },
  }),
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl =
    env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL
  const appBase = env.VITE_APP_BASE || '/'

  return {
    base: appBase,
    define: {
      __BASE__: JSON.stringify(appBase),
    },
    server: {
      allowedHosts: ['.trycloudflare.com', '.nexorasmartech.store'],
    },
    resolve: {
      alias: {
        // `@mercurjs/vendor/extension-targets` is a build-time marker module the
        // dashboard-sdk emits (imported by `_navigation.ts` and every widget).
        // Vite's dev resolution of that `exports` subpath on the linked workspace
        // package is racy — it intermittently throws "Failed to resolve import ...
        // Does the file exist?" and blanks the app. Pin the exact specifier to the
        // same file the exports map points to so resolution is deterministic.
        '@mercurjs/vendor/extension-targets': path.join(
          rootDir,
          'node_modules/@mercurjs/vendor/dist/extension-targets.js',
        ),
      },
    },
    plugins: [
      react(),
      mercurDashboardPlugin({
        medusaConfigPath: '../api/medusa-config.ts',
        ...(backendUrl ? { backendUrl } : {}),
      }),
      // The Mercur plugin derives a base from Medusa after the user config is
      // loaded. Reapply the explicit deployment base last so React Router's
      // __BASE__ and Vite's asset base always stay aligned.
      appBasePlugin(appBase),
    ],
  }
})
