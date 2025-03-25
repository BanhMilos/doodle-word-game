import mongoose from "mongoose";
import Player from "./playerModel.js";

const roomSchema = mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    occupancy: {
      type: Number,
      default: 2,
    },
    maxRound: {
      type: Number,
      default: 1,
    },
    wordsUsed: [
      {
        type: String,
      },
    ],
    wordsCount: {
      type: Number,
      default: 1,
    },
    drawTime: {
      type: Number,
      default: 80,
    },
    drawings: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
