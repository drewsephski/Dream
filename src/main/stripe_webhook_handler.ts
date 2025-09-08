import { Request, Response } from "express";
import { stripe } from "../lib/stripe";
import log from "electron-log";
import { db } from "../db";
import { apps } from "../db/schema";
import { eq } from "drizzle-orm";

const logger = log.scope("stripe_webhook_handler");

// Handle Stripe webhook events
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    logger.error("Missing Stripe signature or webhook secret");
    return res.status(400).send("Missing signature or webhook secret");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;

      if (userId) {
        try {
          // Update the app's subscription information in the database
          await db
            .update(apps)
            .set({
              subscriptionId: session.subscription as string,
              subscriptionStatus: "active",
              subscriptionTier: "pro",
            })
            .where(eq(apps.id, parseInt(userId)));

          logger.info(
            `Successfully updated subscription status for app ${userId}`,
          );
        } catch (error) {
          logger.error(`Error updating app subscription status: ${error}`);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId =
        subscription.metadata?.userId ||
        (subscription as any).client_reference_id;

      if (userId) {
        try {
          // Update the app's subscription information in the database
          await db
            .update(apps)
            .set({
              subscriptionStatus: "cancelled",
              subscriptionTier: "free",
            })
            .where(eq(apps.id, parseInt(userId)));

          logger.info(
            `Successfully updated subscription status for app ${userId}`,
          );
        } catch (error) {
          logger.error(`Error updating app subscription status: ${error}`);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const userId =
        invoice.metadata?.userId || (invoice as any).client_reference_id;

      if (userId) {
        try {
          // Update the app's subscription information in the database
          await db
            .update(apps)
            .set({
              subscriptionStatus: "past_due",
            })
            .where(eq(apps.id, parseInt(userId)));

          logger.info(
            `Successfully updated subscription status for app ${userId} to past_due`,
          );
        } catch (error) {
          logger.error(`Error updating app subscription status: ${error}`);
        }
      }
      break;
    }

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
