import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import AppDetailsPage from "@/pages/app-details";
import { z } from "zod";

export const appDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/$appId",
  component: AppDetailsPage,
  validateSearch: z.object({
    tab: z.enum(["code", "preview", "db"]).optional(),
  }),
});
