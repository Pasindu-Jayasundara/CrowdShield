/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";
import { analyzeContent, buildAnalysisInput } from "./lib/analysis";

export const analyze = action({
  args: {
    content: v.string(),
    context: v.optional(v.string()),
    platform: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const input = buildAnalysisInput(args.content, {
      context: args.context,
      platform: args.platform,
      region: args.region,
    });
    return await analyzeContent(input, {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      model: process.env.AZURE_OPENAI_MODEL,
    });
  },
});
