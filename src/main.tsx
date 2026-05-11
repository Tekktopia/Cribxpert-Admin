// =====================================================
// File: src/main.tsx
// =====================================================
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const root = createRoot(document.getElementById("root")!);

// Option A: Disable StrictMode in dev (stops double-invocation noise) 
if (import.meta.env.DEV) {
  root.render(<App />);
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}