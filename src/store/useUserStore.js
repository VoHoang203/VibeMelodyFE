import { create } from "zustand";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: localStorage.getItem("user"),
  loading: false,
  checkingAuth: false,
  token: localStorage.getItem("token"),
  isArtist: false,

  setUser: (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    set({ 
      user: userData,
      isArtist: !!(userData && userData.isArtist === true)
    });
  },

  setToken: (data) => {
    localStorage.setItem("token", data);
    set({ token: data });
  },

  initializeUser: () => {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") {
      if (raw === "undefined" || raw === "null")
        localStorage.removeItem("user");
      return set({ user: null, isArtist: false });
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        localStorage.removeItem("user");
        return set({ user: null, isArtist: false });
      }
      set({ 
        user: parsed,
        isArtist: !!(parsed && parsed.isArtist === true)
      });
    } catch {
      localStorage.removeItem("user");
      set({ user: null, isArtist: false });
    }
  },

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await api.post("/auth/signup", { name, email, password });
      console.log(res);
      if (!res.data || !res.data.user) {
        throw new Error("Invalid login response");
      }
      get().setUser(res.data.user);
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log(res);

      if (!res.data || !res.data.user) {
        throw new Error("Invalid login response");
      }
      get().setUser(res.data.user);
      get().setToken(res.data.token);

      set({ 
        loading: false,
        isArtist: !!(res.data.user && res.data.user.isArtist === true)
      });
    } catch (error) {
      set({ loading: false });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null, isArtist: false });
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  logout: async () => {
    try {
      set({ user: null, token: null, isArtist: false });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during logout"
      );
    }
  },
}));
