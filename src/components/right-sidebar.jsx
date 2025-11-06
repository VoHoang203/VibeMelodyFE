import { useEffect } from "react";
import { Users, Music } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function parseActivity(activity) {
  if (!activity || activity === "Idle")
    return { title: "", artist: "", isPlaying: false };
  if (activity.startsWith("Playing ")) {
    const raw = activity.replace("Playing ", "");
    const [title, artist] = raw.split(" by ");
    return { title: title || "", artist: artist || "", isPlaying: true };
  }
  return { title: activity, artist: "", isPlaying: false };
}

export function RightSidebar({ currentUserId }) {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    initSocket,
    isConnected,
    onlineUsers,
    userActivities,
  } = useChatStore();

  // Kết nối socket + lấy users
  useEffect(() => {
    if (currentUserId && !isConnected) {
      initSocket(currentUserId);
    }
  }, [currentUserId, isConnected, initSocket]);

  useEffect(() => {
    fetchUsers(); // API trả về all users (trừ mình) theo controller bạn đã viết
  }, [fetchUsers]);

  return (
    <aside className="w-80 bg-black border-l border-white/10 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-white" />
        <h2 className="text-sm font-semibold text-white">
          What they're listening to
        </h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Đang tải…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có bạn bè để hiển thị</p>
      ) : (
        <div className="space-y-4 overflow-y-auto">
          {users.map((u) => {
            const isOnline = onlineUsers.has(u._id);
            const activity = userActivities.get(u._id) || "Idle";
            const { title, artist, isPlaying } = parseActivity(activity);
            console.log(userActivities);
            return (
              <div key={u._id || u.id} className="flex items-center gap-3">
                {/* Avatar + status */}
                <div className="relative">
                  {u.imageUrl ? (
                    <img
                      src={u.imageUrl}
                      alt={u.fullName || u.username || "User"}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                        "bg-white/10"
                      )}
                    >
                      {(
                        u.fullName?.[0] ||
                        u.username?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </div>
                  )}
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black",
                      isOnline ? "bg-green-500" : "bg-zinc-500"
                    )}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {u.fullName || u.username || "Unknown"}
                  </p>

                  {isPlaying ? (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-emerald-400">
                      <Music className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {title}{" "}
                        {artist ? (
                          <span className="text-zinc-400">— {artist}</span>
                        ) : null}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Idle</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
