import { Route } from "@tanstack/react-router";
import HubPage from "../pages/hub";
import { rootRoute } from "./root";

export const hubRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/hub",
  component: HubPage,
});
