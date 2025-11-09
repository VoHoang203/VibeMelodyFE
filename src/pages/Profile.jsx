import { Settings, Share2, Lock, Upload, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const storeUser = useUserStore((s) => s.user);

  const [user, setUser] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editData, setEditData] = useState({ name: "" });

  const [imagePreview, setImagePreview] = useState(null);

  const isOwner = useMemo(() => !!storeUser, [storeUser]);

  useEffect(() => {
    if (!storeUser) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/me/main");

        if (cancelled) return;

        setUser(data.user || storeUser);
        setLikedSongs(data.likedSongs || []);
        setLikedAlbums(data.likedAlbums || []);

        setEditData({
          name: data.user?.fullName || data.user?.name || "",
        });

        setImagePreview(data.user?.imageUrl || null);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setUser((prev) => prev || storeUser);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeUser]);

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
        fullName: editData.name,
      };
      if (imagePreview) {
        payload.imageUrl = imagePreview;
      }

      const { data } = await api.put("/me/profile", payload);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              fullName: data.fullName || prev.fullName,
              imageUrl: data.imageUrl || prev.imageUrl,
            }
          : prev
      );

      toast.success("Cập nhật hồ sơ thành công");
      setShowEditModal(false);
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error(
        err.response?.data?.message || "Không cập nhật được hồ sơ"
      );
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
      toast.error(
        err.response?.data?.message || "Không đổi được mật khẩu"
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (!storeUser && loading) {
    return <div className="p-8">Loading profile…</div>;
  }

  if (!storeUser) {
    return <div className="p-8">Bạn cần đăng nhập để xem trang này.</div>;
  }

  const displayName =
    user?.fullName || user?.name || "User";
  const username =
    user?.username || user?.email || "@username";
  const avatarSrc =
    imagePreview || user?.imageUrl || "/placeholder.svg";

  return (
    <div className="p-8">
      {/* Profile Header */}
      <div className="flex items-start gap-8 mb-12">
        <div className="relative group">
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-48 h-48 rounded-full object-cover"
          />
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-bold">{displayName}</h1>
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
          <p className="text-gray-400 mb-6">{username}</p>

          <div className="flex items-center gap-3">
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

      {/* Account Settings – chỉ owner */}
      {isOwner && (
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
                <p className="text-sm text-gray-400">
                  Update your password
                </p>
              </div>
            </button>
            <Link
              to="/register-artist"
              className="flex items-center gap-4 w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              <Settings className="h-5 w-5 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold">Register as Artist</h3>
                <p className="text-sm text-gray-400">
                  Become an artist and upload your music
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Liked Songs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Liked Songs</h2>
        {likedSongs.length === 0 ? (
          <p className="text-sm text-gray-400">
            Bạn chưa thích bài hát nào.
          </p>
        ) : (
          <div className="space-y-3">
            {likedSongs.map((song) => (
              <Link
                key={song._id}
                to={`/music/${song._id}`}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition group"
              >
                <img
                  src={song.imageUrl || "/placeholder.svg"}
                  alt={song.title}
                  className="w-14 h-14 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {song.artistName || song.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Liked Albums */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Liked Albums</h2>
        {likedAlbums.length === 0 ? (
          <p className="text-sm text-gray-400">
            Bạn chưa thích album nào.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {likedAlbums.map((album) => (
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
                <p className="text-sm text-gray-400 truncate">
                  {album.artistName || ""}{" "}
                  {album.releaseYear && `• ${album.releaseYear}`}
                </p>
              </Link>
            ))}
          </div>
        )}
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
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Profile Picture
                </label>
                <input
                  id="user-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="user-avatar-input"
                  className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-primary/50 transition cursor-pointer flex flex-col items-center justify-center"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover mb-3"
                      />
                      <p className="text-sm text-gray-400">
                        Click to change image
                      </p>
                    </>
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
                  Name
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

      {/* Password Modal */}
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
