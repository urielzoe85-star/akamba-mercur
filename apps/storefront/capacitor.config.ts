import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: process.env.NEXT_PUBLIC_MOBILE_APP_ID || 'cm.akamba.app',
  appName: process.env.NEXT_PUBLIC_SITE_NAME || 'AKAMBA',
  webDir: 'capacitor-shell',
  backgroundColor: '#f5f0e6',
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
        allowNavigation: [new URL(serverUrl).hostname],
        androidScheme: 'https',
        iosScheme: 'https'
      }
    : {
        androidScheme: 'https',
        iosScheme: 'https'
      },
  android: {
    allowMixedContent: false,
    backgroundColor: '#f5f0e6'
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f5f0e6'
  }
};

export default config;
