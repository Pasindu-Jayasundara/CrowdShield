/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";
import { analyzeReport } from "./lib/analysis";
import { loadImageBlobFromStorage } from "./lib/storageImage";

const MAX_INLINE_IMAGE_CHARS = 1_200_000;

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const mime = blob.type?.startsWith("image/") ? blob.type : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export const analyze = action({
  args: {
    content: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imageDataUrl: v.optional(v.string()),
    context: v.optional(v.string()),
    platform: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let imageDataUrl = args.imageDataUrl?.trim() ?? "";
    let imageLoadError: string | undefined;
    let storageIdToDelete: typeof args.imageStorageId;

    if (args.imageStorageId && !imageDataUrl) {
      storageIdToDelete = args.imageStorageId;
      try {
        const blob = await loadImageBlobFromStorage(ctx, args.imageStorageId);
        imageDataUrl = await blobToDataUrl(blob);
      } catch (error) {
        console.error("Failed to read uploaded image:", error);
        imageLoadError =
          error instanceof Error ? error.message : "Could not read the uploaded screenshot.";
      }
    }

    if (imageDataUrl.length > MAX_INLINE_IMAGE_CHARS) {
      imageLoadError =
        "Screenshot is too large for analysis. Try a smaller image or lower resolution.";
      imageDataUrl = "";
    }

    if (imageLoadError && !args.content?.trim()) {
      return {
        aiScore: 0,
        threatScore: 0,
        confidence: 0,
        communityScore: 0,
        trendScore: 50,
        severity: "LOW" as const,
        scamType: "Unknown",
        reasoning: imageLoadError,
        attackPatterns: [],
        recommendations: ["Re-upload the screenshot and try again"],
      };
    }

    try {
      const result = await analyzeReport(
        {
          content: args.content,
          imageDataUrl: imageDataUrl || undefined,
          imageLoadError,
          context: args.context,
          platform: args.platform,
          region: args.region,
        },
        {
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          textEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
          textModel: process.env.AZURE_OPENAI_MODEL,
          imageEndpoint: process.env.AZURE_OPENAI_IMAGE_ENDPOINT,
          imageModel: process.env.AZURE_OPENAI_IMAGE_MODEL,
        },
      );

      if (storageIdToDelete) {
        try {
          await ctx.storage.delete(storageIdToDelete);
        } catch {
          // best-effort cleanup
        }
      }

      return result;
    } catch (error) {
      console.error("analyzeReport failed:", error);
      throw error;
    }
  },
});
