import { IpcClient } from "@/ipc/ipc_client";
import { X } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CircleX } from "lucide-react";
import { SubscriptionFormWrapper } from "@/components/subscription/SubscriptionForm";
import { useUserBudgetInfo } from "@/hooks/useUserBudgetInfo";
import { useSubscription } from "@/hooks/useSubscription";
import { Link } from "@tanstack/react-router";

interface ChatErrorBoxProps {
  onDismiss: () => void;
  error: any;
  isDyadProEnabled: boolean;
}

export function ChatErrorBox({
  onDismiss,
  error,
  isDyadProEnabled,
}: ChatErrorBoxProps) {
  const { userBudget } = useUserBudgetInfo();
  const { subscriptionStatus } = useSubscription();

  const isSubscribed = subscriptionStatus?.isSubscribed || false;
  const usedCredits = userBudget?.usedCredits || 0;
  const totalCredits = userBudget?.totalCredits || 5;
  const remainingCredits = Math.max(0, totalCredits - usedCredits);

  if (error.includes && error.includes("doesn't have a free quota tier")) {
    return (
      <ChatErrorContainer onDismiss={onDismiss}>
        {error}
        <span className="ml-1">
          <ExternalLink href="https://deepseekdrew.sh/pro">
            Access with Drew Pro
          </ExternalLink>
        </span>{" "}
        or switch to another model.
      </ChatErrorContainer>
    );
  }

  // Important, this needs to come after the "free quota tier" check
  // because it also includes this URL in the error message
  if (
    error.includes &&
    (error.includes("Resource has been exhausted") ||
      error.includes("https://ai.google.dev/gemini-api/docs/rate-limits"))
  ) {
    return (
      <ChatErrorContainer onDismiss={onDismiss}>
        {error}
        <span className="ml-1">
          <Link to="/settings">
            Upgrade to Drew Pro
          </Link>
        </span>{" "}
        or read the
        <span className="ml-1">
          <ExternalLink href="https://deepseekdrew.com">
            Rate limit troubleshooting guide.
          </ExternalLink>
        </span>
      </ChatErrorContainer>
    );
  }

  if (error.includes && error.includes("LiteLLM Virtual Key expected")) {
    return (
      <ChatInfoContainer onDismiss={onDismiss}>
        <span>
          Looks like you don't have a valid Pro key.{" "}
          <ExternalLink href="https://deepseekdrew.com">
            Upgrade to Pro
          </ExternalLink>{" "}
          today.
        </span>
      </ChatInfoContainer>
    );
  }

  // Check if user has run out of credits
  if (remainingCredits <= 0 && !isSubscribed) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
        <div className="flex items-start gap-2">
          <CircleX className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <h3 className="font-medium">You've run out of AI credits</h3>
            <p className="mt-1">
              You have used all of your free credits this month. Upgrade to Pro
              for unlimited access.
            </p>
            <div className="mt-3">
              <SubscriptionFormWrapper />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDyadProEnabled && error.includes && error.includes("ExceededBudget:")) {
    return (
      <ChatInfoContainer onDismiss={onDismiss}>
        <span>
          You have used all of your credits this month.{" "}
          <Link to="/app/$appId" params={{ appId: "TODO" }}>Upgrade to Max</Link>{" "}
          and get more AI credits
        </span>
      </ChatInfoContainer>
    );
  }
  // This is a very long list of model fallbacks that clutters the error message.
  let errorMessage = error;
  if (error.includes && error.includes("Fallbacks=")) {
    errorMessage = error.split("Fallbacks=")[0];
  }
  return (
    <ChatErrorContainer onDismiss={onDismiss}>
      {errorMessage}
    </ChatErrorContainer>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="underline cursor-pointer text-blue-500 hover:text-blue-700"
      onClick={() => IpcClient.getInstance().openExternalUrl(href)}
    >
      {children}
    </a>
  );
}

function ChatErrorContainer({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: React.ReactNode | string;
}) {
  return (
    <div className="relative mt-2 bg-red-50 border border-red-200 rounded-md shadow-sm p-2 mx-4">
      <button
        onClick={onDismiss}
        className="absolute top-2.5 left-2 p-1 hover:bg-red-100 rounded"
      >
        <X size={14} className="text-red-500" />
      </button>
      <div className="pl-8 py-1 text-sm">
        <div className="text-red-700 text-wrap">
          {typeof children === "string" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ children: linkChildren, ...props }) => (
                  <a
                    {...props}
                    onClick={(e) => {
                      e.preventDefault();
                      if (props.href) {
                        IpcClient.getInstance().openExternalUrl(props.href);
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {linkChildren}
                  </a>
                ),
              }}
            >
              {children}
            </ReactMarkdown>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

function ChatInfoContainer({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-2 bg-sky-50 border border-sky-200 rounded-md shadow-sm p-2 mx-4">
      <button
        onClick={onDismiss}
        className="absolute top-2.5 left-2 p-1 hover:bg-sky-100 rounded"
      >
        <X size={14} className="text-sky-600" />
      </button>
      <div className="pl-8 py-1 text-sm">
        <div className="text-sky-800 text-wrap">{children}</div>
      </div>
    </div>
  );
}
