import { useState, useRef, useEffect } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { ChatPanel } from "../components/ChatPanel";
import { PreviewPanel } from "../components/preview_panel/PreviewPanel";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { isPreviewOpenAtom } from "@/atoms/viewAtoms";
import { useChats } from "@/hooks/useChats";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { useAuth } from "@clerk/clerk-react";
import { SignInDialog } from "@/components/SignInDialog";

export default function ChatPage() {
  let { id: chatId } = useSearch({ from: "/chat" });
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useAtom(isPreviewOpenAtom);
  const [isResizing, setIsResizing] = useState(false);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const setSelectedAppId = useSetAtom(selectedAppIdAtom);
  const { chats, loading } = useChats(selectedAppId);
  const { isSignedIn } = useAuth();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  useEffect(() => {
    // If user is not signed in, show sign-in dialog
    if (!isSignedIn) {
      setShowSignInDialog(true);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!chatId && chats.length && !loading) {
      // Not a real navigation, just a redirect, when the user navigates to /chat
      // without a chatId, we redirect to the first chat
      setSelectedAppId(chats[0].appId);
      navigate({ to: "/chat", search: { id: chats[0].id }, replace: true });
    }
  }, [chatId, chats, loading, navigate]);

  useEffect(() => {
    if (isPreviewOpen) {
      ref.current?.expand();
    } else {
      ref.current?.collapse();
    }
  }, [isPreviewOpen]);
  const ref = useRef<ImperativePanelHandle>(null);

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <SignInDialog
          open={showSignInDialog}
          onOpenChange={setShowSignInDialog}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-transparent">
      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
      />
      <PanelGroup autoSaveId="persistence" direction="horizontal">
        <Panel id="chat-panel" minSize={30}>
          <div className="h-full w-full bg-transparent">
            <ChatPanel
              chatId={chatId}
              isPreviewOpen={isPreviewOpen}
              onTogglePreview={() => {
                setIsPreviewOpen(!isPreviewOpen);
                if (isPreviewOpen) {
                  ref.current?.collapse();
                } else {
                  ref.current?.expand();
                }
              }}
            />
          </div>
        </Panel>

        <>
          <PanelResizeHandle
            onDragging={(e) => setIsResizing(e)}
            className="w-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors cursor-col-resize"
          />
          <Panel
            collapsible
            ref={ref}
            id="preview-panel"
            minSize={20}
            className={cn(
              !isResizing && "transition-all duration-100 ease-in-out",
              "bg-transparent"
            )}
          >
            <PreviewPanel />
          </Panel>
        </>
      </PanelGroup>
    </div>
  );
}