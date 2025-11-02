import { useState } from "react"
import { Plus, Edit, Eye, EyeOff, Trash2, Music } from "lucide-react"
import { Link } from "react-router-dom";


const mockAlbums = [
  {
    id: 1,
    name: "Gymv2",
    artist: "Vo Anh Hoang",
    year: 2023,
    tracks: 36,
    visible: true,
    image: "/gym-1.jpg",
  },
  {
    id: 2,
    name: "Urban Nights",
    artist: "Vo Anh Hoang",
    year: 2024,
    tracks: 12,
    visible: true,
    image: "/urban-night.jpg",
  },
  {
    id: 3,
    name: "Coastal Dreams",
    artist: "Vo Anh Hoang",
    year: 2024,
    tracks: 8,
    visible: false,
    image: "/coastal-beach.jpg",
  },
]

export default function ManageAlbumsPage() {
  const [albums, setAlbums] = useState(mockAlbums)

  const toggleVisibility = (albumId) => {
    setAlbums((prev) => prev.map((album) => (album.id === albumId ? { ...album, visible: !album.visible } : album)))
  }

  const deleteAlbum = (albumId) => {
    if (confirm("Are you sure you want to delete this album?")) {
      setAlbums((prev) => prev.filter((album) => album.id !== albumId))
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Albums</h1>
          <p className="text-muted-foreground">Create, edit, and manage your music albums</p>
        </div>
        <Link
          to="/create-album"
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition"
        >
          <Plus className="h-5 w-5" />
          Create New Album
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className={`bg-card border border-border rounded-lg overflow-hidden hover:bg-card/80 transition ${!album.visible ? "opacity-60" : ""}`}
          >
            <div className="relative aspect-square">
              <img src={album.image || "/placeholder.svg"} alt={album.name} className="w-full h-full object-cover" />
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
    </div>
  )
}
