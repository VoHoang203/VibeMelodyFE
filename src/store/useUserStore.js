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
      isArtist: !!(userData && userData.isArtist === true),
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
        isArtist: !!(parsed && parsed.isArtist === true),
      });
    } catch {
      localStorage.removeItem("user");
      set({ user: null, isArtist: false });
    }
  },

  signup: async ({ name, email, password }) => {
    set({ loading: true });
    console.log({ name, email, password })
    if (!name || !email || !password) {
      set({ loading: false });
      throw Error("Please fill in all fields");
    }

    try {
      // BE yêu cầu fullName
      const res = await api.post("/auth/signup", {
        fullName: name,
        email:email,
        password:password,
      });

      const { user, accessToken } = res.data || {};

      if (!user) {
        set({ loading: false });
        throw Error("Please fill in all fields");
      }

      // nếu bạn có dùng token cho các request sau
      if (accessToken) {
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }

      set({ loading: false });
      toast.success("Account created!");
    } catch (error) {
      console.error("Signup error:", error);
      set({ loading: false });
      toast.error(
        error?.response?.data?.message || "An error occurred during signup"
      );
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
      get().setToken(res.data.accessToken);
      set({
        loading: false,
        isArtist: !!(res.data.user && res.data.user.isArtist === true),
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
