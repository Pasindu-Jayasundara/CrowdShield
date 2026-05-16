export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AnalysisResult = {
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

const SAFE_SCAM_TYPES = new Set(["safe", "legitimate", "benign", "not_scam", "not scam"]);

export function severityFromScore(score: number): Severity {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

function normalizeSeverity(value: string | undefined, threatScore: number): Severity {
  const upper = value?.trim().toUpperCase();
  if (upper === "CRITICAL" || upper === "HIGH" || upper === "MEDIUM" || upper === "LOW") {
    return upper;
  }
  return severityFromScore(threatScore);
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
  const score = String(payload.aiScore ?? "").trim();
  if (score === "1") return true;
  if (score === "0") return false;
  const type = payload.scamType?.trim().toLowerCase() ?? "";
  if (SAFE_SCAM_TYPES.has(type)) return false;
  return type.length > 0 && type !== "unknown";
}

function parseConfidence(value: string | number | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Extract JSON object from model text (handles markdown fences). */
export function parseAzureJson(text: string): AzureAnalysisPayload {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object in model response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as AzureAnalysisPayload;
}

/** Map Azure Foundry fields to UI-facing analysis. */
export function mapAzureAnalysis(payload: AzureAnalysisPayload): AnalysisResult {
  const confidence = parseConfidence(payload.confidence);
  const scam = isScamClassification(payload);

  if (!scam) {
    // aiScore 0 + high confidence => confident the message is SAFE (low threat, not high score)
    const threatScore = Math.max(0, Math.min(15, 100 - confidence));
    return {
      threatScore,
      severity: "LOW",
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

  const threatScore = confidence > 0 ? confidence : 70;
  const severity = normalizeSeverity(payload.severity, threatScore);
  const scamType = formatScamType(payload.scamType);

  return {
    threatScore,
    severity,
    scamType,
    reasoning: `AI flagged this as ${scamType} with ${confidence}% confidence.`,
    attackPatterns: [scamType, "Suspicious intent"],
    recommendations: [
      "Do not click any links in the message",
      "Do not share personal information or OTP codes",
      "Verify through official channels only",
    ],
  };
}

const DEFAULT_ENDPOINT =
  "https://crowedshield.services.ai.azure.com/openai/deployments/gpt-4o-2026-08-06.ft-67a5f33f01e745c8946e4ed8740cdb3a-spam-img/chat/completions?api-version=2024-02-15-preview";

export async function analyzeContent(
  content: string,
  config: { apiKey?: string; endpoint?: string } = {},
): Promise<AnalysisResult> {
  const apiKey = config.apiKey;
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;

  if (!apiKey) {
    console.error("AZURE_OPENAI_API_KEY is not set");
    return {
      threatScore: 0,
      severity: "LOW",
      scamType: "Unknown",
      reasoning: "AI analysis is not configured. Set AZURE_OPENAI_API_KEY in Convex environment variables.",
      attackPatterns: [],
      recommendations: ["Contact an administrator to enable AI analysis"],
    };
  }

  const systemPrompt = `You are a scam detection AI. Analyze the user message and respond with ONLY a JSON object (no markdown) using these keys:
- scamType: one of safe, phishing, job_scam, investment_crypto, romance_scam, smishing, lottery_scam, or similar
- severity: LOW, MEDIUM, HIGH, or CRITICAL (use LOW for safe/benign messages)
- aiScore: "0" if the message is safe/legitimate, "1" if it is a scam or phishing attempt
- confidence: integer 0-100 representing how confident you are in the aiScore classification

Important: Legitimate social messages, event invites, and benign Spotify/music links from known campaigns are usually safe (aiScore "0", severity LOW). Only mark aiScore "1" when there are real scam indicators (credential theft, payment demands, impersonation, urgency to pay, etc.).`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Azure AI API error: ${response.status} ${response.statusText} — ${body}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText || typeof resultText !== "string") {
      throw new Error("Empty model response");
    }

    const payload = parseAzureJson(resultText);
    return mapAzureAnalysis(payload);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      threatScore: 0,
      severity: "LOW",
      scamType: "Unknown",
      reasoning: "AI analysis is temporarily unavailable. Please try again.",
      attackPatterns: [],
      recommendations: ["Exercise caution until analysis completes"],
    };
  }
}
