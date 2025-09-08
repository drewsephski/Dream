import express from "express";
import bodyParser from "body-parser";
import { handleStripeWebhook } from "./stripe_webhook_handler";
import log from "electron-log";

const logger = log.scope("webhook_server");

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.raw({ type: "application/json" }));

// Stripe webhook endpoint
app.post("/webhook/stripe", handleStripeWebhook);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

let server: any = null;

export function startWebhookServer(port: number = 3001) {
  server = app.listen(port, () => {
    logger.info(`Webhook server listening on port ${port}`);
  });
}

export function stopWebhookServer() {
  if (server) {
    server.close(() => {
      logger.info("Webhook server closed");
    });
  }
}
