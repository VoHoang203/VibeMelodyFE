import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "../store/usePlayerStore"; // bạn đã có store này theo code trước đó

export default function AiSongCards({ songs = [] }) {
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);

  if (!songs.length) return null;

  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {songs.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
        >
          <img
            src={s.imageUrl || "/placeholder.svg"}
            alt={s.title}
            className="w-14 h-14 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{s.title}</p>
            <p className="text-gray-400 text-xs truncate">{s.artist}</p>
          </div>
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90"
            onClick={() =>
              setCurrentSong({
                _id: s.id,
                title: s.title,
                artist: s.artist,
                artistId: s.artistId,
                imageUrl: s.imageUrl,
                audioUrl: s.audioUrl,
                duration: s.duration,
              })
            }
          >
            <Play className="w-4 h-4 text-black" />
          </Button>
        </div>
      ))}
    </div>
  );
}
