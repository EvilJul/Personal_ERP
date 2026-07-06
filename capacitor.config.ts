import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.personal-erp.app',
  appName: 'Personal ERP',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // 使用本地服务器（standalone 模式）
    url: 'http://localhost:3000',
    cleartext: true,
  },
  plugins: {
    Filesystem: {
      iosScheme: 'capacitor',
    },
  },
};

export default config;
