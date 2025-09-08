import { useClerk } from "@clerk/clerk-react";

export const SignOutButton = ({
  children,
  ...props
}: React.ComponentProps<"button">) => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button onClick={handleSignOut} {...props}>
      {children || "Sign Out"}
    </button>
  );
};
