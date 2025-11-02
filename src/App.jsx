import { useState } from "react";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";

// Import các page
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
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/create-album" element={<CreateAlbum />} />
        <Route path="/music/:id" element={<MusicDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile2" element={<Profile2 />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/manage-music" element={<ManageMusicPage/>} />
        <Route path="/manage-albums" element={<ManageAlbumsPage/>} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
