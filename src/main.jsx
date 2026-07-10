import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";

import "./styles/global.css";
import App from "./App.jsx";

const lenis = new Lenis({
  duration: 1.5,
  lerp: 0.08,
  smoothWheel: true,
  syncTouch: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
