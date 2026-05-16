import { computeThreatScore, severityFromThreatScore } from "./threatScore";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const DEFAULT_TREND_SCORE = 50;

export type AnalysisResult = {
  /** AI model confidence (0–100) — the AI Score component. */
  aiScore: number;
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

const SYSTEM_INSTRUCTION = `You are a scam detection AI. Analyze the user message and respond strictly with a JSON object.

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

const DEFAULT_ENDPOINT =
  "https://crowedshield.services.ai.azure.com/api/projects/crowedshield/openai/v1/responses";

const DEFAULT_MODEL =
  "gpt-4o-2026-08-06.ft-67a5f33f01e745c8946e4ed8740cdb3a-spam-img";

const SAFE_SCAM_TYPES = new Set(["safe", "legitimate", "benign", "not_scam", "not scam"]);

/** Severity bands from model instruction (confidence → severity). */
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

/** Extract the scam-classification JSON object from model text. */
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

/** Map Azure Foundry fields to UI-facing analysis. */
export function mapAzureAnalysis(payload: AzureAnalysisPayload): AnalysisResult {
  const confidence = parseConfidence(payload.confidence);
  const scam = isScamClassification(payload);

  if (!scam) {
    const aiScore = Math.max(0, Math.min(100, confidence));
    const communityScore = 0;
    const trendScore = DEFAULT_TREND_SCORE;
    const threatScore = computeThreatScore(aiScore, communityScore, trendScore);
    return {
      aiScore,
      threatScore,
      confidence: aiScore,
      communityScore,
      trendScore,
      severity: severityFromThreatScore(threatScore),
      scamType: "Safe",
      reasoning:
        confidence >= 80
          ? `AI classified this as safe with ${confidence}% confidence.`
          : "AI did not detect significant scam indicators in this message.",
      attackPatterns: [],
      recommendations: [
        "No immediate threat detected",
        "Always verify unexpected links through official channels",
        "Report again if the message asks for money or credentials",
      ],
    };
  }

  const aiScore = confidence > 0 ? confidence : 70;
  const communityScore = 0;
  const trendScore = DEFAULT_TREND_SCORE;
  const threatScore = computeThreatScore(aiScore, communityScore, trendScore);
  const severity = severityFromThreatScore(threatScore);
  const scamType = formatScamType(payload.scamType);

  return {
    aiScore,
    threatScore,
    confidence: aiScore,
    communityScore,
    trendScore,
    severity,
    scamType,
    reasoning: `AI flagged this as ${scamType}. Threat score ${threatScore} (AI ${aiScore}, community ${communityScore}, trend ${trendScore}).`,
    attackPatterns: [scamType, "Suspicious intent"],
    recommendations: [
      "Do not click any links in the message",
      "Do not share personal information or OTP codes",
      "Verify through official channels only",
    ],
  };
}

/** Calls Azure Foundry v1 Responses API (instructions + user input). */
export async function createAzureResponse(
  config: { apiKey: string; endpoint: string; model: string },
  userContent: string,
): Promise<unknown> {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      instructions: SYSTEM_INSTRUCTION,
      temperature: 0,
      input: [
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: userContent }],
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

export async function analyzeContent(
  content: string,
  config: { apiKey?: string; endpoint?: string; model?: string } = {},
): Promise<AnalysisResult> {
  const apiKey = config.apiKey;
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const model = config.model ?? DEFAULT_MODEL;

  if (!apiKey) {
    console.error("AZURE_OPENAI_API_KEY is not set");
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

  try {
    const data = await createAzureResponse({ apiKey, endpoint, model }, content);
    const resultText = extractResponseText(data);
    const payload = parseAzureJson(resultText);
    const result = mapAzureAnalysis(payload);
    console.log("AI analysis payload:", payload, "→", result);
    return result;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      aiScore: 0,
      threatScore: 0,
      confidence: 0,
      communityScore: 0,
      trendScore: DEFAULT_TREND_SCORE,
      severity: "LOW",
      scamType: "Unknown",
      reasoning: "AI analysis is temporarily unavailable. Please try again.",
      attackPatterns: [],
      recommendations: ["Exercise caution until analysis completes"],
    };
  }
}

/** Build the text sent to the model (main content + optional context). */
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
