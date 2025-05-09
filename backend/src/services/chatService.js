import redis from "../config/redis.js";

const sendChatToAll = async ({ username, message, roomId, userId }, io) => {
  try {
    const roomKey = `room:${roomId}`;
    let roomData = await redis.get(roomKey);
    if (!roomData) return;
    roomData = JSON.parse(roomData);

    const isDrawer = roomData.drawingPlayer === userId;
    const hasGuessed = roomData.guessedCorrectlyPeople.includes(userId);
    const isCorrect = message.trim().toLowerCase() === roomData.currentWord.toLowerCase();

    if (isDrawer) {
      io.to(userId).emit("chatMessage", {username: "System",message: "You are the drawer and cannot guess.",type: "alert",});
      return;
    }

    if (hasGuessed) {
      io.to(userId).emit("chatMessage", {username: "System",message: "You already guessed correctly!",type: "info",});
      return;
    }

    if (isCorrect) {
      roomData.guessedCorrectlyPeople.push(userId);
      await redis.set(roomKey, JSON.stringify(roomData));

      io.to(userId).emit("chatMessage", {username,message,type: "correct",});

      io.to(roomId).emit("chatMessage", {username: "System",message: `${username} guessed the word correctly!`,type: "system",});
    } else {
      io.to(roomId).emit("chatMessage", {username,message,type: "message",});
    }
  } catch (error) {
    console.log(error);
  }
};

export default { sendChatToAll };
