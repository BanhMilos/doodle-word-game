import chatService from "../services/chatService.js";
const sendChatToAll = async (data, io) => {
    try {
        await chatService.sendChatToAll(data, io);
    } catch (error) {
        console.log(error);
    }
};

export default { sendChatToAll };