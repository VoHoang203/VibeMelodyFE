import { Play, SkipBack, SkipForward, Repeat, Shuffle, Mic2, ListMusic, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function MusicPlayer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between">
      {/* Currently Playing */}
      <div className="flex items-center gap-4 w-80">
        <img src="/abstract-soundscape.png" alt="Album cover" className="w-14 h-14 rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">Urban Jungle</p>
          <p className="text-xs text-gray-400 truncate">City Lights</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 max-w-2xl px-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <button className="text-gray-400 hover:text-white transition">
            <Shuffle className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition">
            <SkipBack className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition">
            <Play className="h-5 w-5 text-black fill-black ml-0.5" />
          </button>
          <button className="text-gray-400 hover:text-white transition">
            <SkipForward className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition">
            <Repeat className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10 text-right">0:00</span>
          <Slider defaultValue={[0]} max={100} step={1} className="flex-1" />
          <span className="text-xs text-gray-400 w-10">0:36</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 w-80 justify-end">
        <button className="text-gray-400 hover:text-white transition p-2">
          <Mic2 className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-white transition p-2">
          <ListMusic className="h-4 w-4" />
        </button>
        <button className="text-gray-400 hover:text-white transition p-2">
          <Volume2 className="h-4 w-4" />
        </button>
        <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
      </div>
    </div>
  )
}
