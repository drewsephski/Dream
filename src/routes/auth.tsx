import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import AuthPage from "../pages/auth";

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});
