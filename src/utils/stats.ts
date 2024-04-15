import mongoose from "mongoose";

import { type IStats, Stats } from "../models/Stats";

export async function statIncrement(counter: keyof IStats) {
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.connected) {
    try {
      await mongoose.connect(import.meta.env.MONGODB_URI);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  Stats.updateOne({}, { $inc: { [counter]: 1 } }).then(() => {});
}
