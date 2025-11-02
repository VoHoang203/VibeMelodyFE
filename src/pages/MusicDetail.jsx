import { useState } from "react"
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Heart, Repeat2, Share2, Plus, MoreHorizontal, Play, Send } from "lucide-react"
import { WaveformPlayer } from "@/components/waveform-player"
import { CommentsSection } from "@/components/comments-section"

// Mock data
const mockTrack = {
  id: "1",
  title: "Who decided that x Locrian dominant (extended version)...",
  artist: "Ondx",
  artistAvatar: "/placeholder.svg?height=100&width=100",
  coverArt: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MU7fOIC7SHTQccxPqzd7dPnsiug7IE.png",
  duration: 144,
  uploadedAt: "2 months ago",
  plays: 258000,
  likes: 5173,
  reposts: 11,
  followers: 55,
  tracks: 13,
  audioUrl: "/placeholder-audio.mp3",
}

const mockFans = [
  { id: 1, name: "Gagik Kuyumjyan", avatar: "/placeholder.svg?height=40&width=40", plays: 212 },
  { id: 2, name: "Music Lover", avatar: "/placeholder.svg?height=40&width=40", plays: 189 },
  { id: 3, name: "Sound Wave", avatar: "/placeholder.svg?height=40&width=40", plays: 156 },
]

export default function MusicDetailPage() {
  const { id } = useParams();  
  const [isLiked, setIsLiked] = useState(false)
  const [isReposted, setIsReposted] = useState(false)
  const [comment, setComment] = useState("")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Section */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                <Button size="icon" className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90">
                  <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
                </Button>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1">{mockTrack.title}</h1>
                  <p className="text-muted-foreground">{mockTrack.artist}</p>
                </div>

                <span className="text-muted-foreground text-sm">{mockTrack.uploadedAt}</span>
              </div>

              {/* Waveform Player */}
              <WaveformPlayer track={mockTrack} />

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-md ${isLiked ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-md ${isReposted ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
                    onClick={() => setIsReposted(!isReposted)}
                  >
                    <Repeat2 className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    {mockTrack.plays.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {mockTrack.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-4 w-4" />
                    {mockTrack.reposts}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <img src="/placeholder.svg?height=40&width=40" alt="User" />
                </Avatar>
                <input
                  type="text"
                  placeholder="Write a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 bg-secondary border-none rounded-md px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection trackId={mockTrack.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Album Art */}
            <div className="bg-card rounded-lg overflow-hidden">
              <img
                src={mockTrack.coverArt || "/placeholder.svg"}
                alt={mockTrack.title}
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Artist Info */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <img src={mockTrack.artistAvatar || "/placeholder.svg"} alt={mockTrack.artist} />
                </Avatar>

                <div>
                  <h3 className="font-bold text-lg">{mockTrack.artist}</h3>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {mockTrack.followers}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                      {mockTrack.tracks}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Follow</Button>

                <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">
                  Report
                </Button>
              </div>
            </div>

            {/* Top Fans */}
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  FANS
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </h3>
              </div>

              <div className="flex gap-4 border-b border-border mb-4">
                <button className="pb-2 border-b-2 border-primary font-medium text-sm">Top</button>
                <button className="pb-2 text-muted-foreground hover:text-foreground text-sm">First</button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">Fans who have played this track the most:</p>

              <div className="space-y-3">
                {mockFans.map((fan, index) => (
                  <div key={fan.id} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-4">{index + 1}</span>
                    <Avatar className="h-10 w-10">
                      <img src={fan.avatar || "/placeholder.svg"} alt={fan.name} />
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{fan.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{fan.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
