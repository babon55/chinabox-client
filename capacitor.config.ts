import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tm.chinaexpress.app',
  appName: 'ChinaExpress',
  webDir: '.output/public',
  server: {
    url: 'https://chinabox-client.vercel.app',
    cleartext: true,
    androidScheme: 'https',
  }
};

export default config;