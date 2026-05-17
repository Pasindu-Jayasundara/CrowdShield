import { mutation } from "./_generated/server";

/** Client uploads screenshot here, then passes storageId to ai.analyze (avoids huge action args). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
