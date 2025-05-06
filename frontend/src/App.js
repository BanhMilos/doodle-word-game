import logo from "./logo.svg";
import "./App.css";
import CreateRoom from "./test/CreateRoom";
import { useState } from "react";
import socket from "./utils/socket";
import JoinRoom from "./test/JoinRoom";
import DrawingBoard from "./components/DrawingBoard";

function App() {
  const [isJoin, setIsJoin] = useState(false);
  socket.on("connect", (data) => {
    console.log("Connected to server" + data);
  });
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    // Mượn chỗ này test backend nhé ae

    <div className="app-container">
      <DrawingBoard />
    </div>
  );
}

export default App;
