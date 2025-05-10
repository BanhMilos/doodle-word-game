import { useState } from "react";
import useStore from "../store";
import "../styles/roomCreate.css";

export default function RoomCreate({ onLogout, username }) {
  const [settings, setSettings] = useState({
    players: 8,
    language: "English",
    drawTime: 80,
    rounds: 3,
    gameMode: "Normal",
    wordCount: 3,
    hints: 2,
    customWords: "",
    useCustomWordsOnly: false,
  });
  const { username: storeUsername } = useStore();
  const [players] = useState([
    { id: "1", username: "Lunch (You)", avatar: "👑", score: 0 },
    { id: "2", username: "Player2", avatar: "😊", score: 10 },
    { id: "3", username: "Player3", avatar: "😜", score: 5 },
  ]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartGame = () => {
    console.log("Starting game with settings:", settings);
    // Placeholder for starting the game with the configured settings
  };

  const sendMessage = () => {
    if (msg) {
      setMessages((prev) => [...prev, { username: storeUsername || "You", message: msg }]);
      setMsg("");
    }
  };

  return (
    <div className="game-room">
      
      <div className="header">
        <div className="title-container">
          <h1 className="game-title">SKRIBBL.io ✏️</h1>
          <span className="room-id">Room: Private</span>
        </div>
        <div className="game-info">
          <span className="player-count">{players.length}</span>
          <span className="round-info">Waiting</span>
          <span className="word-hint">______</span>
          <span className="timer">3:7</span>
        </div>
      </div>
      <div className="main-content">
        <div className="left-panel">
          {players.map((p, index) => (
            <div key={p.id} className={`player ${p.username === storeUsername ? "current-player" : ""}`}>
              <span className="player-rank">#{index + 1}</span>
              <span className="player-avatar">{p.avatar}</span>
              <span className="player-name">{p.username}{p.username === storeUsername && " (You)"}</span>
              <span className="player-score">{p.score}</span>
              <span className={`status ${index === 0 ? "drawing" : "guessed"}`}></span>
            </div>
          ))}
        </div>
        <div className="center-panel">
          <div className="settings-form">
            <div className="settings-row">
              <label>Players</label>
              <select
                value={settings.players}
                onChange={(e) => handleSettingChange("players", parseInt(e.target.value))}
              >
                {[...Array(15).keys()].map((i) => (
                  <option key={i + 2} value={i + 2}>
                    {i + 2}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label>Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange("language", e.target.value)}
              >
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese</option>
              </select>
            </div>
            <div className="settings-row">
              <label>Draw time</label>
              <select
                value={settings.drawTime}
                onChange={(e) => handleSettingChange("drawTime", parseInt(e.target.value))}
              >
                {[30, 60, 80, 100, 120].map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label>Rounds</label>
              <select
                value={settings.rounds}
                onChange={(e) => handleSettingChange("rounds", parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((round) => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label>Game Mode</label>
              <select
                value={settings.gameMode}
                onChange={(e) => handleSettingChange("gameMode", e.target.value)}
              >
                <option value="Normal">Normal</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
            <div className="settings-row">
              <label>Word Count</label>
              <select
                value={settings.wordCount}
                onChange={(e) => handleSettingChange("wordCount", parseInt(e.target.value))}
              >
                {[1, 2, 3, 4].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label>Hints</label>
              <select
                value={settings.hints}
                onChange={(e) => handleSettingChange("hints", parseInt(e.target.value))}
              >
                {[0, 1, 2, 3].map((hint) => (
                  <option key={hint} value={hint}>
                    {hint}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row custom-words">
              <label>Custom words</label>
              <textarea
                value={settings.customWords}
                onChange={(e) => handleSettingChange("customWords", e.target.value)}
                placeholder="Minimum of 10 words, 1-32 characters per word! 20000 characters maximum. Separated by a , (comma)"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.useCustomWordsOnly}
                  onChange={(e) => handleSettingChange("useCustomWordsOnly", e.target.checked)}
                />
                Use custom words only
              </label>
            </div>
            <div className="settings-buttons">
              <button className="start-button" onClick={handleStartGame}>
                Start!
              </button>
              <button className="invite-button">
                Invite
              </button>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="chat">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.username === storeUsername ? "highlight" : ""}`}>
                <span className="message-username">{m.username}</span>: {m.message}
              </div>
            ))}
          </div>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="chat-input"
          />
        </div>
      </div>
    </div>
  );
}