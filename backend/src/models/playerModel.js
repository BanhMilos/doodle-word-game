import mongoose from "mongoose";

const playerSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    socketID: {
        type: String,
        required: true
    },
    isPartyLeader: {
        type: Boolean,
        default: false
    },
    scores: {
        type: Number,
        default: 0
    }
},{timestamps: true})

const Player = mongoose.model('Player', playerSchema)

export default Player