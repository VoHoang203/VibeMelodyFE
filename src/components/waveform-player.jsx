import { useState, useRef, useEffect } from "react"
import { Avatar } from "@/components/ui/avatar"

export function WaveformPlayer({ track }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track.duration || 144)
  const waveformRef = useRef(null)

  // Generate waveform bars
  const bars = 200
  const waveformData = Array.from({ length: bars }, (_, i) => {
    const progress = i / bars
    const height = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5
    return 20 + height * 60
  })

  const progress = currentTime / duration

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleWaveformClick = (e) => {
    if (!waveformRef.current) return
    const rect = waveformRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickProgress = x / rect.width
    setCurrentTime(clickProgress * duration)
  }

  // Simulate playback
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false)
          return 0
        }
        return prev + 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, duration])

  // Mock comment avatars on waveform
  const commentPositions = [0.15, 0.32, 0.48, 0.65, 0.78]

  return (
    <div className="space-y-2">
      <div ref={waveformRef} className="relative h-24 cursor-pointer group" onClick={handleWaveformClick}>
        {/* Waveform bars */}
        <div className="flex items-end justify-between h-full gap-px">
          {waveformData.map((height, i) => {
            const barProgress = i / bars
            const isPlayed = barProgress <= progress

            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors ${
                  isPlayed ? "bg-orange-500" : "bg-gray-600 group-hover:bg-gray-500"
                }`}
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>

        {/* Comment avatars on waveform */}
        {commentPositions.map((pos, i) => (
          <div key={i} className="absolute bottom-0 transform -translate-x-1/2" style={{ left: `${pos * 100}%` }}>
            <Avatar className="h-8 w-8 border-2 border-[#1a1a1a]">
              <img src={`/placeholder-icon.png?height=32&width=32&text=${i}`} alt="Commenter" />
            </Avatar>
          </div>
        ))}

        {/* Progress indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
