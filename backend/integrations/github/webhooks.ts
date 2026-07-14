import crypto from "crypto";

/**
 * Validates the HMAC signature computed by GitHub using the GITHUB_WEBHOOK_SECRET key.
 */
export function verifySignature(signature: string, rawBody: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const expectedSignature = "sha256=" + hmac.update(rawBody).digest("hex");
    
    // Protect against timing attacks using timingSafeEqual
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    );
  } catch (error) {
    return false;
  }
}
