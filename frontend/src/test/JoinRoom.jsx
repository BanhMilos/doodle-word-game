import React from "react";

const JoinRoom = ({ socket, setIsJoin, isJoin }) => {
  const [members, setMembers] = React.useState([]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const roomName = e.target[1].value;

    socket.emit("join_room", { username, roomName });
    socket.on("updateRoom", ({ roomData }) => {
      setIsJoin(true);
      setMembers(roomData.players);
    });
    socket.on("room_not_found", ({ message }) => {
      alert(message);
    });
    socket.on("room_full", ({ message }) => {
      alert(message);
    });
  };
  return (
    <>
      {isJoin ? (
        <div>
          <ul>
            {members.map((member) => (
              <li key={member.socketID}>{member.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Player name" />
          <br />
          <input type="text" placeholder="Room name" />
          <br />
          <button type="submit">Join</button>
        </form>
      )}
    </>
  );
};

export default JoinRoom;
