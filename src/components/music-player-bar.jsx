import { useEffect, useMemo, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Mic2, ListMusic, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "../store/usePlayerStore";

const fmt = (sec = 0) => {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export function MusicPlayer() {
  const audioRef = useRef(null);

  const {
    currentSong,
    isPlaying,
    queue,
    currentIndex,

    volume,
    currentTime,
    duration,

    // actions
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    setProgress,
    setDuration,
  } = usePlayerStore();

  // Khi play/pause đổi → điều khiển audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {/* autoplay fail */});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Khi bài hát đổi → cập nhật src, reset time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (audio.src !== currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
    }
    audio.currentTime = 0;
    usePlayerStore.setState({ currentTime: 0 }); // sync store
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentSong]);

  // Gắn listeners (timeupdate, loadedmetadata, ended, volumechange)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime || 0);
    const onLoaded = () => {
      const d = audio.duration || 0;
      setDuration(d);
    };
    const onEnded = () => {
      // Khi kết thúc bài → phó thác logic cho store (repeat/shuffle đã xử lý trong playNext)
      playNext();
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playNext, setDuration, setProgress]);

  // Đồng bộ volume từ store → audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume; // 0..1
  }, [volume]);

  // Handlers
  const onSeek = (vals) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextSec = vals?.[0] ?? 0;
    audio.currentTime = nextSec;
    setProgress(nextSec);
  };

  const onVolume = (vals) => {
    const v = (vals?.[0] ?? 0) / 100;
    setVolume(v);
  };

  // UI helpers
  // const isActiveShuffle = shuffle;
  // const repeatLabel = repeat === "off" ? "" : repeat === "one" ? "1" : "∞";

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Currently Playing */}
      <div className="flex items-center gap-4 w-80">
        <img
          src={currentSong?.imageUrl || "/abstract-soundscape.png"}
          alt="Album cover"
          className="w-14 h-14 rounded object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {currentSong?.title || "Nothing playing"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {currentSong?.artist || ""}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 max-w-2xl px-8">
        <div className="flex items-center justify-center gap-4 mb-2">

          <button className="text-gray-400 hover:text-white transition" onClick={playPrevious} title="Previous">
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition"
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-black fill-black" />
            ) : (
              <Play className="h-5 w-5 text-black fill-black ml-0.5" />
            )}
          </button>

          <button className="text-gray-400 hover:text-white transition" onClick={playNext} title="Next">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10 text-right">
            {fmt(currentTime)}
          </span>
          <Slider
            value={[Math.min(currentTime, duration || 0)]}
            min={0}
            max={Math.max(1, Math.floor(duration || 0))}
            step={1}
            onValueChange={onSeek}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-10">
            {fmt(duration || 0)}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 w-80 justify-end">
        <button className="text-gray-400 hover:text-white transition p-2" title="Lyrics">
          <Mic2 className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-white transition p-2" title="Queue">
          <ListMusic className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-white transition p-2" title="Volume">
          <Volume2 className="h-4 w-4" />
        </button>
        <Slider
          value={[Math.round((volume ?? 0.7) * 100)]}
          min={0}
          max={100}
          step={1}
          onValueChange={onVolume}
          className="w-24"
        />
      </div>
    </div>
  );
}
