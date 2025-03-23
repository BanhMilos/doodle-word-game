import mongoose from "mongoose";

const playerSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true
    },
    socketID: {
        type: String,
        required: true,
        trim: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    highestScore: {
        type: Number,
        default: 0
    },
    totalGames: {
        type: Number,
        default: 0
    }
},{timestamps: true})

const Player = mongoose.model('Player', playerSchema)

export default Player