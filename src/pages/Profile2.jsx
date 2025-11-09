import {
  Settings,
  Share2,
  BadgeCheck,
  Edit2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";

export default function ArtistProfilePage() {
  const { id } = useParams(); // artistId
  const user = useUserStore((s) => s.user);

  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editData, setEditData] = useState({ name: "", bio: "" });

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // preview ảnh trong modal edit
  const [imagePreview, setImagePreview] = useState(null);

  const isOwner = useMemo(() => {
    if (!artist || !user) return false;
    const uid = user._id || user.id;
    return String(uid) === String(artist._id);
  }, [artist, user]);

  // load artist main
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/artists/${id}/main`);
        if (cancelled) return;

        setArtist(data.artist);
        setTopTracks(data.topTracks || []);
        setAlbums(data.topAlbums || []);

        setEditData({
          name: data.artist?.name || "",
          bio: data.artist?.bio || "",
        });

        setImagePreview(data.artist?.avatar || null);
      } catch (err) {
        console.error("Failed to load artist:", err);
        toast.error("Không tải được thông tin artist");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // follow-status (chỉ khi không phải owner và đã login)
  useEffect(() => {
    if (!id || !user || isOwner) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get(`/artists/${id}/follow-status`);
        if (cancelled) return;
        setIsFollowing(!!data.following);
      } catch (err) {
        console.error("Failed to load follow status:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user, isOwner]);

  async function toggleFollow() {
    if (!user) {
      toast.error("Bạn cần đăng nhập để follow artist này");
      return;
    }
    if (!id || followLoading) return;

    setFollowLoading(true);
    const prevFollowing = isFollowing;
    let prevFollowers = artist?.followersCount || 0;

    if (!prevFollowing) {
      // follow
      setIsFollowing(true);
      setArtist((prev) =>
        prev
          ? { ...prev, followersCount: prev.followersCount + 1 }
          : prev
      );
      try {
        const { data } = await api.post(`/artists/${id}/follow`);
        const count =
          typeof data.followersCount === "number"
            ? data.followersCount
            : prevFollowers + 1;
        setArtist((prev) =>
          prev ? { ...prev, followersCount: count } : prev
        );
      } catch (err) {
        console.error("Follow failed:", err);
        setIsFollowing(prevFollowing);
        setArtist((prev) =>
          prev ? { ...prev, followersCount: prevFollowers } : prev
        );
      } finally {
        setFollowLoading(false);
      }
    } else {
      // unfollow
      setIsFollowing(false);
      setArtist((prev) =>
        prev
          ? {
              ...prev,
              followersCount: Math.max(0, prev.followersCount - 1),
            }
          : prev
      );
      try {
        const { data } = await api.delete(`/artists/${id}/follow`);
        const count =
          typeof data.followersCount === "number"
            ? data.followersCount
            : prevFollowers - 1;
        setArtist((prev) =>
          prev ? { ...prev, followersCount: Math.max(0, count) } : prev
        );
      } catch (err) {
        console.error("Unfollow failed:", err);
        setIsFollowing(prevFollowing);
        setArtist((prev) =>
          prev ? { ...prev, followersCount: prevFollowers } : prev
        );
      } finally {
        setFollowLoading(false);
      }
    }
  }

  // chọn file ảnh -> preview base64
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSaveProfile() {
    try {
      const payload = {
        stageName: editData.name,
        bio: editData.bio,
      };

      if (imagePreview) {
        payload.imageUrl = imagePreview;
      }

      const { data } = await api.put("/artists/me/profile", payload);
      setArtist((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              bio: data.bio,
              avatar: data.avatar || prev.avatar,
            }
          : prev
      );
      toast.success("Cập nhật hồ sơ artist thành công");
      setShowEditModal(false);
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error("Không cập nhật được hồ sơ");
    }
  }

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleChangePassword() {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Vui lòng điền đầy đủ mật khẩu");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    try {
      setSavingPassword(true);
      await api.put("/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Change password failed:", err);
      const msg =
        err.response?.data?.message || "Không đổi được mật khẩu";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading && !artist) {
    return <div className="p-8">Loading artist…</div>;
  }

  if (!artist) {
    return <div className="p-8">Artist not found</div>;
  }

  return (
    <div className="p-8">
      {/* Artist Profile Header */}
      <div className="flex items-start gap-8 mb-12">
        <div className="relative group">
          <img
            src={artist.avatar || "/placeholder.svg"}
            alt={artist.name}
            className="w-48 h-48 rounded-full object-cover"
          />
          {artist.isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
              <BadgeCheck className="h-8 w-8 text-black" />
            </div>
          )}
          {isOwner && (
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <Upload className="h-8 w-8 text-white" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-5xl font-bold">{artist.name}</h1>
            {artist.isVerified && (
              <BadgeCheck className="h-8 w-8 text-primary" />
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditModal(true)}
                className="text-gray-400 hover:text-white"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
            )}
          </div>
          {artist.username && (
            <p className="text-gray-400 mb-2">{artist.username}</p>
          )}
          {artist.isVerified && (
            <p className="text-sm text-primary mb-2">Verified Artist</p>
          )}
          <p className="text-gray-300 mb-6">{artist.bio}</p>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <span className="text-2xl font-bold">
                {artist.followersCount?.toLocaleString?.() ||
                  artist.followersCount}
              </span>
              <span className="text-gray-400 ml-2">Followers</span>
            </div>
            <div>
              <span className="text-2xl font-bold">
                {artist.followingCount}
              </span>
              <span className="text-gray-400 ml-2">Following</span>
            </div>
            <div>
              <span className="text-2xl font-bold">
                {artist.tracksCount}
              </span>
              <span className="text-gray-400 ml-2">Tracks</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOwner && (
              <Button
                className="bg-primary hover:bg-primary/90 text-black"
                disabled={followLoading}
                onClick={toggleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 bg-transparent"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {isOwner && (
              <Button
                variant="outline"
                size="icon"
                className="border-white/20 bg-transparent"
                onClick={() => setShowPasswordModal(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Bài hát nổi bật</h2>
        <div className="space-y-3">
          {topTracks.map((track, index) => (
            <Link
              key={track._id}
              to={`/music/${track._id}`}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
            >
              <span className="text-gray-400 w-6">{index + 1}</span>
              <img
                src={track.imageUrl || "/placeholder.svg"}
                alt={track.title}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {track.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {track.likesCount} likes
                </p>
              </div>
            </Link>
          ))}
          {topTracks.length === 0 && (
            <p className="text-gray-400 text-sm">
              Chưa có bài hát nổi bật.
            </p>
          )}
        </div>
      </div>

      {/* Albums */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {albums.map((album) => (
            <Link
              key={album._id}
              to={`/album/${album._id}`}
              className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition group"
            >
              <div className="relative mb-4">
                <img
                  src={album.imageUrl || "/placeholder.svg"}
                  alt={album.title}
                  className="w-full aspect-square rounded object-cover"
                />
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">
                {album.title}
              </h3>
              <p className="text-sm text-gray-400">
                {album.releaseYear} • {album.likesCount} likes
              </p>
            </Link>
          ))}
          {albums.length === 0 && (
            <p className="text-gray-400 text-sm">
              Chưa có album nổi bật.
            </p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Edit Artist Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Profile Picture
                </label>
                {/* input file ẩn */}
                <input
                  id="artist-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="artist-avatar-input"
                  className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-primary/50 transition cursor-pointer flex flex-col items-center justify-center"
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-32 h-32 rounded-full mx-auto object-cover"
                      />
                      <p className="text-sm text-primary">Click to change image</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        Click to upload new image
                      </p>
                    </>
                  )}
                </label>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Bio
                </label>
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-24"
                  placeholder="Tell your fans about yourself..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-black"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-neutral-900 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-black"
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
