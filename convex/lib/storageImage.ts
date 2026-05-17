import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";

/** Load uploaded screenshot in actions (get + signed URL fallback). */
export async function loadImageBlobFromStorage(
  ctx: ActionCtx,
  storageId: Id<"_storage">,
): Promise<Blob> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const direct = await ctx.storage.get(storageId);
      if (direct && direct.size > 0) return direct;
    } catch (error) {
      lastError = error;
    }

    try {
      const url = await ctx.storage.getUrl(storageId);
      if (url) {
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 0) return blob;
        }
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Could not read screenshot: ${lastError.message}`
      : "Could not read the uploaded screenshot.",
  );
}
