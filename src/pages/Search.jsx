import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockSongs = [
  {
    id: 1,
    name: "Urban Jungle",
    artist: "City Lights",
    album: "Night Vibes",
    duration: "3:24",
    image: "/urban-cityscape.png",
  },
  {
    id: 2,
    name: "Neon Dreams",
    artist: "Electric Soul",
    album: "Synthwave",
    duration: "4:12",
    image: "/neon-sign.png",
  },
  {
    id: 3,
    name: "Midnight Drive",
    artist: "Night Runners",
    album: "Highway",
    duration: "3:45",
    image: "/midnight-scene.png",
  },
];

const mockAlbums = [
  {
    id: 1,
    name: "Gymv2",
    artist: "Võ Anh Hoàng",
    tracks: 36,
    image: "/modern-gym-interior.png",
  },
  {
    id: 2,
    name: "Urban Nights",
    artist: "Various Artists",
    tracks: 24,
    image: "/urban-night.jpg",
  },
  {
    id: 3,
    name: "Neon Lights",
    artist: "Night Runners",
    tracks: 12,
    image: "/neon-lights.jpg",
  },
  {
    id: 4,
    name: "Summer Vibes",
    artist: "Coastal Kids",
    tracks: 18,
    image: "/summer-beach-day.png",
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8">
      <div className="max-w-xl mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm bài hát, album, nghệ sĩ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
          />
        </div>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="bg-transparent border-b border-white/10 rounded-none h-auto p-0 mb-6">
          <TabsTrigger
            value="songs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white px-6 py-3"
          >
            Bài hát
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white px-6 py-3"
          >
            Album
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="mt-0">
          <div className="space-y-2">
            {mockSongs.map((song) => (
              <Link
                key={song.id}
                to={`/music/${song.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition group"
              >
                <div className="relative">
                  <img
                    src={song.image || "/placeholder.svg"}
                    alt={song.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{song.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {song.artist}
                  </p>
                </div>
                <p className="text-sm text-gray-400 hidden md:block">
                  {song.album}
                </p>
                <p className="text-sm text-gray-400">{song.duration}</p>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="albums" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {mockAlbums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
              >
                <div className="relative mb-4">
                  <img
                    src={album.image || "/placeholder.svg"}
                    alt={album.name}
                    className="w-full aspect-square rounded object-cover"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-white mb-1 truncate">
                  {album.name}
                </h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {album.tracks} bài hát
                </p>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
