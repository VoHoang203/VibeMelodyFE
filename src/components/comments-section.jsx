import { useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

const mockComments = [
  {
    id: 1,
    user: "www.izzy.com",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "I need to wipe after the shit? Who decided that",
    timestamp: "0:11",
    timeAgo: "14 days ago",
    likes: 6,
    replies: [],
  },
  {
    id: 2,
    user: "Jayden Vanleathem",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "@samurai-753620701 ...",
    timestamp: "0:11",
    timeAgo: "11 days ago",
    likes: 0,
    replies: [],
  },
  {
    id: 3,
    user: "Jude",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Whi decided that",
    timestamp: "0:06",
    timeAgo: "18 days ago",
    likes: 0,
    replies: [],
  },
  {
    id: 4,
    user: "Jamison",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "20/10 give me chills",
    timestamp: "0:17",
    timeAgo: "19 days ago",
    likes: 0,
    replies: [],
  },
]

export function CommentsSection({ trackId }) {
  const [comments, setComments] = useState(mockComments)
  const [sortBy, setSortBy] = useState("newest")
  const [likedComments, setLikedComments] = useState(new Set())

  const toggleLike = (commentId) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{comments.length} comments</h2>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#2a2a2a] text-white px-4 py-2 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-10 cursor-pointer"
          >
            <option value="newest">Sorted by: Newest</option>
            <option value="oldest">Sorted by: Oldest</option>
            <option value="popular">Sorted by: Popular</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <img src={comment.avatar || "/placeholder.svg"} alt={comment.user} />
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-sm">{comment.user}</span>
                <span className="text-xs text-gray-400">
                  at {comment.timestamp} · {comment.timeAgo}
                </span>
              </div>

              <p className="text-sm text-gray-200">{comment.content}</p>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-auto p-0 text-xs">
                  Reply
                </Button>

                <button
                  onClick={() => toggleLike(comment.id)}
                  className="flex items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <Heart
                    className={`h-3 w-3 ${likedComments.has(comment.id) ? "fill-orange-500 text-orange-500" : ""}`}
                  />
                  <span className="text-xs">{comment.likes + (likedComments.has(comment.id) ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
