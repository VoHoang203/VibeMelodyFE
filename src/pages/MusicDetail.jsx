import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Heart,
  Repeat2,
  Share2,
  Plus,
  MoreHorizontal,
  Play,
  Send,
} from "lucide-react";
import { WaveformPlayer } from "@/components/waveform-player";
import { CommentsSection } from "@/components/comments-section";
import { usePlayerStore } from "../store/usePlayerStore";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";

function normalizeMarkers(comments, songDuration) {
  if (!Array.isArray(comments) || !songDuration) return [];
  return comments
    .filter(
      (c) =>
        typeof c?.timestamp === "number" &&
        isFinite(c.timestamp) &&
        c.timestamp >= 0 &&
        c.timestamp <= songDuration
    )
    .map((c) => ({
      id: c._id || `${c.user?._id || c.user?.id || "u"}-${c.timestamp}`,
      timestamp: c.timestamp,
      left: Math.min(1, Math.max(0, c.timestamp / songDuration)),
      avatarUrl: c?.user?.imageUrl || "/placeholder.svg?height=32&width=32",
      username: c?.user?.fullName || c?.user?.name || "user",
    }));
}
export default function MusicDetailPage() {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  // input field
  const [commentInput, setCommentInput] = useState("");

  // dữ liệu
  const [artist, setArtist] = useState(null);
  const [song, setSong] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
const user = useUserStore((s) => s.user);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);

  // lấy timestamp hiện tại từ player store khi gửi comment
  const getCurrentTime = () =>
    Math.floor(usePlayerStore.getState().currentTime || 0);

  // user hiện tại (vì chưa có middleware nên cần userId để POST)
  const currentUser = useUserStore((s) => s.user);
  const userId = currentUser?._id || currentUser?.id;

  // fetch song + artist + comments từ API /songs/main/:id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingComments(true);
        const { data } = await api.get(`/songs/main/${id}`); // { song, artist, comments }
        if (!mounted) return;
        setSong(data.song);
        setArtist(data.artist || null);
        setComments(Array.isArray(data.comments) ? data.comments : []);
      } finally {
        setLoadingComments(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);
  const markers = useMemo(() => {
    const dur = Number(song?.duration) || 0;
    return normalizeMarkers(comments, dur);
  }, [comments, song?.duration]);

  if (!song) return <div className="p-8">Loading…</div>;

  const mapped = {
    _id: song._id,
    title: song.title,
    artist: song.artist,
    imageUrl: song.imageUrl,
    audioUrl: song.audioUrl,
    duration: song.duration,
  };

  async function submitComment() {
    const content = commentInput.trim();
    if (!content || !userId) return;
    try {
      const timestamp = getCurrentTime(); // <-- lấy từ player
      const { data: created } = await api.post(`/songs/${song._id}/comments`, {
        userId, // CHƯA middleware -> truyền từ FE
        content,
        timestamp, // giây trong bài
      });
      // clear input + prepend comment mới
      setCommentInput("");
      setComments((prev) => [created, ...prev]);
    } catch (e) {
      console.error("Failed to post comment:", e);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Player Section */}
            <div className="rounded-lg bg-card p-6">
              <div className="mb-6 flex items-start gap-4">
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90"
                  onClick={() => setCurrentSong(mapped)}
                >
                  <Play className="h-8 w-8 fill-primary-foreground text-primary-foreground" />
                </Button>

                <div className="flex-1">
                  <h1 className="mb-1 text-2xl font-bold">{song.title}</h1>
                  <p className="text-muted-foreground">{song.artist}</p>
                </div>
              </div>

              <WaveformPlayer track={song} markers={markers} />

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-md ${
                      isLiked ? "text-primary" : "text-muted-foreground"
                    } hover:text-primary`}
                    onClick={() => setIsLiked((v) => !v)}
                  >
                    <Heart
                      className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                    />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-md ${
                      isReposted ? "text-primary" : "text-muted-foreground"
                    } hover:text-primary`}
                    onClick={() => setIsReposted((v) => !v)}
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
              </div>
            </div>

            {/* Comment Input */}
            <div className="rounded-lg bg-card p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <img src={user.imageUrl || "/placeholder.svg?height=40&width=40"} alt="User" />
                </Avatar>
                <input
                  type="text"
                  placeholder="Write a comment"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitComment();
                  }}
                  className="flex-1 rounded-md border-none bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={submitComment}
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Comments Section (nhận mảng comments + loading) */}
            <CommentsSection comments={comments} loading={loadingComments} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg bg-card">
              <img
                src={song.imageUrl || "/placeholder.svg"}
                alt={song.title}
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="rounded-lg bg-card p-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Avatar className="h-24 w-24">
                  <img
                    src={song.artistAvatar || "/placeholder.svg"}
                    alt={song.artist}
                  />
                </Avatar>

                <div>
                  <h3 className="text-lg font-bold">{song.artist}</h3>
                  <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {song.followers}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
