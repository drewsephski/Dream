import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <div className="max-w-md w-full bg-background p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button onClick={handleGoHome} className="flex items-center gap-2 mx-auto">
          <HomeIcon className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}