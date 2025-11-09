import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Play, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

const fmtDur = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  // debounce 350ms
  const debouncedQ = useMemo(() => {
    let t;
    return (q, cb) => {
      clearTimeout(t);
      t = setTimeout(() => cb(q), 350);
    };
  }, []);

  // fetch songs + albums + artists
  useEffect(() => {
    setLoading(true);
    debouncedQ(searchQuery, async (q) => {
      try {
        const [sRes, aRes, artRes] = await Promise.all([
          api.get("/allsongs", { params: { q: q || "" } }),
          api.get("/allalbums", { params: { q: q || "" } }),
          api.get("/artists/search", { params: { q: q || "" } }),
        ]);

        const sList = Array.isArray(sRes.data)
          ? sRes.data
          : sRes.data.items || [];
        const aList = Array.isArray(aRes.data)
          ? aRes.data
          : aRes.data.items || [];
        const artList = Array.isArray(artRes.data)
          ? artRes.data
          : artRes.data.items || [];

        setSongs(
          sList.map((s) => ({
            id: s._id,
            name: s.title,
            artist: s.artistName || s.artist,
            album: s.albumTitle || "",
            duration: fmtDur(s.duration || s.durationSec || 0),
            image: s.imageUrl,
          }))
        );

        setAlbums(
          aList.map((a) => ({
            id: a._id,
            name: a.title,
            artist: a.artistName,
            tracks: Array.isArray(a.songs) ? a.songs.length : a.tracks || 0,
            image: a.imageUrl,
          }))
        );

        setArtists(
          artList.map((u) => ({
            id: u._id,
            name: u.name,
            username: u.username,
            followers: u.followersCount || 0,
            avatar: u.avatar,
            isVerified: u.isVerified,
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Không tải được kết quả tìm kiếm");
      } finally {
        setLoading(false);
      }
    });
  }, [searchQuery, debouncedQ]);

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
          <TabsTrigger
            value="artists"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-gray-400 data-[state=active]:text-white px-6 py-3"
          >
            Nghệ sĩ
          </TabsTrigger>
        </TabsList>

        {/* SONGS */}
        <TabsContent value="songs" className="mt-0">
          {loading && songs.length === 0 ? (
            <p className="text-sm text-gray-400">Đang tải…</p>
          ) : songs.length === 0 ? (
            <p className="text-sm text-gray-400">Không có bài hát phù hợp</p>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => (
                <Link
                  key={song.id}
                  to={`/music/${song.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition group"
                >
                  <div className="relative">
                    <img
                      src={song.image || "/placeholder.svg"}
                      alt={song.name}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {song.name}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                  {song.album && (
                    <p className="text-sm text-gray-400 hidden md:block">
                      {song.album}
                    </p>
                  )}
                  <p className="text-sm text-gray-400">{song.duration}</p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ALBUMS */}
        <TabsContent value="albums" className="mt-0">
          {loading && albums.length === 0 ? (
            <p className="text-sm text-gray-400">Đang tải…</p>
          ) : albums.length === 0 ? (
            <p className="text-sm text-gray-400">Không có album phù hợp</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {albums.map((album) => (
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
                  <p className="text-sm text-gray-400 truncate">
                    {album.artist}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {album.tracks} bài hát
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ARTISTS */}
        <TabsContent value="artists" className="mt-0">
          {loading && artists.length === 0 ? (
            <p className="text-sm text-gray-400">Đang tải…</p>
          ) : artists.length === 0 ? (
            <p className="text-sm text-gray-400">Không có nghệ sĩ phù hợp</p>
          ) : (
            <div className="space-y-2">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artist/${artist.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition group"
                >
                  <img
                    src={artist.avatar || "/placeholder.svg"}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">
                        {artist.name}
                      </p>
                      {artist.isVerified && (
                        <BadgeCheck className="h-4 w-4 text-primary fill-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      Nghệ sĩ •{" "}
                      {artist.followers?.toLocaleString
                        ? artist.followers.toLocaleString()
                        : artist.followers}{" "}
                      người theo dõi
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
