import {
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
} from "@clerk/clerk-react";
import { Navigate } from "@tanstack/react-router";

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Deepseekdrew</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in or create an account to get started
          </p>
        </div>

        <SignedOut>
          <div className="flex flex-col gap-4 mt-8">
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="w-full px-4 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <Navigate to="/" />
        </SignedIn>
      </div>
    </div>
  );
}
