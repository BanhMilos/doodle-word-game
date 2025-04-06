import "./App.css";
import socket from "./utils/socket";
import Login from "./test/Login";
import Register from "./test/Register";

function App() {
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

    <div className="app-container">
      <div>
        <img src="../assets/gifs/gf_logo.gif" alt="Nothing here" />
      </div>
      <div className="panel">
        There's nothing here
      </div>
    </div>
  );
}

export default App;
