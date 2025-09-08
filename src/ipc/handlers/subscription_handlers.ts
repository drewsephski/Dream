import { createLoggedHandler } from "./safe_handle";
import log from "electron-log";
import { registerSubscriptionHandlers as registerMainSubscriptionHandlers } from "../../main/subscription_api";

const logger = log.scope("subscription_handlers");
const handle = createLoggedHandler(logger);

export function registerSubscriptionHandlers() {
  // This will register the subscription handlers from the main/subscription_api.ts file
  // We're just re-exporting them here to maintain consistency with the IPC handler pattern
  registerMainSubscriptionHandlers();
}
