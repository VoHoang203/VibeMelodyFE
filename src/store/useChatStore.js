import { create } from "zustand";
import { io } from "socket.io-client";
import { api } from "../lib/api";

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/"
    : window.location.origin;

const socket = io(baseURL, {
  autoConnect: false, // chỉ connect khi đã xác thực
  withCredentials: true,
});

export const useChatStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  notifications: [],
  unreadCount: 0,
  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/chat/users");
      set({ users: response.data });
    } catch (error) {
      console.error("❌ fetchUsers error:", error);
      set({
        error: error?.response?.data?.message || "Error fetching users",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchNotifications: async () => {
    try {
      const res = await api.get("/chat/allnoti");
      set({
        notifications: res.data,
        unreadCount: res.data.filter((n) => !n.isRead).length || 0,
      });
      console.log(res.data);
    } catch (err) {
      console.error("❌ fetchNotifications error:", err);
    }
  },

  initSocket: (userId) => {
    const { isConnected } = get();
    if (isConnected) return;

    socket.auth = { userId };
    socket.connect();

    socket.emit("user_connected", userId);

    socket.on("users_online", (users) => {
      set({ onlineUsers: new Set(users) });
    });

    socket.on("activities", (activities) => {
      set({ userActivities: new Map(activities) });
    });

    socket.on("user_connected", (uid) => {
      set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, uid]),
      }));
    });

    socket.on("user_disconnected", (uid) => {
      set((state) => {
        const newOnline = new Set(state.onlineUsers);
        newOnline.delete(uid);
        return { onlineUsers: newOnline };
      });
    });

    socket.on("receive_message", (message) => {
      set((state) => {
        const mid = message._id || message.id;
        // nếu đã có message này rồi thì bỏ qua
        if (state.messages.some((m) => (m._id || m.id) === mid)) {
          return state;
        }
        return { messages: [...state.messages, message] };
      });
    });

    socket.on("message_sent", (message) => {
      set((state) => {
        const mid = message._id || message.id;
        if (state.messages.some((m) => (m._id || m.id) === mid)) {
          return state;
        }
        return { messages: [...state.messages, message] };
      });
    });

    socket.on("activity_updated", ({ userId, activity }) => {
      set((state) => {
        const newMap = new Map(state.userActivities);
        newMap.set(userId, activity);
        return { userActivities: newMap };
      });
    });
    socket.on("notification:new", (data) => {
      console.log("🔔 New notification:", data);
      set((state) => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });
    set({ isConnected: true });
    console.log("🟢 Socket connected for user:", userId);
  },

  disconnectSocket: () => {
    const { isConnected } = get();
    if (isConnected) {
      socket.disconnect();
      set({ isConnected: false });
      console.log("🔴 Socket disconnected");
    }
  },

  sendMessage: async (receiverId, senderId, content) => {
    const s = get().socket;
    if (!s) return;
    s.emit("send_message", { receiverId, senderId, content });
  },

  fetchMessages: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/chat/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      console.error("❌ fetchMessages error:", error);
      set({
        error: error?.response?.data?.message || "Error fetching messages",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
