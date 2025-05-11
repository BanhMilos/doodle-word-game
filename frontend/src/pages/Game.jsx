import { useEffect, useState } from "react";
import useStore from "../store";
import "../styles/room.css";
import socket from "../utils/socket";
export default function Room() {
  const { username, avatar } = useStore();
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.on("update_players", setPlayers);
    socket.on("receive_message", (data) => setMessages((prev) => [...prev, data]));
    return () => {
      socket.off("update_players");
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (msg) {
      socket.emit("send_message", { username, message: msg });
      setMsg("");
    }
  };

  return (
    <div className="game-room">
      <div className="header">
        <h1 className="game-title">SKRIBBL.io ✏️</h1>
        <div className="game-info">
          <span className="player-count">{players.length}</span>
          <span className="round-info">Round 1 of 3</span>
          <span className="word-hint">______</span>
          <span className="timer">3:7</span>
        </div>
      </div>
      <div className="main-content">
        <div className="left-panel">
          {players.map((p, index) => (
            <div key={p.id} className={`player ${p.username === username ? "current-player" : ""}`}>
              <span className="player-rank">#{index + 1}</span>
              <span className="player-avatar">{p.avatar}</span>
              <span className="player-name">{p.username}{p.username === username && " (You)"}</span>
              <span className="player-score">0</span>
              <span className={`status ${p.username === "Ayush Sharma" ? "drawing" : "guessed"}`}></span>
            </div>
          ))}
        </div>
        <div className="center-panel">
          <div className="reaction-buttons">
            <button className="thumbs-up">👍</button>
            <button className="thumbs-down">👎</button>
          </div>
          <div className="canvas-placeholder">[ Canvas Here ]</div>
        </div>
        <div className="right-panel">
          <div className="chat">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.username === "Ayush Sharma" ? "highlight" : ""}`}>
                <span className="message-username">{m.username}</span>: {m.message}
              </div>
            ))}
          </div>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your guess..."
            className="chat-input"
          />
        </div>
      </div>
    </div>
  );
}