export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function severityFromScore(score: number): Severity {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

export function analyzeContent(content: string) {
  const lower = content.toLowerCase();
  let score = 45;
  const patterns: string[] = [];
  if (lower.includes("urgent") || lower.includes("immediately")) {
    patterns.push("Urgency tactics");
  }
  if (lower.includes("http") || lower.includes("bit.ly")) {
    patterns.push("Suspicious links");
  }
  if (lower.includes("otp") || lower.includes("password")) {
    patterns.push("Credential requests");
  }
  if (lower.includes("pay") || lower.includes("$")) {
    patterns.push("Payment requests");
  }
  if (lower.includes("won") || lower.includes("prize")) {
    patterns.push("Too-good-to-be-true");
  }
  if (lower.includes("bank") || lower.includes("verify")) {
    patterns.push("Impersonation");
  }
  score = Math.min(
    95,
    35 + patterns.length * 15 + Math.min(content.length / 10, 20),
  );
  const severity = severityFromScore(score);
  const scamType = patterns.includes("Credential requests")
    ? "OTP Phishing"
    : patterns.includes("Payment requests")
      ? "Phishing"
      : "Smishing";
  return {
    threatScore: Math.round(score),
    severity,
    scamType,
    reasoning: `AI detected ${patterns.length} attack pattern(s) in this message. ${
      patterns.length >= 3
        ? "High confidence this is a coordinated scam attempt."
        : "Exercise caution and verify through official channels."
    }`,
    attackPatterns: patterns.length ? patterns : ["Suspicious content"],
    recommendations: [
      "Do not click any links in the message",
      "Verify through official channels only",
      "Report to local authorities if money was lost",
      "Warn friends and family about this pattern",
    ],
  };
}
