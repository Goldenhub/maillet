import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { inject } from "@vercel/analytics";

const root = document.getElementById("root");
if (root) {
  inject();
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
