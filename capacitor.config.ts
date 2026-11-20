import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'passiflora',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#221C38',
    },
    SystemBars: {
      // Reservar las barras fuera del WebView, incluso en Android edge-to-edge.
      insetsHandling: 'native',
      initialViewportFitValueHint: 'contain',
      style: 'DARK',
    },
  }
};

export default config;
