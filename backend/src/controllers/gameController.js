import { generate } from "random-words";
export const startTurn = async ({ username, roomId }, io) => {
    try {
        io.to(roomId).emit("start_turn", { username });
    } catch (error) {
        console.log(error);
    }
};

export const chooseWord = async ({ username, roomId }, socket) => {
    try {
        const numberOfWords = await redis.get(`room:${roomId}:wordsCount`); // Lấy số lượng từ từ Redis
        const words = generate(numberOfWords); // Tạo danh sách các từ ngẫu nhiên
        socket.emit("pick_a_word", {username, words });
    } catch (error) {
        console.log(error);
    }
};

export const setWord = async ({ roomId, word }, io) => {
    try {
        io.to(roomId).emit("set_word", { word });
    } catch (error) {
        console.log(error);
    }
};