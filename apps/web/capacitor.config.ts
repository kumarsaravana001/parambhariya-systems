import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.parambhariya.app",
  appName: "Parambhariya",
  webDir: "dist",
  bundledWebRuntime: false,
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
