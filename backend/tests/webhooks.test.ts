import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifySignature } from "../integrations/github/webhooks.js";

// Helper to compute correct signature
function computeSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  return "sha256=" + hmac.update(payload).digest("hex");
}

describe("GitHub Webhook HMAC SHA-256 Validator", () => {
  const secretKey = "super-secret-key-123";
  const dummyPayload = JSON.stringify({
    event: "push",
    repository: "Ops",
    ref: "refs/heads/main"
  });

  it("should validate successfully with a matching signature", () => {
    const validSignature = computeSignature(dummyPayload, secretKey);
    const result = verifySignature(validSignature, dummyPayload, secretKey);
    expect(result).toBe(true);
  });

  it("should fail when validated with an invalid secret", () => {
    const validSignature = computeSignature(dummyPayload, "wrong-secret");
    const result = verifySignature(validSignature, dummyPayload, secretKey);
    expect(result).toBe(false);
  });

  it("should fail when validated with an altered payload body", () => {
    const validSignature = computeSignature(dummyPayload, secretKey);
    const alteredPayload = dummyPayload + "altered";
    const result = verifySignature(validSignature, alteredPayload, secretKey);
    expect(result).toBe(false);
  });

  it("should fail gracefully when signature format is malformed", () => {
    const result = verifySignature("invalid_format_without_sha_prefix", dummyPayload, secretKey);
    expect(result).toBe(false);
  });
});
