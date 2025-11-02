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
      shuffle: false,
      repeat: "off", // "off" | "one" | "all"
      volume: 0.7, // 0..1
      currentTime: 0,
      duration: 0,

      // --- action toggle / set ---
      toggleShuffle: () => set({ shuffle: !get().shuffle }),
      cycleRepeat: () => {
        const order = ["off", "one", "all"];
        const idx = order.indexOf(get().repeat);
        set({ repeat: order[(idx + 1) % order.length] });
      },
      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
      setProgress: (sec) => set({ currentTime: Math.max(0, sec) }),
      setDuration: (sec) => set({ duration: Math.max(0, sec) }),

      // --- playNext/playPrevious hỗ trợ shuffle & repeat ---
      playNext: () => {
        const { currentIndex, queue, shuffle, repeat } = get();
        if (!queue?.length) return;

        // repeat one → phát lại bài hiện tại
        if (repeat === "one") {
          set({ isPlaying: true });
          return;
        }

        if (shuffle && queue.length > 1) {
          let rnd = Math.floor(Math.random() * queue.length);
          if (rnd === currentIndex) rnd = (rnd + 1) % queue.length;
          const nextSong = queue[rnd];
          const socket = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
            });
          }
          set({
            currentSong: nextSong,
            currentIndex: rnd,
            isPlaying: true,
            currentTime: 0,
          });
          return;
        }

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
            currentTime: 0,
          });
        } else {
          if (repeat === "all") {
            const first = queue[0];
            const socket = useChatStore.getState().socket;
            if (socket?.auth) {
              socket.emit("update_activity", {
                userId: socket.auth.userId,
                activity: `Playing ${first.title} by ${first.artist}`,
              });
            }
            set({
              currentSong: first,
              currentIndex: 0,
              isPlaying: true,
              currentTime: 0,
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
        }
      },

      playPrevious: () => {
        const { currentIndex, queue } = get();
        if (!queue?.length) return;
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
            currentTime: 0,
          });
        } else {
          // về đầu hàng đợi
          const first = queue[0];
          if (!first) return;
          const socket = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${first.title} by ${first.artist}`,
            });
          }
          set({
            currentSong: first,
            currentIndex: 0,
            isPlaying: true,
            currentTime: 0,
          });
        }
      },
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
