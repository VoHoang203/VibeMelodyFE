import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, LayoutList, Heart } from "lucide-react";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";

export function LeftSidebar() {
  const [activeFilter, setActiveFilter] = useState("artists");
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [likedSongsCount, setLikedSongsCount] = useState(0);

  const user = useUserStore((s) => s.user);

  // load library khi đã login
  useEffect(() => {
    if (!user) {
      // chưa login hoặc đã logout → clear list
      setArtists([]);
      setAlbums([]);
      setLikedSongsCount(0);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/me/library");
        if (cancelled) return;
        setArtists(data.artists || []);
        setAlbums(data.albums || []);
        setLikedSongsCount(data.likedSongsCount ?? 0);
      } catch (err) {
        console.error("Failed to load library:", err);
        if (!cancelled) {
          setArtists([]);
          setAlbums([]);
          setLikedSongsCount(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <aside className="w-72 bg-black p-2">
      <div className="bg-neutral-900 rounded-lg p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Library</h3>
          <button className="text-gray-400 hover:text-white transition-colors">
            <LayoutList className="h-5 w-5" />
          </button>
        </div>

        {/* Liked Songs */}
        <Link
          to="/liked-songs"
          className="flex items-center gap-3 px-3 py-3 rounded-lg mb-4 bg-linear-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
            <Heart className="h-6 w-6 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Liked Songs</p>
            <p className="text-xs text-white/80">
              Playlist • {likedSongsCount} song
              {likedSongsCount !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveFilter("artists")}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === "artists"
                ? "bg-neutral-800 text-white"
                : "bg-transparent text-gray-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => setActiveFilter("albums")}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === "albums"
                ? "bg-neutral-800 text-white"
                : "bg-transparent text-gray-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            Albums
          </button>
        </div>

        {/* Header Recent + search icon (UI thôi) */}
        <div className="flex items-center gap-2 mb-4">
          <button className="p-2 rounded-full hover:bg-neutral-800 transition-colors">
            <Search className="h-4 w-4 text-gray-400" />
          </button>
          <span className="text-sm text-gray-400">Recent</span>
        </div>

        {/* List artists / albums */}
        <div className="space-y-2">
          {activeFilter === "artists" &&
            artists.map((artist) => (
              <Link
                key={artist._id}
                to={`/artist/${artist._id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <img
                  src={artist.imageUrl || "/placeholder.svg"}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {artist.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Nghệ sĩ • {artist.followersCount} người theo dõi
                  </p>
                </div>
              </Link>
            ))}

          {activeFilter === "artists" && artists.length === 0 && (
            <p className="text-xs text-gray-500 px-2">
              Bạn chưa follow nghệ sĩ nào.
            </p>
          )}

          {activeFilter === "albums" &&
            albums.map((album) => (
              <Link
                key={album._id}
                to={`/album/${album._id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <img
                  src={album.imageUrl || "/placeholder.svg"}
                  alt={album.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {album.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Album • {album.artistName}
                    {typeof album.tracksCount === "number" &&
                      ` • ${album.tracksCount} tracks`}
                  </p>
                </div>
              </Link>
            ))}

          {activeFilter === "albums" && albums.length === 0 && (
            <p className="text-xs text-gray-500 px-2">
              Bạn chưa thích album nào.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
