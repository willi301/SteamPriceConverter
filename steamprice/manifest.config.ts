
import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,

  name: "SteamPrice",
  description: "Compare actual Steam game prices across regions.",
  version: "0.1.0",

  permissions: ["storage"],

  host_permissions: [
    "https://store.steampowered.com/*",
    "https://api.frankfurter.dev/*"
  ],

  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module"
  },

  content_scripts: [
    {
      matches: ["https://store.steampowered.com/app/*"],
      js: ["src/content/content.tsx"],
      run_at: "document_idle"
    }
  ]
});
