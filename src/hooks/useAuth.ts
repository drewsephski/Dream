import { useAuth as useClerkAuth } from "@clerk/clerk-react";

export const useAuth = () => {
  const { isSignedIn, isLoaded, userId } = useClerkAuth();

  return {
    isSignedIn,
    isLoaded,
    userId,
    isLoading: !isLoaded,
  };
};