import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/root";
import { homeRoute } from "./routes/home";
import { chatRoute } from "./routes/chat";
import { settingsRoute } from "./routes/settings";
import { providerSettingsRoute } from "./routes/settings/providers/$provider";
import { appDetailsRoute } from "./routes/app-details";
import { hubRoute } from "./routes/hub";
import { libraryRoute } from "./routes/library";
import { authRoute } from "./routes/auth";
import { NotFoundPage } from "./components/NotFoundPage";

const routeTree = rootRoute.addChildren([
  homeRoute,
  hubRoute,
  libraryRoute,
  chatRoute,
  appDetailsRoute,
  authRoute,
  settingsRoute.addChildren([providerSettingsRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: () => null, // Remove the error boundary for now
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}