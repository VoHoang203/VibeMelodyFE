import {
  Play,
  Shuffle,
  Download,
  MoreHorizontal,
  Clock,
  Plus,
  X,
  Heart,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

export default function AlbumDetailPage() {
  const { id } = useParams(); // albumId (hoặc slug) từ URL
  const navigate = useNavigate();

  const user = useUserStore((s) => s.user);
  const playAlbum = usePlayerStore((s) => s.playAlbum);

  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // like album state
  const [albumLiked, setAlbumLiked] = useState(false);
  const [albumLikesCount, setAlbumLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // canEdit: chỉ chủ album (artistId == user.id) mới thấy nút Add Songs
  const canEdit = useMemo(() => {
    if (!album || !user) return false;
    const uid = user._id || user.id;
    if (!uid || !album.artistId) return false;
    return String(uid) === String(album.artistId);
  }, [album, user]);

  // fetch album + songs
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/main/albums/${id}`); // BE: getAlbumMain
        if (cancelled) return;

        setAlbum(data.album || null);

        const mappedTracks =
          (data.songs || []).map((s) => ({
            id: s._id,
            name: s.title,
            artist: s.artistName,
            album: data.album?.title || "",
            date: s.createdAt
              ? new Date(s.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "",
            durationSec: s.duration || 0,
            duration: formatDuration(s.duration || 0),
            image: s.imageUrl || data.album?.imageUrl,
            audioUrl: s.audioUrl,
          })) || [];

        setTracks(mappedTracks);
        setAlbumLikesCount(data.album?.likesCount || 0);
      } catch (err) {
        console.error("Failed to load album:", err);
        toast.error("Không tải được album");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // đợi có albumId thực sự mới gọi like-status
  const albumId = album?._id;

  useEffect(() => {
    if (!albumId || !user) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get(`/albums/${albumId}/like-status`);
        if (cancelled) return;
        setAlbumLiked(!!data.liked);
        setAlbumLikesCount(
          typeof data.likesCount === "number" ? data.likesCount : 0
        );
      } catch (err) {
        console.error("Failed to load album like status:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [albumId, user]);

  // 🔧 toggle like album – KHÔNG còn phụ thuộc data.liked
  async function toggleAlbumLike() {
    if (!albumId) return;

    if (!user) {
      toast.error("Bạn cần đăng nhập để thích album này");
      return;
    }
    if (liking) return;

    setLiking(true);
    const prevLiked = albumLiked;
    const prevCount = albumLikesCount;

    if (!prevLiked) {
      // like
      setAlbumLiked(true);
      setAlbumLikesCount((c) => c + 1);
      try {
        const { data } = await api.post(`/albums/${albumId}/like`);
        // chỉ đồng bộ lại count nếu BE trả về
        if (typeof data.likesCount === "number") {
          setAlbumLikesCount(data.likesCount);
        }
      } catch (err) {
        console.error("Like album failed:", err);
        // revert
        setAlbumLiked(prevLiked);
        setAlbumLikesCount(prevCount);
      } finally {
        setLiking(false);
      }
    } else {
      // unlike
      setAlbumLiked(false);
      setAlbumLikesCount((c) => Math.max(0, c - 1));
      try {
        const { data } = await api.delete(`/albums/${albumId}/like`);
        if (typeof data.likesCount === "number") {
          setAlbumLikesCount(data.likesCount);
        }
      } catch (err) {
        console.error("Unlike album failed:", err);
        // revert
        setAlbumLiked(prevLiked);
        setAlbumLikesCount(prevCount);
      } finally {
        setLiking(false);
      }
    }
  }

  // play cả album
  function handlePlayAlbum() {
    if (!tracks.length) return;
    const queueSongs = tracks.map((t) => ({
      _id: t.id,
      title: t.name,
      artist: t.artist,
      imageUrl: t.image || album?.imageUrl,
      audioUrl: t.audioUrl,
      duration: t.durationSec || 0,
    }));
    playAlbum(queueSongs, 0);
  }

  // remove track (client-only tạm thời)
  const removeTrack = (trackId) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));
  };

  if (loading && !album) {
    return <div className="p-8">Loading album…</div>;
  }

  if (!album) {
    return <div className="p-8">Album not found</div>;
  }

  // cover grid: tạm dùng 4 lần cùng 1 image
  const coverImages = [album.imageUrl];

  return (
    <div className="min-h-screen">
      {/* Header with gradient background */}
      <div className="relative bg-linear-to-b from-red-900 to-black pt-16 pb-6 px-8">
        <div className="flex items-end gap-6">
          {/* Album Cover Grid */}
          <div className="grid grid-cols-1 gap-1  shrink-0">
            {coverImages.map((img, index) => (
              <img
                key={index}
                src={img || "/placeholder.svg"}
                alt={`Cover ${index + 1}`}
                className="w-40 h-40 object-cover rounded-md"
              />
            ))}
          </div>

          {/* Album Info */}
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium mb-2">{album.type}</p>
            <h1 className="text-7xl font-bold mb-6 text-white">
              {album.title}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <Link
                to={`/artist/${album.artistId}`}
                className="font-semibold hover:underline"
              >
                {album.artistName}
              </Link>
              <span>•</span>
              <span>
                {tracks.length} songs,{" "}
                {album.releaseYear ? `Released ${album.releaseYear}` : "Album"}
              </span>
              <span>•</span>
              <span>{albumLikesCount} likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-linear-to-b from-black/40 to-black px-8 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayAlbum}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition"
          >
            <Play className="h-6 w-6 text-black fill-black ml-1" />
          </button>

          {/* like album */}
          <button
            onClick={toggleAlbumLike}
            disabled={liking}
            className={`w-10 h-10 flex items-center justify-center rounded-full border border-transparent text-gray-400 hover:text-red-500 transition ${
              albumLiked ? "text-primary" : ""
            }`}
            title={albumLiked ? "Unlike album" : "Like album"}
          >
            <Heart className={`h-5 w-5 ${albumLiked ? "fill-current" : ""}`} />
          </button>

          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
            <Shuffle className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
            <Download className="h-5 w-5" />
          </button>

          {canEdit && (
            <button
              onClick={() =>
                navigate(`/manage-albums/create-album?id=${album._id}`)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Songs</span>
            </button>
          )}

          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <div className="flex-1"></div>
          <button className="text-sm text-gray-400 hover:text-white font-medium flex items-center gap-2">
            List
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="px-8 pb-8">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_2fr_2fr_1fr_auto_auto] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 mb-2">
          <div className="text-center">#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Date Added</div>
          <div className="text-center">
            <Clock className="h-4 w-4 mx-auto" />
          </div>
          <div></div>
        </div>

        {/* Tracks */}
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="grid grid-cols-[auto_2fr_2fr_1fr_auto_auto] gap-4 px-4 py-3 rounded hover:bg-white/5 transition group items-center"
            >
              <div className="text-center text-gray-400 group-hover:text-white">
                {index + 1}
              </div>
              <Link
                to={`/music/${track.id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={track.image || "/placeholder.svg"}
                  alt={track.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <p className="font-medium text-white group-hover:text-primary">
                    {track.name}
                  </p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
              </Link>
              <div className="text-sm text-gray-400">{track.album}</div>
              <div className="text-sm text-gray-400">{track.date}</div>
              <div className="text-sm text-gray-400 text-center">
                {track.duration}
              </div>
              {canEdit && (
                <button
                  onClick={() => removeTrack(track.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded transition"
                  title="Remove from album"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
