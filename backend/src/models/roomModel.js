import mongoose from "mongoose";

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
    turnsPerRound: {
      type: Number,
      default: 1,
    },
    wordsCount: {
      type: Number,
      default: 1,
    },
    drawTime: {
      type: Number,
      default: 80,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
