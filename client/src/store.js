// client/src/store.js
import { create } from "zustand";

const useStore = create((set) => ({
  username: "",
  avatar: "",
  setUser: (username, avatar) => set({ username, avatar }),
}));

export default useStore;