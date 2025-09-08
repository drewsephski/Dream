import { ipcMain } from "electron";
import { stripe, createCustomer, createCheckoutSession } from "../lib/stripe";
import { readSettings } from "./settings";
import log from "electron-log";
import { db } from "../db";
import { apps } from "../db/schema";
import { eq } from "drizzle-orm";

const logger = log.scope("subscription_api");

interface CreateSubscriptionParams {
  userId: string;
  userEmail: string;
  userName?: string;
  priceId: string;
}

interface CreateSubscriptionResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

// Register IPC handlers for subscription management
export function registerSubscriptionHandlers() {
  // Create a new subscription for a user
  ipcMain.handle(
    "create-subscription",
    async (
      _event,
      { userId, userEmail, userName, priceId }: CreateSubscriptionParams,
    ): Promise<CreateSubscriptionResult> => {
      try {
        logger.info(`Creating subscription for user ${userId}`);

        // Create a Stripe customer
        const customer = await createCustomer(userEmail, userName);

        // Create a checkout session
        const session = await createCheckoutSession(
          customer.id,
          priceId,
          userId,
          "deepseekdrew://subscription-success",
          "deepseekdrew://subscription-cancelled",
        );

        // Update the app's subscription information in the database
        await db
          .update(apps)
          .set({
            subscriptionId: session.id,
            subscriptionStatus: "active",
            subscriptionTier: "pro",
          })
          .where(eq(apps.id, parseInt(userId)));

        logger.info(`Successfully created checkout session for user ${userId}`);

        return {
          success: true,
          sessionId: session.id,
        };
      } catch (error: any) {
        logger.error(
          `Error creating subscription for user ${userId}: ${error.message}`,
        );
        return {
          success: false,
          error: error.message,
        };
      }
    },
  );

  // Get subscription status for a user
  ipcMain.handle(
    "get-subscription-status",
    async (
      _event,
      userId: string,
    ): Promise<{ isSubscribed: boolean; tier?: string }> => {
      try {
        // Get the app's subscription status from the database
        const app = await db.query.apps.findFirst({
          where: eq(apps.id, parseInt(userId)),
        });

        if (!app) {
          return {
            isSubscribed: false,
          };
        }

        return {
          isSubscribed:
            app.subscriptionTier === "pro" &&
            app.subscriptionStatus === "active",
          tier: app.subscriptionTier || "free",
        };
      } catch (error: any) {
        logger.error(
          `Error getting subscription status for user ${userId}: ${error.message}`,
        );
        return {
          isSubscribed: false,
        };
      }
    },
  );
}
