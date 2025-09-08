import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useUserBudgetInfo } from "@/hooks/useUserBudgetInfo";
import { SubscriptionFormWrapper } from "./SubscriptionForm";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionStatusProps {
  onUpgrade: () => void;
}

export function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const { user } = useUser();
  const { userBudget } = useUserBudgetInfo();
  const { subscriptionStatus, isLoading } = useSubscription();

  // Check if user has an active subscription
  const isSubscribed = subscriptionStatus?.isSubscribed || false;
  const subscriptionTier = subscriptionStatus?.tier || "free";

  const usedCredits = userBudget?.usedCredits || 0;
  const totalCredits = userBudget?.totalCredits || 5; // Free tier gets 5 credits
  const remainingCredits = Math.max(0, totalCredits - usedCredits);

  // For free users, show credit usage
  if (subscriptionTier === "free") {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Free Plan</h3>
          <span className="text-sm text-gray-500">
            {remainingCredits} / {totalCredits} credits
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${Math.min(100, (usedCredits / totalCredits) * 100)}%`,
            }}
          ></div>
        </div>

        {remainingCredits <= 0 ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              You've used all your free credits. Upgrade to Pro for unlimited
              access.
            </p>
            <SubscriptionFormWrapper />
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              {remainingCredits} credits remaining. Upgrade to Pro for unlimited
              access.
            </p>
            <Button onClick={onUpgrade} className="w-full">
              Upgrade to Pro - $10/month
            </Button>
          </div>
        )}
      </div>
    );
  }

  // For subscribed users, show subscription details
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Pro Plan</h3>
        <span className="text-sm text-green-600">Active</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        You have unlimited access to all features.
      </p>

      <div className="text-xs text-gray-500">
        <p>Subscription renews monthly</p>
        {userBudget?.budgetResetDate && (
          <p>Next reset: {userBudget.budgetResetDate.toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
