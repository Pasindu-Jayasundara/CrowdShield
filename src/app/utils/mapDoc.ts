import type { Doc } from "../../../convex/_generated/dataModel";
import type {
  AdminUser,
  Announcement,
  Campaign,
  NewsletterIssue,
  Report,
  Subscription,
  SupportMessage,
} from "../types";
import { severityFromThreatScore } from "./threatScore";

export function toReport(doc: Doc<"reports">): Report {
  const { _id, ...rest } = doc;
  const threatScore = rest.threatScore ?? rest.aiScore;
  return {
    ...rest,
    id: _id,
    threatScore,
    severity: severityFromThreatScore(threatScore),
  };
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

export function toAnnouncement(doc: Doc<"announcements">): Announcement {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}

export function toNewsletterIssue(doc: Doc<"newsletters">): NewsletterIssue {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}
