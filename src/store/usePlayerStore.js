import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,

      initializeQueue: (songs) => {
        set({
          queue: songs,
          currentSong: get().currentSong || songs[0],
          currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
        });
      },

      playAlbum: (songs, startIndex = 0) => {
        if (!songs || songs.length === 0) return;
        const song = songs[startIndex];

        const socket = useChatStore.getState().socket;
        if (socket?.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity: `Playing ${song.title} by ${song.artist}`,
          });
        }

        set({
          queue: songs,
          currentSong: song,
          currentIndex: startIndex,
          isPlaying: true,
        });
      },

      setCurrentSong: (song) => {
        if (!song) return;

        const socket = useChatStore.getState().socket;
        if (socket?.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity: `Playing ${song.title} by ${song.artist}`,
          });
        }

        const songIndex = get().queue.findIndex((s) => s._id === song._id);
        set({
          currentSong: song,
          isPlaying: true,
          currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
        });
      },

      togglePlay: () => {
        const willStartPlaying = !get().isPlaying;
        const currentSong = get().currentSong;
        const socket = useChatStore.getState().socket;

        if (socket?.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity:
              willStartPlaying && currentSong
                ? `Playing ${currentSong.title} by ${currentSong.artist}`
                : "Idle",
          });
        }

        set({ isPlaying: willStartPlaying });
      },

      playNext: () => {
        const { currentIndex, queue } = get();
        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          const nextSong = queue[nextIndex];
          const socket = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
            });
          }
          set({
            currentSong: nextSong,
            currentIndex: nextIndex,
            isPlaying: true,
          });
        } else {
          set({ isPlaying: false });
          const socket = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: "Idle",
            });
          }
        }
      },

      playPrevious: () => {
        const { currentIndex, queue } = get();
        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
          const prevSong = queue[prevIndex];
          const socket = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
            });
          }
          set({
            currentSong: prevSong,
            currentIndex: prevIndex,
            isPlaying: true,
          });
        } else {
          set({ isPlaying: false });
          const socket = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: "Idle",
            });
          }
        }
      },
    }),
    {
      name: "player-storage", // key lưu trong localStorage
      getStorage: () => localStorage, // lưu vào localStorage
      partialize: (state) => ({
        // chỉ lưu những phần cần thiết (không lưu socket)
        currentSong: state.currentSong,
        queue: state.queue,
        currentIndex: state.currentIndex,
        isPlaying: state.isPlaying,
      }),
    }
  )
);
