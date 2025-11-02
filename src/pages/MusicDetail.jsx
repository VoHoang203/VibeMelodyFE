import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useParams } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { Button } from "../components/ui/button";
import { Play } from "lucide-react";

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [artist, setArtist] = useState(null);
  const [comments, setComments] = useState([]);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);

  useEffect(() => {
    (async () => {
      // BE: tạo endpoint populate hoặc 3 calls tách
      const { data } = await api.get(`/songs/${id}`); // trả { song, artist, comments }
      setSong(data.song);
      setArtist(data.artist);
      setComments(data.comments || []);
    })();
  }, [id]);

  if (!song) return <div className="p-8">Loading…</div>;

  const mapped = {
    _id: song._id,
    title: song.title,
    artist: song.artist,
    imageUrl: song.imageUrl,
    audioUrl: song.audioUrl,
    duration: song.duration,
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4">
        <img src={song.imageUrl} className="w-36 h-36 rounded object-cover" />
        <div>
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <p className="text-sm text-muted-foreground">{artist?.fullName || song.artist}</p>
          <Button className="mt-3" onClick={() => setCurrentSong(mapped)}>
            <Play className="h-4 w-4 mr-2" /> Play
          </Button>
        </div>
      </div>

      <h2 className="mt-8 mb-2 font-semibold text-lg">Comments</h2>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c._id} className="text-sm text-foreground/90">
            <span className="font-medium">{c.userName}</span>: {c.content}
          </li>
        ))}
      </ul>
    </div>
  );
}