import { useEffect, useState, useMemo } from "react";
import { Heart, Play, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import { usePlayerStore } from "../store/usePlayerStore";
import { toast } from "react-hot-toast";

function formatDuration(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
}

export default function LikedSongsPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const playAlbum = usePlayerStore((s) => s.playAlbum);

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // redirect nếu chưa login
  useEffect(() => {
    if (user === null) return; // đang init
    if (!user) {
      toast.error("Bạn cần đăng nhập để xem Liked Songs");
      navigate("/login");
    }
  }, [user, navigate]);

  // load liked songs từ BE
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/me/liked-songs");
        if (cancelled) return;
        setSongs(
          (data.songs || []).map((s) => ({
            id: s._id,
            title: s.title,
            artistName: s.artistName,
            albumTitle: s.albumTitle,
            durationSec: s.duration || 0,
            durationLabel: formatDuration(s.duration || 0),
            imageUrl: s.imageUrl,
            audioUrl: s.audioUrl,
            createdAt: s.createdAt,
          }))
        );
      } catch (err) {
        console.error("Failed to load liked songs:", err);
        toast.error("Không tải được danh sách bài hát đã thích");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const totalCount = useMemo(() => songs.length, [songs]);

  function handlePlayAll() {
    if (!songs.length) return;
    const queueSongs = songs.map((s) => ({
      _id: s.id,
      title: s.title,
      artist: s.artistName,
      imageUrl: s.imageUrl,
      audioUrl: s.audioUrl,
      duration: s.durationSec || 0,
    }));
    playAlbum(queueSongs, 0);
  }

  if (!user) {
    // lúc redirect sẽ nhảy sang login
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header with gradient */}
      <div className="bg-linear-to-b from-purple-600 to-neutral-900 px-8 pt-20 pb-8">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-linear-to-br from-purple-400 to-blue-600 rounded shadow-2xl flex items-center justify-center">
            <Heart className="h-24 w-24 text-white fill-white" />
          </div>
          <div className="flex-1 pb-2">
            <p className="text-sm font-semibold mb-2">Playlist</p>
            <h1 className="text-7xl font-bold mb-6 text-balance">
              Liked Songs
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">
                {totalCount} song{totalCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-linear-to-b from-neutral-900/95 to-black px-8 py-6">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition"
            onClick={handlePlayAll}
            disabled={!songs.length}
          >
            <Play className="h-6 w-6 text-black fill-black ml-1" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 text-gray-400 hover:text-white"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Song List */}
      <div className="px-8 pb-24">
        {/* Table Header */}
        <div className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 mb-2">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Date added</div>
          <div className="flex justify-end">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="px-4 py-6 text-sm text-gray-400">
            Đang tải Liked Songs…
          </div>
        )}

        {/* Song Rows */}
        {!loading && (
          <div className="space-y-1">
            {songs.map((song, index) => {
              const dateLabel = song.createdAt
                ? new Date(song.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";

              return (
                <Link
                  key={song.id}
                  to={`/music/${song.id}`}
                  className="grid grid-cols-[16px_4fr_3fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded hover:bg-white/5 group items-center"
                >
                  <div className="text-gray-400 group-hover:hidden">
                    {index + 1}
                  </div>
                  <div className="hidden group-hover:block">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={song.imageUrl || "/placeholder.svg"}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <div className="text-white font-medium">
                        {song.title}
                      </div>
                      <div className="text-sm text-gray-400">
                        {song.artistName}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {song.albumTitle}
                  </div>
                  <div className="text-sm text-gray-400">{dateLabel}</div>
                  <div className="flex items-center justify-end gap-4">
                    <Heart className="h-4 w-4 text-primary fill-primary opacity-0 group-hover:opacity-100 transition" />
                    <span className="text-sm text-gray-400">
                      {song.durationLabel}
                    </span>
                  </div>
                </Link>
              );
            })}

            {!songs.length && !loading && (
              <div className="px-4 py-6 text-sm text-gray-400">
                Bạn chưa thích bài hát nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
