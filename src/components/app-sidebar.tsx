import {
  Home,
  Inbox,
  Settings,
  Store,
  BookOpen,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSidebar } from "@/components/ui/sidebar"; // import useSidebar hook
import { useEffect, useState, useRef } from "react";
import { useAtom } from "jotai";
import { dropdownOpenAtom } from "@/atoms/uiAtoms";
import { useAuth } from "@clerk/clerk-react";
import { SignInDialog } from "@/components/SignInDialog";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatList } from "./ChatList";
import { AppList } from "./AppList";
import { SettingsList } from "./SettingsList";
import { DrewLogo } from "./DrewLogo";

// Menu items.
const items = [
  {
    title: "Apps",
    to: "/",
    icon: Home,
  },
  {
    title: "Chat",
    to: "/chat",
    icon: Inbox,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings,
  },
  {
    title: "Library",
    to: "/library",
    icon: BookOpen,
  },
  {
    title: "Hub",
    to: "/hub",
    icon: Store,
  },
];

// Hover state types
type HoverState =
  | "start-hover:app"
  | "start-hover:chat"
  | "start-hover:settings"
  | "start-hover:library"
  | "start-hover:hub"
  | "clear-hover"
  | "no-hover";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar(); // retrieve current sidebar state
  const [hoverState, setHoverState] = useState<HoverState>("no-hover");
  const expandedByHover = useRef(false);
  const [isDropdownOpen] = useAtom(dropdownOpenAtom);
  const { isSignedIn } = useAuth();
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (hoverState.startsWith("start-hover") && state === "collapsed") {
      expandedByHover.current = true;
      toggleSidebar();
    }
    if (
      hoverState === "clear-hover" &&
      state === "expanded" &&
      expandedByHover.current &&
      !isDropdownOpen
    ) {
      toggleSidebar();
      expandedByHover.current = false;
      setHoverState("no-hover");
    }
  }, [hoverState, toggleSidebar, state, setHoverState, isDropdownOpen]);

  const routerState = useRouterState();
  const isAppRoute =
    routerState.location.pathname === "/" ||
    routerState.location.pathname.startsWith("/app-details");
  const isChatRoute = routerState.location.pathname === "/chat";
  const isSettingsRoute = routerState.location.pathname.startsWith("/settings");

  let selectedItem: string | null = null;
  if (hoverState === "start-hover:app") {
    selectedItem = "Apps";
  } else if (hoverState === "start-hover:chat") {
    selectedItem = "Chat";
  } else if (hoverState === "start-hover:settings") {
    selectedItem = "Settings";
  } else if (hoverState === "start-hover:library") {
    selectedItem = "Library";
  } else if (hoverState === "start-hover:hub") {
    selectedItem = "Hub";
  } else if (state === "expanded") {
    if (isAppRoute) {
      selectedItem = "Apps";
    } else if (isChatRoute) {
      selectedItem = "Chat";
    } else if (isSettingsRoute) {
      selectedItem = "Settings";
    }
  }

  const handleNavigation = (to: string) => {
    // If user is not signed in and trying to access protected routes, show sign-in dialog
    if (!isSignedIn && to !== "/") {
      setPendingNavigation(to);
      setIsSignInDialogOpen(true);
      return;
    }

    // For signed-in users or the home route, allow navigation
    window.location.hash = `#${to}`;
  };

  return (
    <>
      <SignInDialog
        open={isSignInDialogOpen}
        onOpenChange={(open) => {
          setIsSignInDialogOpen(open);
          if (!open) {
            setPendingNavigation(null);
          }
        }}
      />
      <Sidebar
        collapsible="icon"
        onMouseLeave={() => {
          if (!isDropdownOpen) {
            setHoverState("clear-hover");
          }
        }}
      >
        <SidebarContent className="overflow-hidden py-0">
          <div className="flex">
            {/* Left Column: Menu items */}
            <div className="flex flex-col items-center w-16">
              <SidebarTrigger
                onMouseEnter={() => {
                  setHoverState("clear-hover");
                }}
                className="mb-6"
              />
              <AppIcons
                onHoverChange={setHoverState}
                onNavigation={handleNavigation}
                isSignedIn={isSignedIn}
              />
            </div>
            {/* Right Column: Chat List Section */}
            <div className="w-[240px] pl-2 pt-14">
              <AppList show={selectedItem === "Apps"} />
              <ChatList show={selectedItem === "Chat"} />
              <SettingsList show={selectedItem === "Settings"} />
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex flex-col items-center justify-center w-full py-3 border-t border-border">
            <DrewLogo size="lg" className="mb-1" />
            <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
              Made by Drew
            </p>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  );
}

function AppIcons({
  onHoverChange,
  onNavigation,
  isSignedIn,
}: {
  onHoverChange: (state: HoverState) => void;
  onNavigation: (to: string) => void;
  isSignedIn: boolean | undefined;
}) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { state } = useSidebar();

  return (
    // When collapsed: only show the main menu
    <SidebarGroup className="pr-0 py-2">
      {/* <SidebarGroupLabel>Dyad</SidebarGroupLabel> */}

      <SidebarGroupContent>
        <SidebarMenu className="space-y-3">
          {items.map((item) => {
            const isActive =
              (item.to === "/" && pathname === "/") ||
              (item.to !== "/" && pathname.startsWith(item.to));

            return (
              <SidebarMenuItem key={item.title}>
                {(item.title === "Hub" || item.title === "Library") ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton 
                        size="lg" 
                        isActive={isActive}
                        className="font-medium w-12"
                      >
                        <button
                          onClick={() => onNavigation(item.to)}
                          className="flex flex-col items-center gap-1 w-full h-full"
                          onMouseEnter={() => {
                            if (item.title === "Apps") {
                              onHoverChange("start-hover:app");
                            } else if (item.title === "Chat") {
                              onHoverChange("start-hover:chat");
                            } else if (item.title === "Settings") {
                              onHoverChange("start-hover:settings");
                            } else if (item.title === "Library") {
                              onHoverChange("start-hover:library");
                            } else if (item.title === "Hub") {
                              onHoverChange("start-hover:hub");
                            }
                          }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <item.icon className="h-5 w-5" />
                            <span className={"text-xs"}>{item.title}</span>
                          </div>
                        </button>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      align="center"
                      className="z-[100] pointer-events-none"
                    >
                      {item.title === "Hub" ? "Browse and install apps from the community" : "Your saved apps and templates"}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton 
                    size="lg" 
                    isActive={isActive}
                    className="font-medium w-12"
                  >
                    <button
                      onClick={() => onNavigation(item.to)}
                      className="flex flex-col items-center gap-1 w-full h-full"
                      onMouseEnter={() => {
                        if (item.title === "Apps") {
                          onHoverChange("start-hover:app");
                        } else if (item.title === "Chat") {
                          onHoverChange("start-hover:chat");
                        } else if (item.title === "Settings") {
                          onHoverChange("start-hover:settings");
                        } else if (item.title === "Library") {
                          onHoverChange("start-hover:library");
                        } else if (item.title === "Hub") {
                          onHoverChange("start-hover:hub");
                        }
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <item.icon className="h-5 w-5" />
                        <span className={"text-xs"}>{item.title}</span>
                      </div>
                    </button>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}