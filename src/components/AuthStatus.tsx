import { useAuth } from "../hooks/useAuth";
import { UserButton, useUser, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "./ui/button";

export const AuthStatus = () => {
  const { isSignedIn, isLoading } = useAuth();
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm" className="h-8 px-3 text-xs">
            Sign Up
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
      <span className="text-sm font-medium">
        {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
      </span>
    </div>
  );
};