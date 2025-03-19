import React from "react";

const CreateRoom = ({ socket, setIsJoin, isJoin }) => {
  const [members, setMembers] = React.useState([]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const roomName = e.target[1].value;
    const size = e.target[2].value;
    const rounds = e.target[3].value;

    socket.emit("create_room", { username, roomName, size, rounds });
    socket.on("updateRoom", ({ roomData }) => {
      setIsJoin(true);
      setMembers(roomData.players);
    });
    socket.on("room_exists", ({ message }) => {
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
          <label htmlFor="sizes">Size</label>
          <select name="sizes">
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
          <br />
          <label htmlFor="rounds">max round</label>
          <select name="rounds">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <button type="submit">Create</button>
        </form>
      )}
    </>
  );
};

export default CreateRoom;
