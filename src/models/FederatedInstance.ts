import mongoose from "mongoose";

const { Schema } = mongoose;

export type IFederatedInstance = {
  name: string;
  uri: string;
  instanceUrl: string;
  app: {
    id: string | undefined;
    clientId: string | undefined;
    clientSecret: string | undefined;
    vapidKey: string | undefined;
  };
  software: {
    name: string;
    version: string;
  };
  usage: {
    usersActiveMonth: number | undefined;
    usersTotal: number | undefined;
  };
  created: Date;
  updated: Date;
};

const FederatedInstanceSchema = new Schema<IFederatedInstance>({
  name: { type: String, required: true },
  uri: { type: String, required: true },
  instanceUrl: { type: String, required: true },
  app: {
    id: {
      type: String,
      maxlength: 50,
      match: /^\d+$/,
    },
    clientId: {
      type: String,
      maxlength: 500,
      match: /^[\u0020-\u007e]+$/,
    },
    clientSecret: {
      type: String,
      maxlength: 500,
      match: /^[\u0020-\u007e]+$/,
    },
    vapidKey: {
      type: String,
      maxlength: 500,
      match: /^[\u0020-\u007e]+$/,
    },
  },
  software: {
    name: { type: String, enum: ["mastodon"], required: true },
    version: {
      type: String,
      maxlength: 50,
      match: /^[\u0020-\u007e]+$/,
      required: true,
    },
  },
  usage: {
    usersActiveMonth: {
      type: Number,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    },
    usersTotal: {
      type: Number,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    },
  },
  created: { type: Date, required: true },
  updated: { type: Date, required: true },
});

export const FederatedInstance = mongoose.model(
  "FederatedInstance",
  FederatedInstanceSchema,
);
