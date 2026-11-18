import { createRoot } from "react-dom/client";

import PricePanel from "../component/PricePanel.tsx";
import styles from "./styles.css?inline";

// Extract Steam App ID from the current URL.
function getSteamAppId(): string | null {
  const match = window.location.pathname.match(
    /^\/app\/(\d+)/
  );

  return match?.[1] ?? null;
}

function injectPanel() {
  const appId = getSteamAppId();

  if (!appId || document.getElementById("steamprice-host")) {
    return;
  }

  const host = document.createElement("div");
  host.id = "steamprice-host";

  document.body.appendChild(host);

  // Isolate our UI from Steam's existing CSS.
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;

  const mountPoint = document.createElement("div");

  shadow.append(style, mountPoint);

  createRoot(mountPoint).render(
    <PricePanel appId={appId} />
  );
}

injectPanel();
