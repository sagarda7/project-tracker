import crypto from "node:crypto";

// Excludes visually ambiguous characters (0/O, 1/I) so codes are easy to read back over phone/paper.
const TRACKING_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateTrackingCode(length = 5): string {
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += TRACKING_CODE_ALPHABET[bytes[i] % TRACKING_CODE_ALPHABET.length];
  }
  return code;
}
