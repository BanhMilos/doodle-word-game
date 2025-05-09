import { useState } from "react";
import useStore from "../store";
import "../styles/lobby.css";

const avatars = ["😠", "😡", "😢", "😊", "😜", "😈", "🤓", "🤡"];

export default function GameLobby({ socket, enterRoom, onLogout }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(""); // Thêm roomId
  const [avatarIndex, setAvatarIndex] = useState(0);
  const { username, avatar, setUser } = useStore();

  const handlePlay = () => {
    if (name) {
      setUser(name, avatars[avatarIndex]);
      const room = roomId || "default";
      socket.emit("join_room", { username: name, avatar: avatars[avatarIndex], roomId: room });
      enterRoom(room);
    }
  };

  const handlePreviousAvatar = () => {
    setAvatarIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
  };

  const handleNextAvatar = () => {
    setAvatarIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="lobby-container">      
      <div className="lobby-header"> 
          {username && (
          <div className="user-display">
            👤 {username}
          </div>
        )}      
        <button className="logout-button" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <h1 className="lobby-title">SKRIBBL.io ✏️</h1>
      <div className="lobby-form">
        <div className="input-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="name-input"
          />
          <select className="language-select">
            <option value="English">English</option>
          </select>
        </div>

        {/* Input mới cho Room ID */}
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID (optional)"
          className="room-input"
        />

        <div className="avatar-section">
          <span className="arrow left-arrow" onClick={handlePreviousAvatar}>❮</span>
          <span className="avatar">{avatars[avatarIndex]}</span>
          <span className="arrow right-arrow" onClick={handleNextAvatar}>❯</span>
        </div>
        <button className="play-button" onClick={handlePlay}>Play!</button>
        <button className="private-room-button">Create Private Room</button>
      </div>
    </div>
  );
}
