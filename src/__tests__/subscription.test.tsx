import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SubscriptionForm } from "@/components/subscription/SubscriptionForm";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useUser, useSignUp } from "@clerk/clerk-react";

// Mock Clerk hooks
vi.mock("@clerk/clerk-react", () => ({
  useUser: vi.fn(),
  useSignUp: vi.fn(),
  useClerk: vi.fn(),
}));

// Mock Stripe components
vi.mock("@stripe/react-stripe-js", () => ({
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  Elements: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useStripe: vi.fn(),
  useElements: vi.fn(),
}));

// Mock IPC client
vi.mock("@/ipc/ipc_client", () => ({
  IpcClient: {
    getInstance: () => ({
      createSubscription: vi.fn(),
      getSubscriptionStatus: vi.fn(),
    }),
  },
}));

// Mock toast hook
vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock useUserBudgetInfo hook
vi.mock("@/hooks/useUserBudgetInfo", () => ({
  useUserBudgetInfo: () => ({
    userBudget: {
      usedCredits: 0,
      totalCredits: 5,
      budgetResetDate: new Date(),
    },
  }),
}));

// Create a query client for testing
const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
};

describe("Subscription Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders subscription form for unauthenticated users", () => {
    (useUser as any).mockReturnValue({
      isSignedIn: false,
      user: null,
    });

    (useSignUp as any).mockReturnValue({
      signUp: {
        create: vi.fn(),
        prepareEmailAddressVerification: vi.fn(),
      },
      setActive: vi.fn(),
    });

    renderWithProviders(<SubscriptionForm />);

    expect(screen.getByText("Subscribe to Pro Plan")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByTestId("card-element")).toBeInTheDocument();
  });

  it("renders subscription form for authenticated users", () => {
    (useUser as any).mockReturnValue({
      isSignedIn: true,
      user: {
        id: "user_123",
        primaryEmailAddress: {
          emailAddress: "test@example.com",
        },
      },
    });

    (useSignUp as any).mockReturnValue({
      signUp: null,
      setActive: vi.fn(),
    });

    renderWithProviders(<SubscriptionForm />);

    expect(screen.getByText("Subscribe to Pro Plan")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.getByTestId("card-element")).toBeInTheDocument();
  });

  it("renders subscription status for free users", () => {
    (useUser as any).mockReturnValue({
      user: {
        id: "user_123",
      },
    });

    const mockOnUpgrade = vi.fn();

    renderWithProviders(<SubscriptionStatus onUpgrade={mockOnUpgrade} />);

    expect(screen.getByText("Free Plan")).toBeInTheDocument();
    expect(
      screen.getByText(
        /credits remaining. Upgrade to Pro for unlimited access./,
      ),
    ).toBeInTheDocument();
  });
});
