import { create } from "zustand";

const initialUser = JSON.parse(localStorage.getItem("hoh_user") || "null");
const initialToken = localStorage.getItem("hoh_token");

const useAuthStore = create((set) => ({
  isAuthenticated: Boolean(initialToken),
  user: initialUser,

  login: (userData, token) => {
    if (userData) localStorage.setItem("hoh_user", JSON.stringify(userData));
    if (token) localStorage.setItem("hoh_token", token);
    set({ isAuthenticated: true, user: userData });
  },

  logout: () => {
    localStorage.removeItem("hoh_user");
    localStorage.removeItem("hoh_token");
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
