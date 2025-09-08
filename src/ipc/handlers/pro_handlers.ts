import fetch from "node-fetch"; // Electron main process might need node-fetch
import log from "electron-log";
import { createLoggedHandler } from "./safe_handle";
import { readSettings } from "../../main/settings"; // Assuming settings are read this way
import { UserBudgetInfo, UserBudgetInfoSchema } from "../ipc_types";
import { IS_TEST_BUILD } from "../utils/test_utils";
import { IpcClient } from "../ipc_client";
import { db } from "../../db";
import { apps } from "../../db/schema";
import { eq } from "drizzle-orm";

const logger = log.scope("pro_handlers");
const handle = createLoggedHandler(logger);

const CONVERSION_RATIO = (10 * 3) / 2;

// Helper function to check if user has an active subscription
async function checkSubscriptionStatus(appId: number): Promise<boolean> {
  try {
    // Get app subscription status from database
    const app = await db.query.apps.findFirst({
      where: eq(apps.id, appId),
    });

    return (
      app?.subscriptionTier === "pro" && app?.subscriptionStatus === "active"
    );
  } catch (error) {
    logger.error("Error checking subscription status:", error);
    return false;
  }
}

export function registerProHandlers() {
  // This method should try to avoid throwing errors because this is auxiliary
  // information and isn't critical to using the app
  handle("get-user-budget", async (): Promise<UserBudgetInfo | null> => {
    if (IS_TEST_BUILD) {
      // Avoid spamming the API in E2E tests.
      return null;
    }
    logger.info("Attempting to fetch user budget information.");

    const settings = readSettings();

    const apiKey = settings.providerSettings?.auto?.apiKey?.value;

    // Check if user has an active subscription
    // We'll need to get the app ID from somewhere - for now we'll use a default
    const appId = 1; // This should be dynamically determined based on context

    // Check if user is subscribed
    const isSubscribed = await checkSubscriptionStatus(appId);

    if (!apiKey && !isSubscribed) {
      logger.info(
        "LLM Gateway API key (Dyad Pro) is not configured and user is not subscribed.",
      );
      // Return free tier limits
      return {
        usedCredits: 0,
        totalCredits: 5, // Free tier gets 5 credits
        budgetResetDate: new Date(
          new Date().setDate(new Date().getDate() + 30),
        ), // Reset in 30 days
      };
    }

    // If user is subscribed, they get unlimited credits
    if (isSubscribed) {
      return {
        usedCredits: 0,
        totalCredits: 999999, // Effectively unlimited
        budgetResetDate: new Date(
          new Date().setDate(new Date().getDate() + 30),
        ), // Reset in 30 days
      };
    }

    if (!apiKey) {
      logger.error("LLM Gateway API key (Dyad Pro) is not configured.");
      // Return free tier limits
      return {
        usedCredits: 0,
        totalCredits: 5, // Free tier gets 5 credits
        budgetResetDate: new Date(
          new Date().setDate(new Date().getDate() + 30),
        ), // Reset in 30 days
      };
    }

    const url = "https://llm-gateway.dyad.sh/user/info";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    try {
      // Use native fetch if available, otherwise node-fetch will be used via import
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          `Failed to fetch user budget. Status: ${response.status}. Body: ${errorBody}`,
        );
        return null;
      }

      const data = await response.json();
      const userInfoData = data["user_info"];
      logger.info("Successfully fetched user budget information.");
      return UserBudgetInfoSchema.parse({
        usedCredits: userInfoData["spend"] * CONVERSION_RATIO,
        totalCredits: userInfoData["max_budget"] * CONVERSION_RATIO,
        budgetResetDate: new Date(userInfoData["budget_reset_at"]),
      });
    } catch (error: any) {
      logger.error(`Error fetching user budget: ${error.message}`, error);
      return null;
    }
  });
}
