import { v } from "convex/values";

export const severityValidator = v.union(
  v.literal("LOW"),
  v.literal("MEDIUM"),
  v.literal("HIGH"),
  v.literal("CRITICAL"),
);

export const platformValidator = v.union(
  v.literal("whatsapp"),
  v.literal("sms"),
  v.literal("email"),
  v.literal("facebook"),
  v.literal("instagram"),
  v.literal("other"),
);

export const reportStatusValidator = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("false_positive"),
  v.literal("removed"),
);

export const voteTypeValidator = v.union(
  v.literal("scam"),
  v.literal("suspicious"),
  v.literal("safe"),
);
