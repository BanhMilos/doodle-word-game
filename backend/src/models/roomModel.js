import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
    word: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    occupancy: {
        type: Number,
        required: true,
        default: 4
    },
    maxRound: {
        type: Number,
        required: true,
        default: 1
    },
    currentRound: {
        type: Number,
        required: true,
        default: 1
    },
    players:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    isJoin: {
        type: Boolean,
        default: true
    },
    turn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    turnIndex: {
        type: Number,
        default: 0
    }
},{timestamps: true})

const Room = mongoose.model('Room', roomSchema)

export default Room