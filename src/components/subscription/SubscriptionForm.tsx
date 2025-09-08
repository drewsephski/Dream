import { useState, useMemo } from "react";
import { useUser, useSignUp } from "@clerk/clerk-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { IpcClient } from "@/ipc/ipc_client";

// Make sure to add your Stripe publishable key to your environment variables
const STRIPE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || "pk_test_placeholder";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Replace with your actual Stripe price ID for the $10/month plan
const PRICE_ID = "price_pro_monthly";

interface SubscriptionFormData {
  email: string;
  tier: "pro"; // For now, we only have one tier
}

interface VerificationData {
  code: string;
}

export function SubscriptionForm() {
  const { isSignedIn, user } = useUser();
  const { signUp, setActive } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    email: "",
    tier: "pro",
  });
  const [verificationData, setVerificationData] = useState<VerificationData>({
    code: "",
  });
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  
  // Generate unique IDs for form elements to prevent conflicts when multiple instances are rendered
  const formIds = useMemo(() => {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    return {
      email: `email-${uniqueId}`,
      code: `code-${uniqueId}`,
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn && !formData.email) {
      toast("Email required", {
        description: "Please enter your email to continue",
      });
      return;
    }

    if (!stripe || !elements) {
      toast("Payment system not loaded", {
        description: "Please wait for the payment system to load",
      });
      return;
    }

    try {
      // If user is not signed in, start the sign-up process
      if (!isSignedIn) {
        // Check if signUp is available
        if (!signUp) {
          toast("Sign-up unavailable", {
            description: "Sign-up service is not available. Please try again.",
          });
          return;
        }

        // Create a sign-up attempt with unsafe metadata
        await signUp.create({
          emailAddress: formData.email,
          unsafeMetadata: {
            selectedTier: formData.tier,
          },
        });

        // Send the verification email
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        setVerifying(true);
      } else {
        // If user is already signed in, proceed directly to subscription
        await createSubscription();
      }
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      toast("Sign-up error", {
        description: "Failed to start sign-up process. Please try again.",
      });
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUp) return;

    try {
      // Attempt to complete the sign-up process
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationData.code,
      });

      if (completeSignUp.status === "complete") {
        // Set the session to active
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Now create the subscription
        await createSubscription();
      } else {
        toast("Verification incomplete", {
          description: "Please check your code and try again",
        });
      }
    } catch (error: any) {
      console.error("Error during verification:", error);
      toast("Verification error", {
        description: "Failed to verify your email. Please try again.",
      });
    }
  };

  const createSubscription = async () => {
    if (!stripe || !elements) {
      toast("Payment system not loaded", {
        description: "Please wait for the payment system to load",
      });
      return;
    }

    try {
      // Get the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        toast("Payment information missing", {
          description: "Please enter your payment information",
        });
        return;
      }

      // Create a payment method
      const { error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast("Payment error", {
          description: error.message || "Failed to process payment information",
        });
        return;
      }

      // Create the subscription through our backend
      const userId = user?.id || signUp?.createdUserId;
      const userEmail = user?.primaryEmailAddress?.emailAddress || formData.email;
      const userName = user?.fullName || undefined;

      if (!userId || !userEmail) {
        toast("User information missing", {
          description: "Unable to create subscription. Please try again.",
        });
        return;
      }

      const result = await IpcClient.getInstance().createSubscription(
        userId,
        userEmail,
        userName,
        PRICE_ID
      );

      if (result.success && result.sessionId) {
        // Redirect to checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: result.sessionId,
        });

        if (error) {
          toast("Checkout error", {
            description: error.message || "Failed to redirect to checkout",
          });
        }
      } else {
        toast("Subscription error", {
          description: result.error || "Failed to create subscription",
        });
      }
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast("Subscription error", {
        description: "Failed to create subscription. Please try again.",
      });
    }
  };

  if (verifying) {
    return (
      <div className="max-w-md mx-auto p-6 bg-background rounded-lg shadow-md border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Verify your email</h2>
        <p className="mb-4 text-muted-foreground">
          We've sent a verification code to your email. Please enter it below.
        </p>
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <Label htmlFor={formIds.code} className="text-foreground">Verification Code</Label>
            <Input
              id={formIds.code}
              type="text"
              value={verificationData.code}
              onChange={(e) =>
                setVerificationData({
                  ...verificationData,
                  code: e.target.value,
                })
              }
              placeholder="Enter your code"
              required
              className="bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" className="w-full">
            Verify & Subscribe
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-lg shadow-md border border-border">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Subscribe to Pro Plan</h2>
      <p className="mb-4 text-muted-foreground">
        Get unlimited access to all features for $10/month.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSignedIn && (
          <div>
            <Label htmlFor={formIds.email} className="text-foreground">Email</Label>
            <Input
              id={formIds.email}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
              required
              className="bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
        )}

        <div>
          <Label className="text-foreground">Payment Details</Label>
          <div className="border rounded-md p-3 mt-1 border-input bg-muted/50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#000000",
                    "::placeholder": {
                      color: "#999999",
                    },
                  },
                  invalid: {
                    color: "var(--destructive)",
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium text-foreground">Pro Plan - $10/month</h3>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
            <li>Unlimited chats</li>
            <li>Access to all AI models</li>
            <li>Priority support</li>
            <li>Early access to new features</li>
          </ul>
        </div>

        <Button type="submit" className="w-full">
          {isSignedIn ? "Subscribe Now" : "Sign Up & Subscribe"}
        </Button>
      </form>
    </div>
  );
}

export function SubscriptionFormWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm />
    </Elements>
  );
}