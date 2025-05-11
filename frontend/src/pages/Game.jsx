import { useEffect, useState } from "react";
import useStore from "../store";
import "../styles/room.css";
import socket from "../utils/socket";
import AppImages from "core/constants/AppImages";
import DrawingBoard from "components/DrawingBoard";

export default function Game() {
  const { playerName } = useStore();
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [settings, setSettings] = useState({
    roomName: "",
    players: 8,
    language: "English",
    drawTime: 80,
    rounds: 0,
    turns: 0,
    wordCount: 3,
    hints: 2,
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartGame = () => {
    console.log(`LOG : player : ${players}`);
    socket.emit("createRoom", {
      username: playerName,
      roomName: settings.roomName,
      occupancy: settings.players,
      maxRound: settings.rounds,
      turnsPerRound: settings.turns,
      wordsCount: settings.wordCount,
      drawTime: settings.drawTime,
      hints: settings.hints,
    });
  };

  useEffect(() => {
    socket.on("approveJoin", (data) => {
      setCurrentRoomId(data.roomId);
      setPlayers((prev) => [
        ...prev,
        {
          id: data.username,
          username: data.username,
          avatar: data.avatar,
          score: 0,
        },
      ]);
    });
    const handleGetRoomData = (data) => {
      setCurrentRoomId(data.roomId);
      setPlayers(
        data.existingPlayers.map((player) => ({
          id: player.username,
          username: player.username,
          avatar: player.avatar,
          score: player.score,
        }))
      );
    };

    socket.on("getRoomData", handleGetRoomData);
    socket.on("chatMessage", (data) => setMessages((prev) => [...prev, data]));
    socket.emit("getRoomData", { username: playerName });
    return () => {
      socket.off("approveJoin");
      socket.off("chatMessage");
    };
  });

  const sendMessage = () => {
    socket.emit("chatMessage", {
      username: playerName,
      message: msg,
      roomId: currentRoomId,
    });
    setMsg("");
  };

  return (
    <div id="game-room">
      <div id="game-wrapper">
        <div id="game-logo">
          <img src={AppImages.Logo} alt="Logo" />
          <div style={{ width: "728px", height: "90px" }} />
        </div>
        <div id="game-bar">
          <div id="game-clock">
            <span className="timer">0</span>
          </div>
          <div id="game-round">
            <div className="text">Round 1 of 3</div>
          </div>
          <div id="game-word">
            <div className="description">Waiting</div>
            {/*<span className="word-hint">____asdasd__</span>*/}
          </div>
        </div>
        <div id="game-players">
          <div className="players-list">
            {players.map((p, index) => (
              <div
                key={p.id}
                className={`player ${
                  p.username === playerName ? "current-player" : ""
                }`}
              >
                <span className="player-rank">#{index + 1}</span>
                <span className="player-avatar">{p.avatar}</span>
                <span className="player-name">
                  {p.username}
                  {p.username === playerName && " (You)"}
                </span>
                <span className="player-score">0</span>
                <span
                  className={`status ${
                    p.username === "Ayush Sharma" ? "drawing" : "guessed"
                  }`}
                ></span>
              </div>
            ))}
          </div>
        </div>
        <div id="game-players-footer"></div>
        <div id="game-canvas">
          <DrawingBoard />
          <div className="overlay"></div>
          <div className="overlay-content" style={{ top: "0%" }}>
            <div className="room show">
              <div className="settings-form">
                <div className="key">
                  <span data-translate="text">Roomname :</span>
                </div>
                <div className="value">
                  <input
                    type="text"
                    value={settings.roomName}
                    onChange={(e) =>
                      handleSettingChange("roomName", e.target.value)
                    }
                  />
                </div>
                <div className="key">
                  <img src={AppImages.Player} />
                  <span data-translate="text">Players</span>
                </div>
                <div className="value">
                  <select
                    value={settings.players}
                    onChange={(e) =>
                      handleSettingChange("players", parseInt(e.target.value))
                    }
                  >
                    {[...Array(15).keys()].map((i) => (
                      <option key={i + 2} value={i + 2}>
                        {i + 2}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="key">
                  <img src={AppImages.Language} />
                  <label>Language</label>
                </div>
                <div className="value">
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      handleSettingChange("language", e.target.value)
                    }
                  >
                    <option value="English">English</option>
                    <option value="Vietnamese">Vietnamese</option>
                  </select>
                </div>
                <div className="key">
                  <img src={AppImages.DrawTime} />
                  <label>Draw time</label>
                </div>
                <div className="value">
                  <select
                    value={settings.drawTime}
                    onChange={(e) =>
                      handleSettingChange("drawTime", parseInt(e.target.value))
                    }
                  >
                    {[30, 60, 80, 100, 120].map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="key">
                  <img src={AppImages.Round} />
                  <label>Rounds</label>
                </div>
                <div className="value">
                  <select
                    value={settings.rounds}
                    onChange={(e) =>
                      handleSettingChange("rounds", parseInt(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((round) => (
                      <option key={round} value={round}>
                        {round}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="key">
                  <label>Turns</label>
                </div>
                <div className="value">
                  <select
                    value={settings.rounds}
                    onChange={(e) =>
                      handleSettingChange("turns", parseInt(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((round) => (
                      <option key={round} value={round}>
                        {round}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="key">
                  <img src={AppImages.WordCount} />
                  <label>Word Count</label>
                </div>
                <div className="value">
                  <select
                    value={settings.wordCount}
                    onChange={(e) =>
                      handleSettingChange("wordCount", parseInt(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="key">
                  <img src={AppImages.Hints} />
                  <label>Hints</label>
                </div>
                <div className="value">
                  <select
                    value={settings.hints}
                    onChange={(e) =>
                      handleSettingChange("hints", parseInt(e.target.value))
                    }
                  >
                    {[0, 1, 2, 3].map((hint) => (
                      <option key={hint} value={hint}>
                        {hint}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="settings-buttons">
                <button className="start-button" onClick={handleStartGame}>
                  Create!
                </button>
              </div>
            </div>
          </div>
        </div>
        <div id="game-chat">
          <div className="chat-content">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-message ${
                  m.username === playerName ? "highlight" : ""
                }`}
              >
                <span className="message-username">{m.username}</span>:{" "}
                {m.message}
              </div>
            ))}
          </div>
          <input
            className="chat-input"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                sendMessage();
              }
            }}
            placeholder="Type your guess..."
          />
        </div>
      </div>
    </div>
  );
}
