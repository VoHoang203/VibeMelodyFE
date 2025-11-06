import { Link, NavLink, useLocation } from "react-router-dom";
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
import { useUserStore } from "../store/useUserStore";

export function Header() {
  const { pathname } = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useUserStore();

  const baseNav = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
  ];

  const userOnly = [
    // { name: "Register Artist", href: "/register-artist", icon: Plus },
    { name: "Chat", href: "/chat", icon: MessageCircle },
  ];
  const artistOnly = [
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Manage Music", href: "/manage-music", icon: ListMusic },
    { name: "Manage Albums", href: "/manage-albums", icon: Plus },
  ];

  const navigation = user
    ? user.isArtist
      ? [...baseNav, ...artistOnly]
      : [...baseNav, ...userOnly]
    : [...baseNav];

  return (
    <header className="bg-black border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-white">
        <Music className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">Vibe Melody</span>
      </Link>

      {/* Navigation */}
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

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Notifications */}
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
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-neutral-800 cursor-pointer">
                        <p className="text-sm text-white font-medium">
                          New song from artist you follow
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase() || "V"}
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
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800"
                    >
                      Account
                    </Link>
                    {user.isArtist && (
                      <Link
                        to="/profile2"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800"
                      >
                        Artist Profile
                      </Link>
                    )}
                    <div className="border-t border-neutral-800 my-2" />
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-primary rounded-full text-white font-semibold hover:bg-primary/90"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
