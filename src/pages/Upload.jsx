import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit2 } from "lucide-react"
import { Link } from "react-router-dom"
import { MusicUploader } from "@/components/music-uploader"
import { UploadedTrackCard } from "@/components/uploaded-track-card"
import { api } from "../lib/api"  // nhớ baseURL = http://localhost:5000/api

const ARTIST_ID = "690675c47a201801c29ee385"
const ARTIST_NAME_FALLBACK = "Sơn Tùng M-TP"

export default function UploadPage() {
  const [tracks, setTracks] = useState([])
  const [editingTrack, setEditingTrack] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", artist: "", keepFile: true })
  const [saving, setSaving] = useState(false)

  const handleTracksUploaded = (newTracks) => {
    setTracks(prev => [...prev, ...newTracks])
  }

  const handleRemoveTrack = (id) => setTracks(prev => prev.filter(t => t.id !== id))

  const handleEditTrack = (track) => {
    setEditingTrack(track)
    setEditForm({ name: track.name, artist: track.artist, keepFile: true })
  }

  const handleSaveEdit = () => {
    setTracks(prev => prev.map(t => t.id === editingTrack.id ? { ...t, name: editForm.name, artist: editForm.artist } : t))
    setEditingTrack(null)
  }

  // ---- GỌI API TRỰC TIẾP BẰNG AXIOS (RẤT NGẮN GỌN) ----
  async function uploadOneSong({ artistId, artistName, title, duration, audioFile, imageFile, albumId }) {
    const fd = new FormData()
    fd.append("artistId", artistId)
    fd.append("artistName", artistName)
    fd.append("title", title)
    fd.append("duration", String(duration || 0))
    if (albumId) fd.append("albumId", albumId)
    if (imageFile) fd.append("imageFile", imageFile)
    fd.append("audioFile", audioFile)

    // log nhanh để chắc chắn form-data có gì
    console.log("[upload] sending", { artistId, artistName, title, duration, hasImage: !!imageFile, hasAudio: !!audioFile })

    const res = await api.post("/songs", fd)
    return res.data // { created: [...] }
  }

  const saveAllToServer = async () => {
    setSaving(true)
    try {
      const withFile = tracks.filter(t => !!t.file)
      if (withFile.length === 0) {
        alert("Không có bản ghi nào có file audio hợp lệ. Kiểm tra MusicUploader có trả về 'file' chưa.")
        return
      }

      const results = []
      for (const t of withFile) {
        try {
          const payload = {
            artistId: ARTIST_ID,
            artistName: (t.artist || ARTIST_NAME_FALLBACK).trim(),
            title: t.name,
            duration: Number(t.duration || 0),
            audioFile: t.file,           // 🔴 bắt buộc
            imageFile: t.imageFile || undefined, // tuỳ chọn
            // albumId: ...
          }
          const res = await uploadOneSong(payload)
          console.log("[upload] OK:", t.name, res)
          results.push(res)
        } catch (e) {
          console.error("[upload] FAIL:", t.name, e?.response?.status, e?.response?.data || e.message)
        }
      }

      if (results.length === 0) {
        alert("Không upload được bản nào. Xem Console/Network tab để biết lỗi cụ thể.")
        return
      }

      setTracks([]) // clear sau khi xong
      alert(`Đã upload ${results.length}/${withFile.length} bài lên server!`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Upload Music</h1>
          <p className="text-muted-foreground">Upload multiple music files at once and manage your library</p>
        </div>

        <div className="grid gap-8">
          <Card className="p-6 bg-card border-border">
            <MusicUploader onTracksUploaded={handleTracksUploaded} />
          </Card>

          {tracks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Uploaded (local) — {tracks.length}</h2>
                <Button onClick={saveAllToServer} disabled={saving}>
                  {saving ? "Saving..." : "Save all to server"}
                </Button>
              </div>
              <div className="grid gap-4">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <UploadedTrackCard track={track} onRemove={handleRemoveTrack} />
                    </div>
                    <button
                      onClick={() => handleEditTrack(track)}
                      className="p-2 rounded-full hover:bg-neutral-800 transition"
                      title="Edit song"
                    >
                      <Edit2 className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingTrack && (
        <>
          <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setEditingTrack(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-lg z-50 p-6">
            <h2 className="text-2xl font-bold mb-4">Edit Song</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Song Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Artist</label>
                <input
                  type="text"
                  value={editForm.artist}
                  onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded focus:border-primary focus:outline-none text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="keepFile"
                  checked={editForm.keepFile}
                  onChange={(e) => setEditForm({ ...editForm, keepFile: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600"
                />
                <label htmlFor="keepFile" className="text-sm">Keep old music file (only update information)</label>
              </div>
              {!editForm.keepFile && (
                <div>
                  <label className="block text-sm font-medium mb-2">New music file</label>
                  <input
                    type="file"
                    accept="audio/*"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded text-foreground"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        // thay file cho track đang edit
                        setTracks(prev => prev.map(t => t.id === editingTrack.id ? { ...t, file: f } : t))
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTrack(null)}
                className="flex-1 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
