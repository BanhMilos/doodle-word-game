const sendChatToAll = async ({ username, message, roomId }, io) => {
    try {
        io.to(roomId).emit("chatMessage", { username, message, type: "message" });
    } catch (error) {
        console.log(error);
    }
};

export default { sendChatToAll };