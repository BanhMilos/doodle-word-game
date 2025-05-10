import { useState } from "react";
import io from "socket.io-client";
import LoginPage from "./components/LoginPage";
import GameLobby from "./components/GameLobby";
import GameRoom from "./components/GameRoom";

const socket = io("http://localhost:4000");

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState("");

  const enterRoom = (roomId) => {
    setRoom(roomId);
  };

  const handleLogin = (username) => {
    setUsername(username);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setUsername("");
    setRoom(null);
    setLoggedIn(false);
  };

  return loggedIn ? (
    <div className="app">
      {room ? (
        <GameRoom socket={socket} roomId={room} username={username} />
      ) : (
        <GameLobby
          socket={socket}
          enterRoom={enterRoom}
          username={username}
          onLogout={handleLogout}
        />
      )}
    </div>
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}