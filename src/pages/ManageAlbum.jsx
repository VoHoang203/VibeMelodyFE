// ManageAlbumsPage.jsx
import { useEffect, useState } from "react";
import { Plus, Edit, Eye, EyeOff, Trash2, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../lib/api";

const ARTIST_ID = "690675c47a201801c29ee385";
const ARTIST_NAME_FALLBACK = "Sơn Tùng M-TP";

export default function ManageAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Load albums theo artist ---
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/albums", { params: { artistId: ARTIST_ID } });
        const list = Array.isArray(data) ? data : (data.items || []);
        // chuẩn hoá field cho UI
        const mapped = list.map((a) => ({
          id: a._id,
          name: a.title,
          artist: a.artist || ARTIST_NAME_FALLBACK,
          year: a.releaseYear,
          tracks: Array.isArray(a.songs) ? a.songs.length : (a.tracks || 0),
          visible: a.isHidden ? false : true,
          image: a.imageUrl,
        }));
        setAlbums(mapped);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách album");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Hide/Unhide (PATCH /albums/:id/hide) ---
  const toggleVisibility = async (albumId) => {
    const idx = albums.findIndex((a) => a.id === albumId);
    if (idx < 0) return;
    const current = albums[idx];
    const nextVisible = !current.visible;

    // optimistic update
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, visible: nextVisible } : a))
    );

    try {
      await api.patch(`/albums/${albumId}/hide`, { hidden: !nextVisible });
      toast.success(nextVisible ? "Album hiển thị" : "Album đã ẩn");
    } catch (e) {
      // rollback
      setAlbums((prev) =>
        prev.map((a) => (a.id === albumId ? { ...a, visible: !nextVisible } : a))
      );
      console.error(e);
      toast.error("Không thể cập nhật trạng thái ẩn/hiện");
    }
  };

  // (tuỳ chọn) Xoá local; nếu BE có DELETE /albums/:id thì gọi tại đây
  const deleteAlbum = async (albumId) => {
    if (!confirm("Are you sure you want to delete this album?")) return;
    // optimistic local
    const backup = albums;
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    try {
      // nếu có API:
      // await api.delete(`/albums/${albumId}`);
      toast.success("Đã xoá (local)");
    } catch (e) {
      setAlbums(backup);
      toast.error("Xoá thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Albums</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage your music albums
          </p>
        </div>
        <Link
          to="/create-album"
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition"
        >
          <Plus className="h-5 w-5" />
          Create New Album
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading albums…</p>
      ) : albums.length === 0 ? (
        <div className="text-muted-foreground">
          Chưa có album nào. Hãy tạo mới nhé!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className={`bg-card border border-border rounded-lg overflow-hidden hover:bg-card/80 transition ${
                !album.visible ? "opacity-60" : ""
              }`}
            >
              <div className="relative aspect-square">
                <img
                  src={album.image || "/placeholder.svg"}
                  alt={album.name}
                  className="w-full h-full object-cover"
                />
                {!album.visible && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <EyeOff className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{album.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{album.artist}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Music className="h-4 w-4" />
                  <span>
                    {album.tracks} tracks • {album.year}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/create-album?id=${album.id}`}
                    className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-center text-sm font-medium transition"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleVisibility(album.id)}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition"
                    title={album.visible ? "Hide album" : "Show album"}
                  >
                    {album.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteAlbum(album.id)}
                    className="px-3 py-2 bg-destructive/20 hover:bg-destructive/40 text-destructive rounded-lg transition"
                    title="Delete album"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
