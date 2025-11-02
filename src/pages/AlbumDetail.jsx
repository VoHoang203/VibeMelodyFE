import { Play, Shuffle, Download, MoreHorizontal, Clock, Plus, Search, X } from "lucide-react"
import {Link} from "react-router-dom"
import { useState } from "react"

const albumData = {
  id: 1,
  name: "Gymv2",
  type: "Public Playlist",
  artist: "Vo Anh Hoang",
  totalTracks: 36,
  duration: "1 hour 30 minutes",
  coverImages: ["/gym-1.jpg", "/gym-2.jpg", "/gym-3.jpg", "/gym-4.jpg"],
  tracks: [
    {
      id: 1,
      name: "Vengeance",
      artist: "iwilldiehere",
      album: "Vengeance",
      date: "Oct 7, 2023",
      duration: "2:14",
      image: "/vengeance.jpg",
    },
    {
      id: 2,
      name: "JUDAS",
      artist: "SAY3AM",
      album: "JUDAS",
      date: "Oct 7, 2023",
      duration: "1:57",
      image: "/judas.jpg",
    },
    {
      id: 3,
      name: "POOR - Sped Up",
      artist: "gqtis",
      album: "POOR (Sped Up)",
      date: "Oct 7, 2023",
      duration: "2:10",
      image: "/poor.jpg",
    },
  ],
}

const availableSongs = [
  { id: 4, name: "Dark Nights", artist: "Vo Anh Hoang", duration: "3:24", image: "/dark-nights.jpg" },
  { id: 5, name: "Electric Soul", artist: "Vo Anh Hoang", duration: "2:45", image: "/electric-soul.jpg" },
  { id: 6, name: "Midnight Drive", artist: "Vo Anh Hoang", duration: "3:12", image: "/midnight-drive.jpg" },
  { id: 7, name: "Neon Dreams", artist: "Vo Anh Hoang", duration: "2:58", image: "/neon-dreams.jpg" },
  { id: 8, name: "City Lights", artist: "Vo Anh Hoang", duration: "3:35", image: "/city-lights.jpg" },
]

export default function AlbumDetailPage() {
  const [showAddSongs, setShowAddSongs] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [tracks, setTracks] = useState(albumData.tracks)

  const toggleSongSelection = (songId) => {
    setSelectedSongs((prev) => (prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]))
  }

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const removeTrack = (trackId) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId))
  }

  const addSelectedSongs = () => {
    const songsToAdd = availableSongs.filter((song) => selectedSongs.includes(song.id))
    const newTracks = songsToAdd.map((song) => ({
      ...song,
      album: albumData.name,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    }))
    setTracks((prev) => [...prev, ...newTracks])
    setShowAddSongs(false)
    setSelectedSongs([])
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen">
      {/* Header with gradient background */}
      <div className="relative bg-linear-to-b from-red-900 to-black pt-16 pb-6 px-8">
        <div className="flex items-end gap-6">
          {/* Album Cover Grid */}
          <div className="grid grid-cols-2 gap-1 w-56 h-56 shrink-0">
            {albumData.coverImages.map((img, index) => (
              <img
                key={index}
                src={img || "/placeholder.svg"}
                alt={`Cover ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ))}
          </div>

          {/* Album Info */}
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium mb-2">{albumData.type}</p>
            <h1 className="text-7xl font-bold mb-6 text-white">{albumData.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{albumData.artist}</span>
              <span>•</span>
              <span>
                {tracks.length} songs, about {albumData.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-linear-to-b from-black/40 to-black px-8 py-6">
        <div className="flex items-center gap-4">
          <button className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition">
            <Play className="h-6 w-6 text-black fill-black ml-1" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
            <Shuffle className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowAddSongs(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add Songs</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <div className="flex-1"></div>
          <button className="text-sm text-gray-400 hover:text-white font-medium flex items-center gap-2">
            List
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
              <div className="text-center text-gray-400 group-hover:text-white">{index + 1}</div>
              <Link to={`/music/${track.id}`} className="flex items-center gap-3">
                <img
                  src={track.image || "/placeholder.svg"}
                  alt={track.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <p className="font-medium text-white group-hover:text-primary">{track.name}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
              </Link>
              <div className="text-sm text-gray-400">{track.album}</div>
              <div className="text-sm text-gray-400">{track.date}</div>
              <div className="text-sm text-gray-400 text-center">{track.duration}</div>
              <button
                onClick={() => removeTrack(track.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded transition"
                title="Remove from album"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAddSongs && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowAddSongs(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-neutral-900 rounded-lg z-50 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-800">
              <h2 className="text-2xl font-bold">Add Songs to Album</h2>
              <p className="text-sm text-gray-400 mt-1">Select songs from your library</p>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => toggleSongSelection(song.id)}
                      className="flex items-center gap-4 p-3 rounded hover:bg-neutral-800 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSongs.includes(song.id)}
                        onChange={() => {}}
                        className="w-5 h-5 rounded border-gray-600"
                      />
                      <img src={song.image || "/placeholder.svg"} alt={song.name} className="w-12 h-12 rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-white">{song.name}</p>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                      </div>
                      <span className="text-sm text-gray-400">{song.duration}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">No songs found</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-neutral-800 flex gap-3">
              <button
                onClick={() => {
                  setShowAddSongs(false)
                  setSelectedSongs([])
                  setSearchQuery("")
                }}
                className="flex-1 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={addSelectedSongs}
                disabled={selectedSongs.length === 0}
                className="flex-1 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-black font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedSongs.length} {selectedSongs.length === 1 ? "song" : "songs"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
