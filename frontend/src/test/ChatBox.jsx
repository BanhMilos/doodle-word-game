import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001"); // connect to backend

const ChatBox = () => {
  const [messages, setMessages] = useState([]); // messages list
  const [message, setMessage] = useState(""); // current message

  // Lắng nghe tin nhắn từ server
  useEffect(() => {
    socket.on("chatMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("chatMessage"); // clean listener when component unmount
    };
  }, []);


  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chatMessage", message); // send mes to server
    }
  };

  //enter key 
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage(); 
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid black",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)} // update input
        onKeyPress={handleKeyPress} 
        placeholder="Type a message"
        style={{ width: "80%", marginRight: "10px" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
