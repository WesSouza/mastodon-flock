import mongoose from "mongoose";

const { Schema } = mongoose;

export type IStats = {
  appOnFederatedInstances: number;
  federatedAccountsFollowed: number;
  federatedAccountsFound: number;
  mastodonLogins: number;
  twitterLogins: number;
};

const StatsSchema = new Schema<IStats>({
  appOnFederatedInstances: { type: Number, required: true },
  federatedAccountsFollowed: { type: Number, required: true },
  federatedAccountsFound: { type: Number, required: true },
  mastodonLogins: { type: Number, required: true },
  twitterLogins: { type: Number, required: true },
});

export const Stats = mongoose.model("Stats", StatsSchema);
