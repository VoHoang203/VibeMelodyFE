import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./store/useUserStore";
import { AppLayout } from "./components/app-layout";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// App Pages
import Home from "./pages/Home";
import AlbumDetail from "./pages/AlbumDetail";
import Chat from "./pages/Chat";
import CreateAlbum from "./pages/CreateAlbum";
import MusicDetail from "./pages/MusicDetail";
import Profile from "./pages/Profile";
import Profile2 from "./pages/Profile2";
import Search from "./pages/Search";
import Upload from "./pages/Upload";
import ManageMusicPage from "./pages/ManageMusic";
import ManageAlbumsPage from "./pages/ManageAlbum";
import RegisterArtistPage from "./pages/RegisterArtistPage";

export default function App() {
  const { user, initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const isArtist = user?.isArtist;

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/forgot-password"
          element={!user ? <ForgotPasswordPage /> : <Navigate to="/" replace />}
        />

        {/* ---------- APP ROUTES (bọc bằng layout) ---------- */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route
            path="/chat"
            element={user ? <Chat /> : <Navigate to="/login" replace />}
          />
          <Route path="/create-album" element={<CreateAlbum />} />
          <Route path="/music/:id" element={<MusicDetail />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/register-artist"
            element={
              user ? <RegisterArtistPage /> : <Navigate to="/login" replace />
            }
          />

          {/* Artist-only */}
          {isArtist && (
            <>
              <Route path="/upload" element={<Upload />} />
              <Route path="/manage-music" element={<ManageMusicPage />} />
              <Route path="/manage-albums" element={<ManageAlbumsPage />} />
              <Route path="/profile2" element={<Profile2 />} />
            </>
          )}
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-center" />
    </>
  );
}
