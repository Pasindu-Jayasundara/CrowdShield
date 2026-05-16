import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      
      if (user && !user.role) {
        const assignedRole = user.email === "your_actual_email@gmail.com" ? "admin" : "public";
        
        await ctx.db.patch(userId, {
          role: assignedRole,
          reportsSubmitted: 0,
          isActive: true,
        });
      }
    },
  },
});