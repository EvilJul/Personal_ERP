import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.personal-erp.app',
  appName: 'Personal ERP',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Filesystem: {
      iosScheme: 'capacitor',
    },
  },
};

export default config;
