/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";
import { analyzeContent } from "./lib/analysis";

export const analyze = action({
  args: { content: v.string() },
  handler: async (_ctx, args) => {
    return await analyzeContent(args.content, {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    });
  },
});
