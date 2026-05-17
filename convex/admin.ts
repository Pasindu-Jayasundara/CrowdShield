import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";

const MAX_ROWS = 500;

export const dashboardStats = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);

    const users = await ctx.db.query("users").take(MAX_ROWS);
    const subs = await ctx.db.query("subscriptions").take(MAX_ROWS);
    const reports = await ctx.db.query("reports").take(MAX_ROWS);

    const activeSubs = subs.filter((s) => s.status === "active");
    const pastDue = subs.filter((s) => s.status === "past_due");
    const mrr = activeSubs.reduce((sum, s) => {
      return sum + (s.plan === "annual" ? s.amount / 12 : s.amount);
    }, 0);

    const pendingReports = reports.filter((r) => r.status === "pending").length;
    const activeUsers = users.filter((u) => u.isActive).length;

    return {
      totalUsers: users.length,
      activeSubscriptions: activeSubs.length,
      mrr: Math.round(mrr),
      pastDueSubscriptions: pastDue.length,
      pendingReports,
      resourceUsage: {
        database: Math.min(100, Math.round((users.length / MAX_ROWS) * 100)),
        aiProcessing: Math.min(
          100,
          Math.round((pendingReports / Math.max(reports.length, 1)) * 100),
        ),
        storage: Math.min(100, Math.round((reports.length / MAX_ROWS) * 100)),
      },
      activeUsers,
    };
  },
});
