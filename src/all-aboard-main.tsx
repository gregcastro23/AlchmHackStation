import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AllAboardKiosk } from "./components/all-aboard/AllAboardKiosk";
import "./index.css";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <AllAboardKiosk />
    </StrictMode>
  );
}
