import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "../contexts/ThemeContext";
import { DeepLinkProvider } from "../contexts/DeepLinkContext";
import { Toaster } from "sonner";
import { TitleBar } from "./TitleBar";
import { useEffect } from "react";
import { useRunApp } from "@/hooks/useRunApp";
import { useAtomValue } from "jotai";
import { previewModeAtom } from "@/atoms/appAtoms";
import { AuthStatus } from "@/components/AuthStatus";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { refreshAppIframe } = useRunApp();
  const previewMode = useAtomValue(previewModeAtom);
  
  // Apply background to body element
  useEffect(() => {
    const applyBackground = () => {
      document.body.style.background = "radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)";
      document.body.style.backgroundAttachment = "fixed";
    };

    applyBackground();
    
    // Clean up on unmount
    return () => {
      document.body.style.background = "";
      document.body.style.backgroundAttachment = "";
    };
  }, []);

  // Global keyboard listener for refresh events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+R (Windows/Linux) or Cmd+R (macOS)
      if (event.key === "r" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault(); // Prevent default browser refresh
        if (previewMode === "preview") {
          refreshAppIframe(); // Use our custom refresh function instead
        }
      }
    };

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [refreshAppIframe, previewMode]);

  return (
    <div className="min-h-screen w-full relative">
      {/* Your Content/Components */}
      <div className="relative z-0">
        <ThemeProvider>
          <DeepLinkProvider>
            <SidebarProvider>
              <TitleBar />
              <AppSidebar />
              <div className="flex h-screenish w-full overflow-x-hidden mt-12 mb-4 mr-4 border-t border-l border-border rounded-lg">
                {children}
              </div>
              <Toaster richColors />
            </SidebarProvider>
          </DeepLinkProvider>
        </ThemeProvider>
      </div>
    </div>
  );
}