import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit2, Trash2, Play, Search, Upload } from "lucide-react"
import { Link } from "react-router-dom";

// Mock data for artist's songs
const mockSongs = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  title: `Song Title ${i + 1}`,
  artist: "Vo Anh Hoang",
  album: i % 3 === 0 ? "Gymv2" : i % 3 === 1 ? "Urban Nights" : "Coastal Dreams",
  duration: `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
  plays: Math.floor(Math.random() * 100000),
  likes: Math.floor(Math.random() * 10000),
  uploadDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
  coverUrl: `/placeholder.svg?height=50&width=50&query=album+cover+${i + 1}`,
}))

export default function ManageMusicPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [songs, setSongs] = useState(mockSongs)
  const [editingTrack, setEditingTrack] = useState(null)
  const [editForm, setEditForm] = useState({ title: "", artist: "", album: "", musicFile: null })

  const itemsPerPage = 10
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSongs = filteredSongs.slice(startIndex, endIndex)

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this song?")) {
      setSongs((prev) => prev.filter((song) => song.id !== id))
    }
  }

  const handleEdit = (song) => {
    setEditingTrack(song)
    setEditForm({ title: song.title, artist: song.artist, album: song.album, musicFile: null })
  }

  const handleSaveEdit = () => {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === editingTrack.id
          ? { ...song, title: editForm.title, artist: editForm.artist, album: editForm.album }
          : song,
      ),
    )
    setEditingTrack(null)
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
              <p className="text-muted-foreground">View and manage all your uploaded songs</p>
            </div>
            <Link to="/upload">
              <Button className="bg-primary hover:bg-primary/90">Upload New Song</Button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search songs or albums..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:border-primary focus:outline-none text-foreground"
            />
          </div>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Album</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3 text-center">Likes</th>
                  <th className="px-4 py-3 text-center">Duration</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSongs.map((song, index) => (
                  <tr key={song.id} className="border-b border-border hover:bg-secondary/50 transition-colors group">
                    <td className="px-4 py-3 text-muted-foreground">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                          <image
                            src={song.coverUrl || "/placeholder.svg"}
                            alt={song.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{song.album}</td>
                    <td className="px-4 py-3 text-muted-foreground">{song.uploadDate}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{song.likes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{song.duration}</td>
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
                          onClick={() => handleDelete(song.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredSongs.length)} of {filteredSongs.length} songs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
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
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {editingTrack && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setEditingTrack(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-lg z-50 p-6">
            <h2 className="text-2xl font-bold mb-4">Edit Song</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Song Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Artist</label>
                <input
                  type="text"
                  value={editForm.artist}
                  onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Album</label>
                <input
                  type="text"
                  value={editForm.album}
                  onChange={(e) => setEditForm({ ...editForm, album: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Update Music File (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setEditForm({ ...editForm, musicFile: e.target.files?.[0] || null })}
                    className="hidden"
                    id="music-file-input"
                  />
                  <label
                    htmlFor="music-file-input"
                    className="flex items-center gap-2 w-full px-4 py-2 bg-secondary border border-border rounded cursor-pointer hover:border-primary transition text-foreground"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {editForm.musicFile ? editForm.musicFile.name : "Choose new music file..."}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep the current file. Supported formats: MP3, WAV, FLAC, M4A, OGG
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
  )
}
