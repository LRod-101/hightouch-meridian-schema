import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { JourneyApp } from "./JourneyApp.jsx";
import { presentationBodyClass, presentationTitle, resolvePresentationRoute } from "./presentationRoute.js";
import "./styles.css";
import "./journey.css";

const route = resolvePresentationRoute(window.location.pathname);
const Presentation = route === "journey"
  ? JourneyApp
  : App;

document.title = presentationTitle(route);
document.body.className = presentationBodyClass(route);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Presentation />
  </React.StrictMode>,
);
