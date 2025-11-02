import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Home,
  Search,
  Upload,
  Plus,
  Bell,
  Music,
  ChevronDown,
  MessageCircle,
  ListMusic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Search", href: "/search", icon: Search },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Manage Music", href: "/manage-music", icon: ListMusic },
  { name: "Manage Albums", href: "/manage-albums", icon: Plus },
];

export function Header() {
  const { pathname } = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-black border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2 text-white">
        <Music className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">Vibe Melody</span>
      </Link>

      <nav className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:inline">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full hover:bg-neutral-800 transition-colors relative"
          >
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-neutral-900 rounded-lg shadow-xl border border-neutral-800 py-2 z-50">
                <div className="px-4 py-3 border-b border-neutral-800">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-neutral-800 transition-colors cursor-pointer">
                    <p className="text-sm text-white font-medium">
                      New song from artist you follow
                    </p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-neutral-800 transition-colors cursor-pointer">
                    <p className="text-sm text-white font-medium">
                      Your album has been approved
                    </p>
                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-neutral-800 transition-colors cursor-pointer">
                    <p className="text-sm text-white font-medium">
                      You have 3 new followers
                    </p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
              V
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900 rounded-lg shadow-xl border border-neutral-800 py-2 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Account
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/profile2"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Artist Profile
                </Link>
                <div className="border-t border-neutral-800 my-2" />
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors">
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors">
                  Register as Artist
                </button>
                <div className="border-t border-neutral-800 my-2" />
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
