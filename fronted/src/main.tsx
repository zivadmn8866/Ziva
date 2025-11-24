import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles.css"; // optional: create styles.css if needed

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
