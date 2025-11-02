import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save, Search, X } from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AlbumTrackList } from "@/components/album-track-list";

const mockArtistSongs = [
  {
    id: "song-1",
    name: "Vengeance",
    artist: "Vo Anh Hoang",
    duration: 214,
    imageUrl: "/gym-1.jpg",
    fileUrl: "",
  },
  {
    id: "song-2",
    name: "JUDAS",
    artist: "Vo Anh Hoang",
    duration: 197,
    imageUrl: "/gym-2.jpg",
    fileUrl: "",
  },
  {
    id: "song-3",
    name: "POOR - Sped Up",
    artist: "Vo Anh Hoang",
    duration: 210,
    imageUrl: "/gym-3.jpg",
    fileUrl: "",
  },
  {
    id: "song-4",
    name: "Dark Ambient",
    artist: "Vo Anh Hoang",
    duration: 245,
    imageUrl: "/urban-night.jpg",
    fileUrl: "",
  },
  {
    id: "song-5",
    name: "Coastal Vibes",
    artist: "Vo Anh Hoang",
    duration: 189,
    imageUrl: "/coastal-beach.jpg",
    fileUrl: "",
  },
];

export default function CreateAlbumPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const albumId = searchParams.get("id");
  const isEditing = !!albumId;

  const [albumName, setAlbumName] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tracks, setTracks] = useState([
    {
      id: "1",
      name: "Intro",
      artist: "Sample Artist",
      duration: 180,
      imageUrl: "/abstract-music-cover.png",
      fileUrl: "",
    },
    {
      id: "2",
      name: "Main Track",
      artist: "Sample Artist",
      duration: 240,
      imageUrl: "/abstract-music-cover.png",
      fileUrl: "",
    },
    {
      id: "3",
      name: "Outro",
      artist: "Sample Artist",
      duration: 200,
      imageUrl: "/abstract-music-cover.png",
      fileUrl: "",
    },
  ]);

  const [showAddSongsPopup, setShowAddSongsPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);

  useEffect(() => {
    if (isEditing) {
      console.log("[v0] Loading album data for ID:", albumId);
      setAlbumName("Gymv2");
      setArtist("Vo Anh Hoang");
      setReleaseYear("2023");
      setCoverImage("/gym-1.jpg");
    }
  }, [albumId, isEditing]);

  const handleCoverImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAlbum = () => {
    console.log("[v0] Saving album:", {
      albumName,
      artist,
      releaseYear,
      tracks: tracks.map((t, i) => ({ ...t, order: i + 1 })),
    });
    alert(
      isEditing ? "Album updated successfully!" : "Album created successfully!"
    );
    router.push("/manage-albums");
  };

  const handleAddSelectedSongs = () => {
    const songsToAdd = mockArtistSongs.filter((song) =>
      selectedSongs.includes(song.id)
    );
    setTracks((prev) => [...prev, ...songsToAdd]);
    setShowAddSongsPopup(false);
    setSelectedSongs([]);
    setSearchQuery("");
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const filteredSongs = mockArtistSongs.filter(
    (song) =>
      song.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tracks.some((track) => track.id === song.id)
  );

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Album Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image</Label>
                <div className="space-y-3">
                  {coverImage ? (
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt="Album cover"
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-secondary flex items-center justify-center">
                      <Plus className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
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

              <Button onClick={handleSaveAlbum} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? "Update Album" : "Save Album"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Track List ({tracks.length})
              </h2>
              <Button
                onClick={() => setShowAddSongsPopup(true)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Track
              </Button>
            </div>
            <AlbumTrackList
              tracks={tracks}
              onReorder={setTracks}
              onRemove={(trackId) =>
                setTracks((prev) => prev.filter((t) => t.id !== trackId))
              }
            />
          </Card>
        </div>
      </div>

      {showAddSongsPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Songs to Album</h2>
              <button
                onClick={() => {
                  setShowAddSongsPopup(false);
                  setSelectedSongs([]);
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
                  placeholder="Search songs..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredSongs.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    No songs found
                  </p>
                ) : (
                  filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => toggleSongSelection(song.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedSongs.includes(song.id)
                          ? "border-primary bg-primary/10"
                          : "border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={song.imageUrl || "/placeholder.svg"}
                          alt={song.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{song.name}</h3>
                          <p className="text-sm text-gray-400 truncate">
                            {song.artist}
                          </p>
                        </div>
                        <span className="text-sm text-gray-400 font-mono">
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedSongs.length} song(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSongsPopup(false);
                    setSelectedSongs([]);
                    setSearchQuery("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSelectedSongs}
                  disabled={selectedSongs.length === 0}
                >
                  Add {selectedSongs.length > 0 && `(${selectedSongs.length})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
