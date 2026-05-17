import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { escapeHtml, sendBulkEmails, textToHtml } from "./lib/email";

const MAX_USERS = 500;

export const newsletterSubscriberEmails = internalQuery({
  args: { criticalOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const subs = await ctx.db.query("newsletterSubscribers").take(1000);
    return subs
      .filter((s) => {
        if (!s.isActive) return false;
        if (args.criticalOnly && s.wantsCriticalAlerts === false) return false;
        return true;
      })
      .map((s) => s.email);
  },
});

export const userEmailsForAnnouncement = internalQuery({
  args: {
    recipients: v.union(
      v.literal("all"),
      v.literal("analysts"),
      v.literal("free_users"),
    ),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").take(MAX_USERS);
    const active = users.filter((u) => u.isActive);

    if (args.recipients === "all") return active.map((u) => u.email);
    if (args.recipients === "analysts") {
      return active
        .filter((u) => u.role === "analyst" || u.role === "admin")
        .map((u) => u.email);
    }
    return active
      .filter((u) => u.role === "public" || u.subscriptionPlan === "free")
      .map((u) => u.email);
  },
});

export const patchNewsletterSendStats = internalMutation({
  args: {
    newsletterId: v.id("newsletters"),
    emailsSent: v.number(),
    emailsFailed: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("newsletters", args.newsletterId, {
      emailsSent: args.emailsSent,
      emailsFailed: args.emailsFailed,
    });
  },
});

export const patchAnnouncementSendStats = internalMutation({
  args: {
    announcementId: v.id("announcements"),
    emailsSent: v.number(),
    emailsFailed: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("announcements", args.announcementId, {
      emailsSent: args.emailsSent,
      emailsFailed: args.emailsFailed,
    });
  },
});

export const sendNewsletterBatch = internalAction({
  args: {
    newsletterId: v.id("newsletters"),
    subject: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const emails = await ctx.runQuery(internal.email.newsletterSubscriberEmails, {
      criticalOnly: false,
    });
    const text = args.content.trim();
    const html = textToHtml(text);
    const { sent, failed } = await sendBulkEmails(emails, args.subject.trim(), text, html);
    await ctx.runMutation(internal.email.patchNewsletterSendStats, {
      newsletterId: args.newsletterId,
      emailsSent: sent,
      emailsFailed: failed,
    });
  },
});

export const sendAnnouncementBatch = internalAction({
  args: {
    announcementId: v.id("announcements"),
    title: v.string(),
    message: v.string(),
    recipients: v.union(
      v.literal("all"),
      v.literal("analysts"),
      v.literal("free_users"),
    ),
  },
  handler: async (ctx, args) => {
    const userEmails = await ctx.runQuery(internal.email.userEmailsForAnnouncement, {
      recipients: args.recipients,
    });
    const subscriberEmails = await ctx.runQuery(internal.email.newsletterSubscriberEmails, {
      criticalOnly: false,
    });
    const emails = [...new Set([...userEmails, ...subscriberEmails])];

    const subject = `[CrowdShield] ${args.title.trim()}`;
    const text = `${args.title.trim()}\n\n${args.message.trim()}\n\n— CrowdShield Announcements`;
    const html = `<div style="font-family:sans-serif"><h2>${escapeHtml(args.title)}</h2>${textToHtml(args.message)}<p style="color:#666;font-size:12px">CrowdShield Announcement</p></div>`;

    const { sent, failed } = await sendBulkEmails(emails, subject, text, html);
    await ctx.runMutation(internal.email.patchAnnouncementSendStats, {
      announcementId: args.announcementId,
      emailsSent: sent,
      emailsFailed: failed,
    });
  },
});

export const sendCriticalThreatAlert = internalAction({
  args: {
    reportId: v.id("reports"),
    scamType: v.string(),
    region: v.optional(v.string()),
    threatScore: v.number(),
    contentPreview: v.string(),
  },
  handler: async (ctx, args) => {
    const emails = await ctx.runQuery(internal.email.newsletterSubscriberEmails, {
      criticalOnly: true,
    });
    if (emails.length === 0) return;

    const region = args.region?.trim() || "Unknown region";
    const subject = `🚨 Critical threat alert: ${args.scamType}`;
    const text = [
      "A critical scam threat was reported on CrowdShield.",
      "",
      `Type: ${args.scamType}`,
      `Region: ${region}`,
      `Threat score: ${args.threatScore}/100`,
      "",
      "Preview:",
      args.contentPreview.slice(0, 280),
      "",
      "Open the live feed to review and vote.",
    ].join("\n");

    const html = `<div style="font-family:sans-serif;line-height:1.5">
      <p><strong>Critical scam threat reported</strong></p>
      <ul>
        <li><strong>Type:</strong> ${escapeHtml(args.scamType)}</li>
        <li><strong>Region:</strong> ${escapeHtml(region)}</li>
        <li><strong>Threat score:</strong> ${args.threatScore}/100</li>
      </ul>
      <p style="background:#fef2f2;padding:12px;border-radius:8px">${escapeHtml(args.contentPreview.slice(0, 280))}</p>
      <p><a href="/feed">View live threat feed</a></p>
    </div>`;

    await sendBulkEmails(emails, subject, text, html);
  },
});
