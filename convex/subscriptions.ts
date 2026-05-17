import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createSubscription = mutation({
  args: {
    plan: v.string(),
    status: v.string(),
    expirationDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.query("users").withIndex("email", q => q.eq("email", identity.email!)).unique();
    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await ctx.db.insert("subscriptions", {
      userId: user._id,
      plan: args.plan,
      status: args.status,
      expirationDate: args.expirationDate,
    });

    return subscription;
  },
});

export const getUserSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();
      
    if (!user) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    return subscription;
  },
});
