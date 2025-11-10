import { useRef, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { usePlayerStore } from "../store/usePlayerStore";

export function WaveformPlayer({ track, markers = [] }) {
  const waveformRef = useRef(null);

  // state từ player store
  const currentSong = usePlayerStore((s) => s.currentSong);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const durationStore = usePlayerStore((s) => s.duration);
  const setProgress = usePlayerStore((s) => s.setProgress);
  console.log(markers);
  // waveform này có phải bài đang phát?
  const isActive =
    currentSong &&
    (currentSong?._id === track?._id ||
      currentSong?.audioUrl === track?.audioUrl);

  // duration ưu tiên từ store khi active; fallback theo track
  const duration = (isActive && durationStore) || track?.duration || 0;

  // progress theo store nếu active
  const progress = duration && isActive ? currentTime / duration : 0;

  // bars giữ nguyên
  const bars = 200;
  const waveformData = useMemo(() => {
    return Array.from({ length: bars }, (_, i) => {
      const p = i / bars;
      const h = Math.sin(p * Math.PI * 4) * 0.5 + 0.5;
      return 20 + h * 60;
    });
  }, []);

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const handleWaveformClick = (e) => {
    if (!waveformRef.current || !duration) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = Math.min(1, Math.max(0, x / rect.width));
    const newTime = clickProgress * duration;
    if (isActive) setProgress(newTime);
  };

  // click vào marker → seek đúng timestamp
  const handleMarkerClick = (ts) => {
    if (!isActive || !duration) return;
    const t = Math.min(Math.max(ts, 0), duration);
    setProgress(t);
  };

  return (
    <div className="space-y-2">
      <div
        ref={waveformRef}
        className="group relative h-24 cursor-pointer"
        onClick={handleWaveformClick}
        title={isActive ? "Click to seek" : "Play this track to enable seeking"}
      >
        {/* Waveform bars */}
        <div className="flex h-full items-end justify-between gap-px">
          {waveformData.map((height, i) => {
            const barProgress = i / bars;
            const isPlayed = barProgress <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors ${
                  isPlayed
                    ? "bg-primary"
                    : "bg-gray-600 group-hover:bg-gray-500"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Markers từ comments: avatar + tooltip */}
        {Array.isArray(markers) &&
          markers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(m.timestamp);
              }}
              className="absolute bottom-0 -translate-x-1/2 transform focus:outline-none"
              style={{ left: `${(m.left ?? 0) * 100}%` }}
              title={`@${m.username || "user"} · ${formatTime(
                m.timestamp || 0
              )}`}
            >
              <Avatar className="h-8 w-8 border-2 border-[#1a1a1a] ring-1 ring-black/30">
                <img
                  src={m.avatarUrl || "/placeholder.svg?height=32&width=32"}
                  alt={m.username || "Commenter"}
                />
              </Avatar>
            </button>
          ))}

        {/* Progress indicator */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(isActive ? currentTime : 0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
