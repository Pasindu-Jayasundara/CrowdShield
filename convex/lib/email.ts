export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "alerts@crowdshield.com";
  const fromName = process.env.SENDGRID_FROM_NAME ?? "CrowdShield";

  if (!apiKey) {
    console.warn("SENDGRID_API_KEY not set — email not sent to", payload.to);
    return false;
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: fromEmail, name: fromName },
      subject: payload.subject,
      content: [
        { type: "text/plain", value: payload.text },
        { type: "text/html", value: payload.html },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("SendGrid error:", response.status, body);
    return false;
  }

  return true;
}

export async function sendBulkEmails(
  emails: string[],
  subject: string,
  text: string,
  html: string,
): Promise<{ sent: number; failed: number }> {
  const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  let sent = 0;
  let failed = 0;

  for (const to of unique) {
    const ok = await sendEmail({ to, subject, text, html });
    if (ok) sent++;
    else failed++;
  }

  return { sent, failed };
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function textToHtml(text: string): string {
  return `<div style="font-family:sans-serif;line-height:1.5;color:#111">${escapeHtml(text)
    .split("\n")
    .map((line) => `<p style="margin:0 0 12px">${line || "&nbsp;"}</p>`)
    .join("")}</div>`;
}
