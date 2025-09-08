import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IpcClient } from "@/ipc/ipc_client";
import { useUser } from "@clerk/clerk-react";

export function useSubscription() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ["subscriptionStatus", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return IpcClient.getInstance().getSubscriptionStatus(user.id);
    },
    enabled: !!user?.id,
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (priceId: string) => {
      if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
        throw new Error("User not authenticated");
      }

      return IpcClient.getInstance().createSubscription(
        user.id,
        user.primaryEmailAddress.emailAddress,
        user.fullName || undefined,
        priceId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
    },
  });

  return {
    subscriptionStatus,
    isLoading,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
  };
}
