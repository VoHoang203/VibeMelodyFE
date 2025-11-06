import { Heart } from "lucide-react";

function formatTimestamp(sec) {
  if (typeof sec !== "number" || Number.isNaN(sec)) return null;
  const m = Math.floor(sec / 60);
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}
function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

/**
 * UI-only: hiển thị danh sách comments nhận từ props
 * - comments: mảng comment (đã populate user)
 * - loading: boolean
 */
export function CommentsSection({
  comments = [],
  loading = false,
}) {
  const count = comments.length;

  return (
    <div className="rounded-lg bg-[#1a1a1a] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {loading ? "Loading…" : `${count} comments`}
        </h2>

        <div className="relative">
          <select
            disabled
            className="cursor-not-allowed appearance-none rounded-md bg-[#2a2a2a] px-4 py-2 pr-10 text-white opacity-60"
          >
            <option>Sorted by: Newest</option>
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((c) => {
          const username = c?.user?.fullName || c?.user?.name || "user";
          const avatarUrl = c?.user?.imageUrl || "/placeholder.svg?height=40&width=40";
          const stamp = formatTimestamp(c?.timestamp);
          const ago = c?.createdAt ? timeAgo(c.createdAt) : "";

          return (
            <div key={c._id} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-700">
                <img src={avatarUrl} alt={username} className="h-10 w-10 object-cover" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium">{username}</span>
                  <span className="text-xs text-gray-400">
                    {stamp ? `at ${stamp}` : null} {ago ? `· ${ago}` : null}
                  </span>
                </div>

                <p className="text-sm text-gray-200">{c.content}</p>

                <div className="flex items-center gap-4">
                  <button className="h-auto p-0 text-xs text-gray-400 hover:text-white">Reply</button>
                  <button disabled className="flex items-center gap-1 text-gray-500 opacity-60" title="Likes not implemented">
                    <Heart className="h-3 w-3" />
                    <span className="text-xs">0</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && comments.length === 0 && (
          <div className="text-sm text-gray-400">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  );
}
