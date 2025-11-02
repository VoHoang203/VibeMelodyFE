import { Users } from "lucide-react"

const friends = [
  { name: "As a Programmer", status: "Idle", avatar: "/programmer.png", color: "bg-blue-500" },
  { name: "Tania Star", status: "Idle", avatar: "/young-woman-smiling.png", color: "bg-pink-500" },
]

export function RightSidebar() {
  return (
    <aside className="w-80 bg-black border-l border-white/10 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-white" />
        <h2 className="text-sm font-semibold text-white">What they're listening to</h2>
      </div>

      <div className="space-y-4">
        {friends.map((friend, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                  friend.color,
                )}
              >
                {friend.name.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{friend.name}</p>
              <p className="text-xs text-gray-400">{friend.status}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}
