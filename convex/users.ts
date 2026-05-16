import { query } from "./_generated/server";
import { auth } from "./auth";

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