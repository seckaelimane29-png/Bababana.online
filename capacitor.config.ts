import type { CapacitorConfig } from "@capacitor/cli";

// The app is a server-rendered TanStack Start app (Supabase auth, Stripe billing,
// admin panel, webhooks) — it can't run as a bundled static SPA inside the WebView.
// Capacitor's "remote URL" mode is used instead: the native shell loads the live
// deployed site directly. Swap CAPACITOR_SERVER_URL to the production domain
// (https://yesalsakhel.com) once it's hosted independently of Lovable.
const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://yesal-sa-khel-wisdom.lovable.app";

const config: CapacitorConfig = {
  appId: "com.yesalsakhel.app",
  appName: "Yesal Sa Khel",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: false,
  },
  backgroundColor: "#060b07",
  ios: {
    contentInset: "always",
    backgroundColor: "#060b07",
    allowsLinkPreview: false,
  },
};

export default config;
