import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api } from "../lib/api";
import { toast } from "react-hot-toast";

const ARTIST_ID = "690675c47a201801c29ee385";
const ARTIST_NAME_FALLBACK = "Sơn Tùng M-TP";

/* ---------- util ---------- */
const fmtDur = (s = 0) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* ---------- mini track list with drag&drop ---------- */
function TrackList({ tracks, onReorder, onRemove }) {
  const dragIdx = useRef(null);
  return (
    <div className="space-y-2">
      {tracks.map((t, i) => (
        <div
          key={t.id}
          draggable
          onDragStart={() => (dragIdx.current = i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const from = dragIdx.current;
            if (from === i) return;
            const next = tracks.slice();
            const [moved] = next.splice(from, 1);
            next.splice(i, 0, moved);
            onReorder(next);
          }}
          className="rounded-lg border border-neutral-800 hover:border-neutral-700 transition p-4 bg-neutral-900/40"
        >
          <div className="flex items-center gap-4">
            <div className="w-6 text-sm text-neutral-400 select-none">
              {i + 1}
            </div>
            <img
              src={t.imageUrl || "/placeholder.svg"}
              alt={t.name}
              className="h-12 w-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{t.name}</div>
              <div className="text-xs text-neutral-400 truncate">
                {t.artist}
              </div>
            </div>
            <div className="text-sm text-neutral-400 font-mono">
              {fmtDur(t.duration)}
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className="ml-3 rounded p-2 hover:bg-neutral-800"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- main page ---------- */
export default function CreateAlbumPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const albumId = sp.get("id");
  const isEditing = !!albumId;

  const [albumName, setAlbumName] = useState("");
  const [artist, setArtist] = useState(ARTIST_NAME_FALLBACK);
  const [releaseYear, setReleaseYear] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  const [tracks, setTracks] = useState([]);

  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [available, setAvailable] = useState([]);
  const [picked, setPicked] = useState([]);

  /* ---------- API inline (dùng api wrapper) ---------- */
  const fetchArtistSongs = async (q) => {
    const params = { artistId: ARTIST_ID, unassigned: true };
    if (q && q.trim()) params.q = q.trim();
    const { data } = await api.get("/songs", { params });
    const list = Array.isArray(data) ? data : data.songs || [];
    return list.map((s) => ({
      id: s._id,
      name: s.title,
      artist: ARTIST_NAME_FALLBACK,
      duration: s.durationSec || s.duration || 0,
      imageUrl: s.imageUrl,
      fileUrl: "",
    }));
  };

  const getAlbum = async (id) => {
    const { data } = await api.get(`/albums/${id}`);
    return data;
  };

  const createAlbum = async ({ title, releaseYear, coverFile, songIds }) => {
    const fd = new FormData();
    fd.append("artistId", ARTIST_ID);
    fd.append("artistName", artist || ARTIST_NAME_FALLBACK);
    fd.append("title", title);
    fd.append("releaseYear", String(releaseYear));
    fd.append("songIds", JSON.stringify(songIds));
    if (coverFile) fd.append("imageFile", coverFile);
    const { data } = await api.post("/albums", fd);
    return data;
  };

  const updateAlbum = async (
    id,
    { title, releaseYear, coverFile, songIds }
  ) => {
    const fd = new FormData();
    fd.append("artistId", ARTIST_ID);
    fd.append("artistName", artist || ARTIST_NAME_FALLBACK);
    fd.append("title", title);
    fd.append("releaseYear", String(releaseYear));
    fd.append("songIds", JSON.stringify(songIds));
    if (coverFile) fd.append("imageFile", coverFile);
    const { data } = await api.put(`/albums/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  };

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const a = await getAlbum(albumId);
        setAlbumName(a.title || "");
        setArtist(a.artist || ARTIST_NAME_FALLBACK);
        setReleaseYear(String(a.releaseYear || ""));
        setCoverPreview(a.imageUrl || "");
        setTracks(
          (a.songs || []).map((s) => ({
            id: s._id,
            name: s.title,
            artist: ARTIST_NAME_FALLBACK,
            duration: s.durationSec || 0,
            imageUrl: s.imageUrl,
            fileUrl: "",
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Không tải được album");
      }
    })();
  }, [albumId, isEditing]);

  /* ---------- load list bài khi mở popup / search ---------- */
  useEffect(() => {
    if (!showAdd) return;
    (async () => {
      try {
        const songs = await fetchArtistSongs(searchQuery);
        const existing = new Set(tracks.map((t) => t.id));
        setAvailable(songs.filter((s) => !existing.has(s.id)));
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách bài hát");
      }
    })();
  }, [showAdd, searchQuery, tracks]);

  /* ---------- handlers ---------- */
  const onUploadCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result || "");
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!albumName || !artist || !releaseYear) {
      toast.error("Vui lòng nhập đủ thông tin album");
      return;
    }
    const songIds = tracks.map((t) => t.id);
    try {
      if (isEditing) {
        await updateAlbum(albumId, {
          title: albumName,
          releaseYear,
          coverFile,
          songIds,
        });
        toast.success("Đã cập nhật album");
      } else {
        await createAlbum({
          title: albumName,
          releaseYear,
          coverFile,
          songIds,
        });
        toast.success("Đã tạo album");
      }
      navigate("/manage-albums");
    } catch (e) {
      console.error(e);
      toast.error("Lưu album thất bại");
    }
  };

  const addPicked = () => {
    const add = available.filter((s) => picked.includes(s.id));
    setTracks((prev) => [...prev, ...add]);
    setShowAdd(false);
    setPicked([]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/manage-albums">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            {isEditing ? "Edit Album" : "Create Album"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update album information and track order"
              : "Create a new album and arrange track order"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Album Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image</Label>
                <div className="space-y-3">
                  {coverPreview ? (
                    <img
                      src={coverPreview || "/placeholder.svg"}
                      alt="cover"
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-secondary/40 flex items-center justify-center">
                      <Plus className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={onUploadCover}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="album-name">Album Name</Label>
                <Input
                  id="album-name"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Enter album name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Release Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                />
              </div>

              <Button onClick={onSave} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? "Update Album" : "Save Album"}
              </Button>
            </div>
          </Card>

          {/* Tracks */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Track List ({tracks.length})
              </h2>
              <Button
                onClick={() => setShowAdd(true)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Track
              </Button>
            </div>
            <TrackList
              tracks={tracks}
              onReorder={setTracks}
              onRemove={(id) => setTracks((p) => p.filter((t) => t.id !== id))}
            />
          </Card>
        </div>
      </div>

      {/* Popup Add Songs */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Songs to Album</h2>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setPicked([]);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-neutral-800 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setShowAdd(true)}
                  placeholder="Search songs..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {available.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No songs found
                  </p>
                ) : (
                  available.map((s) => {
                    const selected = picked.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() =>
                          setPicked((p) =>
                            p.includes(s.id)
                              ? p.filter((x) => x !== s.id)
                              : [...p, s.id]
                          )
                        }
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={s.imageUrl || "/placeholder.svg"}
                            alt={s.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{s.name}</h3>
                            <p className="text-sm text-gray-400 truncate">
                              {s.artist}
                            </p>
                          </div>
                          <span className="text-sm text-gray-400 font-mono">
                            {fmtDur(s.duration)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {picked.length} song(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAdd(false);
                    setPicked([]);
                    setSearchQuery("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const add = available.filter((s) => picked.includes(s.id));
                    setTracks((prev) => [...prev, ...add]);
                    setShowAdd(false);
                    setPicked([]);
                    setSearchQuery("");
                  }}
                  disabled={picked.length === 0}
                >
                  Add {picked.length > 0 && `(${picked.length})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
