import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import CartPage from "./CartPage";
import "./cart.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <CartPage />
  </StrictMode>
);