import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import { Upload, Music, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MusicUploader({ onTracksUploaded }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const audioFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("audio/")
    );

    const newPendingFiles = audioFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name.replace(/\.[^/.]+$/, ""),
      artist: "",
    }));

    setPendingFiles((prev) => [...prev, ...newPendingFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".flac", ".m4a", ".ogg"],
    },
    multiple: true,
  });

  const updatePendingFile = (id, updates) => {
    setPendingFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file))
    );
  };

  const removePendingFile = (id) => {
    setPendingFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updatePendingFile(id, {
        imageFile: file,
        imagePreview: e.target?.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAll = async () => {
    setIsUploading(true);

    const uploadedTracks = await Promise.all(
      pendingFiles.map(async (pending) => {
        const duration = await getAudioDuration(pending.file);
        return {
          id: pending.id,
          name: pending.name,
          artist: pending.artist || "Unknown Artist",
          duration,
          file: pending.file, // 👈 thêm dòng này — để UploadPage nhận được file gốc
          imageFile: pending.imageFile, // 👈 thêm dòng này nếu bạn cũng cần upload ảnh
          imageUrl:
            pending.imagePreview ||
            `/placeholder.svg?height=80&width=80&query=music+album+cover`,
          fileUrl: URL.createObjectURL(pending.file),
        };
      })
    );

    onTracksUploaded(uploadedTracks);
    setPendingFiles([]);
    setIsUploading(false);
    console.log(uploadedTracks);
  };

  const getAudioDuration = (file) =>
    new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        resolve(Math.floor(audio.duration));
        URL.revokeObjectURL(audio.src);
      });
    });
  
  console.log(pendingFiles);
  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? "Thả file vào đây..." : "Kéo thả file nhạc vào đây"}
        </p>
        <p className="text-sm text-muted-foreground">
          hoặc click để chọn file (MP3, WAV, FLAC, M4A, OGG)
        </p>
      </div>

      {pendingFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            File đang chờ ({pendingFiles.length})
          </h3>

          {pendingFiles.map((pending) => (
            <div
              key={pending.id}
              className="border border-border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {pending.imagePreview ? (
                    <img
                      src={pending.imagePreview || "/placeholder.svg"}
                      alt={pending.name}
                      className="h-20 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded bg-secondary flex items-center justify-center">
                      <Music className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`name-${pending.id}`}>Tên bài hát</Label>
                    <Input
                      id={`name-${pending.id}`}
                      value={pending.name}
                      onChange={(e) =>
                        updatePendingFile(pending.id, { name: e.target.value })
                      }
                      placeholder="Nhập tên bài hát"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`artist-${pending.id}`}>Nghệ sĩ</Label>
                    <Input
                      id={`artist-${pending.id}`}
                      value={pending.artist}
                      onChange={(e) =>
                        updatePendingFile(pending.id, {
                          artist: e.target.value,
                        })
                      }
                      placeholder="Nhập tên nghệ sĩ"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`image-${pending.id}`}>Ảnh bìa</Label>
                    <Input
                      id={`image-${pending.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(pending.id, file);
                      }}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePendingFile(pending.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            onClick={handleUploadAll}
            disabled={isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading
              ? "Đang tải lên..."
              : `Tải lên ${pendingFiles.length} bài hát`}
          </Button>
        </div>
      )}
    </div>
  );
}

MusicUploader.propTypes = {
  onTracksUploaded: PropTypes.func.isRequired,
};

export default MusicUploader;
