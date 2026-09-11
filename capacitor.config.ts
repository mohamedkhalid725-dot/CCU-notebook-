import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ccunotebook.app',
  appName: 'CardioVault',
  webDir: 'dist',

  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
      skipNativeAuth: false,
    },
  },
};

export default config;
