import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { applyTenantTheme } from "@parambhariya/ui";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

applyTenantTheme("mushroomai");

// In production on GitHub Pages the app is served from a repo subpath; Vite's
// BASE_URL carries it (e.g. "/parambhariya-systems/"). Strip the trailing slash
// for the router basepath; locally BASE_URL is "/" → no basepath.
const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const router = createRouter({ routeTree, defaultPreload: "intent", basepath });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
