import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk/vite'

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
  const vendorUrl =
    env.VITE_MERCUR_VENDOR_URL || env.MERCUR_VENDOR_URL
  const appBase = env.VITE_APP_BASE || '/'

  return {
    base: appBase,
    define: {
      __BASE__: JSON.stringify(appBase),
    },
    server: {
      allowedHosts: ['.trycloudflare.com', '.nexorasmartech.store'],
    },
    plugins: [
      react(),
      mercurDashboardPlugin({
        medusaConfigPath: '../api/medusa-config.ts',
        ...(backendUrl ? { backendUrl } : {}),
        ...(vendorUrl ? { vendorUrl } : {}),
      }),
      // The Mercur plugin derives a base from Medusa after the user config is
      // loaded. Reapply the explicit deployment base last so React Router's
      // __BASE__ and Vite's asset base always stay aligned.
      appBasePlugin(appBase),
    ],
  }
})
