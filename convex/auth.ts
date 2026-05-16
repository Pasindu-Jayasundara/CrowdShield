import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./lib/password";
import {
  createSession,
  getUserFromSession,
  publicUser,
  requireRole,
} from "./lib/session";

export const me = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getUserFromSession(ctx, args.sessionToken);
    return user ? publicUser(user) : null;
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user || !user.isActive) {
      throw new Error("Invalid email or password");
    }

    if (user.role === "public") {
      throw new Error("This account does not have dashboard access");
    }

    if (!user.passwordHash) {
      throw new Error("Account is not configured for login. Run staff password setup.");
    }

    const passwordHash = await hashPassword(email, args.password);
    if (passwordHash !== user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const token = await createSession(ctx, user._id);
    return { token, user: publicUser(user) };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .unique();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

/** One-time helper for dev: sets passwords on staff accounts in the database. */
export const setupStaffPasswords = mutation({
  args: {},
  handler: async (ctx) => {
    const staff: Array<{
      email: string;
      password: string;
      role: "analyst" | "admin";
      username?: string;
    }> = [
      { email: "analyst@example.com", password: "analyst123", role: "analyst" },
      { email: "pro@security.io", password: "analyst123", role: "analyst" },
      {
        email: "admin@crowdshield.com",
        password: "admin123",
        role: "admin",
        username: "admin",
      },
    ];

    const updated: string[] = [];

    for (const account of staff) {
      const email = account.email.toLowerCase();
      let user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();

      const passwordHash = await hashPassword(email, account.password);

      if (user) {
        await ctx.db.patch(user._id, { passwordHash, role: account.role, isActive: true });
      } else if (account.role === "admin") {
        await ctx.db.insert("users", {
          email,
          username: account.username ?? "admin",
          role: "admin",
          subscriptionPlan: "annual",
          subscriptionStatus: "active",
          reportsSubmitted: 0,
          createdAt: new Date().toISOString().slice(0, 10),
          isActive: true,
          passwordHash,
        });
      }
      updated.push(email);
    }

    return { updated };
  },
});

export const assertAdmin = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    return true;
  },
});
