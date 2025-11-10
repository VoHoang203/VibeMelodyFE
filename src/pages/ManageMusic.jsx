import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit2, Trash2, Play, Search, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";

const formatDuration = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

export default function ManageMusicPage() {
  const user = useUserStore((s) => s.user);
  const artistId = user?._id || user?.id;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingTrack, setEditingTrack] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    musicFile: null,
  });

  const itemsPerPage = 10;

  // load danh sách song của artist
  useEffect(() => {
    if (!artistId) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/songs", {
          params: { artistId },
        });
        setSongs(Array.isArray(data) ? data : []);
        console.log(data)
      } catch (err) {
        console.error("Failed to load songs:", err);
        toast.error("Không tải được danh sách bài hát");
      } finally {
        setLoading(false);
      }
    })();
  }, [artistId]);

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((song) => {
      const title = song.title?.toLowerCase() || "";
      return title.includes(q);
    });
  }, [songs, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSongs.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSongs = filteredSongs.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this song?")) return;

    try {
      await api.delete(`/songs/${id}`);
      setSongs((prev) => prev.filter((s) => String(s._id) !== String(id)));
      toast.success("Đã xóa bài hát thành công");
    } catch (err) {
      console.error("Delete song failed:", err);
      toast.error("Không xóa được bài hát");
    }
  };

  const handleEdit = async (song) => {
    if (!song?._id) return;
    try {
      const { data } = await api.get(`/songs/${song._id}`);
      setEditingTrack(data);
      setEditForm({
        title: data.title || "",
        artist: data.artist || "",
        musicFile: null,
      });
    } catch (err) {
      console.error("Get song detail failed:", err);
      toast.error("Không tải được chi tiết bài hát");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTrack?._id) return;

    try {
      await api.patch(`/songs/${editingTrack._id}`, {
        title: editForm.title,
        artistName: editForm.artist,
        duration: editingTrack.duration, // giữ nguyên duration cũ
      });

      // update lại trong list FE
      setSongs((prev) =>
        prev.map((s) =>
          String(s._id) === String(editingTrack._id)
            ? {
                ...s,
                title: editForm.title,
                artist: editForm.artist,
              }
            : s
        )
      );

      if (editForm.musicFile) {
        toast("Đổi file nhạc chưa được hỗ trợ ở API hiện tại.");
      }

      toast.success("Cập nhật bài hát thành công");
      setEditingTrack(null);
    } catch (err) {
      console.error("Update song failed:", err);
      toast.error("Không cập nhật được bài hát");
    }
  };

  if (!user || !user.isArtist) {
    return (
      <div className="p-8">
        <Link to="/">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <p className="text-muted-foreground">
          Bạn cần đăng nhập bằng tài khoản Artist để quản lý bài hát.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Music</h1>
              <p className="text-muted-foreground">
                View and manage all your uploaded songs
              </p>
            </div>
            <Link to="/upload">
              <Button className="bg-primary hover:bg-primary/90">
                Upload New Song
              </Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:border-primary focus:outline-none text-foreground"
            />
          </div>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          {loading && songs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Đang tải danh sách bài hát...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 w-12">#</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Upload Date</th>
                      <th className="px-4 py-3 text-center">Likes</th>
                      <th className="px-4 py-3 text-center">Duration</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSongs.map((song, index) => (
                      <tr
                        key={song._id}
                        className="border-b border-border hover:bg-secondary/50 transition-colors group"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                              <img
                                src={song.imageUrl || "/placeholder.svg"}
                                alt={song.title}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {song.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {song.artist}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {song.createdAt
                            ? new Date(song.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {(song.likesCount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          {formatDuration(song.duration)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(song)}
                              className="p-2 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary transition"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(song._id)}
                              className="p-2 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {currentSongs.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-sm text-muted-foreground"
                        >
                          Không có bài hát nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredSongs.length > 0 && (
                <div className="px-4 py-4 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredSongs.length)} of{" "}
                    {filteredSongs.length} songs
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded ${
                                currentPage === pageNum
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-secondary text-muted-foreground"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {editingTrack && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setEditingTrack(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-lg z-50 p-6">
            <h2 className="text-2xl font-bold mb-4">Edit Song</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Song Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  value={editForm.artist}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      artist: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Update Music File (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        musicFile: e.target.files?.[0] || null,
                      }))
                    }
                    className="hidden"
                    id="music-file-input"
                  />
                  <label
                    htmlFor="music-file-input"
                    className="flex items-center gap-2 w-full px-4 py-2 bg-secondary border border-border rounded cursor-pointer hover:border-primary transition text-foreground"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {editForm.musicFile
                        ? editForm.musicFile.name
                        : "Choose new music file..."}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (Hiện tại API chưa hỗ trợ đổi file, chỉ đổi metadata.)
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTrack(null)}
                className="flex-1 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
