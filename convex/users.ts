import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 100);
    return await ctx.db.query("users").order("desc").take(limit);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(500);
    const analysts = users.filter((u) => u.role === "analyst").length;
    const active = users.filter((u) => u.isActive).length;
    return {
      total: users.length,
      analysts,
      conversionRate:
        users.length > 0
          ? Math.round((analysts / users.length) * 1000) / 10
          : 0,
      active,
    };
  },
});
