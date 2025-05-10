import { useState } from "react";
import useStore from "../store";

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState("");
  const setUser = useStore((state) => state.setUser);

  const handleLogin = () => {
    if (name.trim()) {
      setUser(name, "🙂"); // avatar mặc định nếu chưa chọn
      onLogin(); // chuyển sang GameLobby
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your username"
        className="login-input"
      />
      <button onClick={handleLogin} className="login-button">Enter Lobby</button>
    </div>
  );
}
