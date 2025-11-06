import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { MusicPlayer } from "./music-player-bar";
import { Header } from "./header";
import { Button } from "./ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useUserStore } from "../store/useUserStore";

export function AppLayout() {
  const { pathname } = useLocation();
  const isChat = pathname === "/chat";
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const user = useUserStore((s) => s.user);
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {user && <LeftSidebar />}

        <main className="flex-1 overflow-y-auto pb-24 relative  ">
          {!isChat && (
            <Button
              size="icon"
              variant="ghost"
              className="fixed top-20 right-4 z-50 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-sm"
              onClick={() => setShowRightSidebar(!showRightSidebar)}
            >
              {showRightSidebar ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          )}
          <Outlet />
        </main>

        {!isChat && showRightSidebar && user && <RightSidebar />}
      </div>

      {user && <MusicPlayer />}
    </div>
  );
}
