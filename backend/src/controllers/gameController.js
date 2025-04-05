import { generate } from "random-words";
const startTurn = async ({ username, roomId }, io) => {
    try {
        io.to(roomId).emit("startTurn", { username });
    } catch (error) {
        console.log(error);
    }
};

const chooseWord = async ({ username, roomId }, socket) => {
    try {
        const numberOfWords = await redis.get(`room:${roomId}:wordsCount`); // Lấy số lượng từ từ Redis
        const words = generate(numberOfWords); // Tạo danh sách các từ ngẫu nhiên
        socket.emit("pick_a_word", {username, words });
    } catch (error) {
        console.log(error);
    }
};

const setWord = async ({ roomId, word }, io) => {
    try {
        io.to(roomId).emit("set_word", { word });
    } catch (error) {
        console.log(error);
    }
};

const drawing = async ({ username, roomId }, io) => {
    try {
        io.to(roomId).emit("drawing", { username });
    } catch (error) {
        console.log(error);
    }
};

export default { startTurn, chooseWord, setWord, drawing };