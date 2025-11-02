import { Settings, Share2, BadgeCheck, Edit2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";
import { useState } from "react"

const artistProfile = {
  name: "Võ Anh Hoàng",
  username: "@voanhoang",
  avatar: "/placeholder.svg?height=200&width=200",
  bio: "Electronic music producer and DJ. Creating vibes since 2020.",
  isVerified: true,
  followers: 125400,
  following: 89,
  tracks: 156,
  albums: [
    { id: 1, name: "Gymv2", tracks: 36, image: "/modern-gym-interior.png", year: 2023 },
    { id: 2, name: "Midnight Dreams", tracks: 24, image: "/placeholder.svg?height=160&width=160", year: 2023 },
    { id: 3, name: "Summer Vibes", tracks: 18, image: "/placeholder.svg?height=160&width=160", year: 2022 },
    { id: 4, name: "Urban Legends", tracks: 22, image: "/placeholder.svg?height=160&width=160", year: 2022 },
  ],
  topTracks: [
    { id: 1, name: "Vengeance", plays: "2.5M", image: "/placeholder.svg?height=60&width=60" },
    { id: 2, name: "JUDAS", plays: "1.8M", image: "/placeholder.svg?height=60&width=60" },
    { id: 3, name: "POOR - Sped Up", plays: "1.2M", image: "/placeholder.svg?height=60&width=60" },
  ],
}

export default function ArtistProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editData, setEditData] = useState({
    name: artistProfile.name,
    bio: artistProfile.bio,
  })

  return (
    <div className="p-8">
      {/* Artist Profile Header */}
      <div className="flex items-start gap-8 mb-12">
        <div className="relative group">
          <img
            src={artistProfile.avatar || "/placeholder.svg"}
            alt={artistProfile.name}
            className="w-48 h-48 rounded-full object-cover"
          />
          {artistProfile.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
              <BadgeCheck className="h-8 w-8 text-black" />
            </div>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <Upload className="h-8 w-8 text-white" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-5xl font-bold">{artistProfile.name}</h1>
            {artistProfile.isVerified && <BadgeCheck className="h-8 w-8 text-primary" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditModal(true)}
              className="text-gray-400 hover:text-white"
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-400 mb-2">{artistProfile.username}</p>
          <p className="text-sm text-primary mb-2">Verified Artist</p>
          <p className="text-gray-300 mb-6">{artistProfile.bio}</p>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <span className="text-2xl font-bold">{artistProfile.followers.toLocaleString()}</span>
              <span className="text-gray-400 ml-2">Followers</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{artistProfile.following}</span>
              <span className="text-gray-400 ml-2">Following</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{artistProfile.tracks}</span>
              <span className="text-gray-400 ml-2">Tracks</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-black">Follow</Button>
            <Button variant="outline" size="icon" className="border-white/20 bg-transparent">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 bg-transparent"
              onClick={() => setShowPasswordModal(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Bài hát nổi bật</h2>
        <div className="space-y-3">
          {artistProfile.topTracks.map((track, index) => (
            <Link
              key={track.id}
              to={`/music/${track.id}`}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
            >
              <span className="text-gray-400 w-6">{index + 1}</span>
              <img
                src={track.image || "/placeholder.svg"}
                alt={track.name}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{track.name}</h3>
                <p className="text-sm text-gray-400">{track.plays} lượt nghe</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Albums */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {artistProfile.albums.map((album) => (
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
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{album.name}</h3>
              <p className="text-sm text-gray-400">
                {album.year} • {album.tracks} tracks
              </p>
            </Link>
          ))}
        </div>
      </div>

      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Edit Artist Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Profile Picture</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-primary/50 transition cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload new image</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Artist Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-24"
                  placeholder="Tell your fans about yourself..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-black">Save Changes</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Current Password</label>
                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">New Password</label>
                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Confirm New Password</label>
                <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-black">Save Changes</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
