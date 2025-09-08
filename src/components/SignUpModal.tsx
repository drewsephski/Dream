import { useAuth } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/clerk-react";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const { isSignedIn } = useAuth();

  // If user is already signed in, close the modal
  if (isSignedIn) {
    onOpenChange(false);
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign up to continue</DialogTitle>
          <DialogDescription>
            You need to create an account to send messages and use all features
            of Deepseekdrew.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            By signing up, you'll be able to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Send messages to the AI</li>
            <li>Save and manage your projects</li>
            <li>Access all features of Deepseekdrew</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <SignUpButton mode="modal">
            <Button>Sign Up</Button>
          </SignUpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
