# Stripe Subscription Integration

This document explains how the Stripe subscription system is implemented in the Deepseekdrew application.

## Overview

The Deepseekdrew application implements a simple one-tier subscription model:

- **Pro Plan**: $10/month for unlimited access
- **Free Plan**: 5 credits (chats) before requiring subscription

The implementation follows the hybrid sign-up and subscribe flow approach recommended by Clerk.

## Architecture

The subscription system consists of several components:

1. **Frontend Components**:

   - `SubscriptionForm`: Handles the subscription signup flow
   - `SubscriptionStatus`: Displays current subscription status and credits

2. **Backend Services**:

   - `subscription_api.ts`: IPC handlers for subscription management
   - `stripe_webhook_handler.ts`: Handles Stripe webhook events
   - `stripe.ts`: Stripe SDK wrapper

3. **Database**:

   - Added subscription fields to the `apps` table:
     - `subscription_id`: Stripe subscription ID
     - `subscription_status`: Current status (active, cancelled, past_due, unpaid)
     - `subscription_tier`: Plan tier (free, pro)

4. **Hooks**:
   - `useSubscription`: React hook for managing subscription state
   - `useUserBudgetInfo`: Hook for managing user credits

## Implementation Details

### Subscription Flow

1. **User Interaction**:

   - User clicks "Upgrade to Pro" button
   - `SubscriptionForm` component is displayed
   - User enters payment information via Stripe Elements

2. **Subscription Creation**:

   - Frontend calls `createSubscription` IPC method
   - Backend creates Stripe customer and checkout session
   - User is redirected to Stripe checkout

3. **Webhook Handling**:
   - Stripe sends webhook events to `/webhook/stripe`
   - Backend updates database with subscription status
   - Supported events:
     - `checkout.session.completed`: Subscription activated
     - `customer.subscription.deleted`: Subscription cancelled
     - `invoice.payment_failed`: Payment failure

### Credit System

The application implements a credit-based system:

- Free users get 5 credits per month
- Pro users get unlimited credits
- Credits are tracked via the `get-user-budget` IPC method
- When credits are exhausted, users are prompted to subscribe

### Environment Variables

The following environment variables are required:

- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (frontend)

## Testing

The subscription system includes integration tests in `subscription.integration.test.tsx`.

## Error Handling

The system handles various error scenarios:

- Network failures during subscription creation
- Stripe webhook signature verification failures
- Database update errors
- User authentication issues

## Security Considerations

- Webhook endpoints are protected with signature verification
- Sensitive data is not exposed to the frontend
- All Stripe API calls use the latest API version