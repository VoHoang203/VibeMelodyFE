import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { MusicPlayer } from "./music-player-bar";
import { Header } from "./header";
import { Button } from "./ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

export function AppLayout({ children }) {
  const { pathname } = useLocation();
  const isChat = pathname === "/chat";
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 relative">
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
          {children}
        </main>

        {!isChat && showRightSidebar && <RightSidebar />}
      </div>

      {/* Music Player - fixed at bottom */}
      <MusicPlayer />
    </div>
  );
}
