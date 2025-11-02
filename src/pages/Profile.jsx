import { Settings, Share2, Lock, UserPlus, Upload, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom";
import { useState } from "react"

const userProfile = {
  name: "Võ Anh Hoàng",
  username: "@voanhoang",
  avatar: "/placeholder.svg?height=200&width=200",
  bio: "Music lover and playlist curator. Always discovering new sounds.",
  followers: 1234,
  following: 567,
  tracks: 36,
  playlists: [
    { id: 1, name: "Gymv2", tracks: 36, image: "/modern-gym-interior.png" },
    { id: 2, name: "Chill Vibes", tracks: 24, image: "/placeholder.svg?height=160&width=160" },
    { id: 3, name: "Workout Mix", tracks: 18, image: "/placeholder.svg?height=160&width=160" },
  ],
}

export default function ProfilePage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: userProfile.name,
    bio: userProfile.bio,
  })

  return (
    <div className="p-8">
      {/* Profile Header */}
      <div className="flex items-start gap-8 mb-12">
        <div className="relative group">
          <img
            src={userProfile.avatar || "/placeholder.svg"}
            alt={userProfile.name}
            className="w-48 h-48 rounded-full object-cover"
          />
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <Upload className="h-8 w-8 text-white" />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-bold">{userProfile.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditModal(true)}
              className="text-gray-400 hover:text-white"
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-400 mb-2">{userProfile.username}</p>
          <p className="text-gray-300 mb-6">{userProfile.bio}</p>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <span className="text-2xl font-bold">{userProfile.followers}</span>
              <span className="text-gray-400 ml-2">Followers</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{userProfile.following}</span>
              <span className="text-gray-400 ml-2">Following</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{userProfile.tracks}</span>
              <span className="text-gray-400 ml-2">Tracks</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-black">Follow</Button>
            <Button variant="outline" size="icon" className="border-white/20 bg-transparent">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-white/20 bg-transparent">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-12 bg-white/5 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        <div className="space-y-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-4 w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <Lock className="h-5 w-5 text-primary" />
            <div className="text-left">
              <h3 className="font-semibold">Change Password</h3>
              <p className="text-sm text-gray-400">Update your password</p>
            </div>
          </button>
          <Link
            to="/register-artist"
            className="flex items-center gap-4 w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <UserPlus className="h-5 w-5 text-primary" />
            <div className="text-left">
              <h3 className="font-semibold">Register as Artist</h3>
              <p className="text-sm text-gray-400">Become an artist and upload your music</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Playlists */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {userProfile.playlists.map((playlist) => (
            <Link
              key={playlist.id}
              to={`/album/${playlist.id}`}
              className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
            >
              <div className="relative mb-4">
                <img
                  src={playlist.image || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-full aspect-square rounded object-cover"
                />
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400">{playlist.tracks} tracks</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Profile Picture</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-primary/50 transition cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload new image</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Name</label>
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
                  placeholder="Tell us about yourself..."
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

      {/* Password Modal */}
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
