"use client";

import { Link} from "react-router-dom"

import { Search, LayoutList, Heart } from "lucide-react";

const playlists = [
  {
    name: "Urban Nights",
    artist: "Various Artists",
    image: "/urban-night.jpg",
  },
  {
    name: "Coastal Dreaming",
    artist: "Various Artists",
    image: "/coastal-beach.jpg",
  },
  {
    name: "Eastern Dreams",
    artist: "Various Artists",
    image: "/eastern-music.jpg",
  },
  {
    name: "Test Album",
    artist: "Taylor Swift",
    image: "/singer-songwriter-stage.png",
  },
];

export function LeftSidebar() {
  return (
    <aside className="w-72 bg-black p-2">
      <div className="bg-neutral-900 rounded-lg p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Library</h3>
          <button className="text-gray-400 hover:text-white transition-colors">
            <LayoutList className="h-5 w-5" />
          </button>
        </div>

        <Link
          to="/liked-songs"
          className="flex items-center gap-3 px-3 py-3 rounded-lg mb-4 bg-linear-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Liked Songs</p>
            <p className="text-xs text-white/80">Playlist • 233 songs</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <button className="px-3 py-1.5 rounded-full bg-neutral-800 text-sm text-white hover:bg-neutral-700 transition-colors">
            Playlists
          </button>
          <button className="px-3 py-1.5 rounded-full bg-transparent text-sm text-gray-400 hover:bg-neutral-800 hover:text-white transition-colors">
            Artists
          </button>
          <button className="px-3 py-1.5 rounded-full bg-transparent text-sm text-gray-400 hover:bg-neutral-800 hover:text-white transition-colors">
            Albums
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button className="p-2 rounded-full hover:bg-neutral-800 transition-colors">
            <Search className="h-4 w-4 text-gray-400" />
          </button>
          <span className="text-sm text-gray-400">Recent</span>
        </div>

        <div className="space-y-2">
          {playlists.map((playlist, index) => (
            <Link
              key={index}
              to={`/album/${index + 1}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <img
                src={playlist.image || "/placeholder.svg"}
                alt={playlist.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {playlist.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Album • {playlist.artist}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
