export const sendChatToAll = async ({ username, message, roomId }, io) => {
    try {
        io.to(roomId).emit("send_chat", { username, message });
    } catch (error) {
        console.log(error);
    }
};