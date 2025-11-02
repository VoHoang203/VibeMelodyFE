// src/components/AudioWaveCanvas.jsx
import React, { useEffect, useRef, useState, useCallback } from "react"

export default function AudioWaveCanvas({
  src,              // string | undefined — Cloudinary URL. Nếu không truyền, bạn có thể dùng input file bên dưới.
  height = 160,     // chiều cao canvas
  fftSize = 256,    // phải là lũy thừa của 2: 256/512/1024...
  barColor = (v) => `rgb(${v},118,138)`, // màu mỗi cột theo biên độ
  bgColor = "rgb(173,216,230)",
  showTime = true,
  className = "",
}) {
  const audioRef = useRef(null)
  const canvasRef = useRef(null)

  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const dataArrayRef = useRef(null)
  const rafRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [localSrc, setLocalSrc] = useState(src || "") // ưu tiên prop src, nếu không có sẽ set từ file input

  // Format mm:ss
  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0))
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, "0")}`
  }

  // Tạo / nối WebAudio nodes một lần sau khi audio có metadata
  const setupAudioGraph = useCallback(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    // Khởi tạo AudioContext khi có user gesture (play)
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new Ctx()
    }

    const audioCtx = audioCtxRef.current

    // Nếu đã có source cũ thì bỏ
    try {
      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
        analyserRef.current = null
      }
    } catch {}

    // Tạo Analyser
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = fftSize
    analyserRef.current = analyser

    // Nối audio element vào analyser (không bắt buộc phải nối tới destination vì audio element tự phát)
    const srcNode = audioCtx.createMediaElementSource(audioEl)
    sourceRef.current = srcNode
    srcNode.connect(analyser)
    analyser.connect(audioCtx.destination) // Cho phép đi qua để nghe, nếu muốn “ẩn” âm thanh thì bỏ dòng này

    const bufferLength = analyser.frequencyBinCount
    dataArrayRef.current = new Uint8Array(bufferLength)
  }, [fftSize])

  // Vẽ bars
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    if (!canvas || !analyser || !dataArray) return

    const ctx = canvas.getContext("2d")
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    // scale canvas for higher DPI
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.scale(dpr, dpr)

    // background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    analyser.getByteFrequencyData(dataArray)

    const bufferLength = dataArray.length
    const barWidth = width / bufferLength

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] // 0..255
      const barHeight = (v / 255) * height
      ctx.fillStyle = typeof barColor === "function" ? barColor(v) : barColor
      // Vẽ từ đáy đi lên
      ctx.fillRect(i * barWidth, height - barHeight, Math.max(1, barWidth - 1), barHeight)
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [bgColor, barColor])

  // Điều khiển play/pause
  const togglePlay = async () => {
    const audioEl = audioRef.current
    if (!audioEl) return
    // iOS/Chrome yêu cầu resume AudioContext sau user gesture
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume()
    } else if (!audioCtxRef.current) {
      // lần đầu play
      await (async () => {
        const Ctx = window.AudioContext || window.webkitAudioContext
        audioCtxRef.current = new Ctx()
      })()
    }

    if (audioEl.paused) {
      await audioEl.play()
      setIsPlaying(true)
      // nếu graph chưa nối thì nối
      if (!analyserRef.current || !sourceRef.current) {
        setupAudioGraph()
      }
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(draw)
    } else {
      audioEl.pause()
      setIsPlaying(false)
      cancelAnimationFrame(rafRef.current)
    }
  }

  // Cập nhật currentTime theo audio
  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return
    const timeUpdate = () => setCurrentTime(audioEl.currentTime || 0)
    const loaded = () => {
      setDuration(Math.floor(audioEl.duration || 0))
      setCurrentTime(0)
    }
    audioEl.addEventListener("timeupdate", timeUpdate)
    audioEl.addEventListener("loadedmetadata", loaded)
    return () => {
      audioEl.removeEventListener("timeupdate", timeUpdate)
      audioEl.removeEventListener("loadedmetadata", loaded)
    }
  }, [])

  // Nếu prop src thay đổi bên ngoài
  useEffect(() => {
    if (src) setLocalSrc(src)
  }, [src])

  // Seek khi click vào canvas
  const onCanvasClick = (e) => {
    const audioEl = audioRef.current
    const canvas = canvasRef.current
    if (!audioEl || !canvas || !duration) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(1, Math.max(0, x / rect.width))
    audioEl.currentTime = percent * duration
  }

  // Input file → set ObjectURL vào audio
  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLocalSrc(url)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  // Dọn dẹp
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      try {
        sourceRef.current?.disconnect()
        analyserRef.current?.disconnect()
      } catch {}
      if (audioCtxRef.current) {
        // Không bắt buộc close, nhưng tốt
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  return (
    <div className={`w-full ${className}`}>
      {/* Audio element ẩn (có controls tùy chọn) */}
      <audio ref={audioRef} src={localSrc || undefined} preload="metadata" />

      {/* Controls */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={togglePlay}
          disabled={!localSrc}
          className="px-3 py-1 rounded bg-orange-500 text-white disabled:opacity-50"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <input type="file" accept="audio/*" onChange={onPickFile} />

        <div className="text-sm text-gray-600 ml-auto">
          {showTime && (
            <>
              <span>{formatTime(currentTime)}</span>
              <span> / </span>
              <span>{formatTime(duration)}</span>
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        style={{
          width: "100%",
          height,
          position: "relative",
          cursor: localSrc ? "pointer" : "default",
          background: "#add8e6",
          borderRadius: 8,
          overflow: "hidden",
        }}
        onClick={onCanvasClick}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        {/* Progress line */}
        {duration > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 2,
              background: "#fff",
              left: `${(currentTime / duration) * 100}%`,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  )
}
