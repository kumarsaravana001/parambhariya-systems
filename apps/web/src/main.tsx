import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { applyTenantTheme } from "@parambhariya/ui";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

applyTenantTheme("mushroomai");

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// In production on GitHub Pages the app is served from a repo subpath; Vite's
// BASE_URL carries it. Strip the trailing slash for the router basepath.
const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const router = createRouter({ routeTree, defaultPreload: "intent", basepath });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
