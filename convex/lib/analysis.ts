import {
  combineModalAiScores,
  computeThreatScore,
  severityFromThreatScore,
} from "./threatScore";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const DEFAULT_TREND_SCORE = 50;

export type AnalysisResult = {
  /** Combined AI signal (0–100) used in ThreatScore formula. */
  aiScore: number;
  textAiScore?: number;
  imageAiScore?: number;
  confidence: number;
  communityScore: number;
  trendScore: number;
  /** Composite: 0.5×AI + 0.35×Community + 0.15×Trend */
  threatScore: number;
  severity: Severity;
  scamType: string;
  reasoning: string;
  attackPatterns: string[];
  recommendations: string[];
};

type AzureAnalysisPayload = {
  scamType?: string;
  severity?: string;
  aiScore?: string | number;
  confidence?: string | number;
};

type ContentPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string };

export type AzureConfig = {
  apiKey?: string;
  textEndpoint?: string;
  textModel?: string;
  imageEndpoint?: string;
  imageModel?: string;
};

const TEXT_SYSTEM_INSTRUCTION = `You are a scam detection AI. Analyze the user message and respond strictly with a JSON object.

The JSON must contain these exact keys:
- 'scamType': (e.g., safe, phishing, job_scam, investment_crypto, romance_scam)
- 'confidence': (A percentage score from 0 to 100 based on how likely the message is a scam)
- 'severity': (This must dynamically change based on the 'confidence' score using the rules below)
- 'aiScore': ('1' if confidence is 50 or higher, '0' if confidence is below 50)

Rules for assigning 'severity' based on 'confidence':
- If confidence is 0% to 25%: severity must be "LOW"
- If confidence is 26% to 60%: severity must be "MEDIUM"
- If confidence is 61% to 85%: severity must be "HIGH"
- If confidence is 86% to 100%: severity must be "CRITICAL"

Do not include markdown formatting or backticks around the JSON. Output only the raw JSON string.`;

const IMAGE_SYSTEM_INSTRUCTION = `You are a visual scam detection AI. Analyze the screenshot for alignment anomalies, text inconsistencies, font mismatches, and fraudulent brand indicators. Respond strictly with a JSON object containing keys: 'scamType' (e.g., safe, fake_receipt, phishing_site, fake_doc), 'severity' (LOW, MEDIUM, HIGH, CRITICAL), 'aiScore' ('1' for scam, '0' for safe), and 'confidence' (0-100 percentage). Do not include markdown formatting or backticks around the JSON.`;

const DEFAULT_ENDPOINT =
  "https://crowedshield.services.ai.azure.com/api/projects/crowedshield/openai/v1/responses";

const DEFAULT_TEXT_MODEL =
  "gpt-4o-2026-08-06.ft-67a5f33f01e745c8946e4ed8740cdb3a-spam-img";

/** Azure deployment name (starts with "-" — not gpt-4o-...). */
const DEFAULT_IMAGE_MODEL =
  "-2025-04-14-ft-afd97a36181944a4be3607494cd1ef77-spam-img-100-100";

/** Common mis-copy adds a gpt-4o- prefix; Azure deployment is hyphen-prefixed. */
function imageModelCandidates(configured?: string): string[] {
  const primary = (configured?.trim() || DEFAULT_IMAGE_MODEL).trim();
  const stripped = primary.replace(/^gpt-4o-/i, "").replace(/^gpt-4\.1-/i, "");
  const hyphenated = stripped.startsWith("-") ? stripped : `-${stripped}`;
  return [...new Set([primary, hyphenated, DEFAULT_IMAGE_MODEL])];
}

function isDeploymentNotFound(error: unknown): boolean {
  const raw = error instanceof Error ? error.message : String(error);
  return raw.includes("404") || raw.includes("DeploymentNotFound");
}

const SAFE_SCAM_TYPES = new Set(["safe", "legitimate", "benign", "not_scam", "not scam"]);

export function severityFromConfidence(confidence: number): Severity {
  if (confidence >= 86) return "CRITICAL";
  if (confidence >= 61) return "HIGH";
  if (confidence >= 26) return "MEDIUM";
  return "LOW";
}

function formatScamType(raw: string | undefined): string {
  if (!raw?.trim()) return "Unknown";
  const lower = raw.trim().toLowerCase();
  if (SAFE_SCAM_TYPES.has(lower)) return "Safe";
  return lower
    .split(/[_\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isScamClassification(payload: AzureAnalysisPayload): boolean {
  const confidence = parseConfidence(payload.confidence);
  const aiScore = String(payload.aiScore ?? "").trim();
  if (aiScore === "0") return false;
  if (aiScore === "1") return true;
  const type = payload.scamType?.trim().toLowerCase() ?? "";
  if (SAFE_SCAM_TYPES.has(type)) return false;
  return confidence >= 50;
}

function parseConfidence(value: string | number | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function isScamPayload(obj: AzureAnalysisPayload): boolean {
  return (
    obj.scamType !== undefined ||
    obj.aiScore !== undefined ||
    obj.severity !== undefined
  );
}

export function parseAzureJson(text: string): AzureAnalysisPayload {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  const objects: AzureAnalysisPayload[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < candidate.length; i++) {
    if (candidate[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (candidate[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const obj = JSON.parse(candidate.slice(start, i + 1)) as AzureAnalysisPayload;
          if (isScamPayload(obj)) objects.push(obj);
        } catch {
          // skip malformed fragment
        }
        start = -1;
      }
    }
  }

  if (objects.length > 0) {
    return objects.reduce((best, current) => {
      const bestConf = parseConfidence(best.confidence);
      const currentConf = parseConfidence(current.confidence);
      const bestHasScam = best.scamType !== undefined && best.aiScore !== undefined;
      const currentHasScam =
        current.scamType !== undefined && current.aiScore !== undefined;
      if (currentHasScam && !bestHasScam) return current;
      if (bestHasScam && !currentHasScam) return best;
      return currentConf >= bestConf ? current : best;
    });
  }

  const jsonStart = candidate.indexOf("{");
  const jsonEnd = candidate.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No JSON object in model response");
  }
  return JSON.parse(candidate.slice(jsonStart, jsonEnd + 1)) as AzureAnalysisPayload;
}

function buildSafeResult(
  aiScore: number,
  reasoning: string,
  source: "text" | "image" | "combined",
): AnalysisResult {
  const communityScore = 0;
  const trendScore = DEFAULT_TREND_SCORE;
  const threatScore = computeThreatScore(aiScore, communityScore, trendScore);
  return {
    aiScore,
    ...(source === "text" ? { textAiScore: aiScore } : {}),
    ...(source === "image" ? { imageAiScore: aiScore } : {}),
    threatScore,
    confidence: aiScore,
    communityScore,
    trendScore,
    severity: severityFromThreatScore(threatScore),
    scamType: "Safe",
    reasoning,
    attackPatterns: [],
    recommendations: [
      "No immediate threat detected",
      "Always verify unexpected links through official channels",
      "Report again if the message asks for money or credentials",
    ],
  };
}

function buildScamResult(
  aiScore: number,
  scamType: string,
  reasoning: string,
  source: "text" | "image" | "combined",
): AnalysisResult {
  const communityScore = 0;
  const trendScore = DEFAULT_TREND_SCORE;
  const threatScore = computeThreatScore(aiScore, communityScore, trendScore);
  const severity = severityFromThreatScore(threatScore);

  return {
    aiScore,
    ...(source === "text" ? { textAiScore: aiScore } : {}),
    ...(source === "image" ? { imageAiScore: aiScore } : {}),
    threatScore,
    confidence: aiScore,
    communityScore,
    trendScore,
    severity,
    scamType,
    reasoning,
    attackPatterns: [scamType, "Suspicious intent"],
    recommendations: [
      "Do not click any links in the message",
      "Do not share personal information or OTP codes",
      "Verify through official channels only",
    ],
  };
}

/** Map Azure Foundry fields to a single-modality analysis result. */
export function mapAzureAnalysis(
  payload: AzureAnalysisPayload,
  source: "text" | "image" = "text",
): AnalysisResult {
  const confidence = parseConfidence(payload.confidence);
  const scam = isScamClassification(payload);

  if (!scam) {
    const aiScore = Math.max(0, Math.min(100, confidence));
    return buildSafeResult(
      aiScore,
      confidence >= 80
        ? `AI classified this ${source === "image" ? "screenshot" : "message"} as safe with ${confidence}% confidence.`
        : `AI did not detect significant scam indicators in this ${source === "image" ? "screenshot" : "message"}.`,
      source,
    );
  }

  const aiScore = confidence > 0 ? confidence : 70;
  const scamType = formatScamType(payload.scamType);
  return buildScamResult(
    aiScore,
    scamType,
    `AI flagged this ${source === "image" ? "screenshot" : "message"} as ${scamType} (${confidence}% confidence).`,
    source,
  );
}

/** User-facing severity always follows composite threat score bands. */
export function finalizeAnalysisSeverity(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    severity: severityFromThreatScore(result.threatScore),
  };
}

export async function createAzureResponse(
  config: { apiKey: string; endpoint: string; model: string; instructions: string },
  parts: ContentPart[],
): Promise<unknown> {
  const response = await fetch(config.endpoint.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      instructions: config.instructions,
      temperature: 0,
      input: [
        {
          type: "message",
          role: "user",
          content: parts,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Azure AI API error: ${response.status} ${response.statusText} — ${body}`);
  }

  return await response.json();
}

function extractResponseText(data: unknown): string {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid model response");
  }

  const obj = data as Record<string, unknown>;

  if (Array.isArray(obj.output)) {
    for (const item of obj.output) {
      if (!item || typeof item !== "object") continue;
      const message = item as { type?: string; content?: unknown[] };
      if (message.type !== "message" || !Array.isArray(message.content)) continue;
      for (const part of message.content) {
        if (!part || typeof part !== "object") continue;
        const block = part as { type?: string; text?: string };
        if (block.type === "output_text" && typeof block.text === "string") {
          return block.text;
        }
      }
    }
  }

  const choices = obj.choices as Array<{ message?: { content?: string } }> | undefined;
  const legacy = choices?.[0]?.message?.content;
  if (typeof legacy === "string") return legacy;

  if (typeof obj.output_text === "string") return obj.output_text;

  throw new Error("Could not extract text from model response");
}

function unconfiguredResult(): AnalysisResult {
  return {
    aiScore: 0,
    threatScore: 0,
    confidence: 0,
    communityScore: 0,
    trendScore: DEFAULT_TREND_SCORE,
    severity: "LOW",
    scamType: "Unknown",
    reasoning:
      "AI analysis is not configured. Set AZURE_OPENAI_API_KEY in Convex environment variables.",
    attackPatterns: [],
    recommendations: ["Contact an administrator to enable AI analysis"],
  };
}

function unavailableResult(reason?: string): AnalysisResult {
  return {
    aiScore: 0,
    threatScore: 0,
    confidence: 0,
    communityScore: 0,
    trendScore: DEFAULT_TREND_SCORE,
    severity: "LOW",
    scamType: "Unknown",
    reasoning: reason ?? "AI analysis is temporarily unavailable. Please try again.",
    attackPatterns: [],
    recommendations: ["Exercise caution until analysis completes"],
  };
}

function sanitizeApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("401") || raw.includes("403")) {
    return "AI authentication failed. Check Azure API key and deployment names in Convex env.";
  }
  if (raw.includes("404") || raw.includes("DeploymentNotFound")) {
    return "Image AI deployment not found. Set AZURE_OPENAI_IMAGE_MODEL to your Azure deployment name (often starts with \"-\", e.g. -2025-04-14-ft-...-spam-img-100-100).";
  }
  if (raw.includes("payload") || raw.includes("too large") || raw.includes("413")) {
    return "Screenshot is too large for analysis. Use a smaller image.";
  }
  if (raw.length > 220) return `${raw.slice(0, 220)}…`;
  return raw;
}

async function runModalityAnalysis(
  parts: ContentPart[],
  config: {
    apiKey: string;
    endpoint: string;
    model: string;
    instructions: string;
  },
  source: "text" | "image",
): Promise<AnalysisResult> {
  const data = await createAzureResponse(config, parts);
  const resultText = extractResponseText(data);
  const payload = parseAzureJson(resultText);
  return mapAzureAnalysis(payload, source);
}

/** Merge text and/or image modality results into one user-facing analysis. */
export function mergeModalityResults(
  text: AnalysisResult | null,
  image: AnalysisResult | null,
): AnalysisResult {
  if (!text && !image) return unconfiguredResult();
  if (text && !image) return text;
  if (!text && image) return image;

  const textAiScore = text!.aiScore;
  const imageAiScore = image!.aiScore;
  const aiScore = combineModalAiScores(textAiScore, imageAiScore);
  const communityScore = 0;
  const trendScore = DEFAULT_TREND_SCORE;
  const threatScore = computeThreatScore(aiScore, communityScore, trendScore);

  const textScam = text!.scamType !== "Safe";
  const imageScam = image!.scamType !== "Safe";
  const primary =
    textScam && imageScam
      ? textAiScore >= imageAiScore
        ? text!
        : image!
      : textScam
        ? text!
        : imageScam
          ? image!
          : textAiScore >= imageAiScore
            ? text!
            : image!;

  const scamType =
    textScam || imageScam
      ? primary.scamType
      : "Safe";

  const attackPatterns = [
    ...new Set([...text!.attackPatterns, ...image!.attackPatterns]),
  ];
  const recommendations = [
    ...new Set([...text!.recommendations, ...image!.recommendations]),
  ];

  const reasoningParts = [
    text!.reasoning && `Text: ${text!.reasoning}`,
    image!.reasoning && `Image: ${image!.reasoning}`,
  ].filter(Boolean);

  const reasoning =
    reasoningParts.length > 0
      ? `${reasoningParts.join(" ")} Combined threat score ${threatScore} (text AI ${textAiScore}, image AI ${imageAiScore}).`
      : `Combined threat score ${threatScore}.`;

  if (scamType === "Safe") {
    return {
      ...buildSafeResult(aiScore, reasoning, "combined"),
      textAiScore,
      imageAiScore,
      threatScore,
      severity: severityFromThreatScore(threatScore),
    };
  }

  return finalizeAnalysisSeverity({
    ...buildScamResult(aiScore, scamType, reasoning, "combined"),
    textAiScore,
    imageAiScore,
    threatScore,
    attackPatterns: attackPatterns.length > 0 ? attackPatterns : primary.attackPatterns,
    recommendations,
  });
}

export type AnalyzeReportInput = {
  content?: string;
  imageDataUrl?: string;
  imageLoadError?: string;
  context?: string;
  platform?: string;
  region?: string;
};

export async function analyzeReport(
  input: AnalyzeReportInput,
  config: AzureConfig = {},
): Promise<AnalysisResult> {
  const textContent = input.content?.trim() ?? "";
  const imageDataUrl = input.imageDataUrl?.trim() ?? "";

  if (!textContent && !imageDataUrl) {
    return {
      ...unconfiguredResult(),
      reasoning: "Provide a message, a screenshot, or both to analyze.",
    };
  }

  const apiKey = config.apiKey;
  if (!apiKey) {
    console.error("AZURE_OPENAI_API_KEY is not set");
    return unconfiguredResult();
  }

  const textEndpoint = (config.textEndpoint ?? DEFAULT_ENDPOINT).trim();
  const imageEndpoint = (config.imageEndpoint ?? config.textEndpoint ?? DEFAULT_ENDPOINT).trim();
  const textModel = config.textModel ?? DEFAULT_TEXT_MODEL;
  const imageModel = config.imageModel ?? DEFAULT_IMAGE_MODEL;

  let textResult: AnalysisResult | null = null;
  let imageResult: AnalysisResult | null = null;
  let textError: string | undefined;
  let imageError: string | undefined;

  if (input.imageLoadError) {
    imageError = input.imageLoadError;
  }

  if (textContent) {
    try {
      const userText = buildAnalysisInput(textContent, {
        context: input.context,
        platform: input.platform,
        region: input.region,
      });
      textResult = await runModalityAnalysis(
        [{ type: "input_text", text: userText }],
        {
          apiKey,
          endpoint: textEndpoint,
          model: textModel,
          instructions: TEXT_SYSTEM_INSTRUCTION,
        },
        "text",
      );
    } catch (error) {
      console.error("Text AI analysis failed:", error);
      textError = sanitizeApiError(error);
    }
  }

  if (imageDataUrl && !imageError) {
    try {
      const imageParts: ContentPart[] = [
        { type: "input_image", image_url: imageDataUrl },
      ];
      if (textContent) {
        imageParts.unshift({
          type: "input_text",
          text: `Additional message context:\n${buildAnalysisInput(textContent, {
            context: input.context,
            platform: input.platform,
            region: input.region,
          })}`,
        });
      } else {
        imageParts.unshift({
          type: "input_text",
          text: "Analyze this screenshot for visual scam indicators.",
        });
      }

      let lastImageError: unknown;
      for (const model of imageModelCandidates(imageModel)) {
        try {
          imageResult = await runModalityAnalysis(
            imageParts,
            {
              apiKey,
              endpoint: imageEndpoint,
              model,
              instructions: IMAGE_SYSTEM_INSTRUCTION,
            },
            "image",
          );
          lastImageError = undefined;
          break;
        } catch (error) {
          lastImageError = error;
          if (!isDeploymentNotFound(error)) break;
          console.warn(`Image deployment "${model}" not found, trying fallback…`);
        }
      }
      if (!imageResult && lastImageError) {
        throw lastImageError;
      }
    } catch (error) {
      console.error("Image AI analysis failed:", error);
      imageError = sanitizeApiError(error);
    }
  }

  if (textResult || imageResult) {
    const merged = finalizeAnalysisSeverity(
      mergeModalityResults(textResult, imageResult),
    );
    const notes: string[] = [];
    if (imageError && textResult) {
      notes.push(`Screenshot analysis failed: ${imageError}`);
    }
    if (textError && imageResult) {
      notes.push(`Text analysis failed: ${textError}`);
    }
    if (notes.length > 0) {
      merged.reasoning = `${merged.reasoning} ${notes.join(" ")}`;
    }
    console.log("AI analysis →", { textResult, imageResult, merged, textError, imageError });
    return merged;
  }

  if (imageError && !textContent) {
    return unavailableResult(`Screenshot analysis failed: ${imageError}`);
  }
  if (textError && !imageDataUrl) {
    return unavailableResult(`Message analysis failed: ${textError}`);
  }
  if (imageError && textError) {
    return unavailableResult(
      `Analysis failed. Screenshot: ${imageError}. Message: ${textError}`,
    );
  }

  return unavailableResult();
}

/** @deprecated Use analyzeReport — analyzes text-only content. */
export async function analyzeContent(
  content: string,
  config: AzureConfig = {},
): Promise<AnalysisResult> {
  return analyzeReport({ content }, config);
}

export function buildAnalysisInput(
  content: string,
  extras?: { context?: string; platform?: string; region?: string },
): string {
  const parts = [content.trim()];
  if (extras?.context?.trim()) {
    parts.push(`Additional context: ${extras.context.trim()}`);
  }
  if (extras?.platform) {
    parts.push(`Platform: ${extras.platform}`);
  }
  if (extras?.region?.trim()) {
    parts.push(`Region: ${extras.region.trim()}`);
  }
  return parts.join("\n\n");
}
