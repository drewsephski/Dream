import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function ErrorBoundary() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to the main route ('/') immediately on mount
    navigate({ to: "/", replace: true });
  }, [navigate]);

  return null;
}
