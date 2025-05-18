import { create } from "zustand";

const useStore = create((set) => ({
  username: "",
  playerName: "",
  avatar: "",
  isHost: false,
  setUser: (username, playerName, avatar, isHost) => set({ username, playerName, avatar, isHost }),
}));

export default useStore;