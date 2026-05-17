import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type UserRole = "public" | "analyst" | "admin";

export function publicUser(user: Doc<"users">) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role as UserRole,
    subscriptionPlan: user.subscriptionPlan,
    isActive: user.isActive,
  };
}

export async function getUserFromSession(
  ctx: QueryCtx | MutationCtx,
  token: string | undefined,
): Promise<Doc<"users"> | null> {
  if (!token?.trim()) return null;

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  const user = await ctx.db.get("users", session.userId);
  if (!user || !user.isActive) return null;
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  token: string | undefined,
  allowed: UserRole[],
): Promise<Doc<"users">> {
  const user = await getUserFromSession(ctx, token);
  if (!user) throw new Error("Not authenticated");
  if (!allowed.includes(user.role as UserRole)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createSession(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<string> {
  const token = crypto.randomUUID();
  await ctx.db.insert("sessions", {
    token,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
    createdAt: new Date().toISOString(),
  });
  return token;
}
