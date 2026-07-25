import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { lenis } from "./utils/lenis.js";
import "./styles/global.css";
import App from "./App.jsx";


import { Provider } from "react-redux";
import store from "./store/index.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
