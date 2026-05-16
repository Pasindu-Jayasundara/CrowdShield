import type { Doc } from "../../../convex/_generated/dataModel";
import type { AdminUser, Campaign, Report, Subscription, SupportMessage } from "../types";

export function toReport(doc: Doc<"reports">): Report {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}

export function toCampaign(doc: Doc<"campaigns">): Campaign {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}

export function toUser(doc: Doc<"users">): AdminUser {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}

export function toSubscription(doc: Doc<"subscriptions">): Subscription {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}

export function toSupportMessage(doc: Doc<"supportMessages">): SupportMessage {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}
