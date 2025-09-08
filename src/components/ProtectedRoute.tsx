import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "@tanstack/react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Show nothing while loading
  if (!isLoaded) {
    return null;
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
