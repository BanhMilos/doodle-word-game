import "./App.css";
import createSocket from "./utils/socket";
import DrawingBoard from "./components/DrawingBoard";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const socket = createSocket();

    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

    <div className="app-container">
      <DrawingBoard />
    </div>
  );
}

export default App;
