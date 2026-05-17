export async function hashPassword(email: string, password: string): Promise<string> {
  const text = `${email.trim().toLowerCase()}:${password}`;
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
