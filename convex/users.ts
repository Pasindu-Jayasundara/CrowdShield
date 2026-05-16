import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { UserRoleType } from "./schema";


export const viewerRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (userId === null) {
      return { isAuthenticated: false, role: null, user: null };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { isAuthenticated: false, role: null, user: null };
    }

    return {
      isAuthenticated: true,
      // Fallback defaults to 'public' for normal users
      role: user.role ?? "public",
      user: user,
    };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const callerId = await auth.getUserId(ctx);
    if (!callerId) throw new Error("Not authenticated");
    const caller = await ctx.db.get(callerId);
    if (caller?.role !== "admin") throw new Error("Not authorized");

    return await ctx.db.query("users").collect();
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: UserRoleType
  },
  handler: async (ctx, args) => {
    const callerId = await auth.getUserId(ctx);
    if (!callerId) throw new Error("Not authenticated");
    const caller = await ctx.db.get(callerId);
    if (caller?.role !== "admin") throw new Error("Not authorized");

    // Prevent self-demotion to avoid losing admin access
    if (args.userId === callerId && args.role !== "admin") {
      throw new Error("Admins cannot demote themselves. Please ask another admin to change your role.");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});


export const toggleStatus = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean()
  },
  handler: async (ctx, args) => {
    const callerId = await auth.getUserId(ctx);
    if (!callerId) throw new Error("Not authenticated");
    const caller = await ctx.db.get(callerId);
    if (caller?.role !== "admin") throw new Error("Not authorized");

    // Prevent disabling own account
    if (args.userId === callerId && !args.isActive) {
      throw new Error("Admins cannot disable their own account.");
    }

    await ctx.db.patch(args.userId, { isActive: args.isActive });
  },
});


export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const callerId = await auth.getUserId(ctx);
    if (!callerId) throw new Error("Not authenticated");
    const caller = await ctx.db.get(callerId);
    if (caller?.role !== "admin") throw new Error("Not authorized");

    // Prevent self-deletion
    if (args.userId === callerId) {
      throw new Error("Admins cannot delete their own account. Please ask another admin to do this.");
    }

    await ctx.db.delete(args.userId);
  },
});