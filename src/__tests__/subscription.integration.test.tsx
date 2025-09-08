import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SubscriptionForm } from "@/components/subscription/SubscriptionForm";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useUser } from "@clerk/clerk-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserBudgetInfo } from "@/hooks/useUserBudgetInfo";
import { IpcClient } from "@/ipc/ipc_client";

// Mock Clerk hooks
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
  useSignUp: vi.fn(),
}));

// Mock custom hooks
vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: vi.fn(),
}));

vi.mock("@/hooks/useUserBudgetInfo", () => ({
  useUserBudgetInfo: vi.fn(),
}));

// Mock IPC client
vi.mock("@/ipc/ipc_client", () => ({
  IpcClient: {
    getInstance: vi.fn().mockReturnValue({
      createSubscription: vi.fn(),
      getSubscriptionStatus: vi.fn(),
      openExternalUrl: vi.fn(),
    }),
  },
}));

// Mock Stripe components
vi.mock("@stripe/react-stripe-js", () => ({
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useStripe: () => ({
    createPaymentMethod: vi.fn(),
    redirectToCheckout: vi.fn(),
  }),
  useElements: () => ({
    getElement: vi.fn(),
  }),
}));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

describe("Subscription Integration", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  describe("SubscriptionForm", () => {
    it("renders subscription form for signed out users", () => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: false,
        user: null,
      });
      (useSubscription as jest.Mock).mockReturnValue({
        subscriptionStatus: null,
        isLoading: false,
      });

      render(<SubscriptionForm />);

      expect(screen.getByText("Subscribe to Pro Plan")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByTestId("card-element")).toBeInTheDocument();
    });

    it("renders subscription form for signed in users", () => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: true,
        user: {
          id: "user_123",
          primaryEmailAddress: { emailAddress: "test@example.com" },
          fullName: "Test User",
        },
      });
      (useSubscription as jest.Mock).mockReturnValue({
        subscriptionStatus: null,
        isLoading: false,
      });

      render(<SubscriptionForm />);

      expect(screen.getByText("Subscribe to Pro Plan")).toBeInTheDocument();
      expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
      expect(screen.getByTestId("card-element")).toBeInTheDocument();
    });
  });

  describe("SubscriptionStatus", () => {
    it("shows free plan status with credits for non-subscribed users", () => {
      (useSubscription as jest.Mock).mockReturnValue({
        subscriptionStatus: {
          isSubscribed: false,
          tier: "free",
        },
        isLoading: false,
      });
      (useUserBudgetInfo as jest.Mock).mockReturnValue({
        userBudget: {
          usedCredits: 2,
          totalCredits: 5,
          budgetResetDate: new Date(),
        },
      });

      render(<SubscriptionStatus onUpgrade={vi.fn()} />);

      expect(screen.getByText("Free Plan")).toBeInTheDocument();
      expect(screen.getByText("3 / 5 credits")).toBeInTheDocument();
      expect(
        screen.getByText("Upgrade to Pro - $10/month"),
      ).toBeInTheDocument();
    });

    it("shows pro plan status for subscribed users", () => {
      (useSubscription as jest.Mock).mockReturnValue({
        subscriptionStatus: {
          isSubscribed: true,
          tier: "pro",
        },
        isLoading: false,
      });
      (useUserBudgetInfo as jest.Mock).mockReturnValue({
        userBudget: {
          usedCredits: 0,
          totalCredits: 999999,
          budgetResetDate: new Date(),
        },
      });

      render(<SubscriptionStatus onUpgrade={vi.fn()} />);

      expect(screen.getByText("Pro Plan")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(
        screen.getByText("You have unlimited access to all features."),
      ).toBeInTheDocument();
    });

    it("shows subscription form when free user runs out of credits", () => {
      (useSubscription as jest.Mock).mockReturnValue({
        subscriptionStatus: {
          isSubscribed: false,
          tier: "free",
        },
        isLoading: false,
      });
      (useUserBudgetInfo as jest.Mock).mockReturnValue({
        userBudget: {
          usedCredits: 5,
          totalCredits: 5,
          budgetResetDate: new Date(),
        },
      });

      render(<SubscriptionStatus onUpgrade={vi.fn()} />);

      expect(
        screen.getByText("You've used all your free credits."),
      ).toBeInTheDocument();
      expect(screen.getByText("Subscribe to Pro Plan")).toBeInTheDocument();
    });
  });
});
